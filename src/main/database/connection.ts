import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import { getInlineMigrations } from './migrations';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  const dbPath = path.join(app.getPath('userData'), 'zaptask.db');
  db = new Database(dbPath);

  // Enable WAL mode for better concurrent read performance
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  runMigrations(db);

  return db;
}

function runMigrations(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const migrations = getInlineMigrations();
  const applied = new Set(
    database.prepare('SELECT name FROM _migrations').all()
      .map((row: any) => row.name),
  );

  const unapplied = migrations.filter((m) => !applied.has(m.name));

  if (unapplied.length > 0) {
    const applyMigration = database.transaction((migration: { name: string; sql: string }) => {
      database.exec(migration.sql);
      database.prepare('INSERT INTO _migrations (name) VALUES (?)').run(migration.name);
    });

    for (const migration of unapplied) {
      console.log(`[DB] Applying migration: ${migration.name}`);
      applyMigration(migration);
    }
  }
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
