Option Explicit
Dim WshShell, fso, scriptDir, viteBin, cmd, teleScript

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = scriptDir

' 1. Start Windows OS Desktop & App Telemetry Service silently in background
teleScript = scriptDir & "\track-desktop.ps1"
If fso.FileExists(teleScript) Then
    WshShell.Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & teleScript & """", 0, False
End If

' 2. Start Vite Preview Server
viteBin = scriptDir & "\node_modules\vite\bin\vite.js"

If fso.FileExists(viteBin) Then
    cmd = "cmd.exe /c node """ & viteBin & """ preview --port 1420 --strictPort"
Else
    cmd = "cmd.exe /c npm.cmd run preview"
End If

WshShell.Run cmd, 0, False

Set fso = Nothing
Set WshShell = Nothing
