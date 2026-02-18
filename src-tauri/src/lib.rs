use tauri::Manager;

#[tauri::command]
fn get_app_info() -> serde_json::Value {
    serde_json::json!({"name":"Mission Control","version":"0.2.3","status":"beta"})
}

/// Create (or focus) a companion window loading surething.io.
/// Window is created entirely on the Rust side — bypasses JS WebviewWindow API
/// which silently fails on Windows WebView2.
#[tauri::command]
fn open_surething_window(app: tauri::AppHandle) -> Result<String, String> {
    // If already open, just focus it
    if let Some(window) = app.get_webview_window("surething") {
        window.set_focus().map_err(|e| e.to_string())?;
        return Ok("focused".into());
    }

    let url = url::Url::parse("https://surething.io").map_err(|e| e.to_string())?;
    tauri::WebviewWindowBuilder::new(
        &app,
        "surething",
        tauri::WebviewUrl::External(url),
    )
    .title("SureThing")
    .inner_size(1000.0, 750.0)
    .center()
    .build()
    .map_err(|e| e.to_string())?;

    Ok("created".into())
}

#[tauri::command]
fn close_surething_window(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("surething") {
        window.close().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn focus_surething_window(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("surething") {
        window.set_focus().map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("SureThing window not found".into())
    }
}

/// Open a URL in the system's default browser.
/// Uses OS-specific commands — guaranteed to work unlike window.open() in WebView2.
#[tauri::command]
fn open_in_browser(url: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("cmd")
            .args(["/C", "start", "", &url])
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&url)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(&url)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            get_app_info,
            open_surething_window,
            close_surething_window,
            focus_surething_window,
            open_in_browser,
        ])
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Mission Control");
}
