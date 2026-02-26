// === Source integrations ===
export type TaskSource = 'jira' | 'asana' | 'notion' | 'monday' | 'gcal' | 'outlook' | 'apple_cal' | 'local';

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
  // Calendar event metadata (populated for gcal/outlook/apple_cal sources)
  startTime: string | null;    // ISO datetime (actual event start)
  endTime: string | null;      // ISO datetime (actual event end)
  location: string | null;     // Event location text
  conferenceUrl: string | null; // Zoom/Meet/Teams join link
  // Recurrence
  recurrenceRule: 'daily' | 'weekdays' | 'weekly' | 'biweekly' | 'monthly' | null;
  recurrenceParentId: string | null; // links to original recurring task for lineage
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

// === Subscription ===
export type SubscriptionTier = 'trial' | 'free' | 'pro';
export type SubscriptionStatus = 'active' | 'expired' | 'canceled';

export interface Subscription {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  trialStartedAt: string;          // ISO date
  trialEndsAt: string;             // ISO date (trialStartedAt + 14 days)
  paddleSubscriptionId: string | null;
  paddleCustomerId: string | null;
  currentPeriodEnd: string | null;  // ISO date
}

export const FREE_LIMITS = {
  maxTasks: 10,
  maxIntegrations: 1,
  pomodoroEnabled: false,
  daySummaryEnabled: false,
  energySchedulingEnabled: false,
} as const;

export const PRO_LIMITS = {
  maxTasks: Infinity,
  maxIntegrations: Infinity,
  pomodoroEnabled: true,
  daySummaryEnabled: true,
  energySchedulingEnabled: true,
} as const;
