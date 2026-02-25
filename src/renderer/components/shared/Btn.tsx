import { type ButtonHTMLAttributes, type CSSProperties } from 'react';

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type BtnSize = 'sm' | 'md';

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
}

const baseStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  borderRadius: 'var(--radius-sm)',
  fontFamily: 'var(--font-body)',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 150ms ease',
  border: 'none',
  whiteSpace: 'nowrap',
};

const variants: Record<BtnVariant, CSSProperties> = {
  primary: {
    background: 'var(--accent)',
    color: '#fff',
  },
  secondary: {
    background: 'var(--surface)',
    color: 'var(--text1)',
    border: '1px solid var(--border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text2)',
  },
  danger: {
    background: 'var(--red)',
    color: '#fff',
  },
};

const sizes: Record<BtnSize, CSSProperties> = {
  sm: { padding: '4px 10px', fontSize: 12 },
  md: { padding: '8px 16px', fontSize: 14 },
};

export function Btn({ variant = 'primary', size = 'md', style, disabled, ...props }: BtnProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      style={{
        ...baseStyle,
        ...variants[variant],
        ...sizes[size],
        ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
        ...style,
      }}
    />
  );
}
