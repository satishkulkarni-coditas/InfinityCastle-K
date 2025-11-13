# Compliance Application

A multi-tenant application with user management, tenant onboarding, and role-based access control.

## Architecture

- **Backend**: .NET Core 8.0 API with ASP.NET Core Identity
- **Frontend**: Angular 17 with Material Design
- **Database**: SQL Server (LocalDB for local development)
- **Authentication**: JWT tokens stored in HTTP-only cookies

## Prerequisites

- .NET 8.0 SDK
- Node.js 18+ and npm
- SQL Server LocalDB (or SQL Server Express)

## Quick Start

### Option 1: Using Run Scripts (Recommended)

The Compliance application is organized in the `Compliance-App` folder with convenient run scripts:

**PowerShell:**
```powershell
cd Compliance-App
.\run-compliance.ps1
```

**Batch File:**
```cmd
cd Compliance-App
run-compliance.bat
```

This will start both the backend API and frontend application automatically.

### Option 2: Manual Setup

**1. Backend Setup:**
```bash
cd Compliance-App/Compliance.Api
dotnet restore
dotnet run
```

The API will run on `http://localhost:5002`

**2. Frontend Setup:**
```bash
cd Compliance-App/Compliance.Client
npm install
npm start
```

The Angular app will run on `http://localhost:4202`

**Default Admin User:**
- Email: `admin@compliance.com`
- Password: `Admin@123`

### 3. Database

The database will be created automatically on first run using Entity Framework Core's `EnsureCreated()`.

## Features

### Authentication
- User login with email/password
- JWT token stored in HTTP-only cookie
- Token contains userId and roles

### User Management
- Create users (AppAdmin and GroupAdmin)
- View all users (AppAdmin and GroupAdmin)
- View user tenants
- User details with roles and tenants

### Tenant Management
- Onboard new tenants (AppAdmin only)
- View all tenants
- Click tenant row to view all its users
- Tenant details with assigned users

### User-Tenant Assignment
- Assign users to tenants
- Assign roles: AppAdmin, GroupAdmin, User
- View user's tenants
- View tenant's users

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users` - Get all users (AppAdmin and GroupAdmin)
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create user (AppAdmin and GroupAdmin)
- `DELETE /api/users/{id}` - Deactivate user (AppAdmin only)

### Tenants
- `GET /api/tenants` - Get all tenants
- `GET /api/tenants/{id}` - Get tenant by ID
- `POST /api/tenants` - Create tenant (AppAdmin only)
- `PUT /api/tenants/{id}` - Update tenant (AppAdmin only)
- `DELETE /api/tenants/{id}` - Deactivate tenant (AppAdmin only)

### User-Tenant Assignment
- `POST /api/usertenants/assign` - Assign user to tenant (AppAdmin only)
- `POST /api/usertenants/unassign` - Unassign user from tenant (AppAdmin only)
- `GET /api/usertenants/user/{userId}` - Get user's tenants
- `GET /api/usertenants/tenant/{tenantId}` - Get tenant's users

## Roles

- **AppAdmin**: Full access to all features
- **GroupAdmin**: Tenant-level admin access
- **User**: Standard user access

## Development Notes

- Token is stored in HTTP-only cookie for security
- CORS is configured for `http://localhost:4202`
- Database uses LocalDB by default (change connection string in `appsettings.json` for production)
- JWT key should be changed in production (currently in `appsettings.json`)

## Next Steps

This is a standalone Compliance application. In Phase 2 of the platform migration, this will be integrated with:
- Platform IdP (centralized authentication)
- Platform portal (unified entry point)
- UserAppLink table (centralized user-tenant-app-role mapping)

