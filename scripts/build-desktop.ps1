# PowerShell script to build Arc Tracker Desktop for Windows (.exe / .msi)
$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Arc Tracker Desktop Build Automation" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Ensure Node & npm are available
Write-Host "`n[1/4] Checking Node.js environment..." -ForegroundColor Yellow
& node -v
& npm -v

# Ensure assets are localized & up-to-date
Write-Host "`n[2/4] Ensuring all offline assets and HTML are prepared..." -ForegroundColor Yellow
& node scripts/localize-assets.js
& node scripts/convert-html.js
& node scripts/generate-icons.js

# Build Vite frontend bundle
Write-Host "`n[3/4] Compiling frontend bundle with Vite..." -ForegroundColor Yellow
& npm run build

# Check Rust toolchain
Write-Host "`n[4/4] Invoking Tauri 2.0 Desktop Compiler..." -ForegroundColor Yellow
try {
    & npm run tauri build
    Write-Host "`n✔ Desktop application compiled successfully!" -ForegroundColor Green
    Write-Host "Output directory: src-tauri\target\release\bundle\" -ForegroundColor Green
} catch {
    Write-Host "`n[Notice] Local Rust/MSVC compiler encountered an issue: $_" -ForegroundColor Red
    Write-Host "Please ensure Rust and Visual Studio C++ Build Tools are installed, or push to GitHub to use the automated GitHub Actions CI workflow." -ForegroundColor Yellow
}
