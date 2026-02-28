import { useStore } from '../../store';

const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
const mod = isMac ? '\u2318' : 'Ctrl+';

const shortcuts = [
  { keys: `${mod}N`, action: 'Create new task' },
  { keys: `${mod}F`, action: 'Search tasks' },
  { keys: `${mod}E`, action: 'Expand / collapse widget' },
  { keys: `${mod}H`, action: 'Show / hide widget' },
  { keys: `${mod}?`, action: 'Open this guide' },
  { keys: 'Esc', action: 'Close panel' },
];

const tips = [
  {
    icon: '\u2611',
    title: 'Task Views',
    desc: 'Use the bottom tabs to switch between your task list, energy-matched suggestions, and daily schedule.',
  },
  {
    icon: '\uD83C\uDFAF',
    title: 'Focus Levels',
    desc: 'Assign Deep, Medium, or Low focus to tasks. ZapTask suggests the right tasks based on your current energy.',
  },
  {
    icon: '\u26A1',
    title: 'Energy Profile',
    desc: 'Set your energy patterns in Settings. ZapTask learns when you\'re most productive and matches tasks accordingly.',
  },
  {
    icon: '\uD83C\uDF45',
    title: 'Pomodoro Timer',
    desc: 'Start a 25-minute focus session on any task. Click the play icon on a task card to begin.',
  },
  {
    icon: '\uD83D\uDCC5',
    title: 'Schedule View',
    desc: 'Add tasks to your daily schedule from the task card menu. View and manage time blocks in the Schedule tab.',
  },
  {
    icon: '\u2197',
    title: 'Expanded Mode',
    desc: `Press ${mod}E or click the expand arrow in the title bar to use ZapTask in a larger window. Great for planning sessions.`,
  },
  {
    icon: '\uD83D\uDD17',
    title: 'Integrations',
    desc: 'Connect Jira, Google Calendar, Notion, and more from Settings to pull in tasks automatically.',
  },
  {
    icon: '\uD83D\uDCCC',
    title: 'Always on Top',
    desc: 'Pin the widget to keep it visible while you work. Click the pin icon in the title bar.',
  },
];

export function QuickStartPanel() {
  const setActivePanel = useStore((s) => s.setActivePanel);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: '1px solid var(--border)',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
          color: 'var(--text1)',
        }}>
          Quick Start Guide
        </h2>
        <button
          onClick={() => setActivePanel(null)}
          style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 18, cursor: 'pointer' }}
        >
          {'\u2715'}
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        {/* Keyboard Shortcuts */}
        <section style={{ marginBottom: 24 }}>
          <h3 style={{
            fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 600,
            color: 'var(--accent)', marginBottom: 10,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {'\u2328'} Keyboard Shortcuts
          </h3>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)', overflow: 'hidden',
          }}>
            {shortcuts.map((s, i) => (
              <div
                key={s.keys}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 12px',
                  borderBottom: i < shortcuts.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <span style={{ fontSize: 13, color: 'var(--text2)' }}>{s.action}</span>
                <kbd style={{
                  fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600,
                  color: 'var(--text1)', background: 'var(--bg)',
                  padding: '2px 8px', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                }}>
                  {s.keys}
                </kbd>
              </div>
            ))}
          </div>
        </section>

        {/* Tips & Features */}
        <section>
          <h3 style={{
            fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 600,
            color: 'var(--accent)', marginBottom: 10,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {'\uD83D\uDCA1'} Tips & Features
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tips.map((tip) => (
              <div
                key={tip.title}
                style={{
                  display: 'flex', gap: 10, padding: '10px 12px',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.4 }}>{tip.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text1)', marginBottom: 2 }}>
                    {tip.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>
                    {tip.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer link */}
        <div style={{
          marginTop: 20, padding: '12px', textAlign: 'center',
          fontSize: 12, color: 'var(--text3)',
        }}>
          Full guide at{' '}
          <button
            onClick={() => window.zaptask.openUrl('https://zaptask.io/guide')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--accent)', fontSize: 12, textDecoration: 'underline',
            }}
          >
            zaptask.io/guide
          </button>
        </div>
      </div>
    </div>
  );
}
