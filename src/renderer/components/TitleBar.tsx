import { useState } from 'react';
import { useStore } from '../store';
import { TrialPill } from './TrialBanner';

export function TitleBar() {
  const [pinned, setPinned] = useState(true);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const windowMode = useStore((s) => s.windowMode);
  const setWindowMode = useStore((s) => s.setWindowMode);

  const handlePin = () => {
    const next = !pinned;
    setPinned(next);
    window.zaptask.setAlwaysOnTop(next);
  };

  const isSettings = windowMode === 'settings';

  const btnStyle = {
    width: 28, height: 28,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 'var(--radius-sm)',
    background: 'transparent',
    color: 'var(--text3)',
    fontSize: 14,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 150ms ease',
  } as const;

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
      {isSettings ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className="no-drag"
            onClick={async () => {
              await window.zaptask.collapseToWidget();
              setWindowMode('widget');
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--accent)', fontFamily: 'var(--font-display)',
              fontWeight: 700, fontSize: 16,
            }}
          >
            {'\u2190'} ZapTask
          </button>
          <TrialPill />
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 16,
            color: 'var(--accent)',
          }}>
            ZapTask
          </span>
          <TrialPill />
        </div>
      )}

      <div className="no-drag" style={{ display: 'flex', gap: 4 }}>
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          style={btnStyle}
        >
          {theme === 'dark' ? '\u2600' : '\u263E'}
        </button>

        {/* Pin / Always on top — only in widget mode */}
        {!isSettings && (
          <button
            onClick={handlePin}
            title={pinned ? 'Unpin from top' : 'Pin to top'}
            style={{
              ...btnStyle,
              background: pinned ? 'var(--accent-dim)' : 'transparent',
              color: pinned ? 'var(--accent)' : 'var(--text3)',
            }}
          >
            {'\uD83D\uDCCC'}
          </button>
        )}

        {/* Settings gear — only in widget mode */}
        {!isSettings && (
          <button
            onClick={async () => {
              await window.zaptask.expandToSettings();
              setWindowMode('settings');
            }}
            title="Settings"
            style={{
              ...btnStyle,
              fontSize: 16,
              color: 'var(--text2)',
            }}
          >
            {'\u2699\uFE0F'}
          </button>
        )}

        {/* Minimize */}
        <button
          onClick={() => window.zaptask.minimize()}
          title="Minimize"
          style={{ ...btnStyle, fontSize: 16 }}
        >
          &#x2013;
        </button>
      </div>
    </div>
  );
}
