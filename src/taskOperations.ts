import type { Task } from './types';

export function addTask(tasks: Task[], task: Task): Task[] {
  return [...tasks, task];
}

export function setTaskFinished(tasks: Task[], id: string, finished: boolean): Task[] {
  return tasks.map((task) => (task.id === id ? { ...task, finished } : task));
}

export function deleteTask(tasks: Task[], id: string): Task[] {
  return tasks.filter((task) => task.id !== id);
}

export function getActiveTasks(tasks: Task[]): Task[] {
  return tasks
    .filter((task) => !task.finished)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
}

export function getFinishedTasks(tasks: Task[]): Task[] {
  return tasks
    .filter((task) => task.finished)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
