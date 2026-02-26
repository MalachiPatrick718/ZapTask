import { useState } from 'react';
import { useSubscription } from '../hooks/useSubscription';

export function TrialBanner() {
  const { tier, isTrialActive, isTrialExpired, daysRemaining, isPro } = useSubscription();
  const [dismissed, setDismissed] = useState(false);

  // Don't show for Pro users
  if (isPro) return null;

  // Dismissable during trial (comes back on remount / next session)
  if (isTrialActive && dismissed) return null;

  // Nothing to show if somehow neither trial nor expired
  if (!isTrialActive && !isTrialExpired) return null;

  const isUrgent = isTrialExpired || daysRemaining <= 3;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 12px',
      background: isUrgent
        ? 'color-mix(in srgb, var(--red) 10%, var(--surface))'
        : 'color-mix(in srgb, var(--accent) 10%, var(--surface))',
      borderBottom: `1px solid ${isUrgent ? 'color-mix(in srgb, var(--red) 25%, var(--border))' : 'color-mix(in srgb, var(--accent) 25%, var(--border))'}`,
      fontSize: 12,
      fontFamily: 'var(--font-mono)',
      flexShrink: 0,
    }}>
      <span style={{ fontSize: 14 }}>
        {isTrialExpired ? '\uD83D\uDD12' : '\u2728'}
      </span>

      <span style={{ flex: 1, color: isUrgent ? 'var(--red)' : 'var(--text2)' }}>
        {isTrialExpired
          ? 'Trial ended \u2014 some features are now limited'
          : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left in your free trial`}
      </span>

      <button
        onClick={() => window.dispatchEvent(new CustomEvent('zaptask:showPricing'))}
        style={{
          padding: '3px 10px',
          background: 'var(--accent)',
          color: '#fff',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          fontSize: 11,
          fontWeight: 600,
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        Upgrade
      </button>

      {isTrialActive && (
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text3)',
            fontSize: 14,
            cursor: 'pointer',
            padding: '0 2px',
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          {'\u2715'}
        </button>
      )}
    </div>
  );
}
