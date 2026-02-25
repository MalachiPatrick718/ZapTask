import { useState, useEffect, useRef, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';

type Status = 'todo' | 'in_progress' | 'done';

const allStatuses: Status[] = ['todo', 'in_progress', 'done'];

const statusConfig: Record<Status, { label: string; bg: string; color: string }> = {
  todo: { label: 'To Do', bg: 'var(--surface-high)', color: 'var(--text2)' },
  in_progress: { label: 'In Progress', bg: 'rgba(78, 205, 196, 0.15)', color: 'var(--teal)' },
  done: { label: 'Done', bg: 'rgba(31, 255, 160, 0.15)', color: 'var(--green)' },
};

interface StatusBadgeProps {
  status: Status;
  style?: CSSProperties;
  onClick?: (nextStatus: Status) => void;
}

export function StatusBadge({ status, style, onClick }: StatusBadgeProps) {
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const badgeRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const config = statusConfig[status];
  const interactive = !!onClick;

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        badgeRef.current && !badgeRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [menuOpen]);

  const handleBadgeClick = (e: React.MouseEvent) => {
    if (!interactive) return;
    e.stopPropagation();
    if (badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      const menuWidth = 140;
      // Clamp left so the dropdown doesn't go off the right edge
      const left = Math.min(rect.left, window.innerWidth - menuWidth - 8);
      setMenuPos({ top: rect.bottom + 4, left: Math.max(4, left) });
    }
    setMenuOpen(!menuOpen);
  };

  const handleSelect = (e: React.MouseEvent, newStatus: Status) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (newStatus !== status && onClick) {
      onClick(newStatus);
    }
  };

  return (
    <>
      <span
        ref={badgeRef}
        onClick={handleBadgeClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '2px 8px',
          borderRadius: 'var(--radius-sm)',
          fontSize: 12,
          fontFamily: 'var(--font-mono)',
          fontWeight: 500,
          background: config.bg,
          color: config.color,
          cursor: interactive ? 'pointer' : 'default',
          outline: interactive && (hovered || menuOpen) ? `1px solid ${config.color}` : 'none',
          transition: 'outline 100ms ease',
          ...style,
        }}
      >
        {config.label}
      </span>

      {menuOpen && createPortal(
        <div
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: menuPos.top,
            left: menuPos.left,
            background: 'var(--surface-up)',
            border: '1px solid var(--border-glow)',
            borderRadius: 'var(--radius-sm)',
            padding: 4,
            zIndex: 9999,
            minWidth: 130,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          {allStatuses.map((s) => {
            const sc = statusConfig[s];
            const isActive = s === status;
            return (
              <button
                key={s}
                onClick={(e) => handleSelect(e, s)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  width: '100%',
                  padding: '6px 8px',
                  border: 'none',
                  borderRadius: 4,
                  background: isActive ? sc.bg : 'transparent',
                  color: isActive ? sc.color : 'var(--text2)',
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: sc.color, flexShrink: 0,
                }} />
                {sc.label}
              </button>
            );
          })}
        </div>,
        document.body,
      )}
    </>
  );
}
