mod database;

use database::{AdditionalLicense, Client, Database, VarClient, VarClientInvoice, VarInvoiceTracking, VarPartner};
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::State;

struct AppState {
    db: Mutex<Option<Database>>,
}

#[tauri::command]
fn set_database_path(path: String, state: State<AppState>) -> Result<(), String> {
    let db_path = PathBuf::from(path);
    let db = Database::new(db_path).map_err(|e| e.to_string())?;
    *state.db.lock().unwrap() = Some(db);
    Ok(())
}

#[tauri::command]
fn get_clients(state: State<AppState>) -> Result<Vec<Client>, String> {
    let db_lock = state.db.lock().unwrap();
    let db = db_lock.as_ref().ok_or("Database not initialized")?;
    db.get_clients().map_err(|e| e.to_string())
}

#[tauri::command]
fn add_client(client: Client, state: State<AppState>) -> Result<(), String> {
    let db_lock = state.db.lock().unwrap();
    let db = db_lock.as_ref().ok_or("Database not initialized")?;
    db.add_client(client).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_client(client: Client, state: State<AppState>) -> Result<(), String> {
    let db_lock = state.db.lock().unwrap();
    let db = db_lock.as_ref().ok_or("Database not initialized")?;
    db.update_client(client).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_client(id: String, state: State<AppState>) -> Result<(), String> {
    let db_lock = state.db.lock().unwrap();
    let db = db_lock.as_ref().ok_or("Database not initialized")?;
    db.delete_client(&id).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_var_partners(state: State<AppState>) -> Result<Vec<VarPartner>, String> {
    let db_lock = state.db.lock().unwrap();
    let db = db_lock.as_ref().ok_or("Database not initialized")?;
    db.get_var_partners().map_err(|e| e.to_string())
}

#[tauri::command]
fn add_var_partner(partner: VarPartner, state: State<AppState>) -> Result<(), String> {
    let db_lock = state.db.lock().unwrap();
    let db = db_lock.as_ref().ok_or("Database not initialized")?;
    db.add_var_partner(partner).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_var_partner(partner: VarPartner, state: State<AppState>) -> Result<(), String> {
    let db_lock = state.db.lock().unwrap();
    let db = db_lock.as_ref().ok_or("Database not initialized")?;
    db.update_var_partner(partner).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_var_partner(id: String, state: State<AppState>) -> Result<(), String> {
    let db_lock = state.db.lock().unwrap();
    let db = db_lock.as_ref().ok_or("Database not initialized")?;
    db.delete_var_partner(&id).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_var_clients(state: State<AppState>) -> Result<Vec<VarClient>, String> {
    let db_lock = state.db.lock().unwrap();
    let db = db_lock.as_ref().ok_or("Database not initialized")?;
    db.get_var_clients().map_err(|e| e.to_string())
}

#[tauri::command]
fn add_var_client(client: VarClient, state: State<AppState>) -> Result<(), String> {
    let db_lock = state.db.lock().unwrap();
    let db = db_lock.as_ref().ok_or("Database not initialized")?;
    db.add_var_client(client).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_var_client(client: VarClient, state: State<AppState>) -> Result<(), String> {
    let db_lock = state.db.lock().unwrap();
    let db = db_lock.as_ref().ok_or("Database not initialized")?;
    db.update_var_client(client).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_var_client(id: String, state: State<AppState>) -> Result<(), String> {
    let db_lock = state.db.lock().unwrap();
    let db = db_lock.as_ref().ok_or("Database not initialized")?;
    db.delete_var_client(&id).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_additional_licenses(client_id: String, state: State<AppState>) -> Result<Vec<AdditionalLicense>, String> {
    let db_lock = state.db.lock().unwrap();
    let db = db_lock.as_ref().ok_or("Database not initialized")?;
    db.get_additional_licenses(&client_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn add_additional_license(license: AdditionalLicense, state: State<AppState>) -> Result<(), String> {
    let db_lock = state.db.lock().unwrap();
    let db = db_lock.as_ref().ok_or("Database not initialized")?;
    db.add_additional_license(license).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_additional_license(license: AdditionalLicense, state: State<AppState>) -> Result<(), String> {
    let db_lock = state.db.lock().unwrap();
    let db = db_lock.as_ref().ok_or("Database not initialized")?;
    db.update_additional_license(license).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_additional_license(id: String, state: State<AppState>) -> Result<(), String> {
    let db_lock = state.db.lock().unwrap();
    let db = db_lock.as_ref().ok_or("Database not initialized")?;
    db.delete_additional_license(&id).map_err(|e| e.to_string())
}

#[tauri::command]
async fn pick_database_file(app: tauri::AppHandle) -> Result<String, String> {
    use tauri_plugin_dialog::DialogExt;

    let file_path = app.dialog()
        .file()
        .add_filter("SQLite Database", &["db", "sqlite", "sqlite3"])
        .blocking_pick_file();

    match file_path {
        Some(path) => Ok(path.as_path().unwrap().to_string_lossy().to_string()),
        None => Err("No file selected".to_string()),
    }
}

#[tauri::command]
async fn save_database_file(app: tauri::AppHandle) -> Result<String, String> {
    use tauri_plugin_dialog::DialogExt;

    let file_path = app.dialog()
        .file()
        .add_filter("SQLite Database", &["db"])
        .set_file_name("billing.db")
        .blocking_save_file();

    match file_path {
        Some(path) => Ok(path.as_path().unwrap().to_string_lossy().to_string()),
        None => Err("No file selected".to_string()),
    }
}

#[tauri::command]
fn get_var_client_invoices(state: State<AppState>) -> Result<Vec<VarClientInvoice>, String> {
    let db_lock = state.db.lock().unwrap();
    let db = db_lock.as_ref().ok_or("Database not initialized")?;
    db.get_var_client_invoices().map_err(|e| e.to_string())
}

#[tauri::command]
fn create_var_client_invoice(invoice: VarClientInvoice, state: State<AppState>) -> Result<(), String> {
    let db_lock = state.db.lock().unwrap();
    let db = db_lock.as_ref().ok_or("Database not initialized")?;
    db.create_var_client_invoice(invoice).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_var_client_invoice(invoice: VarClientInvoice, state: State<AppState>) -> Result<(), String> {
    let db_lock = state.db.lock().unwrap();
    let db = db_lock.as_ref().ok_or("Database not initialized")?;
    db.update_var_client_invoice(invoice).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_var_client_invoice(id: String, state: State<AppState>) -> Result<(), String> {
    let db_lock = state.db.lock().unwrap();
    let db = db_lock.as_ref().ok_or("Database not initialized")?;
    db.delete_var_client_invoice(&id).map_err(|e| e.to_string())
}

#[tauri::command]
fn toggle_var_invoice_status(var_client_id: String, is_invoiced: bool, state: State<AppState>) -> Result<(), String> {
    let db_lock = state.db.lock().unwrap();
    let db = db_lock.as_ref().ok_or("Database not initialized")?;
    db.toggle_var_invoice_status(&var_client_id, is_invoiced).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_var_invoice_tracking(state: State<AppState>) -> Result<Vec<VarInvoiceTracking>, String> {
    let db_lock = state.db.lock().unwrap();
    let db = db_lock.as_ref().ok_or("Database not initialized")?;
    db.get_var_invoice_tracking().map_err(|e| e.to_string())
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .manage(AppState {
            db: Mutex::new(None),
        })
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle()
                    .plugin(tauri_plugin_log::Builder::default().level(log::LevelFilter::Info).build())?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            set_database_path,
            get_clients,
            add_client,
            update_client,
            delete_client,
            get_var_partners,
            add_var_partner,
            update_var_partner,
            delete_var_partner,
            get_var_clients,
            add_var_client,
            update_var_client,
            delete_var_client,
            get_additional_licenses,
            add_additional_license,
            update_additional_license,
            delete_additional_license,
            get_var_client_invoices,
            create_var_client_invoice,
            update_var_client_invoice,
            delete_var_client_invoice,
            toggle_var_invoice_status,
            get_var_invoice_tracking,
            pick_database_file,
            save_database_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
