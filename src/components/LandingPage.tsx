import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  ArrowRight,
  Mail,
  Phone,
  Disc3,
  ShieldCheck,
  Headphones,
  Music2,
  Lock,
  ExternalLink,
  Home,
  Menu,
  X,
  Calendar,
  HelpCircle,
  MapPin,
  Send,
  CheckCircle2
} from 'lucide-react';
import type { Song, User, EventFlyer, SupportTicket } from '../types';

interface LandingPageProps {
  mmReleases: Song[];
  currentUser: User | null;
  landingFeatureImage?: string;
  flyers?: EventFlyer[];
  supportTickets?: SupportTicket[];
  onSubmitTicket?: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>) => void;
  onOpenApp: (tab?: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  mmReleases,
  currentUser,
  landingFeatureImage,
  flyers = [],
  onSubmitTicket,
  onOpenApp,
  onOpenAuth
}) => {
  // Mobile navigation state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Landing page support inquiry form state
  const [tktName, setTktName] = useState(currentUser?.username || '');
  const [tktEmail, setTktEmail] = useState(currentUser?.email || '');
  const [tktCategory, setTktCategory] = useState<SupportTicket['category']>('Technical Support');
  const [tktPriority, setTktPriority] = useState<SupportTicket['priority']>('medium');
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

  // Launch Music Lab strictly requires login
  const handleLaunchMusicLab = (tab = 'releases') => {
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }
    onOpenApp(tab);
  };

  // Free public audio player state for My MM Releases
  const [activeRelease, setActiveRelease] = useState<Song>(mmReleases[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(mmReleases[0]?.duration || 240);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Audio element listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handleEnded = () => {
      // Auto play next in releases
      const currentIndex = mmReleases.findIndex(r => r.id === activeRelease?.id);
      const nextIndex = (currentIndex + 1) % mmReleases.length;
      handleSelectRelease(mmReleases[nextIndex]);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [activeRelease, mmReleases]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleSelectRelease = (song: Song) => {
    if (activeRelease?.id === song.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play().catch(() => {});
        setIsPlaying(true);
      }
    } else {
      setActiveRelease(song);
      setCurrentTime(0);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = song.audioUrl;
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const handleTogglePlayPause = () => {
    if (!activeRelease && mmReleases.length > 0) {
      handleSelectRelease(mmReleases[0]);
      return;
    }

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
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
      {/* Hidden public audio element */}
      <audio
        ref={audioRef}
        src={activeRelease?.audioUrl}
        preload="metadata"
      />


      {/* ==========================================================================
          STICKY PUBLIC NAVBAR
          ========================================================================== */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/mm_logo.jpg" alt="Music Marshall" />
            <div className="landing-logo-meta">
              <span className="landing-logo-title">Music Marshall</span>
              <span className="landing-logo-sub">Sound System & Studio</span>
            </div>
          </div>

          <nav className="landing-links">
            <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              Home
            </a>
            <a href="#mm-releases">My MM Releases</a>
            <a href="#notice-board">Notice Board</a>
            <a href="#support-desk">Support & Tickets</a>
            <a href="#about-us">About Us</a>
            <a href="#contact-us">Contact Us</a>
          </nav>

          <div className="landing-nav-actions">
            {!currentUser && (
              <button className="btn btn-outline btn-sm" onClick={() => onOpenAuth('login')}>
                Sign In
              </button>
            )}
            {currentUser ? (
              <button className="btn btn-primary btn-sm" onClick={() => handleLaunchMusicLab('home')}>
                <span>Launch Music Lab</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => onOpenAuth('register')}>
                <Lock size={13} />
                <span>Sign Up to Launch Lab</span>
              </button>
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
              <span>Notice Board & Flyers</span>
            </a>
            <a
              href="#support-desk"
              onClick={() => setMobileMenuOpen(false)}
            >
              <HelpCircle size={18} />
              <span>Support & Tickets</span>
            </a>
            <a
              href="#about-us"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Music2 size={18} />
              <span>About Us</span>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '8px' }}>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('register');
                    }}
                  >
                    <Lock size={15} />
                    <span>Sign Up to Launch Lab</span>
                  </button>
                  <button
                    className="btn btn-outline"
                    style={{ width: '100%' }}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('login');
                    }}
                  >
                    <span>Sign In</span>
                  </button>
                </div>
              ) : (
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '8px' }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLaunchMusicLab('home');
                  }}
                >
                  <span>Launch Music Lab</span>
                  <ArrowRight size={15} />
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ==========================================================================
          HERO SECTION (ANIMATED)
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
          <div className="hero-badge-pill">
            <Radio size={14} className="pulse-icon" />
            <span>Official High-Definition Audio Archives</span>
          </div>

          <h1 className="landing-hero-title">
            The Authentic Sound of <span className="highlight-text">Music Marshall</span>
          </h1>

          <div className="hero-actions-row">
            <a href="#mm-releases" className="btn btn-accent btn-lg">
              <Play size={18} fill="white" />
              <span>Play MM Releases (No Login Needed)</span>
            </a>
            {currentUser ? (
              <button className="btn btn-primary btn-lg" onClick={() => handleLaunchMusicLab('home')}>
                <span>Launch Music Lab & Studio</span>
                <ArrowRight size={18} />
              </button>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={() => onOpenAuth('register')}>
                <Lock size={18} />
                <span>Sign Up to Launch Music Lab</span>
              </button>
            )}
          </div>

          <div className="hero-feature-tags">
            <div className="feature-tag">
              <Headphones size={15} />
              <span>Free Unrestricted MM Releases</span>
            </div>
            <div className="feature-tag">
              <Disc3 size={15} />
              <span>16 Downloaded Studio Masters</span>
            </div>
            <div className="feature-tag">
              <ShieldCheck size={15} />
              <span>Compulsory Referral VIP Club</span>
            </div>
          </div>
        </div>

        <div className="landing-hero-visual">
          <div className="hero-album-stack">
            <img src={landingFeatureImage || "/mm_banner.png"} alt="Music Marshall Banner" className="hero-visual-banner" />
            <div className="hero-floating-card">
              <div className={`floating-card-icon ${isPlaying ? 'pulse-icon' : ''}`}>
                {isPlaying ? (
                  <div className="mini-equalizer">
                    <span className="eq-bar"></span>
                    <span className="eq-bar"></span>
                    <span className="eq-bar"></span>
                  </div>
                ) : (
                  <Music2 size={20} color="#10b981" />
                )}
              </div>
              <div className="floating-card-text">
                <strong>{activeRelease?.title}</strong>
                <span>{activeRelease?.artist}</span>
              </div>
              <button
                className="btn-play-table"
                onClick={handleTogglePlayPause}
                title={isPlaying ? 'Pause' : 'Play Free'}
              >
                {isPlaying ? <Pause size={14} fill="white" /> : <Play size={14} fill="white" />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          SECTION 1: MY MM RELEASES (PLAYABLE WITHOUT LOGIN!)
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
              All 16 official releases from <em>mymusicmarshall.com</em> are available right here for instant, unrestricted playback. 
              No login required. Click any song to listen immediately!
            </p>
          </div>

          {/* Interactive Public Player Card */}
          <div className="public-player-card">
            <div className="public-player-left">
              <div className={`public-player-cover-wrap ${isPlaying ? 'is-playing' : ''}`}>
                <img
                  src={activeRelease?.coverUrl || '/mm_logo.jpg'}
                  alt={activeRelease?.title}
                  className={`public-player-cover ${isPlaying ? 'is-spinning' : ''}`}
                />
              </div>
              <div className="public-player-meta">
                <span className="public-tag-free">Free Public Release</span>
                <h3 className="public-player-title">{activeRelease?.title}</h3>
                <span className="public-player-artist">{activeRelease?.artist}</span>
                <p className="public-player-desc">{activeRelease?.description || activeRelease?.album}</p>

                <div className="public-player-ctrls">
                  <button className="btn btn-accent btn-play-main" onClick={handleTogglePlayPause}>
                    {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
                    <span>{isPlaying ? 'Pause Track' : 'Play Now'}</span>
                  </button>

                  <div className="volume-inline">
                    <button className="ctrl-btn" onClick={() => setIsMuted(!isMuted)}>
                      {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        setVolume(parseFloat(e.target.value));
                        if (isMuted) setIsMuted(false);
                      }}
                      className="volume-slider"
                    />
                  </div>
                </div>

                <div className="scrubber-row">
                  <span className="time-label">{formatTime(currentTime)}</span>
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    step="0.5"
                    value={currentTime}
                    onChange={handleSeek}
                    className="scrubber-slider"
                  />
                  <span className="time-label">{formatTime(duration)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Table of all 16 free releases */}
          <div className="releases-grid-header">
            <h4>All 16 Official Master Releases</h4>
            <span style={{ fontSize: '0.84rem', color: '#64748b' }}>Select any song to listen</span>
          </div>

          <div className="releases-list-box">
            {mmReleases.map((song, idx) => {
              const isSelected = activeRelease?.id === song.id;
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
                  <div className="release-genre">
                    <span className="badge badge-genre">{song.genre}</span>
                  </div>
                  <div className="release-duration">
                    {formatTime(song.duration)}
                  </div>
                  <div className="release-play-btn">
                    <button
                      className="btn-play-table"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectRelease(song);
                      }}
                    >
                      {isSelected && isPlaying ? <Pause size={14} fill="white" /> : <Play size={14} fill="white" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: '28px' }}>
            {currentUser ? (
              <button className="btn btn-primary" onClick={() => handleLaunchMusicLab('releases')}>
                <span>View Releases in Full Web App</span>
                <ExternalLink size={15} />
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => onOpenAuth('register')}>
                <Lock size={15} />
                <span>Sign Up to Launch Music Lab</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ==========================================================================
          SECTION 2: NOTICE BOARD & VERIFIED EVENT FLYERS
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

          {/* Regular User Policy Banner */}
          <div className="landing-policy-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={20} color="#00f59b" style={{ flexShrink: 0 }} />
              <span className="landing-policy-text">
                Public & Member Notice Board: View and download verified event flyers. Uploading notices is reserved for verified administrators.
              </span>
            </div>
            {currentUser?.role === 'admin' && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleLaunchMusicLab('admin')}
              >
                Admin: Post New Flyer
              </button>
            )}
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

          <div style={{ textAlign: 'center', marginTop: '36px' }}>
            <button
              className="btn btn-outline btn-lg"
              onClick={() => handleLaunchMusicLab('notices')}
              style={{ fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Calendar size={18} />
              <span>Open Dedicated Notice Board Desk</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          SECTION 3: TECHNICAL & ADMIN SUPPORT / TICKET SYSTEM
          ========================================================================== */}
      <section id="support-desk" className="landing-section">
        <div className="section-container">
          <div className="section-title-wrap">
            <div className="section-kicker section-kicker-cyan">
              <HelpCircle size={14} />
              <span>24/7 Marshall Helpdesk</span>
            </div>
            <h2 className="landing-section-h2">Technical & Admin Support</h2>
            <p className="landing-section-desc">
              Need assistance with audio playback, account activation, referral passes, or master stems? 
              Contact our engineering team or submit a ticket directly below.
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
                  Connect With Support
                </h3>
                <p className="support-channel-desc">
                  Our technical response team monitors submissions around the clock. Typical response turnaround is under 2 hours.
                </p>

                <div className="support-channel-list">
                  <div className="support-channel-item">
                    <div className="channel-icon-circle channel-icon-emerald">
                      <Phone size={20} />
                    </div>
                    <div>
                      <div className="channel-label">Direct Support Line</div>
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
                      <div className="channel-label">Studio & VIP Inquiries</div>
                      <a href="mailto:mymusicmarshall@gmail.com" className="channel-value">
                        mymusicmarshall@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="support-channels-footer">
                <button
                  className="btn btn-outline"
                  onClick={() => handleLaunchMusicLab('support')}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <HelpCircle size={16} />
                  <span>View All Tickets in Web App</span>
                </button>
              </div>
            </div>

            {/* Interactive Ticket Form */}
            <div className="support-form-card">
              <div className="support-form-header">
                <h3 className="support-form-title">
                  Create Support Ticket
                </h3>
                <span className="badge badge-accent">
                  Direct Queue
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
                    <span>Submitting as: <strong>{currentUser.username}</strong> ({currentUser.email})</span>
                    <span className="badge badge-accent">Verified User</span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Issue Category</label>
                    <select
                      className="form-control"
                      value={tktCategory}
                      onChange={(e) => setTktCategory(e.target.value as any)}
                    >
                      <option value="Technical Support">Technical & Playback</option>
                      <option value="Account & Verification">Account & Verification</option>
                      <option value="Audio Playback">Audio Playback & Download Stems</option>
                      <option value="Admin Inquiry">Admin & Studio Inquiry</option>
                      <option value="General">General Question</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Priority Level</label>
                    <select
                      className="form-control"
                      value={tktPriority}
                      onChange={(e) => setTktPriority(e.target.value as any)}
                    >
                      <option value="low">Low (General Query)</option>
                      <option value="medium">Medium (Standard)</option>
                      <option value="high">High (Playback Issue)</option>
                      <option value="urgent">Urgent (Account Issue)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label>Subject *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="Brief description of your issue"
                    value={tktSubject}
                    onChange={(e) => setTktSubject(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label>Detailed Message *</label>
                  <textarea
                    required
                    rows={4}
                    className="form-control"
                    placeholder="Provide details about the issue or request so our sound team can assist you immediately..."
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
                  <span>Submit Support Request</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          SECTION 4: ABOUT US
          ========================================================================== */}
      <section id="about-us" className="landing-section">
        <div className="section-container">
          <div className="section-title-wrap">
            <div className="section-kicker">
              <Disc3 size={14} />
              <span>Roots & Legacy</span>
            </div>
            <h2 className="landing-section-h2">About Music Marshall</h2>
            <p className="landing-section-desc">
              Dedicated to the preservation, elevation, and global broadcast of authentic soundclash and studio masters.
            </p>
          </div>

          <div className="about-grid">
            <div className="about-card">
              <div className="about-card-icon">🇯🇲</div>
              <h3>Authentic Heritage</h3>
              <p>
                From the bustling sound systems of Kingston, Jamaica to the master dub rooms of London, 
                Music Marshall was built to honor the founding champions of conscious reggae and rocksteady.
              </p>
            </div>

            <div className="about-card">
              <div className="about-card-icon">🎸</div>
              <h3>Legendary Artists</h3>
              <p>
                Home to foundational tracks by <strong>Wayne Armond</strong> (Chalice co-founder), 
                <strong>Stevie Malekuu</strong>, <strong>Luciano</strong> (The Messenger), saxophone maestro 
                <strong>Yishka</strong>, and vibrant talent <strong>Teacha Barnes</strong>.
              </p>
            </div>

            <div className="about-card">
              <div className="about-card-icon">🎛️</div>
              <h3>Studio Master Quality</h3>
              <p>
                Uncompressed acoustics captured directly from original reel-to-reel and multi-track mixing boards. 
                Experience every baseline, horn riff, and vocal nuance without lossy digital compression.
              </p>
            </div>
          </div>

          <div className="about-quote-box">
            <blockquote className="about-quote">
              “Whatever will be, let the righteousness shine. Music Marshall frequency, elevating your mind.”
            </blockquote>
            <span className="about-quote-author">— Stevie Malekuu, <em>What Will Be</em></span>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          SECTION 4: CONTACT
          ========================================================================== */}
      <section id="contact-us" className="landing-section">
        <div className="section-container" style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'center' }}>
          <div className="section-title-wrap" style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 className="landing-section-h2">
              Contact Music Marshall
            </h2>
            <p className="landing-section-desc">
              Direct access to our sound system management, mastering studio, and licensing desks.
            </p>
          </div>

          <div className="contact-cards-grid">
            {/* Phone */}
            <div className="contact-card">
              <div className="contact-icon-wrap contact-icon-emerald">
                <Phone size={26} />
              </div>
              <span className="contact-label">PHONE SUPPORT</span>
              <a href="tel:9547018103" className="contact-value">
                (954) 701-8103
              </a>
              <a
                href="tel:9547018103"
                className="btn btn-outline"
                style={{ width: '100%', minHeight: '48px', fontWeight: 700 }}
              >
                Call Direct
              </a>
            </div>

            {/* Support */}
            <div className="contact-card">
              <div className="contact-icon-wrap contact-icon-cyan">
                <Mail size={26} />
              </div>
              <span className="contact-label">TECHNICAL DESK</span>
              <a href="mailto:support@ellivrocorporation.com" className="contact-value" style={{ fontSize: '0.95rem' }}>
                support@ellivrocorporation.com
              </a>
              <a
                href="mailto:support@ellivrocorporation.com"
                className="btn btn-accent"
                style={{ width: '100%', minHeight: '48px', fontWeight: 700 }}
              >
                Email Support
              </a>
            </div>

            {/* Marketing */}
            <div className="contact-card">
              <div className="contact-icon-wrap contact-icon-amber">
                <Mail size={26} />
              </div>
              <span className="contact-label">STUDIO & LICENSING</span>
              <a href="mailto:mymusicmarshall@gmail.com" className="contact-value" style={{ fontSize: '0.95rem' }}>
                mymusicmarshall@gmail.com
              </a>
              <a
                href="mailto:mymusicmarshall@gmail.com"
                className="btn btn-primary"
                style={{ width: '100%', minHeight: '48px', fontWeight: 700 }}
              >
                Email Marketing
              </a>
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
            <img src="/mm_logo.jpg" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '6px' }} />
            <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>Music Marshall</span>
          </div>

          <div style={{ fontSize: '0.84rem', color: '#64748b' }}>
            &copy; 2026 Music Marshall Studio & OKM Software. All Rights Reserved.
          </div>

          <div>
            {currentUser ? (
              <button className="btn btn-outline btn-sm" onClick={() => handleLaunchMusicLab('home')}>
                Launch Music Lab
              </button>
            ) : (
              <button className="btn btn-outline btn-sm" onClick={() => onOpenAuth('register')}>
                <Lock size={12} style={{ marginRight: '5px' }} />
                Sign Up to Launch Lab
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};
