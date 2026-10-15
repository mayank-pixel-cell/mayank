@echo off
title Arc Tracker Desktop
cd /d "%~dp0"
echo ==============================================
echo   Launching Arc Tracker Desktop Application...
echo ==============================================

set "EDGE_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE_PATH%" set "EDGE_PATH=C:\Program Files\Microsoft\Edge\Application\msedge.exe"

if exist "%EDGE_PATH%" (
    start "" "%EDGE_PATH%" --app="%~dp0dist\index.html" --window-size=1280,800
) else (
    start msedge --app="%~dp0dist\index.html" --window-size=1280,800
)
exit
