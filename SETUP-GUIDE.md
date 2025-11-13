# Setup Guide for TDH-App and Compliance-App

This guide covers the prerequisites and setup process for running TDH-App and Compliance-App on a new machine.

## Prerequisites

### Required Software

1. **.NET 8.0 SDK**
   - Download from: https://dotnet.microsoft.com/download/dotnet/8.0
   - Verify installation: `dotnet --version` (should show 8.0.x)

2. **Node.js 18+ and npm**
   - Download from: https://nodejs.org/
   - Verify installation: 
     - `node --version` (should show v18.x or higher)
     - `npm --version`

3. **SQL Server LocalDB** (Recommended for local development)
   - **Option A**: Install with Visual Studio (comes bundled)
   - **Option B**: Install SQL Server Express (free)
   - **Option C**: Use existing SQL Server instance
   - Verify LocalDB: `sqllocaldb info` (should list MSSQLLocalDB)

### Optional but Recommended

- **Visual Studio 2022** or **Visual Studio Code** (for development)
- **Git** (if cloning from repository)

## Automatic Setup (No Manual Scripts Required)

Both applications are designed to work out-of-the-box with minimal setup:

### ✅ What Happens Automatically

1. **Database Creation**
   - Database is created automatically on first run using Entity Framework Core's `EnsureCreated()`
   - No manual database setup or migration scripts needed
   - Databases created:
     - `TDH_Db` for TDH-App
     - `Compliance_Db` for Compliance-App

2. **Initial Data Seeding**
   - Roles are automatically created (Admin, EntityAdmin/AppAdmin, User)
   - Default admin user is created automatically:
     - **TDH-App**: `admin@tdh.com` / `Admin@123`
     - **Compliance-App**: `admin@compliance.com` / `Admin@123`

3. **Dependency Installation**
   - Run scripts automatically check and install npm packages if `node_modules` doesn't exist
   - .NET packages are restored automatically on first run

## Quick Start (New Machine)

### For TDH-App

```powershell
# Navigate to TDH-App folder
cd TDH-App

# Run the startup script (handles everything automatically)
.\run-tdh.ps1
```

**Access Points:**
- Frontend: http://localhost:4200
- Backend API: http://localhost:5000
- Swagger UI: http://localhost:5000/swagger

**Default Login:**
- Email: `admin@tdh.com`
- Password: `Admin@123`

### For Compliance-App

```powershell
# Navigate to Compliance-App folder
cd Compliance-App

# Run the startup script (handles everything automatically)
.\run-compliance.ps1
```

**Access Points:**
- Frontend: http://localhost:4202
- Backend API: http://localhost:5002
- Swagger UI: http://localhost:5002/swagger

**Default Login:**
- Email: `admin@compliance.com`
- Password: `Admin@123`

## Potential Issues and Solutions

### Issue 1: SQL Server LocalDB Not Found

**Symptoms:**
- Error: "Cannot open database" or "A network-related or instance-specific error occurred"

**Solutions:**

**Option A: Start LocalDB manually**
```powershell
sqllocaldb start MSSQLLocalDB
```

**Option B: Install SQL Server Express**
- Download from: https://www.microsoft.com/en-us/sql-server/sql-server-downloads
- Choose "Express" edition (free)
- Update connection string in `appsettings.json` if needed

**Option C: Use SQL Server (if already installed)**
- Update connection string in `appsettings.json`:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=TDH_Db;Trusted_Connection=True;MultipleActiveResultSets=true"
}
```

### Issue 2: Port Already in Use

**Symptoms:**
- Warning: "Port 5000/5002/4200/4202 is already in use"

**Solutions:**
- Stop the application using that port
- Or change the port in:
  - Backend: `Properties/launchSettings.json`
  - Frontend: `angular.json` (serve.port)

### Issue 3: Node Modules Missing

**Symptoms:**
- Frontend won't start, npm errors

**Solution:**
The run scripts automatically install dependencies, but if needed manually:
```powershell
cd TDH-App/TDH.Client
npm install

# Or for Compliance-App
cd Compliance-App/Compliance.Client
npm install
```

### Issue 4: .NET SDK Not Found

**Symptoms:**
- Error: "dotnet: command not found" or "Could not find .NET SDK"

**Solution:**
1. Install .NET 8.0 SDK from https://dotnet.microsoft.com/download/dotnet/8.0
2. Restart terminal/PowerShell after installation
3. Verify: `dotnet --version`

### Issue 5: CORS Errors

**Symptoms:**
- Browser console shows CORS errors
- API calls fail with CORS policy errors

**Solution:**
- Ensure backend is running before frontend
- Check that ports match:
  - TDH: Backend 5000, Frontend 4200
  - Compliance: Backend 5002, Frontend 4202
- CORS is pre-configured in `Program.cs`

## Verification Checklist

After setup, verify everything works:

- [ ] .NET SDK installed (`dotnet --version`)
- [ ] Node.js installed (`node --version`)
- [ ] SQL Server LocalDB available (`sqllocaldb info`)
- [ ] Backend API starts without errors
- [ ] Frontend starts without errors
- [ ] Can access frontend in browser (http://localhost:4200 or 4202)
- [ ] Can login with default admin credentials
- [ ] Database created automatically (check SQL Server Management Studio or LocalDB)

## Manual Database Reset (If Needed)

If you need to reset the database:

1. **Stop the application**
2. **Delete the database** (using SQL Server Management Studio or command line)
3. **Restart the application** - it will recreate the database and seed initial data

**Using SQL Server Management Studio:**
- Connect to `(localdb)\MSSQLLocalDB`
- Right-click database → Delete
- Restart application

**Using Command Line:**
```sql
sqllocaldb stop MSSQLLocalDB
sqllocaldb delete MSSQLLocalDB
sqllocaldb create MSSQLLocalDB
```

## Production Considerations

For production deployment, you should:

1. **Change JWT Secret Key** in `appsettings.json`
2. **Use secure connection strings** (not LocalDB)
3. **Enable HTTPS** (update CORS settings)
4. **Change default admin password** after first login
5. **Use environment-specific configuration** (`appsettings.Production.json`)
6. **Set up proper database migrations** (instead of `EnsureCreated()`)

## Summary

**Good News:** Both applications are designed to work immediately on a new machine with minimal setup. Just ensure you have:
1. .NET 8.0 SDK
2. Node.js 18+
3. SQL Server LocalDB (or SQL Server Express)

Then simply run the startup scripts - everything else is automatic!

**No manual scripts, migrations, or database setup required** - the applications handle all initialization automatically on first run.

