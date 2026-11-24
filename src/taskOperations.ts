import type { Task } from './types';

export function addTask(tasks: Task[], task: Task): Task[] {
  if (tasks.some((existingTask) => existingTask.id === task.id)) {
    return tasks;
  }
  return [...tasks, task];
}

export function setTaskFinished(tasks: Task[], id: string, finished: boolean): Task[] {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) return tasks;

  return tasks.map((task, taskIndex) =>
    taskIndex === index ? { ...task, finished } : task,
  );
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

export function sanitizeTasks(value: unknown): Task[] {
  if (!Array.isArray(value)) return [];

  const seenIds = new Set<string>();
  const sanitized: Task[] = [];

  for (const item of value) {
    if (!item || typeof item !== 'object') continue;

    const candidate = item as Record<string, unknown>;
    if (
      typeof candidate.id !== 'string'
      || candidate.id.trim() === ''
      || typeof candidate.title !== 'string'
      || candidate.title.trim() === ''
      || typeof candidate.deadline !== 'string'
      || Number.isNaN(new Date(candidate.deadline).getTime())
      || typeof candidate.finished !== 'boolean'
      || typeof candidate.createdAt !== 'string'
      || Number.isNaN(new Date(candidate.createdAt).getTime())
      || (candidate.description !== undefined && typeof candidate.description !== 'string')
      || seenIds.has(candidate.id)
    ) {
      continue;
    }

    seenIds.add(candidate.id);
    sanitized.push({
      id: candidate.id,
      title: candidate.title,
      ...(candidate.description !== undefined ? { description: candidate.description as string } : {}),
      deadline: candidate.deadline,
      finished: candidate.finished,
      createdAt: candidate.createdAt,
    });
  }

  return sanitized;
}
