import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format as fmtDate } from 'date-fns';
import type {
  Task,
  TaskSource,
  EnergyProfile,
  EnergyLevel,
  TimeBlock,
  UserProfile,
  Subscription,
} from '../../shared/types';
import { DEFAULT_ENERGY_PROFILE } from '../../shared/types';
import { createNextRecurringTask } from '../services/recurrence';

// === View & Panel types ===
export type ActiveView = 'tasks' | 'suggested' | 'day' | 'settings';
export type WindowMode = 'widget' | 'expanded';
export type ActivePanel = null | 'taskDetail' | 'addTask' | 'energyCheckin' | 'quickStart';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// === Tool sync state (UI only — credentials stored via IPC) ===
export interface ToolState {
  toolId: Exclude<TaskSource, 'local'>;
  connected: boolean;
  email: string;
  lastSyncAt: string | null;
  syncStatus: 'idle' | 'syncing' | 'error';
  syncError: string | null;
}

const DEFAULT_TOOLS: ToolState[] = [
  { toolId: 'jira', connected: false, email: '', lastSyncAt: null, syncStatus: 'idle', syncError: null },
  { toolId: 'asana', connected: false, email: '', lastSyncAt: null, syncStatus: 'idle', syncError: null },
  { toolId: 'notion', connected: false, email: '', lastSyncAt: null, syncStatus: 'idle', syncError: null },
  { toolId: 'monday', connected: false, email: '', lastSyncAt: null, syncStatus: 'idle', syncError: null },
  { toolId: 'gcal', connected: false, email: '', lastSyncAt: null, syncStatus: 'idle', syncError: null },
  { toolId: 'outlook', connected: false, email: '', lastSyncAt: null, syncStatus: 'idle', syncError: null },
  { toolId: 'apple_cal', connected: false, email: '', lastSyncAt: null, syncStatus: 'idle', syncError: null },
];

// === Subscription defaults ===
function createDefaultSubscription(): Subscription {
  const now = new Date();
  const trialEnd = new Date(now);
  trialEnd.setDate(trialEnd.getDate() + 14);
  return {
    tier: 'free',
    status: 'active',
    trialStartedAt: now.toISOString(),
    trialEndsAt: trialEnd.toISOString(),
    licenseKey: null,
    currentPeriodEnd: null,
    lastValidatedAt: null,
  };
}

// === Pomodoro ===
const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;
const LONG_BREAK_SECONDS = 15 * 60;

export interface PomodoroSession {
  taskId: string;
  phase: 'focus' | 'break';
  durationSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  completedCount: number;
}

// === Store interface ===
interface ZapStore {
  // User
  user: UserProfile | null;
  setUser: (profile: UserProfile) => void;

  // Onboarding
  onboardingComplete: boolean;
  setOnboardingComplete: (done: boolean) => void;

  // Tasks
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, changes: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // Energy
  energyProfile: EnergyProfile;
  setEnergyProfile: (profile: EnergyProfile) => void;
  currentEnergyOverride: EnergyLevel | null;
  setCurrentEnergyOverride: (level: EnergyLevel | null) => void;

  // Connected tools
  tools: ToolState[];
  setToolConnected: (toolId: string, connected: boolean, email?: string) => void;
  updateToolSync: (toolId: string, syncStatus: ToolState['syncStatus'], lastSyncAt?: string, syncError?: string | null) => void;

  // Notifications
  notificationsEnabled: boolean;
  setNotificationsEnabled: (v: boolean) => void;

  // Theme
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  accentColor: string;
  setAccentColor: (color: string) => void;

  // UI
  windowMode: WindowMode;
  setWindowMode: (mode: WindowMode) => void;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  activePanel: ActivePanel;
  setActivePanel: (panel: ActivePanel) => void;
  selectedTaskId: string | null;
  selectTask: (id: string | null) => void;

  // Toasts
  toasts: ToastItem[];
  addToast: (message: string, type?: ToastItem['type']) => void;
  removeToast: (id: string) => void;

  // Schedule (Day View)
  schedule: TimeBlock[];
  addTimeBlock: (block: TimeBlock) => void;
  removeTimeBlock: (id: string) => void;
  setSchedule: (blocks: TimeBlock[]) => void;

  // Pomodoro
  pomodoroSession: PomodoroSession | null;
  startPomodoro: (taskId: string) => void;
  pausePomodoro: () => void;
  resumePomodoro: () => void;
  stopPomodoro: () => void;
  tickPomodoro: () => void;
  completePomodoroPhase: () => void;

  // Subscription
  subscription: Subscription;
  setSubscription: (sub: Partial<Subscription>) => void;

  // Upsell tracking
  lastUpsellAt: string | null;
  setLastUpsellAt: (date: string) => void;

  // Updates
  updateStatus: 'idle' | 'checking' | 'available' | 'downloading' | 'ready' | 'error';
  updateInfo: { version: string; releaseNotes?: string; downloadUrl?: string } | null;
  updateProgress: number;
  updateError: string | null;
  setUpdateStatus: (status: ZapStore['updateStatus'], info?: ZapStore['updateInfo']) => void;
  setUpdateProgress: (pct: number) => void;
  setUpdateError: (err: string | null) => void;
}

export const useStore = create<ZapStore>()(
  persist(
    (set) => ({
      // User
      user: null,
      setUser: (profile) => set({ user: profile }),

      // Onboarding
      onboardingComplete: false,
      setOnboardingComplete: (done) => set({ onboardingComplete: done }),

      // Tasks
      tasks: [],
      setTasks: (tasks) => set({ tasks }),
      addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),
      updateTask: (id, changes) => {
        const s = useStore.getState();
        const oldTask = s.tasks.find((t) => t.id === id);
        const updatedTask = oldTask ? { ...oldTask, ...changes, updatedAt: new Date().toISOString() } : null;

        const newState: Partial<ZapStore> = {
          tasks: s.tasks.map((t) => t.id === id ? { ...t, ...changes, updatedAt: new Date().toISOString() } : t),
        };
        // If due date changed, remove schedule blocks for this task on the old date
        if (changes.dueDate && oldTask && oldTask.dueDate !== changes.dueDate) {
          newState.schedule = s.schedule.filter(
            (b) => !(b.taskId === id && b.date !== changes.dueDate),
          );
        }

        set(newState);

        // Auto-generate next recurring task when marked done
        if (changes.status === 'done' && updatedTask?.recurrenceRule) {
          const nextTask = createNextRecurringTask(updatedTask);
          // Persist via IPC then add to store
          window.zaptask.tasks.create(nextTask).then((result: any) => {
            if (result.success) {
              useStore.getState().addTask(nextTask);
              const dueFmt = fmtDate(new Date(nextTask.dueDate + 'T00:00:00'), 'MMM d');
              useStore.getState().addToast(`Next occurrence created \u2014 due ${dueFmt}`, 'success');
            }
          }).catch(() => {
            useStore.getState().addToast('Failed to create next recurring task', 'error');
          });
        }
      },
      deleteTask: (id) => set((s) => ({
        tasks: s.tasks.filter((t) => t.id !== id),
        // Also remove any schedule blocks for the deleted task
        schedule: s.schedule.filter((b) => b.taskId !== id),
      })),

      // Energy
      energyProfile: DEFAULT_ENERGY_PROFILE,
      setEnergyProfile: (profile) => set({ energyProfile: profile }),
      currentEnergyOverride: null,
      setCurrentEnergyOverride: (level) => set({ currentEnergyOverride: level }),

      // Connected tools
      tools: DEFAULT_TOOLS,
      setToolConnected: (toolId, connected, email) => set((s) => ({
        tools: s.tools.map((t) =>
          t.toolId === toolId ? { ...t, connected, email: email ?? t.email } : t
        ),
      })),
      updateToolSync: (toolId, syncStatus, lastSyncAt, syncError) => set((s) => ({
        tools: s.tools.map((t) =>
          t.toolId === toolId
            ? { ...t, syncStatus, lastSyncAt: lastSyncAt ?? t.lastSyncAt, syncError: syncError ?? null }
            : t
        ),
      })),

      // Notifications
      notificationsEnabled: true,
      setNotificationsEnabled: (v) => set({ notificationsEnabled: v }),

      // Theme
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      accentColor: '#F06D3D',
      setAccentColor: (color) => set({ accentColor: color }),

      // UI
      windowMode: 'widget',
      setWindowMode: (mode) => set({ windowMode: mode }),
      activeView: 'tasks',
      setActiveView: (view) => set({ activeView: view }),
      activePanel: null,
      setActivePanel: (panel) => set({ activePanel: panel }),
      selectedTaskId: null,
      selectTask: (id) => set({ selectedTaskId: id }),

      // Toasts
      toasts: [],
      addToast: (message, type = 'info') => set((s) => ({
        toasts: [...s.toasts, { id: crypto.randomUUID(), message, type }],
      })),
      removeToast: (id) => set((s) => ({
        toasts: s.toasts.filter((t) => t.id !== id),
      })),

      // Schedule
      schedule: [],
      addTimeBlock: (block) => set((s) => ({ schedule: [...s.schedule, block] })),
      removeTimeBlock: (id) => set((s) => ({ schedule: s.schedule.filter((b) => b.id !== id) })),
      setSchedule: (blocks) => set({ schedule: blocks }),

      // Pomodoro
      pomodoroSession: null,
      startPomodoro: (taskId) => set({
        pomodoroSession: {
          taskId,
          phase: 'focus',
          durationSeconds: FOCUS_SECONDS,
          remainingSeconds: FOCUS_SECONDS,
          isRunning: true,
          completedCount: 0,
        },
      }),
      pausePomodoro: () => set((s) => {
        if (!s.pomodoroSession) return {};
        return { pomodoroSession: { ...s.pomodoroSession, isRunning: false } };
      }),
      resumePomodoro: () => set((s) => {
        if (!s.pomodoroSession) return {};
        return { pomodoroSession: { ...s.pomodoroSession, isRunning: true } };
      }),
      stopPomodoro: () => set({ pomodoroSession: null }),
      tickPomodoro: () => set((s) => {
        if (!s.pomodoroSession || !s.pomodoroSession.isRunning) return {};
        const next = s.pomodoroSession.remainingSeconds - 1;
        if (next <= 0) return {}; // completePomodoroPhase handles the transition
        return { pomodoroSession: { ...s.pomodoroSession, remainingSeconds: next } };
      }),
      completePomodoroPhase: () => set((s) => {
        if (!s.pomodoroSession) return {};
        const session = s.pomodoroSession;
        if (session.phase === 'focus') {
          const newCount = session.completedCount + 1;
          const breakDuration = newCount % 4 === 0 ? LONG_BREAK_SECONDS : BREAK_SECONDS;
          return {
            pomodoroSession: {
              ...session,
              phase: 'break',
              durationSeconds: breakDuration,
              remainingSeconds: breakDuration,
              completedCount: newCount,
              isRunning: true,
            },
          };
        }
        // break → focus
        return {
          pomodoroSession: {
            ...session,
            phase: 'focus',
            durationSeconds: FOCUS_SECONDS,
            remainingSeconds: FOCUS_SECONDS,
            isRunning: true,
          },
        };
      }),
      // Subscription
      subscription: createDefaultSubscription(),
      setSubscription: (sub) => set((s) => ({
        subscription: { ...s.subscription, ...sub },
      })),

      // Upsell tracking
      lastUpsellAt: null,
      setLastUpsellAt: (date) => set({ lastUpsellAt: date }),

      // Updates
      updateStatus: 'idle',
      updateInfo: null,
      updateProgress: 0,
      updateError: null,
      setUpdateStatus: (status, info) => set((s) => ({
        updateStatus: status,
        updateInfo: info !== undefined ? info : s.updateInfo,
        updateError: status !== 'error' ? null : s.updateError,
      })),
      setUpdateProgress: (pct) => set({ updateProgress: pct }),
      setUpdateError: (err) => set({ updateError: err, updateStatus: 'error' }),
    }),
    {
      name: 'zaptask-store',
      partialize: (state) => ({
        user: state.user,
        onboardingComplete: state.onboardingComplete,
        energyProfile: state.energyProfile,
        tools: state.tools,
        theme: state.theme,
        accentColor: state.accentColor,
        notificationsEnabled: state.notificationsEnabled,
        subscription: state.subscription,
        lastUpsellAt: state.lastUpsellAt,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<ZapStore> | undefined;
        return {
          ...current,
          // Only restore specific fields — tasks come from SQLite, schedule starts fresh
          user: p?.user ?? current.user,
          onboardingComplete: p?.onboardingComplete ?? current.onboardingComplete,
          theme: p?.theme === 'light' || p?.theme === 'dark' ? p.theme : current.theme,
          accentColor: typeof p?.accentColor === 'string' && p.accentColor.startsWith('#') ? p.accentColor : current.accentColor,
          energyProfile: p?.energyProfile?.blocks ? p.energyProfile : current.energyProfile,
          tools: (() => {
            if (!Array.isArray(p?.tools)) return current.tools;
            const pTools = p.tools as ToolState[];
            // Merge: keep persisted state for known tools, add any new defaults
            if (pTools.length < current.tools.length) {
              return current.tools.map((def) => {
                const existing = pTools.find((t) => t.toolId === def.toolId);
                return existing || def;
              });
            }
            return pTools;
          })(),
          notificationsEnabled: typeof p?.notificationsEnabled === 'boolean' ? p.notificationsEnabled : current.notificationsEnabled,
          subscription: p?.subscription?.tier ? p.subscription as Subscription : current.subscription,
        };
      },
    },
  ),
);

// One-time cleanup: remove stale data from localStorage
try {
  const raw = localStorage.getItem('zaptask-store');
  if (raw) {
    const parsed = JSON.parse(raw);
    let changed = false;
    // Remove legacy tasks (now in SQLite)
    if (parsed?.state?.tasks) {
      delete parsed.state.tasks;
      changed = true;
    }
    // Clear schedule — will be repopulated from user actions
    if (Array.isArray(parsed?.state?.schedule) && parsed.state.schedule.length > 0) {
      parsed.state.schedule = [];
      changed = true;
    }
    if (changed) {
      localStorage.setItem('zaptask-store', JSON.stringify(parsed));
    }
  }
} catch { /* ignore */ }

// === Helper: get current energy level ===
export function getCurrentEnergy(profile: EnergyProfile, override: EnergyLevel | null): EnergyLevel {
  if (override) return override;
  const hour = new Date().getHours();
  const blocks = profile?.blocks ?? DEFAULT_ENERGY_PROFILE.blocks;
  const block = blocks.find((b) => hour >= b.start && hour < b.end);
  return block?.level ?? 'medium';
}
