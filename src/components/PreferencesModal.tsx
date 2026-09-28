import React from 'react';
import { X, Repeat, Bell, BellOff, Volume2, Check } from 'lucide-react';
import type { UserPreferences } from '../types';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onSavePreferences: (prefs: UserPreferences) => void;
  userRole?: 'admin' | 'user';
}

export const PreferencesModal: React.FC<PreferencesModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onSavePreferences,
  userRole = 'user'
}) => {
  const [repeatMixLoop, setRepeatMixLoop] = React.useState(preferences.repeatMixLoop);
  const [stopNewMixAlerts, setStopNewMixAlerts] = React.useState(preferences.stopNewMixAlerts);
  const [audioBitrate, setAudioBitrate] = React.useState('320k');

  React.useEffect(() => {
    setRepeatMixLoop(preferences.repeatMixLoop);
    setStopNewMixAlerts(preferences.stopNewMixAlerts);
  }, [preferences, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePreferences({
      repeatMixLoop,
      stopNewMixAlerts
    });
    onClose();
  };

  return (
    <div className="auth-overlay">
      <div className="auth-modal" style={{ maxWidth: '480px' }}>
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close preferences"
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ background: '#0f172a', padding: '10px', borderRadius: '10px', color: '#38bdf8' }}>
            <Volume2 size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              Playback & Alert Preferences
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
              Personalize your SoundMarshall studio session {userRole === 'admin' ? '(Admin Mode)' : ''}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Preference 1: Repeat Mix Selected (Loop) */}
          <div
            style={{
              background: '#f8fafc',
              border: repeatMixLoop ? '2px solid #16a34a' : '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ color: repeatMixLoop ? '#16a34a' : '#64748b', marginTop: '2px' }}>
                  <Repeat size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                    Repeat Mix Selected (Loop Playback)
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0 0' }}>
                    When enabled, the music mix or track currently playing will seamlessly repeat from the beginning when it finishes.
                  </p>
                </div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', flexShrink: 0 }}>
                <input
                  type="checkbox"
                  checked={repeatMixLoop}
                  onChange={(e) => setRepeatMixLoop(e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span
                  style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: repeatMixLoop ? '#16a34a' : '#cbd5e1',
                    borderRadius: '24px',
                    transition: '0.3s'
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      content: "''",
                      height: '18px',
                      width: '18px',
                      left: repeatMixLoop ? '22px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transition: '0.3s'
                    }}
                  />
                </span>
              </label>
            </div>
            {repeatMixLoop && (
              <div style={{ marginTop: '10px', fontSize: '0.74rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={14} /> Loop mode active for all mixes and tracks
              </div>
            )}
          </div>

          {/* Preference 2: Stop Receiving Alerts when New Mixes are Uploaded */}
          <div
            style={{
              background: '#f8fafc',
              border: stopNewMixAlerts ? '2px solid #e11d48' : '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ color: stopNewMixAlerts ? '#e11d48' : '#64748b', marginTop: '2px' }}>
                  {stopNewMixAlerts ? <BellOff size={20} /> : <Bell size={20} />}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                    Stop Receiving Alerts for New Mixes
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0 0' }}>
                    Mute email and on-screen notification alerts whenever fresh studio music mixes or juggling sets are published.
                  </p>
                </div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', flexShrink: 0 }}>
                <input
                  type="checkbox"
                  checked={stopNewMixAlerts}
                  onChange={(e) => setStopNewMixAlerts(e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span
                  style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: stopNewMixAlerts ? '#e11d48' : '#cbd5e1',
                    borderRadius: '24px',
                    transition: '0.3s'
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      content: "''",
                      height: '18px',
                      width: '18px',
                      left: stopNewMixAlerts ? '22px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transition: '0.3s'
                    }}
                  />
                </span>
              </label>
            </div>
            {stopNewMixAlerts && (
              <div style={{ marginTop: '10px', fontSize: '0.74rem', color: '#e11d48', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                🔕 New mix upload alerts are muted for your account
              </div>
            )}
          </div>

          {/* Master Audio Stream Quality */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '8px' }}>
              Streaming Audio Bitrate
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[
                { id: '160k', label: '160 kbps', sub: 'Standard' },
                { id: '320k', label: '320 kbps', sub: 'High-Res MP3' },
                { id: 'lossless', label: 'Master FLAC', sub: 'Lossless Dub' }
              ].map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setAudioBitrate(tier.id)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: audioBitrate === tier.id ? '2px solid #0f172a' : '1px solid #cbd5e1',
                    background: audioBitrate === tier.id ? '#0f172a' : '#ffffff',
                    color: audioBitrate === tier.id ? '#ffffff' : '#0f172a',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '0.78rem', fontWeight: 800 }}>{tier.label}</div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>{tier.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{ flex: 1 }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1.5, background: '#16a34a', borderColor: '#16a34a' }}
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
