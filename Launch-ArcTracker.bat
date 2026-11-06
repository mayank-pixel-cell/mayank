@echo off
title Arc Tracker Desktop
cd /d "%~dp0"
echo ==============================================
echo   Launching Arc Tracker Desktop Application...
echo ==============================================

if not exist "dist" (
    echo Building production bundle...
    call npm.cmd run build
)

set "EDGE_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE_PATH%" set "EDGE_PATH=C:\Program Files\Microsoft\Edge\Application\msedge.exe"

set "CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME_PATH%" set "CHROME_PATH=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"

REM Start local preview server in background if not already responding
powershell.exe -NoProfile -Command "try { $r = [System.Net.WebRequest]::Create('http://localhost:1420'); $r.Timeout = 1000; $resp = $r.GetResponse(); $resp.Close(); exit 0 } catch { exit 1 }" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Starting Arc Tracker local server...
    start "" /min cmd.exe /c "npm.cmd run preview"
    timeout /t 2 /nobreak >nul
)

if exist "%EDGE_PATH%" (
    start "" "%EDGE_PATH%" --app="http://localhost:1420" --start-maximized
) else if exist "%CHROME_PATH%" (
    start "" "%CHROME_PATH%" --app="http://localhost:1420" --start-maximized
) else (
    start http://localhost:1420
)
exit
