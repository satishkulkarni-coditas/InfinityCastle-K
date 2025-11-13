# Quick Start Guide - TDH Application

## Prerequisites Check

Before starting, ensure you have:
- ✅ .NET 8.0 SDK installed (`dotnet --version`)
- ✅ Node.js 18+ installed (`node --version`)
- ✅ SQL Server LocalDB (comes with Visual Studio) or SQL Server Express

## Step-by-Step Setup

### 1. Start the Backend API

```bash
# Navigate to API directory
cd TDH.Api

# Restore packages
dotnet restore

# Run the API
dotnet run
```

The API will start on `http://localhost:5000`

**Note**: The database will be created automatically on first run.

### 2. Start the Angular Frontend

Open a **new terminal** and run:

```bash
# Navigate to client directory
cd TDH.Client

# Install dependencies (first time only)
npm install

# Start the development server
npm start
```

The Angular app will start on `http://localhost:4200`

### 3. Login

Open your browser and navigate to `http://localhost:4200`

**Default Admin Credentials:**
- Email: `admin@tdh.com`
- Password: `Admin@123`

## Testing the Application

### 1. Login
- Navigate to `http://localhost:4200`
- You'll be redirected to the login page
- Use the admin credentials above

### 2. Onboard a Tenant
- After login, click "Manage Tenants" or navigate to `/tenants`
- Click "Onboard New Tenant"
- Fill in:
  - Name: `Acme Corporation`
  - Code: `ACME`
  - Description: `Test tenant`
- Click "Create Tenant"

### 3. Create a User
- Navigate to `/users` (Admin only)
- The API endpoint is available, but UI for creating users can be added
- Or use the API directly: `POST /api/users`

### 4. Assign User to Tenant
- Navigate to `/users/assign`
- Select a user
- Select the tenant you created
- Choose a role: Admin, EntityAdmin, or User
- Click "Assign User"

## API Testing with Swagger

1. Navigate to `http://localhost:5000/swagger`
2. You can test all API endpoints directly
3. For authenticated endpoints, use the "Authorize" button and enter the JWT token

## Troubleshooting

### Database Connection Issues

If you get database connection errors:

1. **Check LocalDB is running:**
   ```bash
   sqllocaldb info
   sqllocaldb start MSSQLLocalDB
   ```

2. **Or update connection string** in `TDH.Api/appsettings.json`:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=localhost;Database=TDH_Db;Trusted_Connection=True;"
   }
   ```

### CORS Issues

If you see CORS errors:
- Ensure the API is running on `http://localhost:5000`
- Check `Program.cs` has CORS configured for `http://localhost:4200`

### Token Issues

- Token is stored in HTTP-only cookie (not accessible via JavaScript)
- Cookie is set with `Secure: false` for local HTTP development
- Token expires after 8 hours

## Next Steps

Once the application is running:
1. Test all features (login, tenant onboarding, user assignment)
2. Review the code structure
3. Plan migration to Platform IdP (Phase 2)

## API Endpoints Reference

- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/users` - Get all users (Admin)
- `GET /api/tenants` - Get all tenants
- `POST /api/tenants` - Create tenant (Admin)
- `POST /api/usertenants/assign` - Assign user to tenant (Admin)

See `README.md` for complete API documentation.

