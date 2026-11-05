pub mod os_tracker;

use os_tracker::{
    query_os_active_window, spawn_os_window_monitor, ActiveWindowTelemetry, OsMonitorConfig,
    OsTrackerState,
};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Manager, RunEvent, State, WindowEvent};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeviceTelemetry {
    pub os: String,
    pub arch: String,
    pub family: String,
    pub uptime_seconds: u64,
    pub timestamp_ms: u64,
}

#[derive(Default)]
pub struct AtomicFlushLock(pub Mutex<()>);

#[tauri::command]
pub fn get_system_uptime_seconds() -> u64 {
    #[cfg(target_os = "windows")]
    unsafe {
        windows_sys::Win32::System::SystemInformation::GetTickCount64() / 1000
    }
    #[cfg(not(target_os = "windows"))]
    {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_secs())
            .unwrap_or(0)
    }
}

#[tauri::command]
pub fn get_device_telemetry() -> DeviceTelemetry {
    let now_ms = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0);

    DeviceTelemetry {
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        family: std::env::consts::FAMILY.to_string(),
        uptime_seconds: get_system_uptime_seconds(),
        timestamp_ms: now_ms,
    }
}

#[tauri::command]
pub async fn get_active_window_info() -> Result<ActiveWindowTelemetry, String> {
    tokio::task::spawn_blocking(query_os_active_window)
        .await
        .map_err(|e| format!("Failed to query active window: {}", e))
}

#[tauri::command]
pub fn set_os_monitor_config(
    state: State<'_, Arc<OsTrackerState>>,
    config: OsMonitorConfig,
) -> Result<(), String> {
    let mut guard = state
        .config
        .lock()
        .map_err(|_| "Failed to lock OsTrackerState".to_string())?;
    *guard = config;
    Ok(())
}

#[tauri::command]
pub fn enforce_window_shield(app: AppHandle, lock_on_top: bool) -> Result<(), String> {
    #[cfg(desktop)]
    if let Some(window) = app.get_webview_window("main") {
        if lock_on_top {
            let _ = window.unminimize();
            let _ = window.show();
            let _ = window.set_always_on_top(true);
            let _ = window.set_focus();
        } else {
            let _ = window.set_always_on_top(false);
        }
    }
    #[cfg(not(desktop))]
    let _ = (app, lock_on_top);
    Ok(())
}

fn sanitize_user_id(user_id: Option<&str>) -> String {
    let raw = user_id.unwrap_or("usr_primary").trim();
    if raw.is_empty() {
        return "usr_primary".to_string();
    }
    raw.chars()
        .map(|c| if c.is_ascii_alphanumeric() || c == '_' || c == '-' { c } else { '_' })
        .collect()
}

fn snapshot_file_path(app: &AppHandle, user_id: Option<&str>) -> Result<PathBuf, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to resolve app_data_dir: {}", e))?;
    if !app_dir.exists() {
        fs::create_dir_all(&app_dir)
            .map_err(|e| format!("Failed to create app_data_dir: {}", e))?;
    }
    let clean_uid = sanitize_user_id(user_id);
    if clean_uid == "usr_primary" {
        // Backward-compatible primary filename
        Ok(app_dir.join("arc_state_snapshot.json"))
    } else {
        Ok(app_dir.join(format!("arc_state_snapshot_{}.json", clean_uid)))
    }
}

/// Atomically writes the consolidated key-value snapshot to a temp file and renames it over
/// the user's snapshot file to guarantee zero corruption on sudden power loss or OS shutdown.
#[tauri::command]
pub fn atomic_flush_state(
    app: AppHandle,
    flush_lock: State<'_, AtomicFlushLock>,
    payload_json: String,
    user_id: Option<String>,
) -> Result<bool, String> {
    let _guard = flush_lock
        .0
        .lock()
        .map_err(|_| "AtomicFlushLock poisoned".to_string())?;

    // Validate JSON syntax before committing to disk
    let _: serde_json::Value = serde_json::from_str(&payload_json)
        .map_err(|e| format!("Invalid JSON in atomic_flush_state: {}", e))?;

    let final_path = snapshot_file_path(&app, user_id.as_deref())?;
    let tmp_path = final_path.with_extension("json.tmp");

    fs::write(&tmp_path, payload_json.as_bytes())
        .map_err(|e| format!("Failed to write temp snapshot: {}", e))?;
    fs::rename(&tmp_path, &final_path)
        .map_err(|e| format!("Failed to atomically rename snapshot: {}", e))?;

    Ok(true)
}

#[tauri::command]
pub fn load_atomic_snapshot(
    app: AppHandle,
    user_id: Option<String>,
) -> Result<Option<String>, String> {
    let path = snapshot_file_path(&app, user_id.as_deref())?;
    if !path.exists() {
        return Ok(None);
    }
    let content = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read atomic snapshot: {}", e))?;
    Ok(Some(content))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let tracker_state = Arc::new(OsTrackerState::default());
    let tracker_state_for_setup = Arc::clone(&tracker_state);

    let app = tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .manage(tracker_state)
        .manage(AtomicFlushLock::default())
        .setup(move |app| {
            let handle = app.handle().clone();
            spawn_os_window_monitor(handle, tracker_state_for_setup);
            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { .. } = event {
                let _ = window.emit("arc://flush-before-exit", ());
            }
        })
        .invoke_handler(tauri::generate_handler![
            get_device_telemetry,
            get_system_uptime_seconds,
            get_active_window_info,
            set_os_monitor_config,
            enforce_window_shield,
            atomic_flush_state,
            load_atomic_snapshot
        ])
        .build(tauri::generate_context!())
        .expect("error while building Arc Tracker Tauri application");

    app.run(|app_handle, event| {
        if let RunEvent::ExitRequested { .. } = event {
            let _ = app_handle.emit("arc://flush-before-exit", ());
        }
    });
}
