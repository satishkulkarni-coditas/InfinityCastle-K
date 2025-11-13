import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdDate: string;
  roles: string[];
  tenants?: TenantInfo[];
}

interface TenantInfo {
  tenantId: string;
  tenantName: string;
  tenantCode: string;
  role: string;
}

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  template: `
    <div class="container">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h1>Users</h1>
        <div style="display: flex; gap: 10px;">
          <button mat-raised-button color="primary" (click)="showCreateForm = !showCreateForm" *ngIf="authService.hasRole('AppAdmin') || authService.hasRole('GroupAdmin')">
            <mat-icon>add</mat-icon> Create User
          </button>
          <button mat-raised-button color="accent" routerLink="/users/assign">
            <mat-icon>person_add</mat-icon> Assign to Tenant
          </button>
        </div>
      </div>

      <mat-card *ngIf="showCreateForm && (authService.hasRole('AppAdmin') || authService.hasRole('GroupAdmin'))" style="margin-bottom: 20px;">
        <mat-card-header>
          <mat-card-title>Create New User</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <mat-form-field>
                <mat-label>First Name</mat-label>
                <input matInput formControlName="firstName" required>
                <mat-error *ngIf="userForm.get('firstName')?.hasError('required')">First name is required</mat-error>
              </mat-form-field>

              <mat-form-field>
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="lastName" required>
                <mat-error *ngIf="userForm.get('lastName')?.hasError('required')">Last name is required</mat-error>
              </mat-form-field>
            </div>

            <mat-form-field style="width: 100%;">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" required>
              <mat-error *ngIf="userForm.get('email')?.hasError('required')">Email is required</mat-error>
              <mat-error *ngIf="userForm.get('email')?.hasError('email')">Invalid email format</mat-error>
            </mat-form-field>

            <mat-form-field style="width: 100%;">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" required>
              <mat-error *ngIf="userForm.get('password')?.hasError('required')">Password is required</mat-error>
              <mat-error *ngIf="userForm.get('password')?.hasError('minlength')">Password must be at least 6 characters</mat-error>
            </mat-form-field>

            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
              <button mat-button type="button" (click)="cancelForm()">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="userForm.invalid || loading">
                {{ loading ? 'Creating...' : 'Create User' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="editingUser && (authService.hasRole('AppAdmin') || authService.hasRole('GroupAdmin'))" style="margin-bottom: 20px;">
        <mat-card-header>
          <mat-card-title>Edit User</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="editForm" (ngSubmit)="onUpdate()">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <mat-form-field>
                <mat-label>First Name</mat-label>
                <input matInput formControlName="firstName" required>
                <mat-error *ngIf="editForm.get('firstName')?.hasError('required')">First name is required</mat-error>
              </mat-form-field>

              <mat-form-field>
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="lastName" required>
                <mat-error *ngIf="editForm.get('lastName')?.hasError('required')">Last name is required</mat-error>
              </mat-form-field>
            </div>

            <mat-form-field style="width: 100%;">
              <mat-label>Email</mat-label>
              <input matInput type="email" [value]="editingUser?.email" disabled>
              <mat-hint>Email cannot be changed</mat-hint>
            </mat-form-field>

            <mat-form-field style="width: 100%;">
              <mat-label>New Password (leave blank to keep current password)</mat-label>
              <input matInput type="password" formControlName="password">
              <mat-error *ngIf="editForm.get('password')?.hasError('minlength')">Password must be at least 6 characters</mat-error>
            </mat-form-field>

            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
              <button mat-button type="button" (click)="cancelEdit()">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="editForm.invalid || loading">
                {{ loading ? 'Updating...' : 'Update User' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <table mat-table [dataSource]="users" class="mat-elevation-z0">
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let user">{{ user.email }}</td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let user">{{ user.firstName }} {{ user.lastName }}</td>
          </ng-container>

          <ng-container matColumnDef="roles">
            <th mat-header-cell *matHeaderCellDef>Roles</th>
            <td mat-cell *matCellDef="let user">{{ user.roles.join(', ') || 'No roles' }}</td>
          </ng-container>

          <ng-container matColumnDef="tenants">
            <th mat-header-cell *matHeaderCellDef>Tenants</th>
            <td mat-cell *matCellDef="let user">
              <span *ngIf="user.tenants && user.tenants.length > 0">
                <span *ngFor="let tenant of user.tenants; let last = last">
                  {{ tenant.tenantName }}<span *ngIf="!last">, </span>
                </span>
              </span>
              <span *ngIf="!user.tenants || user.tenants.length === 0" style="color: #999;">No tenants</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let user">
              <button mat-icon-button color="primary" (click)="editUser(user)" *ngIf="authService.hasRole('AppAdmin') || authService.hasRole('GroupAdmin')" title="Edit">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteUser(user.id)" *ngIf="authService.hasRole('AppAdmin')" title="Delete">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>
      </mat-card>
    </div>
  `,
  styles: [`
    table {
      width: 100%;
    }
    .container {
      padding: 20px;
    }
  `]
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  displayedColumns: string[] = ['email', 'name', 'roles', 'tenants', 'actions'];
  apiUrl = 'http://localhost:5002/api';
  showCreateForm = false;
  editingUser: User | null = null;
  userForm: FormGroup;
  editForm: FormGroup;
  loading = false;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    public authService: AuthService
  ) {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]]
    });

    this.editForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      password: ['', [Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.http.get<User[]>(`${this.apiUrl}/users`).subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        if (error.status === 401) {
          this.snackBar.open('Unauthorized. Please log in again.', 'Close', { duration: 3000 });
        } else if (error.status === 403) {
          this.snackBar.open('Access denied. You do not have permission to view users.', 'Close', { duration: 3000 });
        } else {
          this.snackBar.open('Failed to load users: ' + (error.error?.message || error.message), 'Close', { duration: 3000 });
        }
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.loading = true;
      this.http.post(`${this.apiUrl}/users`, this.userForm.value).subscribe({
        next: () => {
          this.loading = false;
          this.snackBar.open('User created successfully!', 'Close', { duration: 3000 });
          this.cancelForm();
          this.loadUsers();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error creating user:', error);
          let message = 'Failed to create user';
          if (error.status === 401) {
            message = 'Unauthorized. Please log in again.';
          } else if (error.status === 403) {
            message = 'Access denied. You do not have permission to create users.';
          } else if (error.error?.message) {
            message = error.error.message;
          }
          this.snackBar.open(message, 'Close', { duration: 3000 });
        }
      });
    }
  }

  editUser(user: User): void {
    this.editingUser = user;
    this.showCreateForm = false;
    this.editForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      password: ''
    });
  }

  onUpdate(): void {
    if (this.editForm.valid && this.editingUser) {
      this.loading = true;
      const updateData: any = {
        firstName: this.editForm.value.firstName,
        lastName: this.editForm.value.lastName
      };
      
      // Only include password if provided
      if (this.editForm.value.password) {
        updateData.password = this.editForm.value.password;
      }

      this.http.put(`${this.apiUrl}/users/${this.editingUser.id}`, updateData).subscribe({
        next: () => {
          this.loading = false;
          this.snackBar.open('User updated successfully!', 'Close', { duration: 3000 });
          this.cancelEdit();
          this.loadUsers();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error updating user:', error);
          let message = 'Failed to update user';
          if (error.status === 401) {
            message = 'Unauthorized. Please log in again.';
          } else if (error.status === 403) {
            message = 'Access denied. You do not have permission to update users.';
          } else if (error.error?.message) {
            message = error.error.message;
          }
          this.snackBar.open(message, 'Close', { duration: 3000 });
        }
      });
    }
  }

  cancelForm(): void {
    this.showCreateForm = false;
    this.userForm.reset();
  }

  cancelEdit(): void {
    this.editingUser = null;
    this.editForm.reset();
  }

  deleteUser(id: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.http.delete(`${this.apiUrl}/users/${id}`).subscribe({
        next: () => {
          this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
          this.loadUsers();
        },
        error: (error) => {
          this.snackBar.open('Failed to delete user', 'Close', { duration: 3000 });
        }
      });
    }
  }
}

