# Migration Guide: Moving TDH Projects to TDH-App Folder

## Current Status

The TDH application run scripts have been created in the `TDH-App` folder, but the project folders (`TDH.Api` and `TDH.Client`) are still in the root directory.

## Steps to Complete Migration

### Step 1: Stop All Running Applications

**IMPORTANT**: Before moving folders, you must stop all running TDH processes:

1. Close any PowerShell/Command Prompt windows running:
   - `dotnet run` (backend)
   - `npm start` or `ng serve` (frontend)

2. Or kill processes manually:
   ```powershell
   # Kill .NET processes
   Get-Process -Name "dotnet" | Where-Object { $_.Path -like "*TDH.Api*" } | Stop-Process -Force
   
   # Kill Node processes for TDH
   Get-Process -Name "node" | Where-Object { $_.Path -like "*TDH.Client*" } | Stop-Process -Force
   ```

### Step 2: Move the Folders

**Option A: Using the Migration Script (Recommended)**

```powershell
.\move-to-tdh-app.ps1
```

**Option B: Manual Move**

```powershell
# Create TDH-App if it doesn't exist
New-Item -ItemType Directory -Path "TDH-App" -Force

# Move folders
Move-Item -Path "TDH.Api" -Destination "TDH-App\" -Force
Move-Item -Path "TDH.Client" -Destination "TDH-App\" -Force
```

### Step 3: Verify Structure

After moving, your structure should look like:

```
KPMGPlatform/
├── TDH-App/
│   ├── TDH.Api/
│   ├── TDH.Client/
│   ├── run-tdh.ps1
│   ├── run-tdh.bat
│   ├── README.md
│   └── QUICKSTART.md
├── README.md
└── (other files)
```

### Step 4: Test the Run Scripts

```powershell
cd TDH-App
.\run-tdh.ps1
```

Or double-click `run-tdh.bat`

## Troubleshooting

### "Folder not found" Error

If the script says folders are not found:
1. Verify folders are in `TDH-App` directory
2. Check the script paths are correct
3. Make sure you're running the script from `TDH-App` folder

### "Port already in use" Warning

This is normal if you have other applications using those ports. The script will still try to start, but you may need to:
- Stop other applications using ports 5000 or 4200
- Or change ports in configuration files

### "Access Denied" When Moving

- Make sure all processes are stopped
- Close any file explorers with those folders open
- Run PowerShell as Administrator if needed

## After Migration

Once moved, you can:

1. **Run the application:**
   ```powershell
   cd TDH-App
   .\run-tdh.ps1
   ```

2. **Access the application:**
   - Frontend: http://localhost:4200
   - Backend: http://localhost:5000
   - Swagger: http://localhost:5000/swagger

3. **Login with:**
   - Email: admin@tdh.com
   - Password: Admin@123

## Benefits of New Structure

✅ All TDH code in one folder  
✅ Easy startup with single script  
✅ Better organization  
✅ Clear separation from other projects  

