import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Try to get token from localStorage (backup if cookie doesn't work)
  const token = localStorage.getItem('authToken');
  
  // Clone request with credentials and add Authorization header if token exists
  let clonedReq = req.clone({
    withCredentials: true
  });
  
  // Add Authorization header if we have a token and it's not already set
  if (token && !req.headers.has('Authorization')) {
    clonedReq = clonedReq.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    // Debug logging (remove in production)
    if (req.url.includes('/api/')) {
      console.log('Sending request to:', req.url, 'with token:', token.substring(0, 20) + '...');
    }
  } else if (!token && req.url.includes('/api/') && !req.url.includes('/auth/login')) {
    console.warn('No token found for API request:', req.url);
  }
  
  return next(clonedReq).pipe(
    catchError(error => {
      if (error.status === 401) {
        console.error('401 Unauthorized for:', req.url, error);
        // Only redirect if not already on login page
        const currentUrl = router.url;
        if (!currentUrl.includes('/login')) {
          // Clear token and redirect to login
          localStorage.removeItem('authToken');
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
};

