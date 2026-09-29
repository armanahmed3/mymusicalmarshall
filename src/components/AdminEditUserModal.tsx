import React, { useState } from 'react';
import { X, Edit3, Award, UserX, UserCheck, Save } from 'lucide-react';
import type { User } from '../types';

interface AdminEditUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveUser: (updatedUser: User) => void;
}

export const AdminEditUserModal: React.FC<AdminEditUserModalProps> = ({
  user,
  isOpen,
  onClose,
  onSaveUser
}) => {
  if (!isOpen || !user) return null;

  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<'admin' | 'user'>(user.role);
  const [referralCode, setReferralCode] = useState(user.referralCode);
  const [accountStatus, setAccountStatus] = useState<User['accountStatus']>(user.accountStatus || 'approved');

  // Loyalty Program fields
  const [isLoyaltyEnrolled, setIsLoyaltyEnrolled] = useState(user.isLoyaltyEnrolled ?? false);
  const [loyaltyTier, setLoyaltyTier] = useState<User['loyaltyTier']>(user.loyaltyTier || 'Bronze Member');
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(user.loyaltyPoints ?? 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveUser({
      ...user,
      username: username.trim(),
      email: email.trim(),
      role,
      referralCode: referralCode.trim().toUpperCase(),
      accountStatus,
      isEmailVerified: user.isEmailVerified ?? true,
      isLoyaltyEnrolled,
      loyaltyTier: isLoyaltyEnrolled ? loyaltyTier : undefined,
      loyaltyPoints: isLoyaltyEnrolled ? loyaltyPoints : 0,
      loyaltyEnrolledAt: isLoyaltyEnrolled ? (user.loyaltyEnrolledAt || new Date().toISOString().split('T')[0]) : undefined
    });
    onClose();
  };

  const toggleDeactivate = () => {
    setAccountStatus((prev) => (prev === 'deactivated' ? 'approved' : 'deactivated'));
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(255, 170, 0, 0.15)', border: '1px solid rgba(255, 170, 0, 0.3)', padding: '8px', borderRadius: '10px', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Edit3 size={20} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Edit User & Loyalty
              </h2>
              <p style={{ fontSize: '0.76rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                ID: {user.id} • Registered {user.createdAt}
              </p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Account Activation / Deactivation Status Banner */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              background: accountStatus === 'deactivated' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
              border: accountStatus === 'deactivated' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: accountStatus === 'deactivated' ? '#f87171' : '#34d399' }}>
                Status: {accountStatus === 'deactivated' ? '🚫 DEACTIVATED' : '✓ ACTIVE (APPROVED)'}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                {accountStatus === 'deactivated'
                  ? 'User cannot log in or stream VIP master audio.'
                  : 'User has full authenticated player access.'}
              </div>
            </div>

            <button
              type="button"
              className={`btn btn-sm ${accountStatus === 'deactivated' ? 'btn-primary' : 'btn-outline'}`}
              style={{
                borderColor: accountStatus === 'deactivated' ? '#10b981' : 'rgba(239, 68, 68, 0.4)',
                color: accountStatus === 'deactivated' ? '#fff' : '#f87171',
                background: accountStatus === 'deactivated' ? '#10b981' : 'transparent',
                fontWeight: 700,
                fontSize: '0.75rem'
              }}
              onClick={toggleDeactivate}
            >
              {accountStatus === 'deactivated' ? (
                <>
                  <UserCheck size={14} /> Reactivate
                </>
              ) : (
                <>
                  <UserX size={14} /> De-activate
                </>
              )}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                required
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                required
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Platform Role</label>
              <select
                className="form-control"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
              >
                <option value="user">VIP Member (Listener)</option>
                <option value="admin">Administrator (Full Control)</option>
              </select>
            </div>

            <div className="form-group">
              <label>VIP Referral Code</label>
              <input
                type="text"
                required
                className="form-control"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                style={{ textTransform: 'uppercase', fontWeight: 700 }}
              />
            </div>
          </div>

          {/* Loyalty Program Enrollment Section */}
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} color="#fbbf24" />
                <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#ffffff' }}>
                  VIP Loyalty Program
                </span>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', color: '#ffffff' }}>
                <input
                  type="checkbox"
                  checked={isLoyaltyEnrolled}
                  onChange={(e) => setIsLoyaltyEnrolled(e.target.checked)}
                  style={{ accentColor: '#10b981' }}
                />
                <span>Enrolled</span>
              </label>
            </div>

            {isLoyaltyEnrolled && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', marginTop: '10px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.78rem' }}>Loyalty Tier</label>
                  <select
                    className="form-control"
                    value={loyaltyTier}
                    onChange={(e) => setLoyaltyTier(e.target.value as any)}
                    style={{ fontSize: '0.82rem' }}
                  >
                    <option value="Bronze Member">Bronze Member (Entry)</option>
                    <option value="Silver VIP">Silver VIP (500+ Pts)</option>
                    <option value="Gold Elite">Gold Elite (1000+ Pts)</option>
                    <option value="Platinum Marshall">Platinum Marshall (Master)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.78rem' }}>Loyalty Points</label>
                  <input
                    type="number"
                    className="form-control"
                    value={loyaltyPoints}
                    onChange={(e) => setLoyaltyPoints(parseInt(e.target.value) || 0)}
                    style={{ fontSize: '0.82rem' }}
                  />
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1.5, background: 'var(--brand-accent, #00f59b)', borderColor: 'var(--brand-accent, #00f59b)', color: '#07090e', fontWeight: 800 }}
            >
              <Save size={15} /> Save User Updates
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};
