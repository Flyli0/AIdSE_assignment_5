import { describe, expect, it } from 'vitest';
import type { Task } from './types';
import {
  addTask,
  deleteTask,
  getActiveTasks,
  getFinishedTasks,
  setTaskFinished,
} from './taskOperations';

const firstTask: Task = {
  id: 'task-1',
  title: 'Write tests',
  description: 'Cover task operations',
  deadline: '2030-01-01T12:00:00.000Z',
  finished: false,
  createdAt: '2026-11-24T10:00:00.000Z',
};

const secondTask: Task = {
  id: 'task-2',
  title: 'Review changes',
  deadline: '2030-01-02T12:00:00.000Z',
  finished: false,
  createdAt: '2026-11-24T11:00:00.000Z',
};

describe('task operations', () => {
  it('successfully adds a task without mutating existing tasks', () => {
    const original = [firstTask, secondTask];
    const addedTask: Task = {
      id: 'task-3',
      title: 'Deploy',
      deadline: '2030-01-03T12:00:00.000Z',
      finished: false,
      createdAt: '2026-11-24T12:00:00.000Z',
    };

    const result = addTask(original, addedTask);

    expect(result).toEqual([...original, addedTask]);
    expect(result).not.toBe(original);
    expect(original).toEqual([firstTask, secondTask]);
    expect(original[0]).toBe(firstTask);
    expect(original[1]).toBe(secondTask);
  });

  it('moves a finished task out of the active section', () => {
    const original = [firstTask, secondTask];
    const finished = setTaskFinished(original, firstTask.id, true);

    expect(getActiveTasks(finished).map((task) => task.id)).not.toContain(firstTask.id);
    expect(getActiveTasks(finished).map((task) => task.id)).toEqual([secondTask.id]);
    expect(getFinishedTasks(finished).map((task) => task.id)).toEqual([firstTask.id]);
  });

  it('deletes only the requested task', () => {
    const original = [firstTask, secondTask];
    const result = deleteTask(original, firstTask.id);

    expect(result).toEqual([secondTask]);
    expect(original).toEqual([firstTask, secondTask]);
  });

  it('adds a task successfully and makes it visible in the active section', () => {
    const addedTask: Task = {
      id: 'task-3',
      title: 'Deploy',
      deadline: '2030-01-03T12:00:00.000Z',
      finished: false,
      createdAt: '2026-11-24T12:00:00.000Z',
    };

    const result = addTask([firstTask, secondTask], addedTask);

    expect(getActiveTasks(result)).toContainEqual(addedTask);
    expect(getActiveTasks(result)).toHaveLength(3);
  });
});
