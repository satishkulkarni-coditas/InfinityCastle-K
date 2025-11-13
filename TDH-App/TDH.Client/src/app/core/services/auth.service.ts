import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
  tenants: TenantInfo[];
}

export interface TenantInfo {
  id: string;
  name: string;
  code: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api';
  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private authCheckComplete = false;
  private authCheckPromise: Promise<boolean> | null = null;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check if user is already logged in (token in cookie)
    this.checkAuthStatus();
  }

  async waitForAuthCheck(): Promise<boolean> {
    if (this.authCheckComplete) {
      return this.isAuthenticated();
    }
    
    if (!this.authCheckPromise) {
      this.authCheckPromise = new Promise<boolean>((resolve) => {
        // Check if already complete
        const checkInterval = setInterval(() => {
          if (this.authCheckComplete) {
            clearInterval(checkInterval);
            resolve(this.isAuthenticated());
          }
        }, 50);
        
        // Timeout after 2 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          if (!this.authCheckComplete) {
            this.authCheckComplete = true;
          }
          resolve(this.isAuthenticated());
        }, 2000);
      });
    }
    
    return this.authCheckPromise;
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials, {
      withCredentials: true
    }).pipe(
      tap(response => {
        // Store token in localStorage as backup (cookie might not work in some browsers)
        if (response.token) {
          localStorage.setItem('authToken', response.token);
        }
        this.currentUserSubject.next(response);
        this.authCheckComplete = true;
      })
    );
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/auth/logout`, {}, {
      withCredentials: true
    }).subscribe({
      next: () => {
        localStorage.removeItem('authToken');
        this.currentUserSubject.next(null);
        this.authCheckComplete = false;
        this.authCheckPromise = null;
        this.router.navigate(['/login']);
      },
      error: () => {
        // Even if logout fails on server, clear local state
        localStorage.removeItem('authToken');
        this.currentUserSubject.next(null);
        this.authCheckComplete = false;
        this.authCheckPromise = null;
        this.router.navigate(['/login']);
      }
    });
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): LoginResponse | null {
    return this.currentUserSubject.value;
  }

  getPrimaryRole(): string {
    const user = this.currentUserSubject.value;
    if (!user || !user.roles || user.roles.length === 0) {
      return 'Unknown';
    }
    // Return the first role (usually the primary role)
    return user.roles[0];
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    
    // Check Identity roles
    if (user.roles.includes(role)) {
      return true;
    }
    
    // For EntityAdmin, also check tenant roles
    // EntityAdmin can be assigned at tenant level
    if (role === 'EntityAdmin' && user.tenants) {
      return user.tenants.some(tenant => tenant.role === 'EntityAdmin');
    }
    
    return false;
  }

  private checkAuthStatus(): void {
    // Check if we have a token in localStorage
    const token = localStorage.getItem('authToken');
    
    // If no token, mark as not authenticated immediately
    if (!token) {
      this.currentUserSubject.next(null);
      this.authCheckComplete = true;
      return;
    }
    
    // Call the /me endpoint to validate token and get user info
    // The interceptor will add the token to the Authorization header
    this.http.get<LoginResponse>(`${this.apiUrl}/auth/me`, {
      withCredentials: true
    }).subscribe({
      next: (response) => {
        // Update token in localStorage if response has a new token
        if (response.token) {
          localStorage.setItem('authToken', response.token);
        }
        this.currentUserSubject.next(response);
        this.authCheckComplete = true;
      },
      error: (error) => {
        // Token is invalid or expired, clear it and mark as not authenticated
        // Only clear if it's actually an auth error (401/403)
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem('authToken');
          this.currentUserSubject.next(null);
        }
        this.authCheckComplete = true;
      }
    });
  }
}

