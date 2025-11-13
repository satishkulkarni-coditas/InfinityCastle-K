# Script to move TDH projects to TDH-App folder
# IMPORTANT: Stop all running TDH processes before running this script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Moving TDH Projects to TDH-App" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if processes are running
$dotnetProcesses = Get-Process -Name "dotnet" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*TDH.Api*" }
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*TDH.Client*" }

if ($dotnetProcesses -or $nodeProcesses) {
    Write-Host "WARNING: TDH processes are still running!" -ForegroundColor Red
    Write-Host "Please stop all TDH applications before moving folders." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to continue anyway (not recommended)..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

$rootPath = Get-Location
$tdhAppPath = Join-Path $rootPath "TDH-App"

# Create TDH-App folder if it doesn't exist
if (-not (Test-Path $tdhAppPath)) {
    New-Item -ItemType Directory -Path $tdhAppPath -Force | Out-Null
    Write-Host "Created TDH-App folder" -ForegroundColor Green
}

# Move TDH.Api
$apiSource = Join-Path $rootPath "TDH.Api"
$apiDest = Join-Path $tdhAppPath "TDH.Api"

if (Test-Path $apiSource) {
    if (Test-Path $apiDest) {
        Write-Host "TDH.Api already exists in TDH-App. Skipping..." -ForegroundColor Yellow
    } else {
        Write-Host "Moving TDH.Api..." -ForegroundColor Yellow
        Move-Item -Path $apiSource -Destination $tdhAppPath -Force
        Write-Host "TDH.Api moved successfully" -ForegroundColor Green
    }
} else {
    Write-Host "TDH.Api not found in root. It may already be moved." -ForegroundColor Yellow
}

# Move TDH.Client
$clientSource = Join-Path $rootPath "TDH.Client"
$clientDest = Join-Path $tdhAppPath "TDH.Client"

if (Test-Path $clientSource) {
    if (Test-Path $clientDest) {
        Write-Host "TDH.Client already exists in TDH-App. Skipping..." -ForegroundColor Yellow
    } else {
        Write-Host "Moving TDH.Client..." -ForegroundColor Yellow
        Move-Item -Path $clientSource -Destination $tdhAppPath -Force
        Write-Host "TDH.Client moved successfully" -ForegroundColor Green
    }
} else {
    Write-Host "TDH.Client not found in root. It may already be moved." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Move Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now use the run scripts in TDH-App folder:" -ForegroundColor Green
Write-Host "  - TDH-App\run-tdh.ps1 (PowerShell)" -ForegroundColor White
Write-Host "  - TDH-App\run-tdh.bat (Batch file)" -ForegroundColor White
Write-Host ""

