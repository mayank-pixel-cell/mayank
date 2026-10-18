# PowerShell script to sign Android APK and Google Play AAB
param(
    [string]$ApkPath = "",
    [string]$OutputPath = "",
    [switch]$SignAab
)

$ErrorActionPreference = "Continue"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Arc Tracker Android Package Auto-Signer" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# If signing AAB bundle for Google Play Store
if ($SignAab) {
    $aabPaths = @(
        "src-tauri\gen\android\app\build\outputs\bundle\universalRelease\app-universal-release.aab",
        "src-tauri\gen\android\app\build\outputs\bundle\release\app-release.aab"
    )
    $FoundAab = ""
    foreach ($p in $aabPaths) {
        if (Test-Path $p) { $FoundAab = $p; break }
    }
    if (-not $FoundAab) {
        $candidate = Get-ChildItem "src-tauri\gen\android\app\build\outputs\bundle" -Filter "*.aab" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($candidate) { $FoundAab = $candidate.FullName }
    }
    if ($FoundAab) {
        $ApkPath = $FoundAab
        $OutputPath = Join-Path (Split-Path $FoundAab) "Arc-Tracker-GooglePlay.aab"
    } else {
        Write-Host "[Notice] No .aab bundle found. Run 'npm run tauri -- android build --aab' first." -ForegroundColor Yellow
        exit 0
    }
}

# Locate input APK if not provided
if (-not $ApkPath) {
    $searchPaths = @(
        "src-tauri\gen\android\app\build\outputs\apk\release\app-release-unsigned.apk",
        "src-tauri\gen\android\app\build\outputs\apk\release\app-release.apk",
        "dist\app-release-unsigned.apk"
    )
    foreach ($p in $searchPaths) {
        if (Test-Path $p) {
            $ApkPath = $p
            break
        }
    }
}

if (-not $ApkPath -or -not (Test-Path $ApkPath)) {
    Write-Host "[Info] No target binary found at standard paths." -ForegroundColor Yellow
    exit 0
}

Write-Host "Found source package: $ApkPath" -ForegroundColor Green

if (-not $OutputPath) {
    $dir = Split-Path $ApkPath
    $ext = [System.IO.Path]::GetExtension($ApkPath)
    $OutputPath = Join-Path $dir "Arc-Tracker-release-signed$ext"
}

$keystorePath = "release.keystore"
$keystorePass = "arctracker123"
$keyAlias = "arctracker"

# 1. Generate local keystore if missing
if (-not (Test-Path $keystorePath)) {
    Write-Host "`n[1/3] Generating release keystore ($keystorePath)..." -ForegroundColor Yellow
    $keytool = Get-Command "keytool" -ErrorAction SilentlyContinue
    if (-not $keytool -and $env:JAVA_HOME) {
        $candidate = Join-Path $env:JAVA_HOME "bin\keytool.exe"
        if (Test-Path $candidate) { $keytool = $candidate }
    }
    
    if ($keytool) {
        & $keytool -genkey -v -keystore $keystorePath -alias $keyAlias -keyalg RSA -keysize 2048 -validity 10000 -storepass $keystorePass -keypass $keystorePass -dname "CN=ArcTracker, OU=Mobile, O=ArcTracker, L=Global, S=State, C=US"
        Write-Host "✔ Keystore created successfully." -ForegroundColor Green
    } else {
        Write-Host "[Notice] 'keytool' not found in PATH or JAVA_HOME. Skipping automated keystore creation." -ForegroundColor Yellow
    }
}

# 2. Locate apksigner or jarsigner
Write-Host "`n[2/3] Locating signing tools..." -ForegroundColor Yellow
$apksigner = Get-Command "apksigner" -ErrorAction SilentlyContinue
if (-not $apksigner -and $env:ANDROID_HOME) {
    $buildTools = Get-ChildItem (Join-Path $env:ANDROID_HOME "build-tools") -ErrorAction SilentlyContinue | Sort-Object Name -Descending
    if ($buildTools.Count -gt 0) {
        $candidate = Join-Path $buildTools[0].FullName "apksigner.bat"
        if (Test-Path $candidate) { $apksigner = $candidate }
    }
}

$jarsigner = Get-Command "jarsigner" -ErrorAction SilentlyContinue
if (-not $jarsigner -and $env:JAVA_HOME) {
    $candidate = Join-Path $env:JAVA_HOME "bin\jarsigner.exe"
    if (Test-Path $candidate) { $jarsigner = $candidate }
}

# 3. Sign the package
Write-Host "`n[3/3] Signing package with release signature..." -ForegroundColor Yellow
$isAab = $ApkPath.EndsWith(".aab")

if (-not $isAab -and $apksigner -and (Test-Path $keystorePath)) {
    & $apksigner sign --ks $keystorePath --ks-pass "pass:$keystorePass" --ks-key-alias $keyAlias --out $OutputPath $ApkPath
    Write-Host "✔ APK signed successfully with apksigner!" -ForegroundColor Green
    Write-Host "Signed APK: $OutputPath" -ForegroundColor Green
} elseif ($jarsigner -and (Test-Path $keystorePath)) {
    Copy-Item $ApkPath $OutputPath -Force
    & $jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore $keystorePath -storepass $keystorePass -keypass $keystorePass $OutputPath $keyAlias
    Write-Host "✔ Package signed successfully with jarsigner!" -ForegroundColor Green
    Write-Host "Signed Package: $OutputPath" -ForegroundColor Green
} else {
    Write-Host "[Notice] To sign locally on Windows, ensure JDK and Android SDK build-tools are in your PATH." -ForegroundColor Yellow
    Write-Host "GitHub Actions automatically signs release binaries on push." -ForegroundColor Yellow
}
