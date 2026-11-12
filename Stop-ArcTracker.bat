@echo off
title Stop Arc Tracker
echo ==============================================
echo       Stopping Arc Tracker Services...
echo ==============================================

powershell.exe -NoProfile -Command ^
  "$conn = Get-NetTCPConnection -LocalPort 1420 -ErrorAction SilentlyContinue; " ^
  "if ($conn) { " ^
  "  $procIds = $conn | Select-Object -ExpandProperty OwningProcess -Unique; " ^
  "  foreach ($p in $procIds) { " ^
  "    if ($p -and $p -ne 0) { " ^
  "      try { Stop-Process -Id $p -Force -ErrorAction SilentlyContinue; Write-Host ('[OK] Stopped server process PID ' + $p) } catch {} " ^
  "    } " ^
  "  } " ^
  "} else { " ^
  "  Write-Host '[INFO] No Arc Tracker server was running on port 1420.' " ^
  "}; " ^
  "$procs = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like '*track-desktop.ps1*' }; " ^
  "foreach ($p in $procs) { try { Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue; Write-Host ('[OK] Stopped desktop telemetry tracker PID ' + $p.ProcessId) } catch {} }; " ^
  "if (Test-Path '%~dp0arc_telemetry.pid') { Remove-Item '%~dp0arc_telemetry.pid' -Force -ErrorAction SilentlyContinue }"

echo Arc Tracker server and telemetry services stopped.
ping -n 2 127.0.0.1 >nul
exit
