import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule, MatMenuModule],
  template: `
    <mat-toolbar color="primary">
      <span>Compliance Application</span>
      <span class="spacer"></span>
      <ng-container *ngIf="authService.isAuthenticated()">
        <button mat-button [matMenuTriggerFor]="menu">
          {{ authService.getCurrentUser()?.fullName }}
        </button>
        <mat-menu #menu="matMenu">
          <button mat-menu-item (click)="logout()">Logout</button>
        </mat-menu>
      </ng-container>
    </mat-toolbar>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }
    mat-toolbar {
      background-color: #4caf50 !important;
      color: #ffffff !important;
    }
  `]
})
export class HeaderComponent {
  constructor(public authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}

