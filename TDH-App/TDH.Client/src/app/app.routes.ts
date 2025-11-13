import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'tenants',
    loadComponent: () => import('./features/tenants/tenant-list/tenant-list.component').then(m => m.TenantListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'tenants/onboard',
    loadComponent: () => import('./features/tenants/tenant-onboard/tenant-onboard.component').then(m => m.TenantOnboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'users',
    loadComponent: () => import('./features/users/user-list/user-list.component').then(m => m.UserListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'users/assign',
    loadComponent: () => import('./features/users/user-assign/user-assign.component').then(m => m.UserAssignComponent),
    canActivate: [authGuard]
  }
];

