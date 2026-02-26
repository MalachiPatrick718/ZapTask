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
import { TrialBanner } from './components/TrialBanner';
import { PricingModal } from './components/PricingModal';
import { useStore, type ActiveView } from './store';

// Tab icons (settings is accessed via TitleBar gear, not bottom nav)
const tabs: { id: ActiveView; label: string; icon: string }[] = [
  { id: 'tasks', label: 'Tasks', icon: '\u2611' },
  { id: 'suggested', label: 'Suggested', icon: '\u26A1' },
  { id: 'day', label: "Today's Work", icon: '\uD83D\uDCC5' },
];

function BottomNav() {
  const activeView = useStore((s) => s.activeView);
  const setActiveView = useStore((s) => s.setActiveView);
  const windowMode = useStore((s) => s.windowMode);
  const tasks = useStore((s) => s.tasks);
  const schedule = useStore((s) => s.schedule);

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

  // Hide bottom nav in settings mode (after all hooks)
  if (windowMode === 'settings') return null;

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
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function MainContent() {
  const activeView = useStore((s) => s.activeView);
  const windowMode = useStore((s) => s.windowMode);

  // Settings mode takes over the entire content area
  if (windowMode === 'settings') {
    return (
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <SettingsView />
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {activeView === 'tasks' && <TasksView />}
      {activeView === 'suggested' && <SuggestedView />}
      {activeView === 'day' && <DayView />}
    </div>
  );
}

export function App() {
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
  const windowMode = useStore((s) => s.windowMode);

  // In-app keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      // Cmd+N — New task
      if (e.key === 'n' && !e.shiftKey) {
        e.preventDefault();
        if (windowMode !== 'settings') {
          setActiveView('tasks');
          setActivePanel('addTask');
        }
      }

      // Cmd+F — Focus search
      if (e.key === 'f' && !e.shiftKey) {
        e.preventDefault();
        if (windowMode !== 'settings') {
          setActiveView('tasks');
          window.dispatchEvent(new CustomEvent('zaptask:focusSearch'));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveView, setActivePanel, windowMode]);
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
      <TrialBanner />
      <MainContent />
      <PomodoroBar />
      <BottomNav />
      <PanelContainer />
      <ToastContainer />
      <PricingModal />
    </div>
  );
}
