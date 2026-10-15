# PowerShell script to build Arc Tracker Android Package (.apk)
$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Arc Tracker Android APK Build Automation" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check Environment Variables for Android
Write-Host "`n[1/4] Verifying Android SDK and Java Environment..." -ForegroundColor Yellow
if (-not $env:ANDROID_HOME -and (Test-Path "$env:LOCALAPPDATA\Android\Sdk")) {
    $env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
}
Write-Host "ANDROID_HOME: $env:ANDROID_HOME"

if (-not $env:JAVA_HOME) {
    Write-Host "Notice: JAVA_HOME is not set. Ensure JDK 17 is installed for Gradle builds." -ForegroundColor Yellow
}

# Ensure assets and web bundle are built
Write-Host "`n[2/4] Building web assets..." -ForegroundColor Yellow
& node scripts/localize-assets.js
& node scripts/convert-html.js
& node scripts/generate-icons.js
& npm run build

# Initialize Android structure if not yet present
Write-Host "`n[3/4] Ensuring Android target is initialized..." -ForegroundColor Yellow
try {
    & npm run tauri -- android init
} catch {
    Write-Host "Tauri android init notice: $_" -ForegroundColor Yellow
}

# Build Android APK
Write-Host "`n[4/4] Building release APK..." -ForegroundColor Yellow
try {
    & npm run tauri -- android build --apk
    Write-Host "`n✔ Android APK built successfully!" -ForegroundColor Green
    Write-Host "Signing APK with release certificate..." -ForegroundColor Cyan
    & powershell -ExecutionPolicy Bypass -File scripts/sign-apk.ps1
} catch {
    Write-Host "`n[Notice] Android compilation requires Android Studio / NDK and JDK 17: $_" -ForegroundColor Red
    Write-Host "Use the provided .github/workflows/build-and-release.yml to build the APK in GitHub Actions automatically." -ForegroundColor Yellow
}
