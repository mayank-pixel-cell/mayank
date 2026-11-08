Option Explicit
Dim WshShell, fso, scriptDir, viteBin, cmd

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = scriptDir

viteBin = scriptDir & "\node_modules\vite\bin\vite.js"

If fso.FileExists(viteBin) Then
    cmd = "cmd.exe /c node """ & viteBin & """ preview --port 1420 --strictPort"
Else
    cmd = "cmd.exe /c npm.cmd run preview"
End If

WshShell.Run cmd, 0, False

Set fso = Nothing
Set WshShell = Nothing
