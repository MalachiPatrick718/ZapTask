export interface Migration {
  name: string;
  sql: string;
}

export function getInlineMigrations(): Migration[] {
  return [
    {
      name: '001_create_tasks',
      sql: `
        DROP TABLE IF EXISTS tasks;
        CREATE TABLE tasks (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          source TEXT NOT NULL DEFAULT 'local',
          source_id TEXT,
          source_url TEXT,
          category TEXT NOT NULL DEFAULT 'work',
          status TEXT NOT NULL DEFAULT 'todo',
          priority TEXT,
          energy_required TEXT,
          estimated_minutes INTEGER,
          due_date TEXT,
          tags TEXT NOT NULL DEFAULT '[]',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          synced_at TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
        CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
        CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
        CREATE INDEX IF NOT EXISTS idx_tasks_source ON tasks(source);
      `,
    },
    {
      name: '002_add_notes_column',
      sql: `ALTER TABLE tasks ADD COLUMN notes TEXT NOT NULL DEFAULT '[]';`,
    },
    {
      name: '003_add_calendar_event_fields',
      sql: `
        ALTER TABLE tasks ADD COLUMN start_time TEXT;
        ALTER TABLE tasks ADD COLUMN end_time TEXT;
        ALTER TABLE tasks ADD COLUMN location TEXT;
        ALTER TABLE tasks ADD COLUMN conference_url TEXT;
      `,
    },
  ];
}
