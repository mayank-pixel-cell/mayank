param(
    [ValidateSet("auto", "desktop-web", "tauri-dev", "tauri-build")]
    [string]$Mode = "auto"
)

$ErrorActionPreference = "Continue"
$WorkspaceRoot = $PSScriptRoot
Set-Location $WorkspaceRoot

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "   ARC TRACKER 2026 - MULTI-USER LAUNCHER (v2.6.0)       " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

# 1. Configure Rust Cargo Target Directory outside OneDrive
$env:CARGO_TARGET_DIR = "C:\Users\vruti\.cargo_target\arc_tracker"

# 2. Build Pre-Compiled Tailwind + Vite Production Bundle
Write-Host "[1/3] Compiling Vite + Tailwind Production Bundle..." -ForegroundColor Yellow
& npm.cmd run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Frontend build failed." -ForegroundColor Red
    exit 1
}

# 3. Check if pre-built Tauri executable exists
$TauriExe = Join-Path $env:CARGO_TARGET_DIR "release\arc-tracker.exe"
if ((Test-Path $TauriExe) -and ($Mode -eq "auto")) {
    Write-Host "[2/3] Launching Native Rust Tauri Executable..." -ForegroundColor Green
    Start-Process -FilePath $TauriExe
    exit 0
}

# 4. If Tauri Dev was explicitly requested, test Smart App Control status first
if ($Mode -eq "tauri-dev" -or $Mode -eq "tauri-build") {
    $sacState = (Get-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\CI\Policy" -Name "VerifiedAndReputablePolicyState" -ErrorAction SilentlyContinue).VerifiedAndReputablePolicyState
    if ($sacState -eq 1) {
        Write-Host "[NOTICE] Windows 11 Smart App Control is active (State=1) and blocks unsigned Cargo build scripts." -ForegroundColor Yellow
        Write-Host "         Falling back to Native Frameless Desktop App Mode..." -ForegroundColor Cyan
        $Mode = "desktop-web"
    } else {
        if ($Mode -eq "tauri-dev") {
            & npm.cmd run tauri dev
            exit $LASTEXITCODE
        } else {
            & npm.cmd run tauri build
            exit $LASTEXITCODE
        }
    }
}

# 5. Launch Production Server + Native Frameless Desktop Window (Edge/Chrome --app mode)
Write-Host "[2/3] Starting Arc Tracker Local Production Server on http://localhost:1420 ..." -ForegroundColor Green
$ServerJob = Start-Process -FilePath "npm.cmd" -ArgumentList "run", "preview", "--", "--port", "1420", "--strictPort", "--host" -PassThru -WindowStyle Hidden

Start-Sleep -Seconds 2

$EdgePaths = @(
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
    "${env:ProgramFiles}\Microsoft\Edge\Application\msedge.exe"
)
$ChromePaths = @(
    "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
)

$AppBrowser = ($EdgePaths + $ChromePaths) | Where-Object { Test-Path $_ } | Select-Object -First 1

if ($AppBrowser) {
    Write-Host "[3/3] Opening Arc Tracker Native Desktop Window..." -ForegroundColor Cyan
    Start-Process -FilePath $AppBrowser -ArgumentList "--app=http://localhost:1420", "--start-maximized"
} else {
    Write-Host "[3/3] Opening Arc Tracker in default browser..." -ForegroundColor Cyan
    Start-Process "http://localhost:1420"
}

Write-Host ""
Write-Host "Arc Tracker is running! Press Ctrl+C in this terminal when you are done to stop the background server." -ForegroundColor Green
Wait-Process -Id $ServerJob.Id
