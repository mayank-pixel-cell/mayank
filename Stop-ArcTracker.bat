@echo off
title Stop Arc Tracker
echo ==============================================
echo       Stopping Arc Tracker Server...
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
  "}"

echo Arc Tracker server stopped.
ping -n 2 127.0.0.1 >nul
exit
