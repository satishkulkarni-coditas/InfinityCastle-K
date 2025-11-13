# KPMG Platform - Multi-Tenant Applications

This repository contains standalone multi-tenant applications that can be run independently. Each application includes its own backend API and frontend client.

## 📦 Applications

### 1. TDH-App
A multi-tenant application with user management, tenant onboarding, and role-based access control.

- **Backend**: .NET Core 8.0 API (Port: 5000)
- **Frontend**: Angular 17 (Port: 4200)
- **Database**: SQL Server LocalDB (`TDH_Db`)

### 2. Compliance-App
A multi-tenant compliance application with similar architecture.

- **Backend**: .NET Core 8.0 API (Port: 5002)
- **Frontend**: Angular 17 (Port: 4202)
- **Database**: SQL Server LocalDB (`Compliance_Db`)

## 🚀 Quick Start

### Prerequisites

Before running any application, ensure you have:

1. **.NET 8.0 SDK**
   ```powershell
   dotnet --version  # Should show 8.0.x
   ```
   Download: https://dotnet.microsoft.com/download/dotnet/8.0

2. **Node.js 18+ and npm**
   ```powershell
   node --version  # Should show v18.x or higher
   npm --version
   ```
   Download: https://nodejs.org/

3. **SQL Server LocalDB** (or SQL Server Express)
   ```powershell
   sqllocaldb info  # Should list MSSQLLocalDB
   ```
   - Comes with Visual Studio, or
   - Download SQL Server Express (free)

### Running TDH-App

```powershell
# Navigate to TDH-App folder
cd TDH-App

# Run the startup script (PowerShell)
.\run-tdh.ps1

# Or use batch file
run-tdh.bat
```

**Access Points:**
- 🌐 Frontend: http://localhost:4200
- 🔧 Backend API: http://localhost:5000
- 📚 Swagger UI: http://localhost:5000/swagger

**Default Login:**
- Email: `admin@tdh.com`
- Password: `Admin@123`

### Running Compliance-App

```powershell
# Navigate to Compliance-App folder
cd Compliance-App

# Run the startup script (PowerShell)
.\run-compliance.ps1

# Or use batch file
run-compliance.bat
```

**Access Points:**
- 🌐 Frontend: http://localhost:4202
- 🔧 Backend API: http://localhost:5002
- 📚 Swagger UI: http://localhost:5002/swagger

**Default Login:**
- Email: `admin@compliance.com`
- Password: `Admin@123`

## ✨ Key Features

### Automatic Setup
Both applications are designed to work out-of-the-box:
- ✅ **Database auto-creation** on first run
- ✅ **Automatic data seeding** (roles and admin users)
- ✅ **Dependency installation** handled by run scripts
- ✅ **No manual configuration** required

### Running in Isolation
Each application runs completely independently:
- Separate databases
- Different ports (no conflicts)
- Independent authentication
- Can run simultaneously or separately

## 📁 Project Structure

```
KPMGPlatform/
├── TDH-App/
│   ├── TDH.Api/          # Backend API (.NET Core)
│   ├── TDH.Client/       # Frontend (Angular)
│   ├── run-tdh.ps1       # PowerShell startup script
│   ├── run-tdh.bat       # Batch startup script
│   └── README.md         # TDH-App specific documentation
│
├── Compliance-App/
│   ├── Compliance.Api/   # Backend API (.NET Core)
│   ├── Compliance.Client/# Frontend (Angular)
│   ├── run-compliance.ps1# PowerShell startup script
│   ├── run-compliance.bat# Batch startup script
│   └── README.md         # Compliance-App specific documentation
│
├── Platform/             # Platform portal (optional)
├── README.md             # This file
└── SETUP-GUIDE.md        # Detailed setup guide
```

## 🔧 Manual Setup (Alternative)

If you prefer to run components manually:

### TDH-App Backend
```powershell
cd TDH-App/TDH.Api
dotnet restore
dotnet run
```

### TDH-App Frontend
```powershell
cd TDH-App/TDH.Client
npm install
npm start
```

### Compliance-App Backend
```powershell
cd Compliance-App/Compliance.Api
dotnet restore
dotnet run
```

### Compliance-App Frontend
```powershell
cd Compliance-App/Compliance.Client
npm install
npm start
```

## 🗄️ Database

Both applications use SQL Server LocalDB by default:
- **TDH-App**: Database name `TDH_Db`
- **Compliance-App**: Database name `Compliance_Db`

Databases are created automatically on first run. No manual setup required!

## 🐛 Troubleshooting

### Port Already in Use
If you see port warnings:
- Stop other applications using those ports
- Or change ports in `Properties/launchSettings.json` (backend) and `angular.json` (frontend)

### SQL Server LocalDB Not Found
```powershell
# Start LocalDB manually
sqllocaldb start MSSQLLocalDB
```

Or install SQL Server Express: https://www.microsoft.com/en-us/sql-server/sql-server-downloads

### CORS Errors
- Ensure backend starts before frontend
- Verify ports match the configuration
- Check browser console for specific errors

For more detailed troubleshooting, see [SETUP-GUIDE.md](./SETUP-GUIDE.md)

## 📚 Documentation

- [SETUP-GUIDE.md](./SETUP-GUIDE.md) - Comprehensive setup and troubleshooting guide
- [TDH-App/README.md](./TDH-App/README.md) - TDH-App specific documentation
- [Compliance-App/README.md](./Compliance-App/README.md) - Compliance-App specific documentation

## 🔐 Security Notes

**For Development:**
- Default admin credentials are provided for quick setup
- JWT keys are in `appsettings.json` (change for production)
- HTTP is used (HTTPS recommended for production)

**For Production:**
- Change all default passwords
- Use secure JWT keys
- Enable HTTPS
- Use proper database connection strings
- Set up environment-specific configurations

## 🤝 Contributing

1. Each application is self-contained
2. Make changes in the respective app folder
3. Test both backend and frontend
4. Ensure database migrations work (if applicable)

## 📝 License

[Add your license information here]

## 🆘 Support

For issues or questions:
1. Check the [SETUP-GUIDE.md](./SETUP-GUIDE.md) for common issues
2. Review application-specific README files
3. Check Swagger UI for API documentation

---

**Note**: These applications are designed to run independently. They can be integrated with a platform portal in future phases, but currently work as standalone applications.

