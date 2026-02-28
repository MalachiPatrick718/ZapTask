import { useState } from 'react';
import { useStore, type ActiveView } from '../store';
import { TrialPill } from './TrialBanner';

export function TitleBar() {
  const [pinned, setPinned] = useState(true);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const windowMode = useStore((s) => s.windowMode);
  const setWindowMode = useStore((s) => s.setWindowMode);
  const activeView = useStore((s) => s.activeView) as ActiveView;
  const setActiveView = useStore((s) => s.setActiveView);

  const handlePin = () => {
    const next = !pinned;
    setPinned(next);
    window.zaptask.setAlwaysOnTop(next);
  };

  const isExpanded = windowMode === 'expanded';
  const isSettingsView = activeView === 'settings';

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
      {isSettingsView ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className="no-drag"
            onClick={() => setActiveView('tasks')}
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
        {!isExpanded && (
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

        {/* Expand / Collapse toggle */}
        <button
          onClick={async () => {
            try {
              if (isExpanded) {
                await window.zaptask.collapse();
                setWindowMode('widget');
              } else {
                await window.zaptask.expand();
                setWindowMode('expanded');
              }
            } catch (err) {
              console.error('[TitleBar] Expand/collapse failed:', err);
            }
          }}
          title={isExpanded ? 'Collapse to widget (\u2318E)' : 'Expand (\u2318E)'}
          style={{
            ...btnStyle,
            fontSize: 15,
            color: isExpanded ? 'var(--accent)' : 'var(--text2)',
          }}
        >
          {isExpanded ? (
            // Collapse: two arrows pointing inward
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9,1 9,5 13,5" />
              <polyline points="5,13 5,9 1,9" />
              <line x1="13" y1="1" x2="9" y2="5" />
              <line x1="1" y1="13" x2="5" y2="9" />
            </svg>
          ) : (
            // Expand: two arrows pointing outward
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9,1 13,1 13,5" />
              <polyline points="5,13 1,13 1,9" />
              <line x1="13" y1="1" x2="8" y2="6" />
              <line x1="1" y1="13" x2="6" y2="8" />
            </svg>
          )}
        </button>

        {/* Settings gear */}
        {!isSettingsView && (
          <button
            onClick={() => setActiveView('settings')}
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
