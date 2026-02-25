import { useState } from 'react';
import { useStore } from '../store';

export function TitleBar() {
  const [pinned, setPinned] = useState(true);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);

  const handlePin = () => {
    const next = !pinned;
    setPinned(next);
    window.zaptask.setAlwaysOnTop(next);
  };

  return (
    <div
      className="drag-region"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}
    >
      <span style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 16,
        color: 'var(--accent)',
      }}>
        ZapTask
      </span>

      <div className="no-drag" style={{ display: 'flex', gap: 4 }}>
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 'var(--radius-sm)',
            background: 'transparent',
            color: 'var(--text3)',
            fontSize: 14,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
        >
          {theme === 'dark' ? '\u2600' : '\u263E'}
        </button>

        {/* Pin / Always on top */}
        <button
          onClick={handlePin}
          title={pinned ? 'Unpin from top' : 'Pin to top'}
          style={{
            width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 'var(--radius-sm)',
            background: pinned ? 'var(--accent-dim)' : 'transparent',
            color: pinned ? 'var(--accent)' : 'var(--text3)',
            fontSize: 14,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
        >
          {pinned ? '\uD83D\uDCCC' : '\uD83D\uDCCC'}
        </button>

        {/* Minimize */}
        <button
          onClick={() => window.zaptask.minimize()}
          title="Minimize"
          style={{
            width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 'var(--radius-sm)',
            background: 'transparent',
            color: 'var(--text3)',
            fontSize: 16,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          &#x2013;
        </button>

        {/* Close (hides to tray) */}
        <button
          onClick={() => window.zaptask.hide()}
          title="Hide to tray"
          style={{
            width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 'var(--radius-sm)',
            background: 'transparent',
            color: 'var(--text3)',
            fontSize: 14,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          &#x2715;
        </button>
      </div>
    </div>
  );
}
