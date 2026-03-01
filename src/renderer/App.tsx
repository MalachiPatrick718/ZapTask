import { useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { TitleBar } from './components/TitleBar';
import { ToastContainer } from './components/shared/Toast';
import { Onboarding } from './components/onboarding/Onboarding';
import { PanelContainer } from './components/panels/PanelContainer';
import { TasksView } from './components/TasksView';
import { SuggestedView } from './components/SuggestedView';
import { DayView } from './components/DayView';
import { SettingsView } from './components/SettingsView';
import { PomodoroBar } from './components/PomodoroBar';
// TrialPill is now rendered inside TitleBar
import { PricingModal } from './components/PricingModal';
import { useStore, type ActiveView } from './store';
import { useSubscription } from './hooks/useSubscription';
import { useLicenseValidation } from './hooks/useLicenseValidation';
import { useProUpsell } from './hooks/useProUpsell';

// Tab icons (settings is accessed via TitleBar gear, not bottom nav)
const tabs: { id: ActiveView; label: string; icon: string }[] = [
  { id: 'tasks', label: 'Tasks', icon: '\u2611' },
  { id: 'suggested', label: 'Suggested', icon: '\u26A1' },
  { id: 'day', label: 'Schedule', icon: '\uD83D\uDCC5' },
];

function BottomNav() {
  const activeView = useStore((s) => s.activeView);
  const setActiveView = useStore((s) => s.setActiveView);
  const tasks = useStore((s) => s.tasks);
  const schedule = useStore((s) => s.schedule);
  const { canUseEnergyScheduling } = useSubscription();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayCount = useMemo(() => {
    const dueToday = tasks.filter((t) => t.dueDate === todayStr && t.status !== 'done');
    const scheduledToday = schedule.filter(
      (b) => b.date === todayStr && tasks.some((t) => t.id === b.taskId),
    );
    // Combine: due tasks + scheduled tasks (avoid double-counting)
    const ids = new Set([
      ...dueToday.map((t) => t.id),
      ...scheduledToday.map((b) => b.taskId),
    ]);
    return ids.size;
  }, [tasks, schedule, todayStr]);

  // Hide bottom nav in settings view (after all hooks)
  if (activeView === 'settings') return null;

  return (
    <nav style={{
      display: 'flex',
      borderTop: '1px solid var(--border)',
      flexShrink: 0,
    }}>
      {tabs.map((tab) => {
        const active = activeView === tab.id;
        const badge = tab.id === 'day' ? todayCount : 0;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              padding: '8px 0',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: active ? 'var(--accent)' : 'var(--text3)',
              transition: 'color 150ms ease',
              fontSize: 16,
              position: 'relative',
            }}
          >
            <span style={{ position: 'relative' }}>
              {tab.icon}
              {badge > 0 && (
                <span style={{
                  position: 'absolute',
                  top: -6,
                  right: -10,
                  minWidth: 16,
                  height: 16,
                  padding: '0 4px',
                  borderRadius: 8,
                  background: 'var(--accent)',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                }}>
                  {badge}
                </span>
              )}
            </span>
            <span style={{
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              fontWeight: active ? 600 : 400,
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}>
              {tab.label}
              {tab.id === 'suggested' && !canUseEnergyScheduling() && (
                <span style={{ fontSize: 9, opacity: 0.6 }}>{'\uD83D\uDD12'}</span>
              )}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function MainContent() {
  const activeView = useStore((s) => s.activeView);

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {activeView === 'tasks' && <TasksView />}
      {activeView === 'suggested' && <SuggestedView />}
      {activeView === 'day' && <DayView />}
      {activeView === 'settings' && <SettingsView />}
    </div>
  );
}

export function App() {
  useLicenseValidation();
  useProUpsell();
  const onboardingComplete = useStore((s) => s.onboardingComplete);
  const theme = useStore((s) => s.theme);
  const setTasks = useStore((s) => s.setTasks);
  const setSchedule = useStore((s) => s.setSchedule);

  const accentColor = useStore((s) => s.accentColor);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Apply custom accent color as CSS variable override
  useEffect(() => {
    const root = document.documentElement;
    if (accentColor && accentColor.startsWith('#')) {
      root.style.setProperty('--accent', accentColor);
      // Derive dim variant (15% opacity)
      const r = parseInt(accentColor.slice(1, 3), 16);
      const g = parseInt(accentColor.slice(3, 5), 16);
      const b = parseInt(accentColor.slice(5, 7), 16);
      root.style.setProperty('--accent-dim', `rgba(${r}, ${g}, ${b}, 0.15)`);
    } else {
      root.style.removeProperty('--accent');
      root.style.removeProperty('--accent-dim');
    }
  }, [accentColor, theme]);

  // Listen for navigate-to-task events from main process (notifications, deep links)
  const selectTask = useStore((s) => s.selectTask);
  const setActivePanel = useStore((s) => s.setActivePanel);
  const setActiveView = useStore((s) => s.setActiveView);
  const setWindowMode = useStore((s) => s.setWindowMode);

  // In-app keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      // Cmd+N — New task
      if (e.key === 'n' && !e.shiftKey) {
        e.preventDefault();
        const view = useStore.getState().activeView;
        if (view !== 'settings') {
          setActiveView('tasks');
          setActivePanel('addTask');
        }
      }

      // Cmd+F — Focus search
      if (e.key === 'f' && !e.shiftKey) {
        e.preventDefault();
        const view = useStore.getState().activeView;
        if (view !== 'settings') {
          setActiveView('tasks');
          window.dispatchEvent(new CustomEvent('zaptask:focusSearch'));
        }
      }

      // Cmd+? — Quick Start Guide
      if (e.key === '/' && e.shiftKey) {
        e.preventDefault();
        setActivePanel('quickStart');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveView, setActivePanel]);

  // Listen for expand/collapse changes from main process (global shortcut)
  useEffect(() => {
    const cleanup = window.zaptask.onExpandChanged((expanded: boolean) => {
      setWindowMode(expanded ? 'expanded' : 'widget');
    });
    return cleanup;
  }, [setWindowMode]);
  useEffect(() => {
    const cleanup = window.zaptask.onNavigateToTask((taskId: string) => {
      if (taskId === '__energy_checkin__') {
        setActivePanel('energyCheckin');
      } else {
        selectTask(taskId);
        setActivePanel('taskDetail');
        setActiveView('tasks');
      }
    });
    return cleanup;
  }, [selectTask, setActivePanel, setActiveView]);

  // Listen for update status events from main process
  const setUpdateStatus = useStore((s) => s.setUpdateStatus);
  const setUpdateProgress = useStore((s) => s.setUpdateProgress);
  const setUpdateError = useStore((s) => s.setUpdateError);
  useEffect(() => {
    const cleanup = window.zaptask.onUpdateStatus((data) => {
      if (data.status === 'error') {
        setUpdateError(data.error || 'Update check failed');
      } else if (data.status === 'downloading' && data.progress != null) {
        setUpdateProgress(data.progress);
        setUpdateStatus('downloading');
      } else {
        setUpdateStatus(
          data.status as any,
          data.version ? { version: data.version, releaseNotes: data.releaseNotes, downloadUrl: data.downloadUrl } : undefined,
        );
      }
    });
    return cleanup;
  }, [setUpdateStatus, setUpdateProgress, setUpdateError]);

  // Listen for synced tasks from integrations (gcal, jira, notion, etc.)
  const addTask = useStore((s) => s.addTask);
  const updateTask = useStore((s) => s.updateTask);
  const updateToolSync = useStore((s) => s.updateToolSync);
  useEffect(() => {
    if (!onboardingComplete) return;
    const cleanupSync = window.zaptask.onSyncTasks(async (data: { source: string; tasks: any[] }) => {
      const currentTasks = useStore.getState().tasks;
      const existingById = new Map(currentTasks.map((t) => [t.id, t]));

      // Fields the user sets locally — never overwrite with null from integrations
      const userFields = ['energyRequired', 'priority', 'estimatedMinutes', 'category'] as const;

      for (const task of data.tasks) {
        const existing = existingById.get(task.id);
        if (existing) {
          // Merge: keep user-set fields if the sync data has null
          const merged: Record<string, any> = { ...task };
          for (const field of userFields) {
            if (merged[field] == null && existing[field] != null) {
              merged[field] = existing[field];
            }
          }
          updateTask(task.id, merged);
          window.zaptask.tasks.update(task.id, merged).catch(() => {});
        } else {
          addTask(task);
          window.zaptask.tasks.create(task).catch(() => {});
        }
      }
    });
    const cleanupStatus = window.zaptask.onSyncStatus?.((data: { toolId: string; status: string; lastSyncAt?: string; error?: string }) => {
      updateToolSync(data.toolId, data.status as any, data.lastSyncAt, data.error);
    });
    return () => {
      cleanupSync();
      cleanupStatus?.();
    };
  }, [onboardingComplete, addTask, updateTask, updateToolSync]);

  // Load tasks from SQLite on startup
  useEffect(() => {
    if (!onboardingComplete) return;
    (async () => {
      try {
        const result = await window.zaptask.tasks.getAll();
        if (result.success && result.data) {
          // One-time migration: if SQLite is empty, check localStorage for leftover tasks
          if (result.data.length === 0) {
            let legacyTasks: any[] = [];
            try {
              const raw = localStorage.getItem('zaptask-store');
              if (raw) {
                const parsed = JSON.parse(raw);
                const stored = parsed?.state?.tasks;
                if (Array.isArray(stored) && stored.length > 0) {
                  legacyTasks = stored;
                }
              }
            } catch { /* ignore parse errors */ }

            // Also check in-memory store (may have tasks from old persist merge)
            const storeTasks = useStore.getState().tasks;
            const tasksToMigrate = legacyTasks.length > 0 ? legacyTasks : storeTasks;

            if (tasksToMigrate.length > 0) {
              console.log(`[App] Migrating ${tasksToMigrate.length} tasks from localStorage to SQLite`);
              for (const task of tasksToMigrate) {
                await window.zaptask.tasks.create(task);
              }
              setTasks(tasksToMigrate);
              // Clean up legacy tasks from localStorage
              try {
                const raw = localStorage.getItem('zaptask-store');
                if (raw) {
                  const parsed = JSON.parse(raw);
                  if (parsed?.state?.tasks) {
                    delete parsed.state.tasks;
                    localStorage.setItem('zaptask-store', JSON.stringify(parsed));
                  }
                }
              } catch { /* ignore */ }
            }
          } else {
            setTasks(result.data);
          }

          // Clean up stale schedule blocks:
          // Remove orphaned (task deleted), past-date, and mismatched-date blocks
          // A block is "mismatched" if it was scheduled on a date different from
          // when the user explicitly clicked "Add to Today's Work" — but we can't
          // distinguish that, so we just keep blocks that are today or future AND
          // whose task still exists.
          const loadedTasks = result.data as any[];
          const taskIds = new Set(loadedTasks.map((t: any) => t.id));
          const todayStr = new Date().toISOString().slice(0, 10);
          const currentSchedule = useStore.getState().schedule;
          const validBlocks = currentSchedule.filter(
            (b: any) => taskIds.has(b.taskId) && b.date >= todayStr,
          );
          if (validBlocks.length !== currentSchedule.length) {
            setSchedule(validBlocks);
          }
        }
      } catch (err) {
        console.error('[App] Error loading tasks:', err);
      }
    })();
  }, [onboardingComplete, setTasks, setSchedule]);

  if (!onboardingComplete) {
    return <Onboarding />;
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>
      <TitleBar />
      <MainContent />
      <PomodoroBar />
      <BottomNav />
      <PanelContainer />
      <ToastContainer />
      <PricingModal />
    </div>
  );
}
