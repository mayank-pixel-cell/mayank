@echo off
title Stop Arc Tracker
echo ==============================================
echo       Stopping Arc Tracker Server...
echo ==============================================

powershell.exe -NoProfile -Command ^
  "$conn = Get-NetTCPConnection -LocalPort 1420 -ErrorAction SilentlyContinue; " ^
  "if ($conn) { " ^
  "  $procIds = $conn | Select-Object -ExpandProperty OwningProcess -Unique; " ^
  "  foreach ($pid in $procIds) { " ^
  "    try { Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue; Write-Host ('[OK] Stopped server process PID ' + $pid) } catch {} " ^
  "  } " ^
  "} else { " ^
  "  Write-Host '[INFO] No Arc Tracker server was running on port 1420.' " ^
  "}"

echo Arc Tracker server stopped.
timeout /t 2 >nul
exit
