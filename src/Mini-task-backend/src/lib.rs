use candid::{CandidType, Deserialize};
use std::cell::RefCell;

#[derive(Clone, CandidType, Deserialize)]
struct Task {
    id: u64,
    text: String,
    completed: bool,
}

type TaskList = RefCell<Vec<Task>>;
thread_local! {
    static TASKS: TaskList = RefCell::new(Vec::new());
    static NEXT_ID: RefCell<u64> = RefCell::new(1);
}

#[ic_cdk::query]
fn get_tasks() -> Vec<Task> {
    TASKS.with(|tasks| tasks.borrow().clone())
}

#[ic_cdk::update]
fn add_task(text: String) -> Task {
    let id = NEXT_ID.with(|next_id| {
        let mut id = next_id.borrow_mut();
        let current = *id;
        *id += 1;
        current
    });
    let task = Task { id, text, completed: false };
    TASKS.with(|tasks| tasks.borrow_mut().push(task.clone()));
    task
}

#[ic_cdk::update]
fn update_task(id: u64, text: String) -> Option<Task> {
    TASKS.with(|tasks| {
        let mut tasks = tasks.borrow_mut();
        if let Some(task) = tasks.iter_mut().find(|t| t.id == id) {
            task.text = text;
            return Some(task.clone());
        }
        None
    })
}

#[ic_cdk::update]
fn toggle_complete(id: u64) -> Option<Task> {
    TASKS.with(|tasks| {
        let mut tasks = tasks.borrow_mut();
        if let Some(task) = tasks.iter_mut().find(|t| t.id == id) {
            task.completed = !task.completed;
            return Some(task.clone());
        }
        None
    })
}

#[ic_cdk::update]
fn delete_task(id: u64) -> bool {
    TASKS.with(|tasks| {
        let mut tasks = tasks.borrow_mut();
        let len_before = tasks.len();
        tasks.retain(|t| t.id != id);
        tasks.len() != len_before
    })
}
