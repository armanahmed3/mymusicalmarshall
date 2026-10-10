import React, { useState, useEffect } from 'react';
import {
  X,
  User as UserIcon,
  Mail,
  Shield,
  Calendar,
  CheckCircle2,
  Tag,
  Save,
  Phone,
  AlertCircle
} from 'lucide-react';
import type { User } from '../types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSaveProfile: (updatedUser: User) => Promise<void> | void;
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
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser && isOpen) {
      // Map firstName only if explicitly present or if username is a human name (does not contain @)
      const derivedFirstName = currentUser.firstName
        ? currentUser.firstName
        : currentUser.username && !currentUser.username.includes('@') && currentUser.username.includes(' ')
        ? currentUser.username.split(' ')[0]
        : '';

      const derivedLastName = currentUser.lastName
        ? currentUser.lastName
        : currentUser.username && !currentUser.username.includes('@') && currentUser.username.includes(' ')
        ? currentUser.username.split(' ').slice(1).join(' ')
        : '';

      setFirstName(derivedFirstName);
      setLastName(derivedLastName);
      setUsername(currentUser.username || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
      setBio(currentUser.bio || '');
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

    if (!cleanUsername) {
      setStatusMessage({ type: 'error', text: 'Display username is required.' });
      return;
    }

    // User is NOT allowed to change email address; keep currentUser.email
    const updatedUser: User = {
      ...currentUser,
      firstName: cleanFirstName || undefined,
      lastName: cleanLastName || undefined,
      username: cleanUsername,
      email: currentUser.email,
      phone: phone.trim() || undefined,
      bio: bio.trim() || undefined
    };

    setIsSubmitting(true);
    try {
      await onSaveProfile(updatedUser);
      setStatusMessage({
        type: 'success',
        text: 'Profile details saved successfully!'
      });
      setTimeout(() => {
        onClose();
      }, 1200);
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
        background: 'rgba(3, 6, 12, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          background: '#0c111d',
          border: '1px solid rgba(0, 245, 155, 0.3)',
          borderRadius: '20px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(0, 245, 155, 0.12)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
          animation: 'fadeInUp 0.25s ease-out'
        }}
      >
        {/* Header Section */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(16, 24, 40, 0.95) 0%, rgba(12, 17, 29, 0.9) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                position: 'relative',
                width: '48px',
                height: '48px',
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
                boxShadow: '0 4px 14px rgba(0, 245, 155, 0.35)',
                flexShrink: 0
              }}
            >
              {currentUser.username.charAt(0).toUpperCase()}
              <span
                style={{
                  position: 'absolute',
                  bottom: '-1px',
                  right: '-1px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: '#00f59b',
                  border: '2.5px solid #0c111d'
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                  {currentUser.username}
                </h2>
                <span
                  style={{
                    background: isAdmin ? 'rgba(0, 245, 155, 0.18)' : 'rgba(56, 189, 248, 0.18)',
                    color: isAdmin ? '#00f59b' : '#38bdf8',
                    border: `1px solid ${isAdmin ? 'rgba(0, 245, 155, 0.35)' : 'rgba(56, 189, 248, 0.35)'}`,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    letterSpacing: '0.02em'
                  }}
                >
                  {isAdmin ? 'Admin 🛡️' : 'Member'}
                </span>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                Edit your listener profile & credentials
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
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.18s ease'
            }}
            aria-label="Close Profile Modal"
          >
            <X size={17} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {statusMessage && (
            <div
              style={{
                marginBottom: '18px',
                padding: '11px 14px',
                borderRadius: '10px',
                background: statusMessage.type === 'error' ? 'rgba(239, 68, 68, 0.14)' : 'rgba(0, 245, 155, 0.14)',
                border: `1px solid ${statusMessage.type === 'error' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(0, 245, 155, 0.35)'}`,
                color: statusMessage.type === 'error' ? '#fca5a5' : '#00f59b',
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                fontSize: '0.84rem',
                fontWeight: 600
              }}
            >
              {statusMessage.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Membership Metadata Overview Card */}
          <div
            style={{
              background: 'rgba(16, 24, 40, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))',
              gap: '12px'
            }}
          >
            <div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Tag size={11} color="#00f59b" /> Referral Code
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#00f59b', fontFamily: 'monospace', marginTop: '2px' }}>
                {currentUser.referralCode || 'N/A'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Shield size={11} color="#38bdf8" /> Invited By
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
                {currentUser.referredBy || 'Direct'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={11} color="#f59e0b" /> Member Since
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#cbd5e1', marginTop: '2px' }}>
                {currentUser.createdAt || 'Recent'}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* First & Last Name */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                  First Name <span style={{ color: '#00f59b' }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: '#ffffff',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                  Last Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: '#ffffff',
                    fontSize: '0.88rem'
                  }}
                />
              </div>
            </div>

            {/* Username & Email */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                  Display Username <span style={{ color: '#00f59b' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <UserIcon size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="text"
                    className="input-field"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                    style={{
                      width: '100%',
                      paddingLeft: '36px',
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      paddingTop: '10px',
                      paddingBottom: '10px',
                      color: '#ffffff',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                  Email Address (Account Identity)
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="email"
                    className="input-field"
                    value={email}
                    readOnly
                    disabled
                    style={{
                      width: '100%',
                      paddingLeft: '36px',
                      background: 'rgba(15, 23, 42, 0.45)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '10px',
                      paddingTop: '10px',
                      paddingBottom: '10px',
                      color: '#94a3b8',
                      fontSize: '0.88rem',
                      cursor: 'not-allowed',
                      userSelect: 'none'
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                  🔒 Email address is linked to your account and cannot be changed
                </div>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                Phone Number (Optional)
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="tel"
                  className="input-field"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  style={{
                    width: '100%',
                    paddingLeft: '36px',
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    color: '#ffffff',
                    fontSize: '0.88rem'
                  }}
                />
              </div>
            </div>

            {/* Listener Bio */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                Listener Bio / Note
              </label>
              <textarea
                className="input-field"
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your favorite selectors, sound systems, or musical tastes..."
                style={{
                  width: '100%',
                  resize: 'vertical',
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  color: '#ffffff',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            {/* Bottom Actions */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '6px'
              }}
            >
              <button
                type="button"
                className="btn btn-outline"
                onClick={onClose}
                disabled={isSubmitting}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  fontSize: '0.84rem',
                  fontWeight: 600
                }}
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
                  gap: '7px',
                  padding: '10px 22px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  background: 'linear-gradient(135deg, #00f59b 0%, #00d2ff 100%)',
                  color: '#07090e',
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(0, 245, 155, 0.35)',
                  cursor: 'pointer'
                }}
              >
                <Save size={15} />
                <span>{isSubmitting ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
