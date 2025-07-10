#[tauri::command]
fn first_text() -> String {
    format!("This is Faisal's app")
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![first_text])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
