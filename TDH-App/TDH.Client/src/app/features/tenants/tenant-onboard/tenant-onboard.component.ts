import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-tenant-onboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  template: `
    <div class="container">
      <h1>Onboard New Tenant</h1>
      
      <mat-card class="form-container">
        <mat-card-content>
          <form [formGroup]="tenantForm" (ngSubmit)="onSubmit()">
            <mat-form-field class="full-width">
              <mat-label>Tenant Name</mat-label>
              <input matInput formControlName="name" required>
              <mat-error *ngIf="tenantForm.get('name')?.hasError('required')">
                Tenant name is required
              </mat-error>
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>Tenant Code</mat-label>
              <input matInput formControlName="code" required>
              <mat-error *ngIf="tenantForm.get('code')?.hasError('required')">
                Tenant code is required
              </mat-error>
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3"></textarea>
            </mat-form-field>

            <div class="actions">
              <button mat-button type="button" routerLink="/tenants">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="tenantForm.invalid || loading">
                {{ loading ? 'Creating...' : 'Create Tenant' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-container {
      max-width: 600px;
      margin: 0 auto;
    }
    .full-width {
      width: 100%;
      margin-bottom: 10px;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }
  `]
})
export class TenantOnboardComponent {
  tenantForm: FormGroup;
  loading = false;
  apiUrl = 'http://localhost:5000/api';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.tenantForm = this.fb.group({
      name: ['', [Validators.required]],
      code: ['', [Validators.required]],
      description: ['']
    });
  }

  onSubmit(): void {
    if (this.tenantForm.valid) {
      this.loading = true;
      this.http.post(`${this.apiUrl}/tenants`, this.tenantForm.value).subscribe({
        next: () => {
          this.loading = false;
          this.snackBar.open('Tenant created successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/tenants']);
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open(error.error?.message || 'Failed to create tenant', 'Close', { duration: 3000 });
        }
      });
    }
  }
}

