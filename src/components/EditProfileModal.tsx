import React, { useState, useEffect } from 'react';
import {
  X,
  User as UserIcon,
  Mail,
  Shield,
  Key,
  Calendar,
  CheckCircle2,
  Tag,
  Save,
  Music,
  Phone,
  AlertCircle
} from 'lucide-react';
import type { User } from '../types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSaveProfile: (updatedUser: User, newPassword?: string) => Promise<void> | void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveProfile
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [favoriteGenre, setFavoriteGenre] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser && isOpen) {
      setFirstName(currentUser.firstName || currentUser.username.split(' ')[0] || '');
      setLastName(currentUser.lastName || currentUser.username.split(' ').slice(1).join(' ') || '');
      setUsername(currentUser.username || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
      setBio(currentUser.bio || '');
      setFavoriteGenre(currentUser.favoriteGenre || 'Reggae');
      setNewPassword('');
      setConfirmPassword('');
      setStatusMessage(null);
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanFirstName || !cleanUsername || !cleanEmail) {
      setStatusMessage({ type: 'error', text: 'First name, username, and email are required.' });
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setStatusMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    const updatedUser: User = {
      ...currentUser,
      firstName: cleanFirstName,
      lastName: cleanLastName || undefined,
      username: cleanUsername,
      email: cleanEmail,
      phone: phone.trim() || undefined,
      bio: bio.trim() || undefined,
      favoriteGenre: favoriteGenre.trim() || undefined
    };

    setIsSubmitting(true);
    try {
      await onSaveProfile(updatedUser, newPassword || undefined);
      setStatusMessage({ type: 'success', text: 'Profile successfully updated! Confirmation dispatched to both user and admin emails.' });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to update profile. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAdmin = currentUser.role === 'admin';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(5, 7, 12, 0.88)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          background: 'linear-gradient(145deg, #0e1526 0%, #080c16 100%)',
          border: '1px solid rgba(0, 245, 155, 0.35)',
          borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75), 0 0 35px rgba(0, 245, 155, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 28px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 22, 38, 0.6)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: isAdmin
                  ? 'linear-gradient(135deg, #00f59b 0%, #00d2ff 100%)'
                  : 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
                color: '#07090e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.25rem',
                boxShadow: '0 4px 14px rgba(0, 245, 155, 0.3)'
              }}
            >
              {currentUser.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                  Member Profile & Settings
                </h2>
                <span
                  style={{
                    background: isAdmin ? 'rgba(0, 245, 155, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                    color: isAdmin ? '#00f59b' : '#38bdf8',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 800
                  }}
                >
                  {isAdmin ? '🛡️ Admin Account' : '⭐ VIP Member'}
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                View and update all listener details. Any changes will dispatch confirmation emails to both you and the administrator.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            aria-label="Close Profile"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
          {statusMessage && (
            <div
              style={{
                marginBottom: '20px',
                padding: '12px 16px',
                borderRadius: '12px',
                background: statusMessage.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 245, 155, 0.15)',
                border: `1px solid ${statusMessage.type === 'error' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(0, 245, 155, 0.4)'}`,
                color: statusMessage.type === 'error' ? '#fca5a5' : '#00f59b',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.88rem',
                fontWeight: 600
              }}
            >
              {statusMessage.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Quick Account Metadata Overview Card */}
          <div
            style={{
              background: 'rgba(15, 20, 36, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '14px'
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Tag size={12} color="#00f59b" /> Referral Code
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#00f59b', fontFamily: 'monospace', marginTop: '2px' }}>
                {currentUser.referralCode || 'N/A'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Shield size={12} color="#38bdf8" /> Invited By
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
                {currentUser.referredBy || 'Direct'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <CheckCircle2 size={12} color="#22c55e" /> Status
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#22c55e', marginTop: '2px' }}>
                {currentUser.accountStatus === 'approved' ? 'Active VIP' : currentUser.accountStatus}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={12} color="#f59e0b" /> Member Since
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#cbd5e1', marginTop: '2px' }}>
                {currentUser.createdAt || 'Recent'}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Row 1: First Name & Last Name */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                  First Name <span style={{ color: '#00f59b' }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                  Last Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Row 2: Display Username & Email */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                  Display Username <span style={{ color: '#00f59b' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <UserIcon size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="text"
                    className="input-field"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                    style={{ width: '100%', paddingLeft: '38px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                  Email Address <span style={{ color: '#00f59b' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="email"
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    required
                    style={{ width: '100%', paddingLeft: '38px' }}
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Phone & Favorite Genre */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                  Phone Number (Optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="tel"
                    className="input-field"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    style={{ width: '100%', paddingLeft: '38px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                  Favorite Genre / Style
                </label>
                <div style={{ position: 'relative' }}>
                  <Music size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <select
                    className="input-field"
                    value={favoriteGenre}
                    onChange={(e) => setFavoriteGenre(e.target.value)}
                    style={{ width: '100%', paddingLeft: '38px' }}
                  >
                    <option value="Reggae">Reggae / Roots</option>
                    <option value="Rocksteady">Rocksteady Classics</option>
                    <option value="Dancehall">Dancehall Jugglings</option>
                    <option value="Dub">Studio Dub & Stems</option>
                    <option value="Lovers Rock">Lovers Rock</option>
                    <option value="Ska">Original Ska</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Row 4: Bio / Listener Note */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                Listener Bio / Sound System Note
              </label>
              <textarea
                className="input-field"
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your favorite sound system, selectors, or musical interests..."
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            {/* Row 5: Change Password Section */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '16px 20px'
              }}
            >
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={16} color="#00f59b" /> Change Password (Leave blank to keep current)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    className="input-field"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="input-field"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '10px'
              }}
            >
              <button
                type="button"
                className="btn btn-outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  fontWeight: 800
                }}
              >
                <Save size={16} />
                <span>{isSubmitting ? 'Saving & Sending Emails...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
