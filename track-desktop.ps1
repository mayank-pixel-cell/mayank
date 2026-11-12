# ==============================================================================
# ARC TRACKER - WINDOWS OS DESKTOP & APPLICATION TELEMETRY SERVICE (v2.6.0)
# Tracks active foreground application and window usage time in real-time.
# Writes to arc_desktop_telemetry.js (CORS-free for file://) and arc_desktop_telemetry.json
# ==============================================================================

param(
    [string]$OutputDir = $PSScriptRoot
)

$ErrorActionPreference = "SilentlyContinue"

# Ensure Output Directory exists
if (-not (Test-Path $OutputDir)) {
    $OutputDir = $PSScriptRoot
}

$TelemetryFileJs = Join-Path $OutputDir "arc_desktop_telemetry.js"
$TelemetryFileJson = Join-Path $OutputDir "arc_desktop_telemetry.json"
$LockFile = Join-Path $OutputDir "arc_telemetry.pid"

# Single Instance Check
$existingPid = $null
if (Test-Path $LockFile) {
    try {
        $existingPid = [int](Get-Content $LockFile -Raw).Trim()
        if ($existingPid -and (Get-Process -Id $existingPid -ErrorAction SilentlyContinue)) {
            Write-Host "[ArcTelemetry] Service already running (PID $existingPid)." -ForegroundColor Yellow
            exit 0
        }
    } catch {}
}

# Record current PID
$PID | Out-File -FilePath $LockFile -Encoding ascii -Force

# Compile Win32 Foreground & Inactivity API
Add-Type @"
using System;
using System.Runtime.InteropServices;
using System.Text;

public class Win32Helper {
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll")]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);

    [DllImport("user32.dll")]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);

    [StructLayout(LayoutKind.Sequential)]
    public struct LASTINPUTINFO {
        public uint cbSize;
        public uint dwTime;
    }

    [DllImport("user32.dll")]
    public static extern bool GetLastInputInfo(ref LASTINPUTINFO plii);

    public static uint GetIdleTimeMs() {
        LASTINPUTINFO lastInput = new LASTINPUTINFO();
        lastInput.cbSize = (uint)Marshal.SizeOf(lastInput);
        if (GetLastInputInfo(ref lastInput)) {
            return (uint)Environment.TickCount - lastInput.dwTime;
        }
        return 0;
    }
}
"@

# Process Name to Friendly Display Name Map
$AppCatalog = @{
    "chrome"          = "Google Chrome"
    "msedge"          = "Microsoft Edge"
    "firefox"         = "Mozilla Firefox"
    "brave"           = "Brave Browser"
    "code"            = "Visual Studio Code"
    "devenv"          = "Visual Studio"
    "windowsterminal" = "Terminal / PowerShell"
    "powershell"      = "Terminal / PowerShell"
    "pwsh"            = "Terminal / PowerShell"
    "cmd"             = "Terminal / PowerShell"
    "slack"           = "Slack"
    "discord"         = "Discord"
    "spotify"         = "Spotify"
    "notepad"         = "Notepad"
    "notepad++"       = "Notepad++"
    "notion"          = "Notion"
    "figma"           = "Figma"
    "steam"           = "Steam / Gaming"
    "epicgameslauncher"= "Epic Games"
    "explorer"        = "Windows Explorer"
    "obs64"           = "OBS Studio"
    "vlc"             = "VLC Media Player"
    "arc-tracker"     = "Arc Tracker Desktop"
}

# Category Map for TAP TO COMPARE APPS
$CategoryCatalog = @{
    "Visual Studio Code"    = @{ category = "Development"; icon = "fa-solid fa-code"; color = "#0ea5e9" }
    "Visual Studio"         = @{ category = "Development"; icon = "fa-solid fa-code"; color = "#a855f7" }
    "Google Chrome"         = @{ category = "Web Research"; icon = "fa-brands fa-chrome"; color = "#38bdf8" }
    "Microsoft Edge"        = @{ category = "Web Browsing"; icon = "fa-brands fa-edge"; color = "#0284c7" }
    "Mozilla Firefox"       = @{ category = "Web Browsing"; icon = "fa-brands fa-firefox"; color = "#f97316" }
    "Brave Browser"         = @{ category = "Web Browsing"; icon = "fa-brands fa-chrome"; color = "#f97316" }
    "Terminal / PowerShell" = @{ category = "DevOps"; icon = "fa-solid fa-terminal"; color = "#22d3ee" }
    "Slack"                 = @{ category = "Work Chat"; icon = "fa-brands fa-slack"; color = "#818cf8" }
    "Discord"               = @{ category = "Chat / Community"; icon = "fa-brands fa-discord"; color = "#6366f1" }
    "Spotify"               = @{ category = "Audio / Music"; icon = "fa-brands fa-spotify"; color = "#10b981" }
    "Notion"                = @{ category = "Productivity"; icon = "fa-solid fa-book-bookmark"; color = "#a78bfa" }
    "Figma"                 = @{ category = "Design"; icon = "fa-brands fa-figma"; color = "#ec4899" }
    "Steam / Gaming"        = @{ category = "Gaming"; icon = "fa-solid fa-gamepad"; color = "#c084fc" }
    "Windows Explorer"      = @{ category = "System Files"; icon = "fa-solid fa-folder-open"; color = "#fbbf24" }
    "Arc Tracker Desktop"   = @{ category = "Productivity"; icon = "fa-solid fa-clock"; color = "#06b6d4" }
}

# Initialize State
$today = (Get-Date).ToString("yyyy-MM-dd")
$totalSeconds = 0
$apps = [ordered]@{}

# Restore today's state if telemetry file already exists
if (Test-Path $TelemetryFileJson) {
    try {
        $existingData = Get-Content $TelemetryFileJson -Raw | ConvertFrom-Json
        if ($existingData.date -eq $today) {
            $totalSeconds = [int]$existingData.totalSeconds
            if ($existingData.apps) {
                foreach ($prop in $existingData.apps.PSObject.Properties) {
                    $apps[$prop.Name] = [int]$prop.Value
                }
            }
        }
    } catch {}
}

# Function to write telemetry files
function Write-TelemetryFiles {
    param(
        [string]$curApp = "Desktop",
        [string]$curTitle = "Windows Desktop"
    )

    $appDetails = @()
    foreach ($key in $apps.Keys) {
        $secVal = [int]$apps[$key]
        $catMeta = $CategoryCatalog[$key]
        $category = if ($catMeta) { $catMeta.category } else { "Other" }
        $icon = if ($catMeta) { $catMeta.icon } else { "fa-solid fa-window-maximize" }
        $color = if ($catMeta) { $catMeta.color } else { "#94a3b8" }

        $appDetails += [ordered]@{
            name     = $key
            seconds  = $secVal
            category = $category
            icon     = $icon
            color    = $color
        }
    }

    $sortedApps = @(if ($appDetails.Count -gt 0) { $appDetails | Sort-Object -Property seconds -Descending } else { @() })

    $payload = [ordered]@{
        date         = $today
        timestamp    = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
        totalSeconds = $totalSeconds
        activeApp    = $curApp
        activeTitle  = $curTitle
        appsMap      = $apps
        appsList     = $sortedApps
    }

    $jsonContent = $payload | ConvertTo-Json -Depth 4 -Compress
    $jsContent = "window.__ARC_DESKTOP_TELEMETRY__ = $jsonContent;`nif(typeof window.__onArcDesktopTelemetry === 'function') window.__onArcDesktopTelemetry(window.__ARC_DESKTOP_TELEMETRY__);"

    try {
        [System.IO.File]::WriteAllText($TelemetryFileJs, $jsContent, [System.Text.Encoding]::UTF8)
        [System.IO.File]::WriteAllText($TelemetryFileJson, $jsonContent, [System.Text.Encoding]::UTF8)
    } catch {}
}

# Initial Write immediately so files are accessible right away
Write-TelemetryFiles -curApp "Desktop" -curTitle "Windows Desktop"
Write-Host "[ArcTelemetry] Windows Desktop Screen Time Service Started. Tracking active window..." -ForegroundColor Green

$flushCounter = 0

try {
    while ($true) {
        Start-Sleep -Seconds 1

        # 1. Midnight rollover check (Local 00:00:00)
        $currentDay = (Get-Date).ToString("yyyy-MM-dd")
        if ($currentDay -ne $today) {
            $today = $currentDay
            $totalSeconds = 0
            $apps = [ordered]@{}
        }

        # 2. Inactivity / Idle check (if keyboard/mouse untouched for > 180 seconds)
        $idleMs = [Win32Helper]::GetIdleTimeMs()
        if ($idleMs -gt 180000) {
            continue
        }

        # 3. Active Foreground Window
        $hwnd = [Win32Helper]::GetForegroundWindow()
        $windowTitle = ""
        $appName = "Desktop"

        if ($hwnd -ne [IntPtr]::Zero) {
            $sb = New-Object System.Text.StringBuilder 512
            [void][Win32Helper]::GetWindowText($hwnd, $sb, 512)
            $windowTitle = $sb.ToString().Trim()

            $procId = 0
            [void][Win32Helper]::GetWindowThreadProcessId($hwnd, [ref]$procId)

            if ($procId -gt 0) {
                try {
                    $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
                    if ($proc) {
                        $baseName = $proc.ProcessName.ToLower()
                        if ($AppCatalog.ContainsKey($baseName)) {
                            $appName = $AppCatalog[$baseName]
                        } else {
                            $appName = $proc.ProcessName.Substring(0,1).ToUpper() + $proc.ProcessName.Substring(1)
                        }
                    }
                } catch {}
            }
        }

        # Increment total desktop seconds
        $totalSeconds++

        # Increment per-app seconds
        if (-not $apps.Contains($appName)) {
            $apps[$appName] = 0
        }
        $apps[$appName] = [int]$apps[$appName] + 1

        # 4. Flush to files every 2 seconds
        $flushCounter++
        if ($flushCounter -ge 2) {
            $flushCounter = 0
            Write-TelemetryFiles -curApp $appName -curTitle $windowTitle
        }
    }
} finally {
    if (Test-Path $LockFile) {
        Remove-Item $LockFile -Force -ErrorAction SilentlyContinue
    }
}
