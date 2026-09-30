import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Sparkles,
  Phone,
  Disc3,
  ShieldCheck,
  Headphones,
  Lock,
  Home,
  Menu,
  X,
  Calendar,
  Send,
  Download,
  LogOut,
  Radio,
  MapPin,
  ExternalLink,
  Mail,
  CheckCircle2
} from 'lucide-react';
import type { Song, User, EventFlyer, SupportTicket } from '../types';

interface LandingPageProps {
  mmReleases: Song[];
  allMixes?: Song[];
  currentUser: User | null;
  landingFeatureImage?: string;
  flyers?: EventFlyer[];
  supportTickets?: SupportTicket[];
  onSubmitTicket?: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>) => void;
  onOpenApp?: (tab?: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout?: () => void;
  onOpenAdmin?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  mmReleases,
  allMixes: _allMixes = [],
  currentUser,
  landingFeatureImage: _landingFeatureImage,
  flyers = [],
  onSubmitTicket,
  onOpenApp,
  onOpenAuth,
  onLogout,
  onOpenAdmin
}) => {
  // Mobile navigation state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Landing page support inquiry form state
  const [tktName, setTktName] = useState(currentUser?.username || '');
  const [tktEmail, setTktEmail] = useState(currentUser?.email || '');
  const tktCategory: SupportTicket['category'] = 'Technical Support';
  const tktPriority: SupportTicket['priority'] = 'medium';
  const [tktSubject, setTktSubject] = useState('');
  const [tktMessage, setTktMessage] = useState('');
  const [tktSuccess, setTktSuccess] = useState<string | null>(null);

  const handleLandingTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = currentUser?.username || tktName.trim();
    const finalEmail = currentUser?.email || tktEmail.trim();

    if (!finalName || !finalEmail || !tktSubject.trim() || !tktMessage.trim()) return;

    if (onSubmitTicket) {
      onSubmitTicket({
        userId: currentUser?.id,
        username: finalName,
        email: finalEmail,
        subject: tktSubject.trim(),
        category: tktCategory,
        priority: tktPriority,
        message: tktMessage.trim()
      });
    }

    setTktSubject('');
    setTktMessage('');
    setTktSuccess('✓ Your support request has been submitted to the Marshall Technical & Admin desk!');
    setTimeout(() => setTktSuccess(null), 6000);
  };

  // Active audio player state for My MM Releases
  const [activeTrack, setActiveTrack] = useState<Song>(mmReleases[0] || null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Audio element listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlayEvent = () => setIsPlaying(true);
    const handlePauseEvent = () => setIsPlaying(false);
    const handleEnded = () => {
      const currentIndex = mmReleases.findIndex(r => r.id === activeTrack?.id);
      const nextIndex = (currentIndex + 1) % mmReleases.length;
      handleSelectRelease(mmReleases[nextIndex]);
    };

    audio.addEventListener('play', handlePlayEvent);
    audio.addEventListener('pause', handlePauseEvent);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlayEvent);
      audio.removeEventListener('pause', handlePauseEvent);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [activeTrack, mmReleases]);

  const handleSelectRelease = (song: Song) => {
    if (activeTrack?.id === song.id) {
      if (audioRef.current) {
        if (audioRef.current.paused) {
          audioRef.current.play().catch(err => console.warn('Play error:', err));
        } else {
          audioRef.current.pause();
        }
      }
    } else {
      setActiveTrack(song);
      if (audioRef.current) {
        audioRef.current.src = song.audioUrl;
        audioRef.current.load();
        audioRef.current.play().catch(err => console.warn('Play error:', err));
      }
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="landing-wrap">
      {/* Hidden public audio element for My MM Releases */}
      <audio
        ref={audioRef}
        src={activeTrack?.audioUrl}
        preload="metadata"
      />

      {/* ==========================================================================
          ANCHORED NAVIGATION BAR (Sticky, always visible)
          ========================================================================== */}
      <header className="landing-nav" id="top-nav">
        <div className="landing-nav-inner">
          {/* Logo with Animated Headphone and Authentic Audio in italics */}
          <div className="landing-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
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

          {/* Navigation Links using current button style */}
          <nav className="landing-links">
            <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              Home
            </a>
            {currentUser && onOpenApp && (
              <button
                type="button"
                className="landing-nav-link-btn"
                onClick={() => onOpenApp('mixes')}
                title="Listen to Music (VIP Member Access)"
              >
                <Headphones size={15} />
                <span>Listen to Music</span>
              </button>
            )}
            <a href="#mm-releases">My MM Releases</a>
            <a href="#notice-board">Notice Board</a>
            <a href="#contact-us">Contact Us</a>
          </nav>

          {/* Nav Right Action: Login / Logout */}
          <div className="landing-nav-actions">
            {!currentUser ? (
              <button className="btn btn-outline btn-sm" onClick={() => onOpenAuth('login')}>
                Login
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {currentUser.role === 'admin' && onOpenAdmin && (
                  <button className="btn btn-outline btn-sm" onClick={onOpenAdmin} title="Open Administrator Control Center">
                    <ShieldCheck size={14} color="#00f59b" />
                    <span>Admin Panel</span>
                  </button>
                )}
                <button
                  className="btn btn-primary btn-sm"
                  onClick={onLogout}
                  title={`Signed in as ${currentUser.username}. Click to log out.`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <LogOut size={13} />
                  <span>Logout ({currentUser.username})</span>
                </button>
              </div>
            )}

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
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setMobileMenuOpen(false);
              }}
            >
              <Home size={18} />
              <span>Home</span>
            </a>
            {currentUser && onOpenApp && (
              <button
                type="button"
                className="landing-mobile-menu-item"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenApp('mixes');
                }}
              >
                <Headphones size={18} />
                <span>Listen to Music</span>
              </button>
            )}
            <a
              href="#mm-releases"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Disc3 size={18} />
              <span>My MM Releases</span>
            </a>
            <a
              href="#notice-board"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Calendar size={18} />
              <span>Notice Board</span>
            </a>
            <a
              href="#contact-us"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Phone size={18} />
              <span>Contact Us</span>
            </a>

            <div className="mobile-menu-actions">
              {!currentUser ? (
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '8px' }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                >
                  <span>Login</span>
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '8px' }}>
                  {currentUser.role === 'admin' && onOpenAdmin && (
                    <button
                      className="btn btn-outline"
                      style={{ width: '100%' }}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenAdmin();
                      }}
                    >
                      <ShieldCheck size={15} color="#00f59b" />
                      <span>Admin Panel</span>
                    </button>
                  )}
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onLogout) onLogout();
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

      {/* ==========================================================================
          HERO SECTION (Simplified, attractive, uncluttered)
          ========================================================================== */}
      <section className="landing-hero">
        <div className="landing-hero-backdrop">
          <div className="soundwave-container">
            <div className="soundwave-bar"></div>
            <div className="soundwave-bar"></div>
            <div className="soundwave-bar"></div>
            <div className="soundwave-bar"></div>
            <div className="soundwave-bar"></div>
            <div className="soundwave-bar"></div>
            <div className="soundwave-bar"></div>
            <div className="soundwave-bar"></div>
          </div>
        </div>

        <div className="landing-hero-content">
          {/* Note 1 (Handwritten): Remove ARCHIVES from "Official High Definition Audio" */}
          <div className="hero-badge-pill">
            <Radio size={14} className="pulse-icon" />
            <span>Official High Definition Audio</span>
          </div>

          <h1 className="landing-hero-title">
            The Authentic Sound of <span className="highlight-text">Music Marshall</span>
          </h1>

          <p style={{ fontSize: '1.05rem', color: '#94a3b8', maxWidth: '520px', lineHeight: 1.6, marginBottom: '24px' }}>
            Experience original roots reggae, lovers rock, and exclusive studio soundclash masters directly from Jamaica and London.
          </p>

          <div className="hero-actions-row">
            {/* Note 2 (Handwritten): Change to "Play MY MM Releases (No login needed)" */}
            <a
              href="#mm-releases"
              className="btn btn-accent btn-lg"
              onClick={() => {
                if (!isPlaying && mmReleases.length > 0) {
                  handleSelectRelease(mmReleases[0]);
                }
              }}
            >
              <Play size={18} fill="white" />
              <span>Play MY MM Releases (No login needed)</span>
            </a>

            {/* Note 3 (Handwritten): Sign up (100% free) to listen to Audio Mixes */}
            {!currentUser ? (
              <button className="btn btn-primary btn-lg" onClick={() => onOpenAuth('register')}>
                <Lock size={16} />
                <span>Sign up (100% free) to listen to Audio Mixes</span>
              </button>
            ) : (
              <button
                className="btn btn-primary btn-lg"
                onClick={() => onOpenApp && onOpenApp('mixes')}
                title="Listen to Music (VIP Player)"
              >
                <Headphones size={18} />
                <span>Listen to Music (VIP Player)</span>
              </button>
            )}
          </div>
          {/* Note 7 (Handwritten): "Remove 3 lines under Sign up" -> hero-feature-tags removed! */}
        </div>

        <div className="landing-hero-visual">
          <div className="hero-headphone-showcase">
            <img
              src="/headphone_logo.png"
              alt="Music Marshall Authentic Audio"
              className="hero-headphone-img"
            />
          </div>
        </div>
      </section>


      {/* ==========================================================================
          SECTION: NOTICE BOARD & VERIFIED EVENT FLYERS
          ========================================================================== */}
      <section id="notice-board" className="landing-section">
        <div className="section-container">
          <div className="section-title-wrap">
            <div className="section-kicker section-kicker-amber">
              <Calendar size={14} />
              <span>Verified Notice Board & Events</span>
            </div>
            <h2 className="landing-section-h2">Event Flyers & Studio Notices</h2>
            <p className="landing-section-desc">
              Official soundclash dates, festival schedules, and live studio announcements.
              Notices are verified and posted exclusively by Marshall Administration.
            </p>
          </div>

          {/* Flyers Grid */}
          {flyers.length === 0 ? (
            <div className="flyers-empty-state">
              <Calendar size={36} color="#64748b" style={{ margin: '0 auto 10px' }} />
              <h3 className="empty-title">No Event Notices Posted Yet</h3>
              <p className="empty-desc">Check back soon for upcoming soundclash dates and concert flyers.</p>
            </div>
          ) : (
            <div className="flyers-grid">
              {flyers.map((flyer) => (
                <div key={flyer.id} className="flyer-card">
                  <div className="flyer-img-wrap">
                    <img
                      src={flyer.flyerUrl}
                      alt={flyer.title}
                      className="flyer-img"
                    />
                    <div className="flyer-date-badge">
                      <Calendar size={12} />
                      <span>{flyer.eventDate}</span>
                    </div>
                  </div>

                  <div className="flyer-card-body">
                    <h3 className="flyer-title">{flyer.title}</h3>
                    <div className="flyer-location">
                      <MapPin size={14} color="#ffb703" />
                      <span>{flyer.location}</span>
                    </div>
                    <p className="flyer-desc">{flyer.description}</p>

                    <div className="flyer-footer">
                      <span className="flyer-author">
                        Posted by {flyer.postedBy || 'Admin'}
                      </span>
                      {flyer.externalLink ? (
                        <a
                          href={flyer.externalLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline btn-sm"
                        >
                          <span>Event Tickets</span>
                          <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="badge badge-accent">
                          Verified Notice
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ==========================================================================
          SECTION: MY MM RELEASES (PLACED AT BOTTOM OF HOME PAGE)
          (Handwritten Note 9: "Put List of releases at Bottom of Home Page")
          (Handwritten Note 4: "When 'MY Releases' is selected a List should appear")
          (Handwritten Note 5: "Display Genre from Table")
          (Handwritten Note 6: "Add Download functionality for MY MM Releases")
          ========================================================================== */}
      <section id="mm-releases" className="landing-section bg-secondary">
        <div className="section-container">
          <div className="section-title-wrap">
            <div className="section-kicker">
              <Sparkles size={14} />
              <span>Public Audio Catalog</span>
            </div>
            <h2 className="landing-section-h2">My MM Releases — Stream Free Without Login</h2>
            <p className="landing-section-desc">
              All 16 official releases from <em>mymusicmarshall.com</em> are available right here for instant, unrestricted playback and download.
              No login required. Click any song to listen or download immediately!
            </p>
          </div>

          {/* Table of all 16 free releases with Genre & Download functionality */}
          <div className="releases-grid-header">
            <h4>All 16 Official Master Releases</h4>
            <span style={{ fontSize: '0.84rem', color: '#64748b' }}>Select any track to play or download</span>
          </div>

          <div className="releases-list-box">
            {mmReleases.map((song, idx) => {
              const isSelected = activeTrack?.id === song.id;
              return (
                <div
                  key={song.id}
                  className={`release-row ${isSelected ? 'is-active' : ''}`}
                  onClick={() => handleSelectRelease(song)}
                >
                  <div className="release-col-num">
                    {isSelected && isPlaying ? (
                      <div className="mini-equalizer">
                        <span className="eq-bar"></span>
                        <span className="eq-bar"></span>
                        <span className="eq-bar"></span>
                      </div>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <img src={song.coverUrl} alt={song.title} className="release-thumb" />
                  <div className="release-info">
                    <span className="release-title">{song.title}</span>
                    <span className="release-artist">{song.artist}</span>
                  </div>

                  {/* Note 5 (Handwritten): Display Genre from Table */}
                  <div className="release-genre">
                    <span className="badge-genre">{song.genre}</span>
                  </div>

                  <div className="release-duration">
                    {formatTime(song.duration)}
                  </div>

                  {/* Note 6 (Handwritten): Add Download functionality for MY MM Releases */}
                  <div className="release-actions" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={song.audioUrl}
                      download={`${song.title} - ${song.artist}.mp3`}
                      className="btn-download-table"
                      title={`Download ${song.title}`}
                    >
                      <Download size={13} />
                      <span>Download</span>
                    </a>

                    <div className="release-play-btn">
                      <button
                        className="btn-play-table"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectRelease(song);
                        }}
                        title={isSelected && isPlaying ? 'Pause' : 'Play'}
                      >
                        {isSelected && isPlaying ? <Pause size={14} fill="white" /> : <Play size={14} fill="white" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==========================================================================
          SECTION: CONTACT US & SUPPORT
          ========================================================================== */}
      <section id="contact-us" className="landing-section">
        <div className="section-container" style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div className="section-title-wrap" style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 className="landing-section-h2">Contact Music Marshall</h2>
            <p className="landing-section-desc">
              Direct access to our studio sound desk, artist relations, and technical inquiries.
            </p>
          </div>

          <div className="support-grid">
            {/* Direct Studio Contacts Card */}
            <div className="support-channels-card">
              <div>
                <div className="support-channel-pill">
                  <ShieldCheck size={14} />
                  <span>DIRECT STUDIO CHANNELS</span>
                </div>
                <h3 className="support-channel-title">
                  Connect With Us
                </h3>
                <p className="support-channel-desc">
                  Our team monitors submissions around the clock. Typical response turnaround is under 2 hours.
                </p>

                <div className="support-channel-list">
                  <div className="support-channel-item">
                    <div className="channel-icon-circle channel-icon-emerald">
                      <Phone size={20} />
                    </div>
                    <div>
                      <div className="channel-label">Direct Studio Line</div>
                      <a href="tel:9547018103" className="channel-value">
                        (954) 701-8103
                      </a>
                    </div>
                  </div>

                  <div className="support-channel-item">
                    <div className="channel-icon-circle channel-icon-cyan">
                      <Mail size={20} />
                    </div>
                    <div>
                      <div className="channel-label">Technical Helpdesk</div>
                      <a href="mailto:support@ellivrocorporation.com" className="channel-value">
                        support@ellivrocorporation.com
                      </a>
                    </div>
                  </div>

                  <div className="support-channel-item">
                    <div className="channel-icon-circle channel-icon-amber">
                      <Mail size={20} />
                    </div>
                    <div>
                      <div className="channel-label">Studio & Licensing</div>
                      <a href="mailto:mymusicmarshall@gmail.com" className="channel-value">
                        mymusicmarshall@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Message / Ticket Form */}
            <div className="support-form-card">
              <div className="support-form-header">
                <h3 className="support-form-title">
                  Send A Message
                </h3>
                <span className="badge badge-accent">
                  Direct Desk
                </span>
              </div>

              {tktSuccess && (
                <div className="ticket-success-alert">
                  <CheckCircle2 size={18} color="#00f59b" />
                  <span>{tktSuccess}</span>
                </div>
              )}

              <form onSubmit={handleLandingTicketSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {!currentUser ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Your Name *</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="e.g. John Doe"
                        value={tktName}
                        onChange={(e) => setTktName(e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Your Email *</label>
                      <input
                        type="email"
                        required
                        className="form-control"
                        placeholder="you@example.com"
                        value={tktEmail}
                        onChange={(e) => setTktEmail(e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="ticket-user-badge">
                    <span>Sending as: <strong>{currentUser.username}</strong> ({currentUser.email})</span>
                    <span className="badge badge-accent">Verified User</span>
                  </div>
                )}

                <div className="form-group" style={{ margin: 0 }}>
                  <label>Subject *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="Brief description of your message or inquiry"
                    value={tktSubject}
                    onChange={(e) => setTktSubject(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label>Message *</label>
                  <textarea
                    required
                    rows={4}
                    className="form-control"
                    placeholder="How can we help you? Feel free to ask about releases, mixes, or studio sessions..."
                    value={tktMessage}
                    onChange={(e) => setTktMessage(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-accent"
                  style={{ width: '100%', padding: '14px', fontSize: '0.98rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Send size={16} />
                  <span>Send Message</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          LANDING FOOTER
          ========================================================================== */}
      <footer className="landing-footer">
        <div className="section-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/headphone_logo.png" alt="Logo" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>Music Marshall</span>
              <span style={{ fontSize: '0.72rem', color: '#00f59b', fontStyle: 'italic', fontWeight: 700 }}>Authentic Audio</span>
            </div>
          </div>

          <div style={{ fontSize: '0.84rem', color: '#64748b' }}>
            &copy; 2026 Music Marshall Studio & OKM Software. All Rights Reserved.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {!currentUser ? (
              <button className="btn btn-outline btn-sm" onClick={() => onOpenAuth('login')}>
                Login
              </button>
            ) : (
              <button className="btn btn-outline btn-sm" onClick={onLogout}>
                <LogOut size={12} style={{ marginRight: '5px' }} />
                Logout
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};
