import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Disc3,
  Phone,
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
  MapPin,
  ExternalLink,
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
  hideNav?: boolean;
  onPlaySong?: (song: Song) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  mmReleases,
  allMixes = [],
  currentUser,
  landingFeatureImage: _landingFeatureImage,
  flyers = [],
  onSubmitTicket,
  onOpenApp,
  onOpenAuth,
  onLogout,
  onOpenAdmin,
  hideNav = false,
  onPlaySong
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

  // Active audio player state for My MM Releases & Featured Mix
  const [activeTrack, setActiveTrack] = useState<Song>(mmReleases[0] || null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Featured Mix for Home Screen (PDF Item 4)
  const featuredMix = allMixes.length > 0
    ? allMixes[0]
    : mmReleases.find(s => s.isMix || s.title.toLowerCase().includes('mix') || s.title.toLowerCase().includes('juggling') || s.title.toLowerCase().includes('medley')) || mmReleases[0];
  
  const isPlayingFeaturedMix = isPlaying && activeTrack?.id === featuredMix?.id;

  const handleToggleFeaturedMix = () => {
    if (!featuredMix) return;
    handleSelectRelease(featuredMix);
  };

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
    if (onPlaySong) {
      onPlaySong(song);
      setActiveTrack(song);
      return;
    }
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

  const handleListenMusicClick = () => {
    if (currentUser && onOpenApp) {
      onOpenApp('mixes');
    } else if (onOpenApp) {
      onOpenApp('mixes');
    } else {
      onOpenAuth('login');
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
          ANCHORED NAVIGATION BAR (Sticky, always visible when not hidden by parent)
          ========================================================================== */}
      {!hideNav && (
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
            <button
              type="button"
              className="landing-nav-link-btn"
              onClick={handleListenMusicClick}
              title="Listen to Music & Mixes"
            >
              <Headphones size={15} />
              <span>Listen to Music</span>
            </button>
            <a href="#mm-releases">My MM Productions</a>
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
            <button
              type="button"
              className="landing-mobile-menu-item"
              onClick={() => {
                setMobileMenuOpen(false);
                handleListenMusicClick();
              }}
            >
              <Headphones size={18} />
              <span>Listen to Music</span>
            </button>
            <a
              href="#mm-releases"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Disc3 size={18} />
              <span>My MM Productions</span>
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
      )}

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
          <h1 className="landing-hero-title">
            <span className="highlight-text">Music Marshall</span>
          </h1>

          <p style={{ fontSize: '1.05rem', color: '#94a3b8', maxWidth: '540px', lineHeight: 1.6, marginBottom: '24px' }}>
            This platform provides a wide variety of music to satisfy the different tastes and preferences of listeners. Whether you enjoy reggae, dancehall, R&amp;B, hip-hop, soca, old-school classics, or today’s hits, there is a mix that will keep you entertained and engaged. Start listening now !!
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
          SECTION: MUSIC MARSHALL FEATURED MIX (PDF Item 4)
          "Music Marshall Featured Mix - Stream Free Without Login"
          ========================================================================== */}
      <section className="landing-featured-mix-banner-wrap" style={{ padding: '0 24px 28px' }}>
        <div className="section-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="featured-mix-stream-bar" style={{
            background: 'rgba(11, 15, 25, 0.95)',
            border: '1.5px solid rgba(0, 245, 155, 0.35)',
            borderRadius: '16px',
            padding: '18px 26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.45)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(0, 245, 155, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00f59b',
                flexShrink: 0
              }}>
                <Headphones size={24} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.18rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
                  Music Marshall Featured Mix -
                </div>
                <div style={{ color: '#00f59b', fontWeight: 700, fontSize: '0.94rem' }}>
                  Stream Free Without Login
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-accent btn-md"
              onClick={handleToggleFeaturedMix}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px', fontWeight: 800, borderRadius: '9999px' }}
            >
              {isPlayingFeaturedMix ? <Pause size={17} fill="white" /> : <Play size={17} fill="white" />}
              <span>{isPlayingFeaturedMix ? 'Pause Featured Mix' : 'Stream Free Without Login'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          SECTION: NOTICE BOARD & VERIFIED EVENT FLYERS (PDF Item 6 & 7)
          ========================================================================== */}
      <section id="notice-board" className="landing-section">
        <div className="section-container">
          <div className="section-title-wrap">
            <div className="section-kicker section-kicker-amber">
              <Calendar size={14} />
              <span>Verified Notice Board & Events</span>
            </div>
            <h2 className="landing-section-h2">Event Flyers & Other Notices</h2>
            <p className="landing-section-desc">
              Promoters can upload flyers and they will be posted free. Contact us for more details
            </p>
          </div>

          {/* Flyers Grid or Promotional Noticeboard Placeholder */}
          {flyers.length === 0 ? (
            <div className="flyers-empty-state" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.15)', borderRadius: '16px', padding: '36px 20px', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'rgba(0, 245, 155, 0.1)', color: '#00f59b', marginBottom: '14px' }}>
                <Calendar size={28} />
              </div>
              <h3 className="empty-title" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
                Notice Board & Event Feature
              </h3>
              <p className="empty-desc" style={{ maxWidth: '520px', margin: '0 auto 16px', color: '#94a3b8', lineHeight: 1.6, fontSize: '0.94rem' }}>
                Promoters can upload flyers and they will be posted free. Contact us for more details and to get your event listed on Music Marshall.
              </p>
              <a href="#contact-us" className="btn btn-outline btn-sm">
                <span>Contact Us to Post a Flyer</span>
              </a>
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
          SECTION: MY MM PRODUCTIONS (PLACED AT BOTTOM OF HOME PAGE)
          ========================================================================== */}
      <section id="mm-releases" className="landing-section bg-secondary">
        <div className="section-container">
          <div className="section-title-wrap">
            <h2 className="landing-section-h2">My MM Productions</h2>
            <p className="landing-section-desc">
              My Music Marshall is affiliated to MY MM Productions Label and is authorized to stream and allow downloads of the releases below.
              <br />
              Click any song to listen or download.
            </p>
          </div>

          <div className="releases-list-box">
            {mmReleases.map((song) => {
              const isSelected = activeTrack?.id === song.id;
              return (
                <div
                  key={song.id}
                  className={`release-row ${isSelected ? 'is-active' : ''}`}
                  onClick={() => handleSelectRelease(song)}
                >
                  <div style={{ position: 'relative', width: '44px', height: '44px', flexShrink: 0 }}>
                    <img src="/headphone_logo.png" alt={song.title} className="release-thumb" style={{ width: '100%', height: '100%', display: 'block' }} />
                    {isSelected && isPlaying && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="mini-equalizer">
                          <span className="eq-bar"></span>
                          <span className="eq-bar"></span>
                          <span className="eq-bar"></span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="release-info">
                    <span className="release-title">{song.title}</span>
                    {song.artist?.trim() ? <span className="release-artist">{song.artist}</span> : null}
                  </div>

                  {/* Note 5: Display Genre from Table */}
                  <div className="release-genre">
                    <span className="badge-genre">{song.genre}</span>
                  </div>

                  <div className="release-duration">
                    {formatTime(song.duration)}
                  </div>

                  {/* Note 6: Add Download functionality for MY MM Releases */}
                  <div className="release-actions" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={song.audioUrl}
                      download={song.artist?.trim() ? `${song.title} - ${song.artist}.mp3` : `${song.title}.mp3`}
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
        <div className="section-container" style={{ maxWidth: '780px', margin: '0 auto' }}>
          <div className="section-title-wrap" style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 className="landing-section-h2">Contact Music Marshall</h2>
          </div>

          <div>
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
            &copy; 2026 OKM Software. All Rights Reserved.
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
