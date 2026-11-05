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

REM Start local preview server in background if not already running
netstat -ano | findstr :1420 >nul
if %ERRORLEVEL% neq 0 (
    if exist "node_modules\.bin\vite.cmd" (
        start /b "" "node_modules\.bin\vite.cmd" preview --port 1420
    ) else (
        start /b cmd /c "npm.cmd run preview -- --port 1420"
    )
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
