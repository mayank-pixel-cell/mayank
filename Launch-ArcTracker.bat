@echo off
title Arc Tracker Desktop
cd /d "%~dp0"

if not exist "dist" (
    echo Building production bundle...
    call npm.cmd run build
)

set "EDGE_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE_PATH%" set "EDGE_PATH=C:\Program Files\Microsoft\Edge\Application\msedge.exe"

set "CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME_PATH%" set "CHROME_PATH=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"

:: Ensure Start-PreviewServer.vbs exists for completely hidden background execution
if not exist "%~dp0Start-PreviewServer.vbs" (
    (
        echo Option Explicit
        echo Dim WshShell, fso, scriptDir, viteBin, cmd
        echo Set WshShell = CreateObject^("WScript.Shell"^)
        echo Set fso = CreateObject^("Scripting.FileSystemObject"^)
        echo scriptDir = fso.GetParentFolderName^(WScript.ScriptFullName^)
        echo WshShell.CurrentDirectory = scriptDir
        echo viteBin = scriptDir ^& "\node_modules\vite\bin\vite.js"
        echo If fso.FileExists^(viteBin^) Then
        echo     cmd = "cmd.exe /c node """ ^& viteBin ^& """ preview --port 1420 --strictPort"
        echo Else
        echo     cmd = "cmd.exe /c npm.cmd run preview"
        echo End If
        echo WshShell.Run cmd, 0, False
        echo Set fso = Nothing
        echo Set WshShell = Nothing
    ) > "%~dp0Start-PreviewServer.vbs"
)

REM Check if local preview server is already responding
powershell.exe -NoProfile -Command "try { $r = [System.Net.WebRequest]::Create('http://localhost:1420'); $r.Timeout = 1000; $resp = $r.GetResponse(); $resp.Close(); exit 0 } catch { exit 1 }" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Starting Arc Tracker local server silently in background...
    if exist "%~dp0Start-PreviewServer.vbs" (
        wscript.exe "%~dp0Start-PreviewServer.vbs"
    ) else (
        powershell.exe -NoProfile -WindowStyle Hidden -Command "Start-Process -FilePath 'cmd.exe' -ArgumentList '/c npm.cmd run preview' -WorkingDirectory '%~dp0' -WindowStyle Hidden"
    )
    
    REM Wait until port 1420 is ready (up to 6 seconds) using ping sleep (safe for hidden batch execution)
    for /L %%i in (1,1,6) do (
        powershell.exe -NoProfile -Command "try { $r = [System.Net.WebRequest]::Create('http://localhost:1420'); $r.Timeout = 500; $resp = $r.GetResponse(); $resp.Close(); exit 0 } catch { exit 1 }" >nul 2>&1
        if not errorlevel 1 goto SERVER_READY
        ping -n 2 127.0.0.1 >nul
    )
)

:SERVER_READY
if exist "%EDGE_PATH%" (
    start "" "%EDGE_PATH%" --app="http://localhost:1420" --start-maximized
) else if exist "%CHROME_PATH%" (
    start "" "%CHROME_PATH%" --app="http://localhost:1420" --start-maximized
) else (
    start http://localhost:1420
)
exit
