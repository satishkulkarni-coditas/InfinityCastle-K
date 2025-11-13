import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { AuthService, LoginResponse } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatListModule],
  template: `
    <div class="container">
      <h1>Dashboard</h1>
      
      <div *ngIf="currentUser" class="user-info">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Welcome, {{ currentUser.fullName }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p><strong>Email:</strong> {{ currentUser.email }}</p>
            <p><strong>Roles:</strong> {{ currentUser.roles.join(', ') }}</p>
            <p><strong>Tenants:</strong></p>
            <mat-list>
              <mat-list-item *ngFor="let tenant of currentUser.tenants">
                {{ tenant.name }} ({{ tenant.code }}) - {{ tenant.role }}
              </mat-list-item>
            </mat-list>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="actions mt-20">
        <button mat-raised-button color="primary" routerLink="/tenants">
          Manage Tenants
        </button>
        <button mat-raised-button color="primary" routerLink="/users" *ngIf="authService.hasRole('Admin')">
          Manage Users
        </button>
      </div>
    </div>
  `,
  styles: [`
    .user-info {
      margin-bottom: 20px;
    }
    .actions {
      display: flex;
      gap: 10px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: LoginResponse | null = null;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }
}

