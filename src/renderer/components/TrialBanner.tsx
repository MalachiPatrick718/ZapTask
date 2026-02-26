import { useState } from 'react';
import { useSubscription } from '../hooks/useSubscription';

export function TrialBanner() {
  const { tier, isTrialActive, isTrialExpired, daysRemaining, isPro } = useSubscription();
  const [dismissed, setDismissed] = useState(false);

  // Don't show for Pro users
  if (isPro) return null;

  // Dismissable during trial (comes back on remount / next session)
  if (isTrialActive && dismissed) return null;

  // Free tier (never trialed or after expiry) — subtle prompt
  const isFreeUser = tier === 'free' && !isTrialExpired;

  // Nothing to show if somehow none of the states match
  if (!isTrialActive && !isTrialExpired && !isFreeUser) return null;

  const isUrgent = isTrialExpired || (isTrialActive && daysRemaining <= 3);

  const bgColor = isUrgent
    ? 'color-mix(in srgb, var(--red) 10%, var(--surface))'
    : isFreeUser
      ? 'var(--surface)'
      : 'color-mix(in srgb, var(--accent) 10%, var(--surface))';

  const borderColor = isUrgent
    ? 'color-mix(in srgb, var(--red) 25%, var(--border))'
    : isFreeUser
      ? 'var(--border)'
      : 'color-mix(in srgb, var(--accent) 25%, var(--border))';

  const textColor = isUrgent
    ? 'var(--red)'
    : isFreeUser
      ? 'var(--text3)'
      : 'var(--text2)';

  let icon: string;
  let message: string;

  if (isTrialExpired) {
    icon = '\uD83D\uDD12';
    message = 'Trial ended \u2014 some features are now limited';
  } else if (isTrialActive) {
    icon = '\u2728';
    message = `Pro Trial \u2014 ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`;
  } else {
    icon = '\u2728';
    message = 'Free plan \u2014 upgrade to unlock all features';
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 12px',
      background: bgColor,
      borderBottom: `1px solid ${borderColor}`,
      fontSize: 12,
      fontFamily: 'var(--font-mono)',
      flexShrink: 0,
    }}>
      <span style={{ fontSize: 14 }}>{icon}</span>

      <span style={{ flex: 1, color: textColor }}>
        {message}
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
