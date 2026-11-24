import { useState, useMemo, useEffect } from 'react';
import { CheckCircle2, Circle, Clock, Plus, Pencil, X, AlertCircle } from 'lucide-react';
import type { Task } from './types';
import {
  addTask,
  deleteTask as deleteTaskOperation,
  getActiveTasks,
  getFinishedTasks,
  setTaskFinished,
} from './taskOperations';

const STORAGE_KEY = 'task-tracker:tasks';

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Task[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function genId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const nowDatetimeLocal = (): string => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const toDatetimeLocal = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const validateDeadline = (
  value: string,
  now: number = Date.now(),
): { deadlineDate: Date } | { error: string } => {
  const deadlineDate = new Date(value);
  if (Number.isNaN(deadlineDate.getTime())) {
    return { error: 'Please provide a valid deadline.' };
  }
  if (deadlineDate.getTime() <= now) {
    return { error: 'Deadline must be after the current time.' };
  }
  return { deadlineDate };
};

const formatDeadline = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const deadlineStatus = (iso: string): 'overdue' | 'soon' | 'ok' => {
  const remaining = new Date(iso).getTime() - Date.now();
  if (remaining < 0) return 'overdue';
  if (remaining < 24 * 60 * 60 * 1000) return 'soon';
  return 'ok';
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const activeTasks = useMemo(
    () => getActiveTasks(tasks),
    [tasks],
  );
  const finishedTasks = useMemo(
    () => getFinishedTasks(tasks),
    [tasks],
  );

  const handleSave = (data: { title: string; description?: string; deadline: string }) => {
    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? { ...t, ...data } : t)),
      );
    } else {
      const newTask: Task = {
        id: genId(),
        ...data,
        finished: false,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => addTask(prev, newTask));
    }
    closeModal();
  };

  const markFinished = (id: string) => {
    setTasks((prev) => setTaskFinished(prev, id, true));
  };

  const markActive = (id: string) => {
    setTasks((prev) => setTaskFinished(prev, id, false));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => deleteTaskOperation(prev, id));
  };

  const openCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Task Tracker</h1>
              <p className="text-sm text-slate-500">Stay on top of what matters.</p>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 active:scale-95"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">New Task</span>
          </button>
        </header>

        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Active</h2>
            <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {activeTasks.length}
            </span>
          </div>

          {activeTasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <Circle size={28} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm text-slate-500">No active tasks. Create one to get started.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {activeTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onFinish={() => markFinished(task.id)}
                  onEdit={() => openEdit(task)}
                  onDelete={() => deleteTask(task.id)}
                />
              ))}
            </ul>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Finished</h2>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
              {finishedTasks.length}
            </span>
          </div>

          {finishedTasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <CheckCircle2 size={28} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm text-slate-500">Finished tasks will appear here.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {finishedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onFinish={() => markActive(task.id)}
                  onEdit={() => openEdit(task)}
                  onDelete={() => deleteTask(task.id)}
                />
              ))}
            </ul>
          )}
        </section>
      </div>

      {modalOpen && (
        <TaskModal
          task={editingTask}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  onFinish: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function TaskCard({ task, onFinish, onEdit, onDelete }: TaskCardProps) {
  const status = task.finished ? 'done' : deadlineStatus(task.deadline);
  const remainingMs = new Date(task.deadline).getTime() - Date.now();

  const deadlineColor =
    status === 'overdue'
      ? 'text-rose-600 bg-rose-50'
      : status === 'soon'
        ? 'text-amber-600 bg-amber-50'
        : 'text-slate-500 bg-slate-100';

  return (
    <li className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-3">
        <button
          onClick={onFinish}
          title={task.finished ? 'Mark as active' : 'Mark as finished'}
          className="mt-0.5 flex-shrink-0 transition hover:scale-110"
        >
          {task.finished ? (
            <CheckCircle2 size={22} className="text-emerald-500" />
          ) : (
            <Circle size={22} className="text-slate-300 hover:text-slate-500" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <h3
            className={`font-medium leading-snug ${
              task.finished ? 'text-slate-400 line-through' : 'text-slate-900'
            }`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p
              className={`mt-1 text-sm leading-relaxed ${
                task.finished ? 'text-slate-300 line-through' : 'text-slate-500'
              }`}
            >
              {task.description}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${deadlineColor}`}>
              <Clock size={12} />
              {formatDeadline(task.deadline)}
            </span>
            {!task.finished && status === 'overdue' && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-500">
                <AlertCircle size={12} /> Overdue
              </span>
            )}
            {!task.finished && status === 'soon' && (
              <span className="text-xs font-medium text-amber-600">
                Due in {Math.max(1, Math.round(remainingMs / (60 * 60 * 1000)))}h
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-1 opacity-60 transition group-hover:opacity-100">
          <button
            onClick={onEdit}
            title="Edit task"
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={onDelete}
            title="Delete task"
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </li>
  );
}

interface TaskModalProps {
  task: Task | null;
  onClose: () => void;
  onSave: (data: { title: string; description?: string; deadline: string }) => void;
}

function TaskModal({ task, onClose, onSave }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [deadline, setDeadline] = useState(
    task ? toDatetimeLocal(task.deadline) : nowDatetimeLocal(),
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Title is required.');
      return;
    }
    const deadlineValidation = validateDeadline(deadline);
    if ('error' in deadlineValidation) {
      setError(deadlineValidation.error);
      return;
    }
    onSave({
      title: trimmed,
      description: description.trim() || undefined,
      deadline: deadlineValidation.deadlineDate.toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full max-w-lg rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              placeholder="What needs to be done?"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Description <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Add any details..."
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Deadline</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={nowDatetimeLocal()}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {error && (
            <p className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
              <AlertCircle size={15} />
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 active:scale-95"
            >
              {task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
