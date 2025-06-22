import React, { useEffect, useReducer, useState } from 'react';
import { Mini_task_backend } from 'declarations/Mini-task-backend';

const FILTERS = {
  all: () => true,
  active: (t) => !t.completed,
  completed: (t) => t.completed,
};

function taskReducer(state, action) {
  switch (action.type) {
    case 'set':
      return action.tasks;
    case 'add':
      return [...state, action.task];
    case 'update':
      return state.map((t) => (t.id === action.task.id ? action.task : t));
    case 'delete':
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

function App() {
  const [tasks, dispatch] = useReducer(taskReducer, []);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Mini_task_backend.get_tasks().then((tasks) => {
      dispatch({ type: 'set', tasks });
      setLoading(false);
    });
  }, []);

  async function addTask(text) {
    const task = await Mini_task_backend.add_task(text);
    dispatch({ type: 'add', task });
  }

  async function updateTask(id, text) {
    const [task] = await Mini_task_backend.update_task(id, text);
    if (task) dispatch({ type: 'update', task });
  }

  async function toggleComplete(id) {
    const [task] = await Mini_task_backend.toggle_complete(id);
    if (task) dispatch({ type: 'update', task });
  }

  async function deleteTask(id) {
    const ok = await Mini_task_backend.delete_task(id);
    if (ok) dispatch({ type: 'delete', id });
  }

  return (
    <main style={{ maxWidth: 400, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>To-Do List</h1>
      <TaskInput onAdd={addTask} />
      <FilterBar filter={filter} setFilter={setFilter} />
      {loading ? (
        <p style={{textAlign: 'center', color: '#888'}}>Loading...</p>
      ) : (
        <TaskList
          tasks={tasks.filter(FILTERS[filter])}
          onToggle={toggleComplete}
          onDelete={deleteTask}
          onEdit={updateTask}
        />
      )}
    </main>
  );
}

function TaskInput({ onAdd }) {
  const [text, setText] = useState('');
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        if (text.trim()) {
          onAdd(text.trim());
          setText('');
        }
      }}
      style={{ display: 'flex', gap: 8, marginBottom: 16 }}
    >
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Add a new task"
        style={{ flex: 1, padding: 8 }}
      />
      <button type="submit">Add</button>
    </form>
  );
}

function TaskList({ tasks, onToggle, onDelete, onEdit }) {
  if (!tasks.length) return <p>No tasks.</p>;
  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </ul>
  );
}

function TaskItem({ task, onToggle, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(task.text);
  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
      />
      {editing ? (
        <form
          onSubmit={e => {
            e.preventDefault();
            if (text.trim()) {
              onEdit(task.id, text.trim());
              setEditing(false);
            }
          }}
          style={{ flex: 1 }}
        >
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            autoFocus
            style={{ padding: 4, width: '90%' }}
          />
        </form>
      ) : (
        <span
          style={{
            flex: 1,
            textDecoration: task.completed ? 'line-through' : 'none',
            color: task.completed ? '#888' : '#222',
            cursor: 'pointer',
          }}
          onDoubleClick={() => setEditing(true)}
        >
          {task.text}
        </span>
      )}
      <button onClick={() => setEditing(e => !e)}>{editing ? 'Cancel' : 'Edit'}</button>
      <button onClick={() => onDelete(task.id)} style={{ color: 'red' }}>Delete</button>
    </li>
  );
}

function FilterBar({ filter, setFilter }) {
  return (
    <div className="FilterBar">
      {Object.keys(FILTERS).map(f => (
        <button
          key={f}
          onClick={() => setFilter(f)}
          style={{
            fontWeight: filter === f ? 'bold' : 'normal',
            textTransform: 'capitalize',
          }}
          aria-pressed={filter === f}
        >
          {f}
        </button>
      ))}
    </div>
  );
}

export default App;
