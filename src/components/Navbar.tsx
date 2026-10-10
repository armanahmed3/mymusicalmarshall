import React, { useState } from 'react';
import {
  Headphones,
  Disc3,
  Calendar,
  HelpCircle,
  ListMusic,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Settings,
  Home,
  User as UserIcon
} from 'lucide-react';
import type { User, AppPage } from '../types';

interface NavbarProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  currentUser: User | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  onOpenPreferences: () => void;
  onOpenEditProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenPreferences,
  onOpenEditProfile
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (page: AppPage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAdmin = currentUser?.role === 'admin';
  const isLoggedIn = currentUser !== null;

  return (
    <header className="landing-nav" id="top-nav">
      <div className="landing-nav-inner">
        {/* Logo with Animated Headphone and Authentic Audio */}
        <div
          className="landing-logo"
          onClick={() => handleNavClick('home')}
          title="Music Marshall - Authentic Audio"
        >
          <img
            src="/headphone_logo.png"
            alt="Music Marshall Headphone Logo"
            className="headphone-logo-animated"
          />
          <div className="landing-logo-meta">
            <span className="landing-logo-title">Music Marshall</span>
            <span className="landing-logo-sub">Authentic Audio</span>
          </div>
        </div>

        {/* Main Desktop Navigation Links */}
        <nav className="landing-links">
          <button
            type="button"
            className={`landing-nav-link-btn ${currentPage === 'home' ? 'is-active' : ''}`}
            onClick={() => handleNavClick('home')}
          >
            <Home size={15} />
            <span>Home</span>
          </button>

          {/* LISTEN TO MUSIC: Strictly visible only when logged in */}
          {isLoggedIn && (
            <button
              type="button"
              className={`landing-nav-link-btn ${currentPage === 'mixes' ? 'is-active' : ''}`}
              onClick={() => handleNavClick('mixes')}
              title="Listen to Music & Continuous Mixes"
            >
              <Headphones size={15} />
              <span>Listen to Music</span>
            </button>
          )}

          <button
            type="button"
            className={`landing-nav-link-btn ${currentPage === 'releases' ? 'is-active' : ''}`}
            onClick={() => handleNavClick('releases')}
            title="Free Official MM Releases"
          >
            <Disc3 size={15} />
            <span>My MM Productions</span>
          </button>

          <button
            type="button"
            className={`landing-nav-link-btn ${currentPage === 'notices' ? 'is-active' : ''}`}
            onClick={() => handleNavClick('notices')}
            title="Official Bulletin & Event Flyers"
          >
            <Calendar size={15} />
            <span>Notice Board</span>
          </button>

          <button
            type="button"
            className={`landing-nav-link-btn ${currentPage === 'support' ? 'is-active' : ''}`}
            onClick={() => handleNavClick('support')}
            title="Marshall Technical & Admin Desk"
          >
            <HelpCircle size={15} />
            <span>Support Desk</span>
          </button>

          {/* USER & ADMIN FEATURE: Create Playlist (Only visible after login by user/admin) */}
          {isLoggedIn && (
            <button
              type="button"
              className={`landing-nav-link-btn ${currentPage === 'create-playlist' ? 'is-active' : ''}`}
              onClick={() => handleNavClick('create-playlist')}
              title="Create and Manage Playlists"
              style={{
                borderColor: currentPage === 'create-playlist' ? '#00f59b' : 'rgba(0, 245, 155, 0.3)',
                background: currentPage === 'create-playlist' ? 'rgba(0, 245, 155, 0.15)' : 'rgba(0, 245, 155, 0.05)',
                color: '#00f59b',
                fontWeight: 700
              }}
            >
              <ListMusic size={15} />
              <span>Create Playlist</span>
            </button>
          )}

          {/* ADMIN ONLY FEATURE: Admin Panel (Only visible after login by admin) */}
          {isAdmin && (
            <button
              type="button"
              className={`landing-nav-link-btn ${currentPage === 'admin' ? 'is-active' : ''}`}
              onClick={() => handleNavClick('admin')}
              title="Platform Administrator Control Panel"
              style={{
                borderColor: currentPage === 'admin' ? '#00f59b' : 'rgba(255, 170, 0, 0.4)',
                background: currentPage === 'admin' ? 'linear-gradient(135deg, rgba(0, 245, 155, 0.2) 0%, rgba(0, 210, 255, 0.2) 100%)' : 'rgba(255, 170, 0, 0.08)',
                color: currentPage === 'admin' ? '#00f59b' : '#fbbf24',
                fontWeight: 800
              }}
            >
              <ShieldCheck size={15} color={currentPage === 'admin' ? '#00f59b' : '#fbbf24'} />
              <span>Admin Panel</span>
            </button>
          )}
        </nav>

        {/* Right Navigation Actions */}
        <div className="landing-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {!isLoggedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => onOpenAuth('login')}
                title="Log In to your Music Marshall account"
              >
                Login
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => onOpenAuth('register')}
                title="Register with a Referral Code"
              >
                Register
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              {/* User Profile Capsule Button */}
              <button
                type="button"
                className="nav-profile-chip"
                onClick={onOpenEditProfile}
                title="Click to view & edit your profile details"
                style={{ maxWidth: '170px' }}
              >
                <div className={`nav-profile-avatar ${!isAdmin ? 'user-avatar' : ''}`}>
                  {currentUser.username.charAt(0).toUpperCase()}
                </div>
                <div className="nav-profile-info" style={{ maxWidth: '110px', overflow: 'hidden' }}>
                  <span
                    className="nav-profile-name"
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'block',
                      maxWidth: '105px'
                    }}
                    title={currentUser.username}
                  >
                    {currentUser.username}
                  </span>
                  <span className={`nav-profile-role ${!isAdmin ? 'is-member' : ''}`}>
                    {isAdmin ? '🛡️ Admin' : 'Member'}
                  </span>
                </div>
              </button>

              {/* Dedicated Prominent Logout Button */}
              <button
                type="button"
                className="btn btn-outline btn-sm nav-logout-btn"
                onClick={onLogout}
                title="Log out from Music Marshall"
                style={{
                  borderColor: 'rgba(239, 68, 68, 0.45)',
                  color: '#f87171',
                  background: 'rgba(239, 68, 68, 0.12)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 700,
                  flexShrink: 0
                }}
              >
                <LogOut size={13} />
                <span>Logout</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            className="landing-mobile-menu-btn"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="landing-mobile-menu">
          <button
            type="button"
            className="landing-mobile-menu-item"
            onClick={() => handleNavClick('home')}
          >
            <Home size={18} />
            <span>Home</span>
          </button>

          {/* Mobile Listen to Music (Strictly visible only when logged in) */}
          {isLoggedIn && (
            <button
              type="button"
              className="landing-mobile-menu-item"
              onClick={() => handleNavClick('mixes')}
            >
              <Headphones size={18} />
              <span>Listen to Music</span>
            </button>
          )}

          <button
            type="button"
            className="landing-mobile-menu-item"
            onClick={() => handleNavClick('releases')}
          >
            <Disc3 size={18} />
            <span>My MM Productions</span>
          </button>

          <button
            type="button"
            className="landing-mobile-menu-item"
            onClick={() => handleNavClick('notices')}
          >
            <Calendar size={18} />
            <span>Notice Board</span>
          </button>

          <button
            type="button"
            className="landing-mobile-menu-item"
            onClick={() => handleNavClick('support')}
          >
            <HelpCircle size={18} />
            <span>Support Desk</span>
          </button>

          {/* Mobile Create Playlist Link (Logged-in User/Admin) */}
          {isLoggedIn && (
            <button
              type="button"
              className="landing-mobile-menu-item"
              onClick={() => handleNavClick('create-playlist')}
              style={{ color: '#00f59b', fontWeight: 700 }}
            >
              <ListMusic size={18} color="#00f59b" />
              <span>Create Playlist</span>
            </button>
          )}

          {/* Mobile Admin Panel Link (Admin Only) */}
          {isAdmin && (
            <button
              type="button"
              className="landing-mobile-menu-item"
              onClick={() => handleNavClick('admin')}
              style={{ color: '#fbbf24', fontWeight: 800 }}
            >
              <ShieldCheck size={18} color="#fbbf24" />
              <span>Admin Panel</span>
            </button>
          )}

          {/* Mobile Auth Actions */}
          <div className="mobile-menu-actions">
            {!isLoggedIn ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '8px' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                >
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ width: '100%' }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('register');
                  }}
                >
                  <span>Register with Referral Code</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '8px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    borderColor: 'rgba(0, 245, 155, 0.4)',
                    color: '#00f59b'
                  }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenEditProfile();
                  }}
                >
                  <UserIcon size={15} />
                  <span>Edit Profile ({currentUser.username})</span>
                </button>

                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenPreferences();
                  }}
                >
                  <Settings size={15} />
                  <span>Playback Preferences</span>
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                >
                  <LogOut size={15} />
                  <span>Logout ({currentUser.username})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
