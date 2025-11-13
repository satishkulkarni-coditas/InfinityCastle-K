import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav mode="side" opened class="sidenav" [class.sidenav-collapsed]="!isExpanded">
        <div class="sidenav-header">
          <button mat-icon-button (click)="toggleSidebar()" class="toggle-btn">
            <mat-icon>{{ isExpanded ? 'chevron_left' : 'chevron_right' }}</mat-icon>
          </button>
        </div>
        
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
            <mat-icon>dashboard</mat-icon>
            <span *ngIf="isExpanded">Dashboard</span>
          </a>
          
          <a mat-list-item routerLink="/tenants" routerLinkActive="active">
            <mat-icon>business</mat-icon>
            <span *ngIf="isExpanded">Manage Tenants</span>
          </a>
          
          <a mat-list-item routerLink="/users" routerLinkActive="active" *ngIf="authService.hasRole('AppAdmin') || authService.hasRole('GroupAdmin')">
            <mat-icon>people</mat-icon>
            <span *ngIf="isExpanded">Manage Users</span>
          </a>
          
          <a mat-list-item routerLink="/users/assign" routerLinkActive="active" *ngIf="authService.hasRole('AppAdmin')">
            <mat-icon>person_add</mat-icon>
            <span *ngIf="isExpanded">Assign Users</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>
      
      <mat-sidenav-content class="sidenav-content">
        <ng-content></ng-content>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: calc(100vh - 64px);
      position: relative;
    }
    
    .sidenav {
      width: 250px;
      background-color: #fafafa;
      border-right: 1px solid #e0e0e0;
      transition: width 0.3s ease;
    }
    
    .sidenav-collapsed {
      width: 64px !important;
    }
    
    .sidenav-header {
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: flex-end;
    }
    
    .toggle-btn {
      color: #666;
    }
    
    mat-nav-list {
      padding-top: 0;
    }
    
    mat-nav-list a {
      color: #333;
      padding: 12px 16px;
    }
    
    mat-nav-list a:hover {
      background-color: #f5f5f5;
    }
    
    mat-nav-list a.active {
      background-color: #e8f5e9;
      color: #4caf50;
      font-weight: 500;
    }
    
    mat-nav-list a mat-icon {
      margin-right: 16px;
      color: #666;
    }
    
    mat-nav-list a.active mat-icon {
      color: #4caf50;
    }
    
    .sidenav-collapsed mat-nav-list a span {
      display: none;
    }
    
    .sidenav-collapsed .sidenav-header {
      justify-content: center;
    }
    
    .sidenav-content {
      padding: 0;
      overflow-y: auto;
    }
  `]
})
export class SidebarComponent {
  isExpanded = true;

  constructor(public authService: AuthService) {}

  toggleSidebar(): void {
    this.isExpanded = !this.isExpanded;
  }
}

