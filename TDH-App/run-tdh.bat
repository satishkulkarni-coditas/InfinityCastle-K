@echo off
REM TDH Application Startup Script (Batch File)
REM This script starts both the backend API and frontend Angular application

echo ========================================
echo   TDH Application Startup Script
echo ========================================
echo.

REM Get the script directory
set SCRIPT_DIR=%~dp0
set API_PATH=%SCRIPT_DIR%TDH.Api
set CLIENT_PATH=%SCRIPT_DIR%TDH.Client

REM Check if folders exist
if not exist "%API_PATH%" (
    echo ERROR: TDH.Api folder not found at: %API_PATH%
    pause
    exit /b 1
)

if not exist "%CLIENT_PATH%" (
    echo ERROR: TDH.Client folder not found at: %CLIENT_PATH%
    pause
    exit /b 1
)

echo Starting TDH Backend API...
echo Backend will run on: http://localhost:5000
echo Swagger UI: http://localhost:5000/swagger
echo.

REM Start Backend API in new window
start "TDH Backend API" powershell -NoExit -Command "cd '%API_PATH%'; Write-Host 'TDH Backend API - Starting...' -ForegroundColor Green; dotnet run"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

echo.
echo Starting TDH Frontend (Angular)...
echo Frontend will run on: http://localhost:4200
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
start "TDH Frontend" powershell -NoExit -Command "cd '%CLIENT_PATH%'; Write-Host 'TDH Frontend - Starting...' -ForegroundColor Green; npm start"

echo.
echo ========================================
echo   Applications Starting...
echo ========================================
echo.
echo Backend API: http://localhost:5000
echo Frontend App: http://localhost:4200
echo.
echo Default Login Credentials:
echo   Email: admin@tdh.com
echo   Password: Admin@123
echo.
echo To stop the applications, close the PowerShell windows
echo.
pause

