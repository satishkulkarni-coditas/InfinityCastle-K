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
  }
  
  return next(clonedReq).pipe(
    catchError(error => {
      if (error.status === 401) {
        // Clear token and redirect to login
        localStorage.removeItem('authToken');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};

