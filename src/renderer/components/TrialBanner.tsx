import { useSubscription } from '../hooks/useSubscription';

/**
 * Small pill shown in the title bar next to "ZapTask".
 * Not dismissable — always visible for non-Pro users.
 * Clicking opens the pricing modal.
 */
export function TrialPill() {
  const { tier, isTrialActive, isTrialExpired, daysRemaining, isPro } = useSubscription();

  // Pro users: subtle badge, no action needed
  if (isPro) {
    return (
      <span style={{
        fontSize: 9,
        fontFamily: 'var(--font-mono)',
        fontWeight: 600,
        color: 'var(--accent)',
        background: 'var(--accent-dim)',
        padding: '1px 6px',
        borderRadius: 8,
        letterSpacing: '0.03em',
      }}>
        PRO
      </span>
    );
  }

  let label: string;
  let color: string;
  let bg: string;

  if (isTrialActive) {
    const urgent = daysRemaining <= 3;
    label = `${daysRemaining}d trial`;
    color = urgent ? 'var(--red)' : 'var(--text3)';
    bg = urgent
      ? 'color-mix(in srgb, var(--red) 12%, transparent)'
      : 'color-mix(in srgb, var(--accent) 10%, transparent)';
  } else if (isTrialExpired) {
    label = 'Trial ended';
    color = 'var(--red)';
    bg = 'color-mix(in srgb, var(--red) 12%, transparent)';
  } else if (tier === 'free') {
    label = 'Free';
    color = 'var(--text3)';
    bg = 'var(--surface)';
  } else {
    return null;
  }

  return (
    <button
      className="no-drag"
      onClick={() => window.dispatchEvent(new CustomEvent('zaptask:showPricing'))}
      title="View plans"
      style={{
        fontSize: 9,
        fontFamily: 'var(--font-mono)',
        fontWeight: 600,
        color,
        background: bg,
        padding: '1px 6px',
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        letterSpacing: '0.03em',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}
