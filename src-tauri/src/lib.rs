#[tauri::command]
fn get_device_telemetry() -> serde_json::Value {
    let os = std::env::consts::OS;
    serde_json::json!({
        "os": os,
        "is_native": true,
        "system_idle_tracking": true
    })
}

#[tauri::command]
fn get_system_uptime_seconds() -> u64 {
    #[cfg(target_os = "windows")]
    unsafe {
        extern "system" {
            fn GetTickCount64() -> u64;
        }
        return GetTickCount64() / 1000;
    }
    #[cfg(not(target_os = "windows"))]
    0
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![get_device_telemetry, get_system_uptime_seconds])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
