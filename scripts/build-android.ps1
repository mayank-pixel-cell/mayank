# PowerShell script to build Arc Tracker Android Package (.apk) and Google Play Bundle (.aab)
param(
    [ValidateSet("all", "apk", "aab")]
    [string]$Target = "all"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Arc Tracker Android & Google Play Builder" -ForegroundColor Cyan
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

# Build Android Targets
Write-Host "`n[4/4] Compiling requested targets ($Target)..." -ForegroundColor Yellow
try {
    if ($Target -eq "apk" -or $Target -eq "all") {
        Write-Host "Building Release APK..." -ForegroundColor Cyan
        & npm run tauri -- android build --apk
        Write-Host "Signing APK with release certificate..." -ForegroundColor Cyan
        & powershell -ExecutionPolicy Bypass -File scripts/sign-apk.ps1
    }

    if ($Target -eq "aab" -or $Target -eq "all") {
        Write-Host "Building Google Play Store Android App Bundle (.aab)..." -ForegroundColor Cyan
        & npm run tauri -- android build --aab
        Write-Host "Signing Google Play AAB with release certificate..." -ForegroundColor Cyan
        & powershell -ExecutionPolicy Bypass -File scripts/sign-apk.ps1 -SignAab
    }
    Write-Host "`n✔ Android builds completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "`n[Notice] Android compilation requires Android Studio / NDK and JDK 17: $_" -ForegroundColor Red
    Write-Host "Use the automated .github/workflows/build-and-release.yml workflow to build both APK & Google Play AAB in GitHub Actions." -ForegroundColor Yellow
}
