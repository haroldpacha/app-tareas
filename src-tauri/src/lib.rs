// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
struct Task {
    id: Option<i32>,
    title: String,
    category: String,
    priority: i32,
    completed: bool,
    cost: Option<f64>,
    time: Option<i32>,
}

struct AppState {
    db: Mutex<Connection>,
}

fn init_database(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            priority INTEGER NOT NULL,
            completed BOOLEAN NOT NULL DEFAULT 0,
            cost REAL,
            time INTEGER
        )",
        [],
    )?;
    Ok(())
}

#[tauri::command]
async fn add_task(state: State<'_, AppState>, task: Task) -> Result<Task, String> {
    let conn = state.db.lock().unwrap();
    conn.execute(
        "INSERT INTO tasks (title, category, priority, completed, cost, time) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        [
            &task.title,
            &task.category,
            &task.priority.to_string(),
            "0",
            &task.cost.map(|c| c.to_string()).unwrap_or_default(),
            &task.time.map(|t| t.to_string()).unwrap_or_default(),
        ],
    )
    .map_err(|e| e.to_string())?;
    
    let id = conn.last_insert_rowid();
    Ok(Task {
        id: Some(id as i32),
        ..task
    })
}

#[tauri::command]
async fn get_tasks(state: State<'_, AppState>) -> Result<Vec<Task>, String> {
    let conn = state.db.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT id, title, category, priority, completed, cost, time FROM tasks")
        .map_err(|e| e.to_string())?;
    
    let tasks = stmt
        .query_map([], |row| {
            Ok(Task {
                id: Some(row.get(0)?),
                title: row.get(1)?,
                category: row.get(2)?,
                priority: row.get(3)?,
                completed: row.get(4)?,
                cost: row.get(5)?,
                time: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    
    Ok(tasks)
}

#[tauri::command]
async fn toggle_task(state: State<'_, AppState>, id: i32) -> Result<(), String> {
    let conn = state.db.lock().unwrap();
    conn.execute(
        "UPDATE tasks SET completed = NOT completed WHERE id = ?1",
        [id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let conn = Connection::open("tasks.db").unwrap();
    init_database(&conn).unwrap();
    
    tauri::Builder::default()
        .manage(AppState {
            db: Mutex::new(conn),
        })
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet, add_task, get_tasks, toggle_task])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
