import type Database from 'better-sqlite3';
import { getDb } from '../connection';
import type { Task } from '../../../shared/types';

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  source: string;
  source_id: string | null;
  source_url: string | null;
  category: string;
  status: string;
  priority: string | null;
  energy_required: string | null;
  estimated_minutes: number | null;
  due_date: string | null;
  tags: string;
  notes: string;
  created_at: string;
  updated_at: string;
  synced_at: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  conference_url: string | null;
}

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    source: row.source as Task['source'],
    sourceId: row.source_id,
    sourceUrl: row.source_url,
    category: row.category as Task['category'],
    status: row.status as Task['status'],
    priority: row.priority as Task['priority'],
    energyRequired: row.energy_required as Task['energyRequired'],
    estimatedMinutes: row.estimated_minutes,
    dueDate: row.due_date,
    tags: JSON.parse(row.tags || '[]'),
    notes: JSON.parse(row.notes || '[]'),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    syncedAt: row.synced_at,
    startTime: row.start_time,
    endTime: row.end_time,
    location: row.location,
    conferenceUrl: row.conference_url,
  };
}

function taskToParams(task: Task) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    source: task.source,
    source_id: task.sourceId,
    source_url: task.sourceUrl,
    category: task.category,
    status: task.status,
    priority: task.priority,
    energy_required: task.energyRequired,
    estimated_minutes: task.estimatedMinutes,
    due_date: task.dueDate,
    tags: JSON.stringify(task.tags),
    notes: JSON.stringify(task.notes),
    created_at: task.createdAt,
    updated_at: task.updatedAt,
    synced_at: task.syncedAt,
    start_time: task.startTime,
    end_time: task.endTime,
    location: task.location,
    conference_url: task.conferenceUrl,
  };
}

export class TaskRepository {
  private db: Database.Database;
  private stmtGetAll: Database.Statement;
  private stmtGetById: Database.Statement;
  private stmtInsert: Database.Statement;
  private stmtUpdate: Database.Statement;
  private stmtDelete: Database.Statement;

  constructor() {
    this.db = getDb();

    this.stmtGetAll = this.db.prepare('SELECT * FROM tasks ORDER BY created_at DESC');
    this.stmtGetById = this.db.prepare('SELECT * FROM tasks WHERE id = ?');

    this.stmtInsert = this.db.prepare(`
      INSERT INTO tasks (
        id, title, description, source, source_id, source_url,
        category, status, priority, energy_required,
        estimated_minutes, due_date, tags, notes, created_at, updated_at, synced_at,
        start_time, end_time, location, conference_url
      ) VALUES (
        @id, @title, @description, @source, @source_id, @source_url,
        @category, @status, @priority, @energy_required,
        @estimated_minutes, @due_date, @tags, @notes, @created_at, @updated_at, @synced_at,
        @start_time, @end_time, @location, @conference_url
      )
    `);

    this.stmtUpdate = this.db.prepare(`
      UPDATE tasks SET
        title = @title, description = @description,
        source = @source, source_id = @source_id, source_url = @source_url,
        category = @category, status = @status, priority = @priority,
        energy_required = @energy_required, estimated_minutes = @estimated_minutes,
        due_date = @due_date, tags = @tags, notes = @notes,
        updated_at = @updated_at, synced_at = @synced_at,
        start_time = @start_time, end_time = @end_time,
        location = @location, conference_url = @conference_url
      WHERE id = @id
    `);

    this.stmtDelete = this.db.prepare('DELETE FROM tasks WHERE id = ?');
  }

  getAll(): Task[] {
    return (this.stmtGetAll.all() as TaskRow[]).map(rowToTask);
  }

  getById(id: string): Task | null {
    const row = this.stmtGetById.get(id) as TaskRow | undefined;
    return row ? rowToTask(row) : null;
  }

  create(task: Task): Task {
    this.stmtInsert.run(taskToParams(task));
    return task;
  }

  update(id: string, changes: Partial<Task>): Task | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const merged: Task = {
      ...existing,
      ...changes,
      updatedAt: new Date().toISOString(),
    };

    this.stmtUpdate.run(taskToParams(merged));
    return merged;
  }

  delete(id: string): boolean {
    const result = this.stmtDelete.run(id);
    return result.changes > 0;
  }
}
