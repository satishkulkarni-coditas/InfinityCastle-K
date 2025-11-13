import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';

interface Tenant {
  id: string;
  name: string;
  code: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

@Component({
  selector: 'app-user-assign',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  template: `
    <div class="container">
      <h1>Assign User to Tenant</h1>
      
      <mat-card class="form-container">
        <mat-card-content>
          <form [formGroup]="assignForm" (ngSubmit)="onSubmit()">
            <mat-form-field class="full-width">
              <mat-label>User</mat-label>
              <mat-select formControlName="userId" required>
                <mat-option *ngFor="let user of users" [value]="user.id">
                  {{ user.firstName }} {{ user.lastName }} ({{ user.email }})
                </mat-option>
              </mat-select>
              <mat-error *ngIf="assignForm.get('userId')?.hasError('required')">
                User is required
              </mat-error>
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>Tenant</mat-label>
              <mat-select formControlName="tenantId" required>
                <mat-option *ngFor="let tenant of tenants" [value]="tenant.id">
                  {{ tenant.name }} ({{ tenant.code }})
                </mat-option>
              </mat-select>
              <mat-error *ngIf="assignForm.get('tenantId')?.hasError('required')">
                Tenant is required
              </mat-error>
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>Role</mat-label>
              <mat-select formControlName="role" required>
                <mat-option value="AppAdmin">App Admin</mat-option>
                <mat-option value="GroupAdmin">Group Admin</mat-option>
                <mat-option value="User">User</mat-option>
              </mat-select>
              <mat-error *ngIf="assignForm.get('role')?.hasError('required')">
                Role is required
              </mat-error>
            </mat-form-field>

            <div class="actions">
              <button mat-button type="button" routerLink="/users">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="assignForm.invalid || loading">
                {{ loading ? 'Assigning...' : 'Assign User' }}
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
export class UserAssignComponent implements OnInit {
  assignForm: FormGroup;
  users: User[] = [];
  tenants: Tenant[] = [];
  loading = false;
  apiUrl = 'http://localhost:5002/api';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.assignForm = this.fb.group({
      userId: ['', [Validators.required]],
      tenantId: ['', [Validators.required]],
      role: ['User', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadTenants();
  }

  loadUsers(): void {
    this.http.get<User[]>(`${this.apiUrl}/users`).subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => {
        this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
      }
    });
  }

  loadTenants(): void {
    this.http.get<Tenant[]>(`${this.apiUrl}/tenants`).subscribe({
      next: (tenants) => {
        this.tenants = tenants;
      },
      error: (error) => {
        this.snackBar.open('Failed to load tenants', 'Close', { duration: 3000 });
      }
    });
  }

  onSubmit(): void {
    if (this.assignForm.valid) {
      this.loading = true;
      this.http.post(`${this.apiUrl}/usertenants/assign`, this.assignForm.value).subscribe({
        next: () => {
          this.loading = false;
          this.snackBar.open('User assigned successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/users']);
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open(error.error?.message || 'Failed to assign user', 'Close', { duration: 3000 });
        }
      });
    }
  }
}

