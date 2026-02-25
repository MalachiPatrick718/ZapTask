export { getDb, closeDb } from './connection';
export { TaskRepository } from './repositories/task-repository';

import { TaskRepository } from './repositories/task-repository';

let _taskRepo: TaskRepository | null = null;

export function getTaskRepository(): TaskRepository {
  if (!_taskRepo) {
    _taskRepo = new TaskRepository();
  }
  return _taskRepo;
}
