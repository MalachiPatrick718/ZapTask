import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Btn } from './shared/Btn';
import { DEFAULT_ENERGY_PROFILE } from '../../shared/types';
import type { EnergyLevel, EnergyProfile } from '../../shared/types';

type SettingsTab = 'integrations' | 'energy' | 'preferences' | 'account';

const energyLevels: { value: EnergyLevel; icon: string; label: string; color: string }[] = [
  { value: 'high', icon: '\u26A1', label: 'High', color: 'var(--energy-high)' },
  { value: 'medium', icon: '\uD83D\uDD0B', label: 'Medium', color: 'var(--energy-med)' },
  { value: 'low', icon: '\uD83C\uDF19', label: 'Low', color: 'var(--energy-low)' },
];

const toolMeta: Record<string, { name: string; color: string }> = {
  jira: { name: 'Jira', color: '#2684FF' },
  gcal: { name: 'Google Calendar', color: '#4285F4' },
  notion: { name: 'Notion', color: '#999' },
};

export function SettingsView() {
  const [tab, setTab] = useState<SettingsTab>('integrations');

  const settingsTabs: { id: SettingsTab; label: string }[] = [
    { id: 'integrations', label: 'Integrations' },
    { id: 'energy', label: 'Energy' },
    { id: 'preferences', label: 'Prefs' },
    { id: 'account', label: 'Account' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '12px 14px 0' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
          color: 'var(--text1)', marginBottom: 10,
        }}>
          Settings
        </h2>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
          {settingsTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                background: tab === t.id ? 'var(--accent-dim)' : 'transparent',
                color: tab === t.id ? 'var(--accent)' : 'var(--text3)',
                fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 500,
                border: 'none', cursor: 'pointer',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px' }}>
        {tab === 'integrations' && <IntegrationsTab />}
        {tab === 'energy' && <EnergyTab />}
        {tab === 'preferences' && <PreferencesTab />}
        {tab === 'account' && <AccountTab />}
      </div>
    </div>
  );
}

function IntegrationsTab() {
  const tools = useStore((s) => s.tools);
  const setToolConnected = useStore((s) => s.setToolConnected);
  const addToast = useStore((s) => s.addToast);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {tools.map((tool) => {
        const meta = toolMeta[tool.toolId];
        return (
          <div
            key={tool.toolId}
            style={{
              padding: '12px 14px',
              background: 'var(--surface)',
              border: `1px solid ${tool.connected ? 'var(--green)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: tool.connected ? 'var(--green)' : meta.color,
                }} />
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text1)' }}>{meta.name}</span>
              </div>
              {tool.connected ? (
                <Btn variant="ghost" size="sm" onClick={() => {
                  setToolConnected(tool.toolId, false);
                  addToast(`${meta.name} disconnected`, 'info');
                }}>
                  Disconnect
                </Btn>
              ) : (
                <Btn variant="secondary" size="sm" onClick={() => {
                  setToolConnected(tool.toolId, true, 'user@example.com');
                  addToast(`${meta.name} connected (simulated)`, 'success');
                }}>
                  Connect
                </Btn>
              )}
            </div>
            {tool.connected && (
              <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
                {tool.email} {'\u00B7'} {tool.lastSyncAt ? `Last sync: ${new Date(tool.lastSyncAt).toLocaleTimeString()}` : 'Not synced yet'}
              </div>
            )}
          </div>
        );
      })}
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
    // Sort by start time after updating
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
    padding: '4px 6px',
    background: 'var(--surface-high)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text1)',
    fontSize: 12,
    fontFamily: 'var(--font-mono)',
  };

  // Visual preview: 5am to 11pm = 18 hours
  const previewStart = 5;
  const previewEnd = 23;
  const previewRange = previewEnd - previewStart;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Templates */}
      <div>
        <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text3)', marginBottom: 6 }}>
          Templates
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {ENERGY_TEMPLATES.map((t) => (
            <Btn
              key={t.label}
              variant="secondary"
              size="sm"
              onClick={() => {
                setEnergyProfile(t.profile);
                addToast(`Applied "${t.label}" template`, 'success');
              }}
              style={{ flex: 1, fontSize: 11 }}
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
          display: 'flex', height: 20, borderRadius: 'var(--radius-sm)', overflow: 'hidden',
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
                  title={`${block.label}: ${formatHour(block.start)}–${formatHour(block.end)} (${levelInfo.label})`}
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
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 12px',
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
                    fontSize: 13, fontWeight: 500, width: '100%', outline: 'none',
                    padding: 0, marginBottom: 4,
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
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
                  padding: '4px 8px', borderRadius: 'var(--radius-sm)',
                  background: `color-mix(in srgb, ${levelInfo.color} 15%, transparent)`,
                  color: levelInfo.color, fontSize: 12, fontWeight: 500,
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
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 4 }}>
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
  );
}

function PreferencesTab() {
  const notificationsEnabled = useStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useStore((s) => s.setNotificationsEnabled);
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
    width: 40,
    height: 22,
    borderRadius: 11,
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
    left: active ? 20 : 2,
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: '#fff',
    transition: 'left 150ms ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Start on Login */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px',
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
        padding: '14px',
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
    </div>
  );
}

function AccountTab() {
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const setOnboardingComplete = useStore((s) => s.setOnboardingComplete);
  const addToast = useStore((s) => s.addToast);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [confirmClear, setConfirmClear] = useState(false);

  const inputStyle = {
    width: '100%' as const,
    padding: '8px 12px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text1)',
    fontSize: 13,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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

      <div style={{
        marginTop: 16,
        padding: '12px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
      }}>
        <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text3)', marginBottom: 4 }}>
          App Version
        </div>
        <div style={{ fontSize: 13, color: 'var(--text1)' }}>0.1.0 MVP</div>
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
  );
}
