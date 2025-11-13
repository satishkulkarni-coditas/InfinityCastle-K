@echo off
REM Compliance Application Startup Script (Batch File)
REM This script starts both the backend API and frontend Angular application

echo ========================================
echo   Compliance Application Startup Script
echo ========================================
echo.

REM Get the script directory
set SCRIPT_DIR=%~dp0
set API_PATH=%SCRIPT_DIR%Compliance.Api
set CLIENT_PATH=%SCRIPT_DIR%Compliance.Client

REM Check if folders exist
if not exist "%API_PATH%" (
    echo ERROR: Compliance.Api folder not found at: %API_PATH%
    pause
    exit /b 1
)

if not exist "%CLIENT_PATH%" (
    echo ERROR: Compliance.Client folder not found at: %CLIENT_PATH%
    pause
    exit /b 1
)

echo Starting Compliance Backend API...
echo Backend will run on: http://localhost:5002
echo Swagger UI: http://localhost:5002/swagger
echo.

REM Start Backend API in new window
start "Compliance Backend API" powershell -NoExit -Command "cd '%API_PATH%'; Write-Host 'Compliance Backend API - Starting...' -ForegroundColor Green; dotnet run"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

echo.
echo Starting Compliance Frontend (Angular)...
echo Frontend will run on: http://localhost:4202
echo.

REM Check if node_modules exists
if not exist "%CLIENT_PATH%\node_modules" (
    echo Installing frontend dependencies...
    cd /d "%CLIENT_PATH%"
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install frontend dependencies
        pause
        exit /b 1
    )
)

REM Start Frontend in new window
start "Compliance Frontend" powershell -NoExit -Command "cd '%CLIENT_PATH%'; Write-Host 'Compliance Frontend - Starting...' -ForegroundColor Green; npm start"

echo.
echo ========================================
echo   Applications Starting...
echo ========================================
echo.
echo Backend API: http://localhost:5002
echo Frontend App: http://localhost:4202
echo.
echo Default Login Credentials:
echo   Email: admin@compliance.com
echo   Password: Admin@123
echo.
echo To stop the applications, close the PowerShell windows
echo.
pause

