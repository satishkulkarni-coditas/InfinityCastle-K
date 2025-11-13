import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const appAdminGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for initial auth check to complete
  await authService.waitForAuthCheck();

  if (authService.isAuthenticated() && authService.hasRole('AppAdmin')) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};

