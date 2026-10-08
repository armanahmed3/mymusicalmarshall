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

          <button
            type="button"
            className={`landing-nav-link-btn ${currentPage === 'mixes' ? 'is-active' : ''}`}
            onClick={() => handleNavClick('mixes')}
            title="Listen to Music & Continuous Mixes"
          >
            <Headphones size={15} />
            <span>Listen to Music</span>
          </button>

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
        <div className="landing-nav-actions">
          {!isLoggedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => onOpenAuth('login')}
              >
                Login
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => onOpenAuth('register')}
              >
                Register
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* User Identity Profile Button (Clickable to Edit Profile) */}
              <button
                type="button"
                onClick={onOpenEditProfile}
                title="Click to view & edit your profile details"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  background: isAdmin ? 'rgba(0, 245, 155, 0.12)' : 'rgba(255, 255, 255, 0.06)',
                  border: `1px solid ${isAdmin ? 'rgba(0, 245, 155, 0.35)' : 'rgba(255, 255, 255, 0.15)'}`,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  color: '#ffffff',
                  transition: 'all 0.2s ease'
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: isAdmin ? 'linear-gradient(135deg, #00f59b 0%, #00d2ff 100%)' : 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
                    color: '#07090e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.74rem'
                  }}
                >
                  {currentUser.username.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontWeight: 700, color: '#f8fafc' }}>
                  {currentUser.username}
                </span>
                {isAdmin ? (
                  <span
                    style={{
                      background: 'rgba(0, 245, 155, 0.2)',
                      color: '#00f59b',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.68rem',
                      fontWeight: 800
                    }}
                  >
                    Admin 🛡️
                  </span>
                ) : (
                  <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 600 }}>Profile ⚙️</span>
                )}
              </button>

              {/* Logout Button */}
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={onLogout}
                title="Log out from Music Marshall"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
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

          <button
            type="button"
            className="landing-mobile-menu-item"
            onClick={() => handleNavClick('mixes')}
          >
            <Headphones size={18} />
            <span>Listen to Music</span>
          </button>

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
