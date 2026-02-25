import { useEffect } from 'react';
import { useStore } from '../../store';

const typeColors: Record<string, { bg: string; border: string }> = {
  success: { bg: 'rgba(31, 255, 160, 0.1)', border: 'var(--green)' },
  error: { bg: 'rgba(255, 84, 112, 0.1)', border: 'var(--red)' },
  info: { bg: 'rgba(240, 109, 61, 0.1)', border: 'var(--accent)' },
};

export function ToastContainer() {
  const toasts = useStore((s) => s.toasts);
  const removeToast = useStore((s) => s.removeToast);

  return (
    <div style={{
      position: 'fixed',
      top: 48,
      left: 12,
      right: 12,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      pointerEvents: 'none',
    }}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: { id: string; message: string; type: string }; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const colors = typeColors[toast.type] || typeColors.info;

  return (
    <div style={{
      padding: '10px 14px',
      borderRadius: 'var(--radius-sm)',
      background: colors.bg,
      borderLeft: `3px solid ${colors.border}`,
      color: 'var(--text1)',
      fontSize: 13,
      pointerEvents: 'auto',
      backdropFilter: 'blur(12px)',
    }}>
      {toast.message}
    </div>
  );
}
