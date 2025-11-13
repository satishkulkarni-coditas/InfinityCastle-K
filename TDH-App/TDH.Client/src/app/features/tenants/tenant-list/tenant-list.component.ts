import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../../core/services/auth.service';

interface Tenant {
  id: string;
  name: string;
  code: string;
  description: string;
  createdDate: string;
  userCount: number;
}

interface TenantUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  assignedDate: string;
}

@Component({
  selector: 'app-tenant-list',
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
    MatIconModule,
    MatExpansionModule,
    MatListModule
  ],
  template: `
    <div class="container">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h1>Tenants</h1>
        <button mat-raised-button color="primary" routerLink="/tenants/onboard" *ngIf="authService.hasRole('Admin')">
          <mat-icon>add</mat-icon> Onboard New Tenant
        </button>
      </div>

      <mat-card *ngIf="editingTenant" style="margin-bottom: 20px;">
        <mat-card-header>
          <mat-card-title>Edit Tenant</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="editForm" (ngSubmit)="onUpdateSubmit()">
            <mat-form-field style="width: 100%;">
              <mat-label>Tenant Name</mat-label>
              <input matInput formControlName="name" required>
              <mat-error *ngIf="editForm.get('name')?.hasError('required')">Tenant name is required</mat-error>
            </mat-form-field>

            <mat-form-field style="width: 100%;">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3"></textarea>
            </mat-form-field>

            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
              <button mat-button type="button" (click)="cancelEdit()">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="editForm.invalid || loading">
                {{ loading ? 'Updating...' : 'Update Tenant' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <table mat-table [dataSource]="tenants" class="mat-elevation-z0">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let tenant">{{ tenant.name }}</td>
          </ng-container>

          <ng-container matColumnDef="code">
            <th mat-header-cell *matHeaderCellDef>Code</th>
            <td mat-cell *matCellDef="let tenant">{{ tenant.code }}</td>
          </ng-container>

          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>Description</th>
            <td mat-cell *matCellDef="let tenant">{{ tenant.description || '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="userCount">
            <th mat-header-cell *matHeaderCellDef>Users</th>
            <td mat-cell *matCellDef="let tenant">{{ tenant.userCount }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let tenant">
              <button mat-icon-button color="primary" (click)="editTenant(tenant); $event.stopPropagation()" *ngIf="authService.hasRole('Admin')" title="Edit">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteTenant(tenant.id); $event.stopPropagation()" *ngIf="authService.hasRole('Admin')" title="Delete">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns" (click)="viewTenantUsers(row)"></tr>
        </table>
      </mat-card>

      <mat-card *ngIf="selectedTenant && tenantUsers.length > 0" style="margin-top: 20px;">
        <mat-card-header>
          <mat-card-title>Users in {{ selectedTenant.name }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-list>
            <mat-list-item *ngFor="let user of tenantUsers">
              <div style="display: flex; justify-content: space-between; width: 100%;">
                <div>
                  <strong>{{ user.firstName }} {{ user.lastName }}</strong> ({{ user.email }})
                  <br>
                  <span style="color: #666; font-size: 0.9em;">Role: {{ user.role }}</span>
                </div>
              </div>
            </mat-list-item>
          </mat-list>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="selectedTenant && tenantUsers.length === 0" style="margin-top: 20px;">
        <mat-card-content>
          <p>No users assigned to this tenant.</p>
        </mat-card-content>
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
    tr.mat-row {
      cursor: pointer;
    }
    tr.mat-row:hover {
      background-color: #f5f5f5;
    }
  `]
})
export class TenantListComponent implements OnInit {
  tenants: Tenant[] = [];
  displayedColumns: string[] = ['name', 'code', 'description', 'userCount', 'actions'];
  apiUrl = 'http://localhost:5000/api';
  editingTenant: Tenant | null = null;
  editForm: FormGroup;
  loading = false;
  selectedTenant: Tenant | null = null;
  tenantUsers: TenantUser[] = [];
  loadingUsers = false;

  constructor(
    private http: HttpClient,
    public authService: AuthService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadTenants();
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

  editTenant(tenant: Tenant): void {
    this.editingTenant = tenant;
    this.editForm.patchValue({
      name: tenant.name,
      description: tenant.description || ''
    });
  }

  cancelEdit(): void {
    this.editingTenant = null;
    this.editForm.reset();
  }

  onUpdateSubmit(): void {
    if (this.editForm.valid && this.editingTenant) {
      this.loading = true;
      this.http.put(`${this.apiUrl}/tenants/${this.editingTenant.id}`, this.editForm.value).subscribe({
        next: () => {
          this.loading = false;
          this.snackBar.open('Tenant updated successfully!', 'Close', { duration: 3000 });
          this.cancelEdit();
          this.loadTenants();
        },
        error: (error) => {
          this.loading = false;
          const message = error.error?.message || 'Failed to update tenant';
          this.snackBar.open(message, 'Close', { duration: 3000 });
        }
      });
    }
  }

  deleteTenant(id: string): void {
    if (confirm('Are you sure you want to delete this tenant? This will deactivate the tenant.')) {
      this.http.delete(`${this.apiUrl}/tenants/${id}`).subscribe({
        next: () => {
          this.snackBar.open('Tenant deleted successfully', 'Close', { duration: 3000 });
          this.loadTenants();
        },
        error: (error) => {
          this.snackBar.open('Failed to delete tenant', 'Close', { duration: 3000 });
        }
      });
    }
  }

  viewTenantUsers(tenant: Tenant): void {
    this.selectedTenant = tenant;
    this.loadingUsers = true;
    this.http.get<TenantUser[]>(`${this.apiUrl}/usertenants/tenant/${tenant.id}`).subscribe({
      next: (users) => {
        this.tenantUsers = users;
        this.loadingUsers = false;
      },
      error: (error) => {
        this.loadingUsers = false;
        this.snackBar.open('Failed to load tenant users', 'Close', { duration: 3000 });
      }
    });
  }
}

