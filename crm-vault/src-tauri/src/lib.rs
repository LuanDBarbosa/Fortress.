// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_clients() -> Vec<String> {
    vec!["Acme Corp".into(), "Globex".into(), "Initech".into()]
}

#[tauri::command]
fn get_tasks() -> Vec<String> {
    vec!["Design CRM UI".into(), "Implement Vault Crypto".into()]
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, get_clients, get_tasks])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
