import React from 'react';
import { Mail, CheckCircle2, Headphones, Sparkles, Disc3, Award, ArrowRight, X } from 'lucide-react';
import type { User } from '../types';

interface WelcomeEmailModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onStartListening: () => void;
}

export const WelcomeEmailModal: React.FC<WelcomeEmailModalProps> = ({
  user,
  isOpen,
  onClose,
  onStartListening
}) => {
  if (!isOpen || !user) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        zIndex: 9999,
        background: 'rgba(5, 8, 16, 0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="modal-card"
        style={{
          maxWidth: '580px',
          width: '100%',
          background: 'linear-gradient(180deg, #0d1322 0%, #070a13 100%)',
          border: '1.5px solid rgba(0, 245, 155, 0.35)',
          borderRadius: '20px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.75), 0 0 40px rgba(0, 245, 155, 0.15)',
          overflow: 'hidden',
          animation: 'fadeInScale 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Email App Bar Mockup Header */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
            <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
              Official Welcome Email • Music Marshall Studio
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px'
            }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Email Header Envelope Metadata */}
        <div
          style={{
            padding: '20px 24px 16px',
            background: 'rgba(0, 245, 155, 0.03)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #00f59b 0%, #00d2ff 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#070a13',
                flexShrink: 0,
                boxShadow: '0 4px 14px rgba(0, 245, 155, 0.3)'
              }}
            >
              <Mail size={24} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#ffffff' }}>
                  Music Marshall VIP Portal
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontWeight: 700
                  }}
                >
                  ✓ Sent to Mailbox
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                <strong>To:</strong> {user.email} &lt;{user.username}&gt;
              </div>
              <div style={{ fontSize: '0.82rem', color: '#00f59b', fontWeight: 700, marginTop: '4px' }}>
                Subject: 🎵 Welcome to Music Marshall VIP — Lifetime Stream Access Pass!
              </div>
            </div>
          </div>
        </div>

        {/* Email Content Body */}
        <div style={{ padding: '24px', maxHeight: '60vh', overflowY: 'auto' }}>
          <div
            style={{
              textAlign: 'center',
              padding: '16px 0 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(0, 245, 155, 0.12)',
                border: '1px solid rgba(0, 245, 155, 0.25)',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                color: '#00f59b',
                fontWeight: 800,
                marginBottom: '10px'
              }}
            >
              <Sparkles size={14} />
              <span>REGISTRATION CONFIRMED • 100% UNLOCKED</span>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 8px' }}>
              Welcome, {user.username}!
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto', lineHeight: 1.5 }}>
              Thank you for registering with Music Marshall. Your VIP account is active and verified for unlimited streaming access.
            </p>
          </div>

          {/* User Account Credentials Box */}
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '14px',
              padding: '18px',
              margin: '20px 0'
            }}
          >
            <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', fontWeight: 800, marginBottom: '12px' }}>
              VIP Pass Details
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Member Name</span>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>{user.username}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Account Email</span>
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#00f59b', wordBreak: 'break-all' }}>{user.email}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Assigned Promo / Ref Code</span>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fbbf24', letterSpacing: '0.05em' }}>
                  {user.referralCode}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Streaming Status</span>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#34d399', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} /> VIP Active
                </span>
              </div>
            </div>
          </div>

          {/* Privileges Highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '16px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.84rem', color: '#cbd5e1' }}>
              <Headphones size={16} color="#00f59b" style={{ flexShrink: 0 }} />
              <span>Full playback of all official My MM Productions and Master DJ Mixes</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.84rem', color: '#cbd5e1' }}>
              <Disc3 size={16} color="#00f59b" style={{ flexShrink: 0 }} />
              <span>Create and manage your own custom mix playlists</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.84rem', color: '#cbd5e1' }}>
              <Award size={16} color="#00f59b" style={{ flexShrink: 0 }} />
              <span>Exclusive access to live sound system dates & Notice Board flyers</span>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div
          style={{
            padding: '16px 24px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
            A confirmation email was dispatched to <strong>{user.email}</strong>.
          </span>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              onClose();
              onStartListening();
            }}
            style={{
              padding: '10px 22px',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 18px rgba(0, 245, 155, 0.35)'
            }}
          >
            <span>Start Listening Now</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
