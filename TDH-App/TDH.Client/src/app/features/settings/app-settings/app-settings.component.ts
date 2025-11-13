import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-app-settings',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>App Settings</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p class="message">App Setting Page loaded for {{ role }}</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    .message {
      font-size: 18px;
      color: #333;
      margin: 20px 0;
    }
  `]
})
export class AppSettingsComponent implements OnInit {
  role: string = '';

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.role = this.authService.getPrimaryRole();
  }
}

