import { type ReactNode, useEffect } from 'react';
import { useStore } from '../../store';
import { AddTaskPanel } from './AddTaskPanel';
import { TaskDetailPanel } from './TaskDetailPanel';
import { EnergyCheckinPanel } from './EnergyCheckinPanel';
import { QuickStartPanel } from './QuickStartPanel';

export function PanelContainer() {
  const activePanel = useStore((s) => s.activePanel);
  const setActivePanel = useStore((s) => s.setActivePanel);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activePanel) {
        setActivePanel(null);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activePanel, setActivePanel]);

  if (!activePanel) return null;

  let content: ReactNode = null;
  if (activePanel === 'addTask') content = <AddTaskPanel />;
  if (activePanel === 'taskDetail') content = <TaskDetailPanel />;
  if (activePanel === 'energyCheckin') content = <EnergyCheckinPanel />;
  if (activePanel === 'quickStart') content = <QuickStartPanel />;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setActivePanel(null)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          zIndex: 100,
        }}
      />
      {/* Panel */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        zIndex: 101,
        background: 'var(--bg)',
        borderLeft: '1px solid var(--border)',
        overflow: 'auto',
        animation: 'slideIn 200ms ease',
      }}>
        {content}
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
