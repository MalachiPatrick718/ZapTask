import { useStore } from '../../store';

interface UpgradePromptProps {
  feature: string;
  description: string;
  inline?: boolean;
}

export function UpgradePrompt({ feature, description, inline }: UpgradePromptProps) {
  const addToast = useStore((s) => s.addToast);

  if (inline) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 10px',
        background: 'color-mix(in srgb, var(--accent) 8%, var(--surface))',
        border: '1px solid color-mix(in srgb, var(--accent) 20%, var(--border))',
        borderRadius: 'var(--radius-sm)',
        fontSize: 11,
        color: 'var(--text2)',
      }}>
        <span style={{ fontSize: 13 }}>{'\uD83D\uDD12'}</span>
        <span><strong style={{ color: 'var(--accent)' }}>Pro</strong> {'\u2014'} {feature}</span>
      </div>
    );
  }

  return (
    <div style={{
      padding: '16px',
      background: 'color-mix(in srgb, var(--accent) 6%, var(--surface))',
      border: '1px solid color-mix(in srgb, var(--accent) 20%, var(--border))',
      borderRadius: 'var(--radius-md)',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>{'\uD83D\uDD12'}</div>
      <div style={{
        fontSize: 14, fontWeight: 600, color: 'var(--text1)', marginBottom: 4,
      }}>
        {feature}
      </div>
      <div style={{
        fontSize: 12, color: 'var(--text3)', marginBottom: 12, lineHeight: 1.4,
      }}>
        {description}
      </div>
      <button
        onClick={() => {
          // Dispatch a custom event that PricingModal listens for
          window.dispatchEvent(new CustomEvent('zaptask:showPricing'));
          addToast('Upgrade to Pro for full access', 'info');
        }}
        style={{
          padding: '8px 20px',
          background: 'var(--accent)',
          color: '#fff',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Upgrade to Pro
      </button>
    </div>
  );
}

/** Small lock badge for buttons */
export function ProBadge() {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 2,
      padding: '1px 5px',
      background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
      borderRadius: 'var(--radius-sm)',
      fontSize: 9,
      fontWeight: 700,
      color: 'var(--accent)',
      letterSpacing: '0.03em',
    }}>
      PRO
    </span>
  );
}
