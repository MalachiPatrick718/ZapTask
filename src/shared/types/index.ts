// === Source integrations ===
export type TaskSource = 'jira' | 'notion' | 'gcal' | 'local';

// === Energy levels (3 levels per brief) ===
export type EnergyLevel = 'high' | 'medium' | 'low';

// === Task Note ===
export interface TaskNote {
  id: string;
  text: string;
  createdAt: string; // ISO datetime
}

// === Task ===
export interface Task {
  id: string;
  title: string;
  description: string | null;
  source: TaskSource;
  sourceId: string | null;
  sourceUrl: string | null;
  category: 'work' | 'personal';
  status: 'todo' | 'in_progress' | 'done';
  priority: 'urgent' | 'high' | 'medium' | 'low' | null;
  energyRequired: EnergyLevel | null;
  estimatedMinutes: number | null;
  dueDate: string | null; // ISO date YYYY-MM-DD
  tags: string[];
  notes: TaskNote[];
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
  syncedAt: string | null; // ISO datetime
}

// === Energy Profile ===
export interface EnergyBlock {
  id: string;
  label: string;
  start: number; // hour 0-23
  end: number; // hour 0-23
  level: EnergyLevel;
}

export interface EnergyProfile {
  blocks: EnergyBlock[];
}

export const DEFAULT_ENERGY_PROFILE: EnergyProfile = {
  blocks: [
    { id: 'morning', label: 'Morning', start: 6, end: 12, level: 'high' },
    { id: 'early_afternoon', label: 'Early Afternoon', start: 12, end: 15, level: 'medium' },
    { id: 'late_afternoon', label: 'Late Afternoon', start: 15, end: 18, level: 'high' },
    { id: 'evening', label: 'Evening', start: 18, end: 22, level: 'low' },
  ],
};

// === Connected Tool ===
export interface ConnectedTool {
  toolId: 'jira' | 'notion' | 'gcal';
  connected: boolean;
  email: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: string;
  lastSyncAt: string | null;
  syncError: string | null;
}

// === Time Block (Day View scheduling) ===
export interface TimeBlock {
  id: string;
  taskId: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:MM
  end: string; // HH:MM
  createdAt: string;
}

// === User Profile ===
export interface UserProfile {
  name: string;
  email: string;
}
