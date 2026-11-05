use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Emitter, Manager};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct ActiveWindowTelemetry {
    pub process_id: u32,
    pub process_name: String,
    pub executable_path: String,
    pub window_title: String,
    pub idle_seconds: u64,
    pub timestamp_ms: u64,
    pub platform: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OsMonitorConfig {
    pub enabled: bool,
    pub poll_interval_ms: u64,
    pub focus_mode_active: bool,
    pub strict_mode_active: bool,
    pub blocked_processes: Vec<String>,
    pub blocked_title_keywords: Vec<String>,
}

impl Default for OsMonitorConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            poll_interval_ms: 1000,
            focus_mode_active: false,
            strict_mode_active: false,
            blocked_processes: Vec::new(),
            blocked_title_keywords: Vec::new(),
        }
    }
}

pub struct OsTrackerState {
    pub config: Mutex<OsMonitorConfig>,
    pub last_window: Mutex<Option<ActiveWindowTelemetry>>,
}

impl Default for OsTrackerState {
    fn default() -> Self {
        Self {
            config: Mutex::new(OsMonitorConfig::default()),
            last_window: Mutex::new(None),
        }
    }
}

fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or(Duration::from_secs(0))
        .as_millis() as u64
}

#[cfg(target_os = "windows")]
pub fn query_os_active_window() -> ActiveWindowTelemetry {
    use windows_sys::Win32::Foundation::{CloseHandle, FALSE, HWND, MAX_PATH};
    use windows_sys::Win32::System::SystemInformation::GetTickCount64;
    use windows_sys::Win32::System::Threading::{
        OpenProcess, QueryFullProcessImageNameW, PROCESS_QUERY_LIMITED_INFORMATION,
    };
    use windows_sys::Win32::UI::Input::KeyboardAndMouse::{GetLastInputInfo, LASTINPUTINFO};
    use windows_sys::Win32::UI::WindowsAndMessaging::{
        GetForegroundWindow, GetWindowTextLengthW, GetWindowTextW, GetWindowThreadProcessId,
    };

    unsafe {
        let hwnd: HWND = GetForegroundWindow();
        let mut pid: u32 = 0;
        let mut window_title = String::new();
        let mut executable_path = String::new();
        let mut process_name = String::new();

        if !hwnd.is_null() {
            GetWindowThreadProcessId(hwnd, &mut pid);

            let title_len = GetWindowTextLengthW(hwnd);
            if title_len > 0 {
                let mut buf: Vec<u16> = vec![0; (title_len + 1) as usize];
                let copied = GetWindowTextW(hwnd, buf.as_mut_ptr(), title_len + 1);
                if copied > 0 {
                    window_title = String::from_utf16_lossy(&buf[..copied as usize]);
                }
            }

            if pid > 0 {
                let h_proc = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, FALSE, pid);
                if !h_proc.is_null() {
                    let mut path_buf: Vec<u16> = vec![0; MAX_PATH as usize * 4];
                    let mut size: u32 = path_buf.len() as u32;
                    let ok = QueryFullProcessImageNameW(h_proc, 0, path_buf.as_mut_ptr(), &mut size);
                    if ok != 0 && size > 0 {
                        executable_path = String::from_utf16_lossy(&path_buf[..size as usize]);
                        if let Some(fname) = executable_path.rsplit(&['\\', '/'][..]).next() {
                            process_name = fname.to_lowercase();
                        }
                    }
                    CloseHandle(h_proc);
                }
            }
        }

        // Calculate OS-level user idle seconds via GetLastInputInfo
        let mut lii = LASTINPUTINFO {
            cbSize: std::mem::size_of::<LASTINPUTINFO>() as u32,
            dwTime: 0,
        };
        let idle_seconds = if GetLastInputInfo(&mut lii) != 0 {
            let tick_now = GetTickCount64();
            let last_tick = lii.dwTime as u64;
            let current_tick_32 = (tick_now & 0xFFFF_FFFF) as u64;
            let elapsed_ms = if current_tick_32 >= last_tick {
                current_tick_32 - last_tick
            } else {
                (0x1_0000_0000 - last_tick) + current_tick_32
            };
            elapsed_ms / 1000
        } else {
            0
        };

        ActiveWindowTelemetry {
            process_id: pid,
            process_name,
            executable_path,
            window_title,
            idle_seconds,
            timestamp_ms: now_ms(),
            platform: "windows".to_string(),
        }
    }
}

#[cfg(target_os = "macos")]
pub fn query_os_active_window() -> ActiveWindowTelemetry {
    use std::process::Command;

    let script = r#"
        tell application "System Events"
            set frontApp to first application process whose frontmost is true
            set appName to name of frontApp
            set winTitle to ""
            try
                set winTitle to name of front window of frontApp
            end try
            return appName & "|||" & winTitle
        end tell
    "#;

    let mut process_name = String::new();
    let mut window_title = String::new();

    if let Ok(output) = Command::new("osascript").arg("-e").arg(script).output() {
        if output.status.success() {
            let raw = String::from_utf8_lossy(&output.stdout).trim().to_string();
            let mut parts = raw.splitn(2, "|||");
            process_name = parts.next().unwrap_or("").to_lowercase();
            window_title = parts.next().unwrap_or("").to_string();
        }
    }

    ActiveWindowTelemetry {
        process_id: 0,
        process_name: process_name.clone(),
        executable_path: process_name,
        window_title,
        idle_seconds: 0,
        timestamp_ms: now_ms(),
        platform: "macos".to_string(),
    }
}

#[cfg(not(any(target_os = "windows", target_os = "macos")))]
pub fn query_os_active_window() -> ActiveWindowTelemetry {
    ActiveWindowTelemetry {
        process_id: 0,
        process_name: String::new(),
        executable_path: String::new(),
        window_title: String::new(),
        idle_seconds: 0,
        timestamp_ms: now_ms(),
        platform: std::env::consts::OS.to_string(),
    }
}

/// Starts the non-blocking background OS window monitor task.
pub fn spawn_os_window_monitor(app_handle: AppHandle, tracker_state: Arc<OsTrackerState>) {
    tauri::async_runtime::spawn(async move {
        let mut interval = tokio::time::interval(Duration::from_millis(1000));
        loop {
            interval.tick().await;

            let cfg = {
                match tracker_state.config.lock() {
                    Ok(guard) => guard.clone(),
                    Err(_) => continue,
                }
            };

            if !cfg.enabled {
                continue;
            }

            let telemetry = tokio::task::spawn_blocking(query_os_active_window)
                .await
                .unwrap_or_else(|_| query_os_active_window());

            // Ignore self if Arc Tracker is the foreground window
            let is_self = telemetry.process_name.contains("arc-tracker")
                || telemetry.process_name.contains("arctracker")
                || telemetry.window_title.contains("Winter & Summer Arc");

            // Emit telemetry update to frontend
            let _ = app_handle.emit("arc://active-window-changed", &telemetry);

            if !is_self && !telemetry.process_name.is_empty() {
                let proc_lower = telemetry.process_name.to_lowercase();
                let title_lower = telemetry.window_title.to_lowercase();

                let proc_blocked = cfg
                    .blocked_processes
                    .iter()
                    .any(|bp| !bp.is_empty() && proc_lower.contains(&bp.to_lowercase()));

                let title_blocked = cfg
                    .blocked_title_keywords
                    .iter()
                    .any(|kw| !kw.is_empty() && title_lower.contains(&kw.to_lowercase()));

                if proc_blocked || title_blocked {
                    let _ = app_handle.emit("arc://os-lockout-triggered", &telemetry);
                    #[cfg(desktop)]
                    if let Some(win) = app_handle.get_webview_window("main") {
                        let _ = win.unminimize();
                        let _ = win.show();
                        let _ = win.set_always_on_top(true);
                        let _ = win.set_focus();
                    }
                }
            }

            if let Ok(mut last) = tracker_state.last_window.lock() {
                *last = Some(telemetry);
            }
        }
    });
}
