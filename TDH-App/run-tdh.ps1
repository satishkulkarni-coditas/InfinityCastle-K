# TDH Application Startup Script
# This script starts both the backend API and frontend Angular application

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TDH Application Startup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory (where TDH-App folder is)
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$apiPath = Join-Path $scriptPath "TDH.Api"
$clientPath = Join-Path $scriptPath "TDH.Client"

# Check if folders exist
if (-not (Test-Path $apiPath)) {
    Write-Host "ERROR: TDH.Api folder not found at: $apiPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $clientPath)) {
    Write-Host "ERROR: TDH.Client folder not found at: $clientPath" -ForegroundColor Red
    exit 1
}

# Function to check if port is in use
function Test-Port {
    param([int]$Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
    return $connection
}

# Check if ports are already in use
Write-Host "Checking ports..." -ForegroundColor Yellow
if (Test-Port -Port 5000) {
    Write-Host "WARNING: Port 5000 is already in use. Backend may not start." -ForegroundColor Yellow
}

if (Test-Port -Port 4200) {
    Write-Host "WARNING: Port 4200 is already in use. Frontend may not start." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting TDH Backend API..." -ForegroundColor Green
Write-Host "Backend will run on: http://localhost:5000" -ForegroundColor Gray
Write-Host "Swagger UI: http://localhost:5000/swagger" -ForegroundColor Gray
Write-Host ""

# Start Backend API in new window
$backendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$apiPath'; Write-Host 'TDH Backend API - Starting...' -ForegroundColor Green; dotnet run" -PassThru

# Wait a bit for backend to start
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Starting TDH Frontend (Angular)..." -ForegroundColor Green
Write-Host "Frontend will run on: http://localhost:4200" -ForegroundColor Gray
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path (Join-Path $clientPath "node_modules"))) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location $clientPath
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install frontend dependencies" -ForegroundColor Red
        Stop-Process -Id $backendJob.Id -Force -ErrorAction SilentlyContinue
        exit 1
    }
}

# Start Frontend in new window
$frontendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$clientPath'; Write-Host 'TDH Frontend - Starting...' -ForegroundColor Green; npm start" -PassThru

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Applications Starting..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend API Process ID: $($backendJob.Id)" -ForegroundColor Gray
Write-Host "Frontend Process ID: $($frontendJob.Id)" -ForegroundColor Gray
Write-Host ""
Write-Host "Backend API: http://localhost:5000" -ForegroundColor Green
Write-Host "Frontend App: http://localhost:4200" -ForegroundColor Green
Write-Host ""
Write-Host "Default Login Credentials:" -ForegroundColor Yellow
Write-Host "  Email: admin@tdh.com" -ForegroundColor White
Write-Host "  Password: Admin@123" -ForegroundColor White
Write-Host ""
Write-Host "To stop the applications, close the PowerShell windows or press Ctrl+C" -ForegroundColor Gray
Write-Host ""

# Wait for user input to keep script running
Write-Host "Press any key to exit (this will NOT stop the applications)..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

