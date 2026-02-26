import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store';
import { Btn } from './shared/Btn';
import { ProBadge } from './shared/UpgradePrompt';
import { useSubscription } from '../hooks/useSubscription';
import { DEFAULT_ENERGY_PROFILE } from '../../shared/types';
import type { EnergyLevel, EnergyProfile } from '../../shared/types';

type SettingsTab = 'integrations' | 'energy' | 'preferences' | 'account' | 'support';

const sidebarItems: { id: SettingsTab; label: string; icon: string }[] = [
  { id: 'integrations', label: 'Integrations', icon: '\uD83D\uDD17' },
  { id: 'energy', label: 'Energy', icon: '\u26A1' },
  { id: 'preferences', label: 'Preferences', icon: '\u2699' },
  { id: 'account', label: 'Account', icon: '\uD83D\uDC64' },
  { id: 'support', label: 'Support', icon: '\u2753' },
];

const energyLevels: { value: EnergyLevel; icon: string; label: string; color: string }[] = [
  { value: 'high', icon: '\u26A1', label: 'High', color: 'var(--energy-high)' },
  { value: 'medium', icon: '\uD83D\uDD0B', label: 'Medium', color: 'var(--energy-med)' },
  { value: 'low', icon: '\uD83C\uDF19', label: 'Low', color: 'var(--energy-low)' },
];

const toolMeta: Record<string, { name: string; color: string; description: string }> = {
  jira: { name: 'Jira', color: '#2684FF', description: 'Import issues and epics from Jira projects' },
  asana: { name: 'Asana', color: '#F06A6A', description: 'Sync tasks and projects from Asana' },
  notion: { name: 'Notion', color: '#999', description: 'Pull tasks from Notion databases' },
  monday: { name: 'Monday.com', color: '#FF3D57', description: 'Sync items and boards from Monday.com' },
  gcal: { name: 'Google Calendar', color: '#4285F4', description: 'Import events from Google Calendar' },
  outlook: { name: 'Outlook', color: '#0078D4', description: 'Sync tasks and events from Outlook' },
  apple_cal: { name: 'Apple Calendar', color: '#FF3B30', description: 'Import events from Apple Calendar' },
};

export function SettingsView() {
  const [tab, setTab] = useState<SettingsTab>('integrations');

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Sidebar */}
      <nav style={{
        width: 200,
        flexShrink: 0,
        borderRight: '1px solid var(--border)',
        padding: '16px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}>
        <div style={{
          padding: '0 16px 12px',
          fontSize: 13,
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          color: 'var(--text2)',
          letterSpacing: '0.02em',
        }}>
          Settings
        </div>
        {sidebarItems.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                margin: '0 8px',
                borderRadius: 'var(--radius-sm)',
                background: active ? 'var(--accent-dim)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text2)',
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 150ms ease',
              }}
            >
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '24px 32px',
      }}>
        {tab === 'integrations' && <IntegrationsTab />}
        {tab === 'energy' && <EnergyTab />}
        {tab === 'preferences' && <PreferencesTab />}
        {tab === 'account' && <AccountTab />}
        {tab === 'support' && <SupportTab />}
      </div>
    </div>
  );
}

function IntegrationsTab() {
  const tools = useStore((s) => s.tools);
  const user = useStore((s) => s.user);
  const setToolConnected = useStore((s) => s.setToolConnected);
  const addToast = useStore((s) => s.addToast);
  const { canConnectIntegration, hasFullAccess } = useSubscription();
  const [connecting, setConnecting] = useState<string | null>(null);

  // Listen for OAuth callback results from main process
  useEffect(() => {
    const unsubscribe = window.zaptask.onOAuthCallback((data) => {
      if (data.success && data.toolId) {
        setToolConnected(data.toolId, true, user?.email || '');
        addToast(`${toolMeta[data.toolId]?.name || data.toolId} connected!`, 'success');
        window.zaptask.syncNow(data.toolId).catch(() => {});
      } else if (data.error) {
        addToast(`Connection failed: ${data.error}`, 'error');
      }
      setConnecting(null);
    });
    return unsubscribe;
  }, [setToolConnected, addToast, user]);

  const handleConnect = useCallback(async (toolId: string) => {
    setConnecting(toolId);
    try {
      const result = await window.zaptask.startOAuth({ toolId });
      if (!result?.success) {
        addToast(`Failed to start OAuth: ${result?.error || 'Unknown error'}`, 'error');
        setConnecting(null);
      }
      // Flow continues in onOAuthCallback listener above
    } catch (err: any) {
      addToast(`Failed to connect: ${err?.message || 'Unknown error'}`, 'error');
      setConnecting(null);
    }
  }, [addToast]);

  const handleDisconnect = useCallback(async (toolId: string) => {
    setToolConnected(toolId, false);
    await window.zaptask.clearCredentials(toolId);
    addToast(`${toolMeta[toolId]?.name || toolId} disconnected`, 'info');
  }, [setToolConnected, addToast]);

  return (
    <div>
      <h3 style={{
        fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 700,
        color: 'var(--text1)', marginBottom: 4,
      }}>
        Integrations
      </h3>
      <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>
        Connect your tools to import tasks and events into ZapTask.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 12,
      }}>
        {tools.map((tool) => {
          const meta = toolMeta[tool.toolId];
          if (!meta) return null;
          const isAppleCal = tool.toolId === 'apple_cal';
          const isConnecting = connecting === tool.toolId;
          return (
            <div
              key={tool.toolId}
              style={{
                padding: '16px',
                background: 'var(--surface)',
                border: `1px solid ${tool.connected ? 'var(--green)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: tool.connected ? 'var(--green)' : meta.color,
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text1)' }}>
                  {meta.name}
                </span>
                {isAppleCal && (
                  <span style={{ fontSize: 10, color: 'var(--text3)', fontStyle: 'italic' }}>
                    Coming soon
                  </span>
                )}
              </div>

              <p style={{
                fontSize: 12, color: 'var(--text3)', lineHeight: 1.4,
                margin: 0, minHeight: 34,
              }}>
                {meta.description}
              </p>

              {tool.connected && (
                <div style={{
                  fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)',
                }}>
                  {tool.email} {'\u00B7'} {tool.lastSyncAt
                    ? `Last sync: ${new Date(tool.lastSyncAt).toLocaleTimeString()}`
                    : 'Not synced yet'}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                {tool.connected ? (
                  <>
                    <Btn
                      variant="secondary"
                      size="sm"
                      onClick={async () => {
                        try {
                          await window.zaptask.syncNow(tool.toolId);
                          addToast(`${meta.name} synced`, 'success');
                        } catch {
                          addToast(`${meta.name} sync failed`, 'error');
                        }
                      }}
                      style={{ flex: 1 }}
                    >
                      Sync Now
                    </Btn>
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDisconnect(tool.toolId)}
                      style={{ flex: 1 }}
                    >
                      Disconnect
                    </Btn>
                  </>
                ) : isAppleCal ? (
                  <div style={{
                    padding: '6px 0', width: '100%', textAlign: 'center',
                    fontSize: 12, color: 'var(--text3)',
                  }}>
                    CalDAV support coming soon
                  </div>
                ) : canConnectIntegration() || hasFullAccess ? (
                  <Btn
                    variant="secondary"
                    size="sm"
                    disabled={isConnecting}
                    onClick={() => handleConnect(tool.toolId)}
                    style={{ width: '100%' }}
                  >
                    {isConnecting ? 'Connecting...' : 'Connect'}
                  </Btn>
                ) : (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 6, padding: '6px 0', width: '100%',
                    fontSize: 12, color: 'var(--text3)',
                  }}>
                    {'\uD83D\uDD12'} <ProBadge /> to connect more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ENERGY_TEMPLATES: { label: string; profile: EnergyProfile }[] = [
  {
    label: 'Morning Person',
    profile: {
      blocks: [
        { id: 'morning', label: 'Morning', start: 6, end: 12, level: 'high' },
        { id: 'early_afternoon', label: 'Early Afternoon', start: 12, end: 15, level: 'medium' },
        { id: 'late_afternoon', label: 'Late Afternoon', start: 15, end: 18, level: 'low' },
        { id: 'evening', label: 'Evening', start: 18, end: 22, level: 'low' },
      ],
    },
  },
  {
    label: 'Night Owl',
    profile: {
      blocks: [
        { id: 'morning', label: 'Morning', start: 6, end: 12, level: 'low' },
        { id: 'early_afternoon', label: 'Early Afternoon', start: 12, end: 15, level: 'medium' },
        { id: 'late_afternoon', label: 'Late Afternoon', start: 15, end: 18, level: 'high' },
        { id: 'evening', label: 'Evening', start: 18, end: 22, level: 'high' },
      ],
    },
  },
  {
    label: 'Steady',
    profile: {
      blocks: [
        { id: 'morning', label: 'Morning', start: 6, end: 12, level: 'medium' },
        { id: 'afternoon', label: 'Afternoon', start: 12, end: 18, level: 'medium' },
        { id: 'evening', label: 'Evening', start: 18, end: 22, level: 'low' },
      ],
    },
  },
];

const HOURS = Array.from({ length: 19 }, (_, i) => i + 5); // 5am to 11pm

function formatHour(h: number): string {
  if (h === 0 || h === 24) return '12am';
  if (h === 12) return '12pm';
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

function EnergyTab() {
  const energyProfile = useStore((s) => s.energyProfile);
  const setEnergyProfile = useStore((s) => s.setEnergyProfile);
  const addToast = useStore((s) => s.addToast);

  const cycleLevel = (blockId: string) => {
    const order: EnergyLevel[] = ['high', 'medium', 'low'];
    const newBlocks = energyProfile.blocks.map((b) => {
      if (b.id !== blockId) return b;
      const idx = order.indexOf(b.level);
      return { ...b, level: order[(idx + 1) % order.length] };
    });
    setEnergyProfile({ blocks: newBlocks });
  };

  const updateBlockTime = (blockId: string, field: 'start' | 'end', value: number) => {
    const newBlocks = energyProfile.blocks.map((b) => {
      if (b.id !== blockId) return b;
      return { ...b, [field]: value };
    });
    newBlocks.sort((a, b) => a.start - b.start);
    setEnergyProfile({ blocks: newBlocks });
  };

  const addBlock = () => {
    const lastBlock = energyProfile.blocks[energyProfile.blocks.length - 1];
    const newStart = lastBlock ? lastBlock.end : 6;
    if (newStart >= 23) {
      addToast('No more room to add a block', 'error');
      return;
    }
    const newBlock = {
      id: crypto.randomUUID(),
      label: 'New Block',
      start: newStart,
      end: Math.min(newStart + 2, 23),
      level: 'medium' as EnergyLevel,
    };
    setEnergyProfile({ blocks: [...energyProfile.blocks, newBlock] });
  };

  const removeBlock = (blockId: string) => {
    if (energyProfile.blocks.length <= 1) {
      addToast('Need at least one energy block', 'error');
      return;
    }
    setEnergyProfile({ blocks: energyProfile.blocks.filter((b) => b.id !== blockId) });
  };

  const updateLabel = (blockId: string, label: string) => {
    setEnergyProfile({
      blocks: energyProfile.blocks.map((b) => b.id === blockId ? { ...b, label } : b),
    });
  };

  const selectStyle = {
    padding: '6px 8px',
    background: 'var(--surface-high)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text1)',
    fontSize: 13,
    fontFamily: 'var(--font-mono)',
  };

  const previewStart = 5;
  const previewEnd = 23;
  const previewRange = previewEnd - previewStart;

  return (
    <div>
      <h3 style={{
        fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 700,
        color: 'var(--text1)', marginBottom: 4,
      }}>
        Energy Profile
      </h3>
      <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>
        Set your energy levels throughout the day to get smarter task suggestions.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 560 }}>
        {/* Templates */}
        <div>
          <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text3)', marginBottom: 6 }}>
            Templates
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {ENERGY_TEMPLATES.map((t) => (
              <Btn
                key={t.label}
                variant="secondary"
                size="sm"
                onClick={() => {
                  setEnergyProfile(t.profile);
                  addToast(`Applied "${t.label}" template`, 'success');
                }}
                style={{ flex: 1 }}
              >
                {t.label}
              </Btn>
            ))}
          </div>
        </div>

        {/* Visual preview bar */}
        <div>
          <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text3)', marginBottom: 4 }}>
            Preview
          </div>
          <div style={{
            display: 'flex', height: 24, borderRadius: 'var(--radius-sm)', overflow: 'hidden',
            border: '1px solid var(--border)',
          }}>
            {energyProfile.blocks
              .filter((b) => b.end > previewStart && b.start < previewEnd)
              .sort((a, b) => a.start - b.start)
              .map((block) => {
                const clampedStart = Math.max(block.start, previewStart);
                const clampedEnd = Math.min(block.end, previewEnd);
                const widthPercent = ((clampedEnd - clampedStart) / previewRange) * 100;
                const levelInfo = energyLevels.find((l) => l.value === block.level)!;
                return (
                  <div
                    key={block.id}
                    title={`${block.label}: ${formatHour(block.start)}\u2013${formatHour(block.end)} (${levelInfo.label})`}
                    style={{
                      width: `${widthPercent}%`,
                      background: `color-mix(in srgb, ${levelInfo.color} 40%, var(--surface))`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: levelInfo.color, fontWeight: 600,
                    }}
                  >
                    {widthPercent > 8 ? levelInfo.icon : ''}
                  </div>
                );
              })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text3)', marginTop: 2 }}>
            <span>{formatHour(previewStart)}</span>
            <span>{formatHour(12)}</span>
            <span>{formatHour(previewEnd)}</span>
          </div>
        </div>

        {/* Blocks */}
        {energyProfile.blocks
          .slice()
          .sort((a, b) => a.start - b.start)
          .map((block) => {
            const levelInfo = energyLevels.find((l) => l.value === block.level)!;
            return (
              <div
                key={block.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 14px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <input
                    type="text"
                    value={block.label}
                    onChange={(e) => updateLabel(block.id, e.target.value)}
                    style={{
                      background: 'transparent', border: 'none', color: 'var(--text1)',
                      fontSize: 14, fontWeight: 500, width: '100%', outline: 'none',
                      padding: 0, marginBottom: 4,
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <select
                      value={block.start}
                      onChange={(e) => updateBlockTime(block.id, 'start', Number(e.target.value))}
                      style={selectStyle}
                    >
                      {HOURS.map((h) => (
                        <option key={h} value={h}>{formatHour(h)}</option>
                      ))}
                    </select>
                    <span style={{ color: 'var(--text3)', fontSize: 12 }}>{'\u2013'}</span>
                    <select
                      value={block.end}
                      onChange={(e) => updateBlockTime(block.id, 'end', Number(e.target.value))}
                      style={selectStyle}
                    >
                      {HOURS.map((h) => (
                        <option key={h} value={h}>{formatHour(h)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => cycleLevel(block.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                    background: `color-mix(in srgb, ${levelInfo.color} 15%, transparent)`,
                    color: levelInfo.color, fontSize: 13, fontWeight: 500,
                    border: 'none', cursor: 'pointer',
                  }}
                >
                  {levelInfo.icon} {levelInfo.label}
                </button>

                <button
                  onClick={() => removeBlock(block.id)}
                  style={{
                    background: 'none', border: 'none',
                    color: 'var(--text3)', fontSize: 14,
                    cursor: 'pointer', padding: '2px 4px',
                    flexShrink: 0,
                  }}
                  title="Remove block"
                >
                  {'\u2715'}
                </button>
              </div>
            );
          })}

        {/* Add block + Reset */}
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <Btn variant="secondary" size="sm" onClick={addBlock}>
            + Add Block
          </Btn>
          <Btn
            variant="ghost"
            size="sm"
            onClick={() => {
              setEnergyProfile(DEFAULT_ENERGY_PROFILE);
              addToast('Energy profile reset to defaults', 'info');
            }}
          >
            Reset
          </Btn>
        </div>
      </div>
    </div>
  );
}

const ACCENT_PRESETS = [
  { color: '#F06D3D', label: 'Coral' },
  { color: '#E05A2B', label: 'Ember' },
  { color: '#FF6B6B', label: 'Rose' },
  { color: '#845EF7', label: 'Violet' },
  { color: '#5C7CFA', label: 'Indigo' },
  { color: '#339AF0', label: 'Blue' },
  { color: '#22B8CF', label: 'Cyan' },
  { color: '#20C997', label: 'Teal' },
  { color: '#51CF66', label: 'Green' },
  { color: '#FCC419', label: 'Gold' },
];

function PreferencesTab() {
  const notificationsEnabled = useStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useStore((s) => s.setNotificationsEnabled);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const accentColor = useStore((s) => s.accentColor);
  const setAccentColor = useStore((s) => s.setAccentColor);
  const addToast = useStore((s) => s.addToast);
  const [autoLaunch, setAutoLaunchState] = useState(false);
  const [autoLaunchLoading, setAutoLaunchLoading] = useState(true);

  useEffect(() => {
    window.zaptask.app.getAutoLaunch().then((result: any) => {
      if (result.success) setAutoLaunchState(result.data);
      setAutoLaunchLoading(false);
    });
  }, []);

  const handleAutoLaunchToggle = async (enabled: boolean) => {
    const result = await window.zaptask.app.setAutoLaunch(enabled);
    if (result.success) {
      setAutoLaunchState(enabled);
      addToast(enabled ? 'ZapTask will start on login' : 'Auto-start disabled', 'success');
    } else {
      addToast('Failed to update auto-start setting', 'error');
    }
  };

  const toggleStyle = (active: boolean) => ({
    width: 44,
    height: 24,
    borderRadius: 12,
    border: 'none',
    background: active ? 'var(--accent)' : 'var(--border)',
    cursor: 'pointer',
    position: 'relative' as const,
    transition: 'background 150ms ease',
    flexShrink: 0,
  });

  const knobStyle = (active: boolean) => ({
    position: 'absolute' as const,
    top: 2,
    left: active ? 22 : 2,
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: '#fff',
    transition: 'left 150ms ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
  });

  return (
    <div>
      <h3 style={{
        fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 700,
        color: 'var(--text1)', marginBottom: 4,
      }}>
        Preferences
      </h3>
      <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>
        Customize how ZapTask behaves.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>
        {/* Start on Login */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text1)' }}>Start on Login</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
              Open ZapTask when you log in (starts minimized)
            </div>
          </div>
          <button
            onClick={() => handleAutoLaunchToggle(!autoLaunch)}
            disabled={autoLaunchLoading}
            style={toggleStyle(autoLaunch)}
          >
            <div style={knobStyle(autoLaunch)} />
          </button>
        </div>

        {/* Notifications */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text1)' }}>Notifications</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
              Energy check-in reminders and due-soon alerts
            </div>
          </div>
          <button
            onClick={() => {
              setNotificationsEnabled(!notificationsEnabled);
              addToast(notificationsEnabled ? 'Notifications disabled' : 'Notifications enabled', 'info');
            }}
            style={toggleStyle(notificationsEnabled)}
          >
            <div style={knobStyle(notificationsEnabled)} />
          </button>
        </div>

        {/* Theme */}
        <div style={{
          padding: '16px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
        }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text1)', marginBottom: 2 }}>Theme</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
            Switch between light and dark mode
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['dark', 'light'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTheme(t);
                  addToast(`${t.charAt(0).toUpperCase() + t.slice(1)} theme applied`, 'info');
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: `1.5px solid ${theme === t ? 'var(--accent)' : 'var(--border)'}`,
                  background: theme === t ? 'var(--accent-dim)' : 'transparent',
                  color: theme === t ? 'var(--accent)' : 'var(--text2)',
                  fontSize: 13,
                  fontWeight: theme === t ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                {t === 'dark' ? '\uD83C\uDF19' : '\u2600\uFE0F'} {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Accent Color */}
        <div style={{
          padding: '16px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
        }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text1)', marginBottom: 2 }}>Accent Color</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
            Choose the accent color for buttons, highlights, and badges
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ACCENT_PRESETS.map((preset) => {
              const isActive = accentColor.toLowerCase() === preset.color.toLowerCase();
              return (
                <button
                  key={preset.color}
                  title={preset.label}
                  onClick={() => {
                    setAccentColor(preset.color);
                    addToast(`Accent set to ${preset.label}`, 'info');
                  }}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: preset.color,
                    border: isActive ? '2.5px solid var(--text1)' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'transform 150ms ease, border 150ms ease',
                    transform: isActive ? 'scale(1.15)' : 'scale(1)',
                    outline: isActive ? `2px solid ${preset.color}` : 'none',
                    outlineOffset: 2,
                  }}
                />
              );
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <label style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text3)' }}>
              Custom:
            </label>
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              style={{
                width: 28,
                height: 28,
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                background: 'transparent',
                cursor: 'pointer',
                padding: 0,
              }}
            />
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text3)' }}>
              {accentColor}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountTab() {
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const setOnboardingComplete = useStore((s) => s.setOnboardingComplete);
  const addToast = useStore((s) => s.addToast);
  const { tier, isPro, isTrialActive, daysRemaining, hasFullAccess } = useSubscription();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [confirmClear, setConfirmClear] = useState(false);

  const inputStyle = {
    width: '100%' as const,
    padding: '10px 14px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text1)',
    fontSize: 14,
  };

  const handleSave = () => {
    setUser({ name: name.trim(), email: email.trim() });
    addToast('Profile updated', 'success');
  };

  const handleClearAll = () => {
    localStorage.clear();
    setOnboardingComplete(false);
    addToast('All data cleared', 'info');
    window.location.reload();
  };

  return (
    <div>
      <h3 style={{
        fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 700,
        color: 'var(--text1)', marginBottom: 4,
      }}>
        Account
      </h3>
      <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>
        Manage your profile and app data.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text2)' }}>
            Name
          </label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text2)' }}>
            Email
          </label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
        </div>
        <Btn onClick={handleSave} style={{ width: '100%' }}>Save Profile</Btn>

        {/* Subscription */}
        <div style={{
          marginTop: 8,
          padding: '14px',
          background: isPro
            ? 'color-mix(in srgb, var(--accent) 5%, var(--surface))'
            : 'var(--surface)',
          border: `1px solid ${isPro ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-md)',
        }}>
          <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text3)', marginBottom: 4 }}>
            Subscription
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{
              fontSize: 14, fontWeight: 600,
              color: isPro ? 'var(--accent)' : 'var(--text1)',
            }}>
              {isPro ? 'Pro' : isTrialActive ? 'Free Trial' : 'Free'}
            </span>
            {isTrialActive && (
              <span style={{
                fontSize: 11, fontFamily: 'var(--font-mono)',
                color: daysRemaining <= 3 ? 'var(--red)' : 'var(--text3)',
              }}>
                {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
              </span>
            )}
          </div>
          {!isPro && (
            <Btn
              size="sm"
              onClick={() => window.dispatchEvent(new CustomEvent('zaptask:showPricing'))}
              style={{ width: '100%' }}
            >
              Upgrade to Pro
            </Btn>
          )}
          {isPro && (
            <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
              Active subscription {'\u2713'}
            </div>
          )}
        </div>

        <div style={{
          marginTop: 8,
          padding: '14px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
        }}>
          <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text3)', marginBottom: 4 }}>
            App Version
          </div>
          <div style={{ fontSize: 14, color: 'var(--text1)' }}>0.1.0 MVP</div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 8 }}>
          {confirmClear ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontSize: 13, color: 'var(--red)' }}>
                This will erase all tasks, settings, and connections. Are you sure?
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn variant="secondary" onClick={() => setConfirmClear(false)} style={{ flex: 1 }}>Cancel</Btn>
                <Btn variant="danger" onClick={handleClearAll} style={{ flex: 1 }}>Clear Everything</Btn>
              </div>
            </div>
          ) : (
            <Btn variant="ghost" onClick={() => setConfirmClear(true)} style={{ color: 'var(--red)', width: '100%' }}>
              Clear all data
            </Btn>
          )}
        </div>
      </div>
    </div>
  );
}

type FeedbackCategory = 'Bug Report' | 'Feature Request' | 'General Feedback';

function SupportTab() {
  const addToast = useStore((s) => s.addToast);
  const [category, setCategory] = useState<FeedbackCategory>('General Feedback');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const canSubmit = subject.trim().length > 0 && message.trim().length > 0 && !submitting;

  const handleCaptureScreenshot = async () => {
    setCapturing(true);
    try {
      const result = await window.zaptask.feedback.captureScreenshot();
      if (result.success && result.data) {
        setScreenshotDataUrl(result.data);
        addToast('Screenshot captured', 'success');
      } else {
        addToast(result.error || 'Failed to capture screenshot', 'error');
      }
    } catch {
      addToast('Failed to capture screenshot', 'error');
    } finally {
      setCapturing(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const result = await window.zaptask.feedback.send({
        category,
        subject: subject.trim(),
        message: message.trim(),
        screenshotDataUrl: screenshotDataUrl || undefined,
      });
      if (result.success) {
        addToast(
          screenshotDataUrl
            ? 'Email client opened — screenshot copied to clipboard, paste it into the email'
            : 'Email client opened with your feedback',
          'success',
        );
        setCategory('General Feedback');
        setSubject('');
        setMessage('');
        setScreenshotDataUrl(null);
      } else {
        addToast(result.error || 'Failed to send feedback', 'error');
      }
    } catch {
      addToast('Failed to open email client', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%' as const,
    padding: '10px 14px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text1)',
    fontSize: 14,
    fontFamily: 'var(--font-body)',
  };

  return (
    <div>
      <h3 style={{
        fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 700,
        color: 'var(--text1)', marginBottom: 4,
      }}>
        Support & Feedback
      </h3>
      <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>
        Found a bug or have an idea? Send us feedback — it opens your email client.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
        {/* Category */}
        <div>
          <label style={{
            display: 'block', marginBottom: 4, fontSize: 12,
            fontFamily: 'var(--font-mono)', color: 'var(--text2)',
          }}>
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="Bug Report">Bug Report</option>
            <option value="Feature Request">Feature Request</option>
            <option value="General Feedback">General Feedback</option>
          </select>
        </div>

        {/* Subject */}
        <div>
          <label style={{
            display: 'block', marginBottom: 4, fontSize: 12,
            fontFamily: 'var(--font-mono)', color: 'var(--text2)',
          }}>
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief summary of your feedback"
            style={inputStyle}
          />
        </div>

        {/* Message */}
        <div>
          <label style={{
            display: 'block', marginBottom: 4, fontSize: 12,
            fontFamily: 'var(--font-mono)', color: 'var(--text2)',
          }}>
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe the issue or suggestion in detail..."
            rows={5}
            style={{ ...inputStyle, resize: 'vertical' as const, minHeight: 100 }}
          />
        </div>

        {/* Screenshot */}
        <div>
          <label style={{
            display: 'block', marginBottom: 4, fontSize: 12,
            fontFamily: 'var(--font-mono)', color: 'var(--text2)',
          }}>
            Screenshot (optional)
          </label>

          {screenshotDataUrl ? (
            <div style={{
              position: 'relative',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}>
              <img
                src={screenshotDataUrl}
                alt="Screenshot preview"
                style={{ width: '100%', display: 'block', borderRadius: 'var(--radius-md)' }}
              />
              <Btn
                variant="danger"
                size="sm"
                onClick={() => setScreenshotDataUrl(null)}
                style={{ position: 'absolute', top: 8, right: 8 }}
              >
                Remove
              </Btn>
            </div>
          ) : (
            <Btn
              variant="secondary"
              size="sm"
              disabled={capturing}
              onClick={handleCaptureScreenshot}
            >
              {capturing ? 'Capturing...' : 'Capture Screenshot'}
            </Btn>
          )}

          <p style={{
            fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)',
            marginTop: 6,
          }}>
            Screenshot will be copied to your clipboard when you submit.
          </p>
        </div>

        {/* Submit */}
        <Btn
          disabled={!canSubmit}
          onClick={handleSubmit}
          style={{ width: '100%' }}
        >
          {submitting ? 'Opening email...' : 'Send Feedback'}
        </Btn>
      </div>
    </div>
  );
}
