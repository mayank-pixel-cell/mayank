Option Explicit
Dim WshShell, fso, scriptDir, batPath

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
batPath = scriptDir & "\Launch-ArcTracker.bat"

If fso.FileExists(batPath) Then
    WshShell.CurrentDirectory = scriptDir
    WshShell.Run "cmd.exe /c """" & batPath & """", 0, False
Else
    ' Fallback to direct app launch if bat is missing
    Dim edgePath, chromePath
    edgePath = WshShell.ExpandEnvironmentStrings("%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe")
    If Not fso.FileExists(edgePath) Then
        edgePath = WshShell.ExpandEnvironmentStrings("%ProgramFiles%\Microsoft\Edge\Application\msedge.exe")
    End If
    chromePath = WshShell.ExpandEnvironmentStrings("%ProgramFiles%\Google\Chrome\Application\chrome.exe")
    If Not fso.FileExists(chromePath) Then
        chromePath = WshShell.ExpandEnvironmentStrings("%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe")
    End If

    If fso.FileExists(edgePath) Then
        WshShell.Run """" & edgePath & """ --app=http://localhost:1420 --start-maximized", 1, False
    ElseIf fso.FileExists(chromePath) Then
        WshShell.Run """" & chromePath & """ --app=http://localhost:1420 --start-maximized", 1, False
    Else
        WshShell.Run "http://localhost:1420", 1, False
    End If
End If

Set fso = Nothing
Set WshShell = Nothing
