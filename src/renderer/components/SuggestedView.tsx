import { useMemo, useCallback } from 'react';
import { scheduleTaskIntoDay } from '../services/scheduler';
import { useStore, getCurrentEnergy } from '../store';
import { getSuggestions } from '../services/suggestions';
import { TaskCard } from './shared/TaskCard';
import { useSubscription } from '../hooks/useSubscription';
import type { EnergyLevel, Task } from '../../shared/types';

function to12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'pm' : 'am';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, '0')}${period}`;
}
import type { ScoredTask } from '../services/suggestions';

const energyConfig: Record<EnergyLevel, { icon: string; label: string; color: string }> = {
  high: { icon: '\u26A1', label: 'High', color: 'var(--energy-high)' },
  medium: { icon: '\uD83D\uDD0B', label: 'Medium', color: 'var(--energy-med)' },
  low: { icon: '\uD83C\uDF19', label: 'Low', color: 'var(--energy-low)' },
};

export function SuggestedView() {
  const { canUseEnergyScheduling } = useSubscription();
  const tasks = useStore((s) => s.tasks);
  const updateTask = useStore((s) => s.updateTask);
  const energyProfile = useStore((s) => s.energyProfile);
  const override = useStore((s) => s.currentEnergyOverride);
  const schedule = useStore((s) => s.schedule);
  const addTimeBlock = useStore((s) => s.addTimeBlock);
  const setActivePanel = useStore((s) => s.setActivePanel);
  const setActiveView = useStore((s) => s.setActiveView);
  const selectTask = useStore((s) => s.selectTask);
  const addToast = useStore((s) => s.addToast);
  const startPomodoro = useStore((s) => s.startPomodoro);

  const currentEnergy = getCurrentEnergy(energyProfile, override);
  const config = energyConfig[currentEnergy];

  const sections = useMemo(
    () => getSuggestions(tasks, currentEnergy, energyProfile, schedule),
    [tasks, currentEnergy, energyProfile, schedule],
  );

  const allEmpty = sections.needsAttention.length === 0
    && sections.rightForRightNow.length === 0
    && sections.comingUp.length === 0;

  const handleTaskClick = (taskId: string) => {
    selectTask(taskId);
    setActivePanel('taskDetail');
  };

  const handleAddToDay = useCallback((task: Task) => {
    const block = scheduleTaskIntoDay(task, new Date(), energyProfile, schedule, override);
    if (!block) {
      addToast('No available slot today. Try adjusting your schedule.', 'error');
      return;
    }
    addTimeBlock(block);
    addToast(`Scheduled ${to12h(block.start)} \u2013 ${to12h(block.end)}`, 'success');
    setActiveView('day');
  }, [energyProfile, schedule, override, addTimeBlock, addToast, setActiveView]);

  const hour = new Date().getHours();
  const currentBlock = energyProfile.blocks.find((b) => hour >= b.start && hour < b.end);

  const renderScoredCard = (scored: ScoredTask) => (
    <div key={scored.task.id}>
      <TaskCard
        task={scored.task}
        onClick={() => handleTaskClick(scored.task.id)}
        onStatusChange={async (id, s) => {
          const r = await window.zaptask.tasks.update(id, { status: s });
          if (r.success) updateTask(id, { status: s });
        }}
        onAddToDay={() => handleAddToDay(scored.task)}
        onStartPomodoro={() => startPomodoro(scored.task.id)}
      />
      <div style={{
        fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)',
        padding: '3px 12px 0',
      }}>
        {scored.reason}
      </div>
    </div>
  );

  if (!canUseEnergyScheduling()) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100%', gap: 12, padding: 24, textAlign: 'center',
      }}>
        <span style={{ fontSize: 40 }}>{'\u26A1'}</span>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
          color: 'var(--text1)',
        }}>
          Energy-Aware Scheduling
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text2)', maxWidth: 280, lineHeight: 1.5 }}>
          Get personalized task suggestions based on your energy levels throughout the day.
        </p>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('zaptask:showPricing'))}
          style={{
            padding: '8px 20px',
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: 4,
          }}
        >
          {'\uD83D\uDD12'} Upgrade to Pro
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto' }}>
      {/* Energy header */}
      <div style={{
        padding: '14px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 24 }}>{config.icon}</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: config.color }}>
                {config.label} Energy
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)', fontFamily: 'var(--font-mono)' }}>
                {currentBlock?.label || 'Off-hours'}
                {override && ' (override)'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setActivePanel('energyCheckin')}
            style={{
              padding: '5px 12px',
              background: 'var(--surface-high)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text1)',
              fontSize: 13,
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
            }}
          >
            Update energy
          </button>
        </div>

        {/* Mini timeline bar */}
        <div style={{ display: 'flex', gap: 2, borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          {energyProfile.blocks.map((block) => {
            const isCurrent = hour >= block.start && hour < block.end;
            const blockConfig = energyConfig[block.level];
            return (
              <div
                key={block.id}
                style={{
                  flex: block.end - block.start,
                  height: 6,
                  background: isCurrent ? blockConfig.color : `color-mix(in srgb, ${blockConfig.color} 25%, var(--surface))`,
                  transition: 'all 200ms ease',
                }}
                title={`${block.label}: ${block.level}`}
              />
            );
          })}
        </div>
      </div>

      {/* Sections */}
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 14px 14px' }}>
        {allEmpty && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            height: '100%', gap: 8, color: 'var(--text2)',
          }}>
            <span style={{ fontSize: 32, color: 'var(--green)' }}>{'\u2713'}</span>
            <span style={{ fontSize: 15 }}>You're all caught up</span>
          </div>
        )}

        {/* Section A: Needs Attention */}
        {sections.needsAttention.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h3 style={{
              fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 600,
              color: 'var(--red)', marginBottom: 8,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {'\uD83D\uDEA8'} Needs Attention
              <span style={{
                fontSize: 11, padding: '1px 6px',
                background: 'rgba(255, 84, 112, 0.1)', borderRadius: 'var(--radius-sm)',
              }}>
                {sections.needsAttention.length}
              </span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {sections.needsAttention.map(renderScoredCard)}
            </div>
          </div>
        )}

        {/* Section B: Right for Right Now */}
        {sections.rightForRightNow.length > 0 ? (
          <div style={{ marginBottom: 16 }}>
            <h3 style={{
              fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 600,
              color: 'var(--accent)', marginBottom: 8,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {'\u26A1'} Right for Right Now
              <span style={{
                fontSize: 11, padding: '1px 6px',
                background: 'var(--accent-dim)', borderRadius: 'var(--radius-sm)',
              }}>
                {sections.rightForRightNow.length}
              </span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {sections.rightForRightNow.map(renderScoredCard)}
            </div>
          </div>
        ) : !allEmpty && sections.needsAttention.length === 0 && (
          <div style={{
            padding: '20px 14px', textAlign: 'center',
            color: 'var(--text3)', fontSize: 13,
          }}>
            No tasks match your current energy. Try a different energy level or check below.
          </div>
        )}

        {/* Section C: Coming Up */}
        {sections.comingUp.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h3 style={{
              fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 600,
              color: 'var(--text2)', marginBottom: 8,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {'\uD83D\uDC40'} Coming Up
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, opacity: 0.8 }}>
              {sections.comingUp.map(renderScoredCard)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
