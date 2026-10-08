import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Download,
  X,
  AlertCircle,
  Headphones,
  Lock,
  CheckCircle2
} from 'lucide-react';
import type {
  Song,
  User,
  ReferralCode,
  AppPage,
  Playlist,
  EventFlyer,
  SupportTicket,
  UserPreferences
} from './types';
import {
  INITIAL_SONGS,
  INITIAL_REFERRAL_CODES,
  INITIAL_USERS,
  INITIAL_PLAYLISTS,
  INITIAL_FLYERS,
  INITIAL_SUPPORT_TICKETS
} from './data/initialSongs';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { MusicMixesView } from './components/MusicMixesView';
import { ReleasesView } from './components/ReleasesView';
import { NoticeBoardView } from './components/NoticeBoardView';
import { SupportView } from './components/SupportView';
import { CreatePlaylistPage } from './components/CreatePlaylistPage';
import { AdminPanelView } from './components/AdminPanelView';
import { PreferencesModal } from './components/PreferencesModal';
import { WelcomeEmailModal } from './components/WelcomeEmailModal';
import { EditProfileModal } from './components/EditProfileModal';

export function App() {
  // --- Persistent Storage State ---
  const [songs, setSongs] = useState<Song[]>(() => {
    const saved = localStorage.getItem('mm_songs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_SONGS.length) {
          return parsed.map((s: Song) => {
            const initSong = INITIAL_SONGS.find((init) => init.id === s.id);
            if (initSong) {
              return {
                ...s,
                title: initSong.title,
                artist: initSong.artist,
                description: initSong.description,
                album: initSong.album,
                coverUrl: '/headphone_logo.png',
                genre: initSong.genre || s.genre,
                isMmRelease: initSong.isMmRelease
              };
            }
            return s;
          });
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_SONGS;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('mm_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const cleaned = parsed.filter((u: User) => u.email !== 'marcus@reggae.com' && u.email !== 'sarah.t@sound.fm');
        const updated = cleaned.map((u: User) => {
          const isAdm = u.role === 'admin';
          return {
            ...u,
            isEmailVerified: isAdm ? true : (u.isEmailVerified ?? false),
            accountStatus: isAdm ? 'approved' : (u.accountStatus || 'pending_approval'),
            verifiedAt: isAdm ? (u.verifiedAt || '2026-01-01') : u.verifiedAt
          };
        });
        if (updated.length > 0) return updated;
      } catch {
        // fallback
      }
    }
    return INITIAL_USERS;
  });

  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>(() => {
    const saved = localStorage.getItem('mm_referral_codes');
    return saved ? JSON.parse(saved) : INITIAL_REFERRAL_CODES;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('mm_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // --- Active Page Navigation State ---
  const [currentPage, setCurrentPage] = useState<AppPage>('home');

  // --- Auth Modal & Form State ---
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regReferralCode, setRegReferralCode] = useState('');
  const [regError, setRegError] = useState<string | null>(null);

  // Welcome modal after registration
  const [welcomeEmailModalOpen, setWelcomeEmailModalOpen] = useState(false);
  const [welcomeEmailUser, setWelcomeEmailUser] = useState<User | null>(null);

  // Preferences modal
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('mm_user_preferences');
    return saved ? JSON.parse(saved) : { repeatMixLoop: true, stopNewMixAlerts: false };
  });

  // Notifications Toast
  const [adminToast, setAdminToast] = useState<string | null>(null);

  // Playlists, Event Flyers & Support Tickets
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem('mm_playlists');
    return saved ? JSON.parse(saved) : INITIAL_PLAYLISTS;
  });

  const [flyers, setFlyers] = useState<EventFlyer[]>(() => {
    const saved = localStorage.getItem('mm_flyers');
    return saved ? JSON.parse(saved) : INITIAL_FLYERS;
  });

  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('mm_support_tickets');
    return saved ? JSON.parse(saved) : INITIAL_SUPPORT_TICKETS;
  });

  // Feature banners
  const [landingFeatureImage, setLandingFeatureImage] = useState<string>(() => {
    return localStorage.getItem('mm_landing_feature_image') || '/mm_banner.png';
  });
  const [dashboardFeatureImage, setDashboardFeatureImage] = useState<string>(() => {
    return localStorage.getItem('mm_dashboard_feature_image') || '/mm_banner.png';
  });

  // Audio Playback Engine
  const mmReleases = songs.filter((s) => s.isMmRelease);
  const [currentSong, setCurrentSong] = useState<Song | null>(() => mmReleases[0] || songs[0] || null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('mm_songs', JSON.stringify(songs));
  }, [songs]);

  useEffect(() => {
    localStorage.setItem('mm_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('mm_referral_codes', JSON.stringify(referralCodes));
  }, [referralCodes]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('mm_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('mm_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('mm_playlists', JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem('mm_flyers', JSON.stringify(flyers));
  }, [flyers]);

  useEffect(() => {
    localStorage.setItem('mm_support_tickets', JSON.stringify(supportTickets));
  }, [supportTickets]);

  useEffect(() => {
    localStorage.setItem('mm_landing_feature_image', landingFeatureImage);
  }, [landingFeatureImage]);

  useEffect(() => {
    localStorage.setItem('mm_dashboard_feature_image', dashboardFeatureImage);
  }, [dashboardFeatureImage]);

  useEffect(() => {
    localStorage.setItem('mm_user_preferences', JSON.stringify(preferences));
  }, [preferences]);

  // Audio Player Event Listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      if (isPlaying) {
        audio.play().catch((err) => console.log('Audio auto-resume notice:', err));
      }
    };
    const handleEnded = () => {
      if (preferences.repeatMixLoop) {
        audio.currentTime = 0;
        audio.play().catch((e) => console.log('Loop playback notice:', e));
      } else {
        handleNextSong();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentSong, preferences.repeatMixLoop, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Playback Handlers
  const handlePlaySong = (song: Song) => {
    if (!song.isMmRelease && !currentUser) {
      setAuthMessage('🔒 Sign in or register to stream full VIP studio tracks.');
      setAuthTab('login');
      setAuthModalOpen(true);
      return;
    }

    if (currentSong?.id === song.id) {
      handleTogglePlayPause();
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = song.audioUrl;
        audioRef.current.load();
        audioRef.current.play().catch((err) => console.log('Audio playback notice:', err));
      }
    }
  };

  const handleTogglePlayPause = () => {
    if (!currentSong) {
      if (mmReleases[0]) handlePlaySong(mmReleases[0]);
      return;
    }

    if (!currentSong.isMmRelease && !currentUser) {
      setAuthMessage('🔒 Please log in to stream VIP audio catalog.');
      setAuthTab('login');
      setAuthModalOpen(true);
      return;
    }

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play().catch((err) => console.log('Play resume notice:', err));
      setIsPlaying(true);
    }
  };

  const handleNextSong = () => {
    const list = songs;
    if (list.length === 0) return;
    const currentIndex = list.findIndex((s) => s.id === currentSong?.id);
    const nextIndex = (currentIndex + 1) % list.length;
    handlePlaySong(list[nextIndex]);
  };

  const handlePrevSong = () => {
    const list = songs;
    if (list.length === 0) return;
    const currentIndex = list.findIndex((s) => s.id === currentSong?.id);
    const prevIndex = (currentIndex - 1 + list.length) % list.length;
    handlePlaySong(list[prevIndex]);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Auth Handlers
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailClean = loginEmail.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === emailClean);

    if (!user) {
      setAuthMessage('Account not found. Please register with a VIP referral code.');
      return;
    }

    if (loginPassword.trim() !== 'admin123' && loginPassword.trim() !== 'marshall123' && loginPassword.length < 4) {
      setAuthMessage('Invalid password. Please re-enter credentials.');
      return;
    }

    setCurrentUser(user);
    setAuthModalOpen(false);
    setLoginEmail('');
    setLoginPassword('');
    setAuthMessage(null);

    if (user.role === 'admin') {
      setCurrentPage('admin');
      setAdminToast('✓ Administrator signed in. Admin Panel loaded.');
    } else {
      setAdminToast(`✓ Welcome back, ${user.username}!`);
    }
    setTimeout(() => setAdminToast(null), 3500);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFirstName = regFirstName.trim();
    const cleanLastName = regLastName.trim();
    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanCode = regReferralCode.trim().toUpperCase();

    if (!cleanFirstName || !cleanEmail || !regPassword) {
      setRegError('Please provide all required fields.');
      return;
    }

    const codeExists = referralCodes.some((rc) => rc.code.toUpperCase() === cleanCode);
    if (!codeExists) {
      setRegError(`Invalid promo code "${cleanCode}". Membership is strictly by invitation.`);
      return;
    }

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      setRegError('An account with this email address already exists. Please log in.');
      return;
    }

    // Increment code uses
    setReferralCodes((prev) =>
      prev.map((rc) => (rc.code.toUpperCase() === cleanCode ? { ...rc, uses: rc.uses + 1 } : rc))
    );

    const fullName = cleanLastName ? `${cleanFirstName} ${cleanLastName}` : cleanFirstName;
    const prefix = (cleanFirstName.replace(/[^a-zA-Z]/g, '').slice(0, 4) || 'USER').toUpperCase();
    const newUserCode = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newUser: User = {
      id: `usr-${Date.now()}`,
      username: fullName,
      firstName: cleanFirstName,
      lastName: cleanLastName || undefined,
      email: cleanEmail,
      role: 'user',
      referralCode: newUserCode,
      referredBy: cleanCode,
      createdAt: new Date().toISOString().split('T')[0],
      isEmailVerified: true,
      accountStatus: 'approved'
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setAuthModalOpen(false);

    setWelcomeEmailUser(newUser);
    setWelcomeEmailModalOpen(true);

    // 1. Dispatch welcome email to registered user (with BCC to admin)
    fetch('/api/send-welcome-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: newUser.email,
        username: newUser.username,
        referralCode: newUser.referralCode
      })
    }).catch((err) => console.log('Welcome email dispatch notice:', err));

    // 2. Dispatch new registration notification directly to admin
    fetch('/api/send-admin-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: newUser.username,
        email: newUser.email,
        referralCode: newUser.referralCode
      })
    }).catch((err) => console.log('Admin registration alert notice:', err));

    setAdminToast(`✓ Welcome to Music Marshall, ${cleanFirstName}! Email confirmation dispatched.`);
    setTimeout(() => setAdminToast(null), 4000);

    setRegFirstName('');
    setRegLastName('');
    setRegEmail('');
    setRegPassword('');
    setRegReferralCode('');
    setRegError(null);
    setAuthMessage(null);
  };

  const handleSaveProfile = async (updatedUser: User) => {
    // 1. Update in users array and currentUser
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setCurrentUser(updatedUser);

    // 2. Dispatch profile update notification email to BOTH user and admin
    try {
      await fetch('/api/send-profile-update-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: updatedUser.email,
          username: updatedUser.username,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          phone: updatedUser.phone,
          favoriteGenre: updatedUser.favoriteGenre,
          bio: updatedUser.bio
        })
      });
    } catch (err) {
      console.log('Profile update email notification notice:', err);
    }

    setAdminToast(`✓ Profile updated! Confirmation sent to ${updatedUser.email} & Admin.`);
    setTimeout(() => setAdminToast(null), 4000);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('home');
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    }
    setAdminToast('✓ You have been logged out.');
    setTimeout(() => setAdminToast(null), 3000);
  };

  // User Management Handlers (Admin)
  const handleUpdateUser = (updatedUser: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // Playlist Handlers
  const handleCreatePlaylist = (name: string, description: string, songIds: string[]) => {
    const newPl: Playlist = {
      id: `pl-${Date.now()}`,
      name,
      description,
      createdBy: currentUser ? currentUser.username : 'Music Marshall Member',
      createdAt: new Date().toISOString().split('T')[0],
      songIds,
      coverUrl: '/mm_banner.png'
    };
    setPlaylists((prev) => [newPl, ...prev]);
  };

  const handleDeletePlaylist = (id: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
  };

  const handleRemoveSongFromPlaylist = (playlistId: string, songId: string) => {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId ? { ...p, songIds: p.songIds.filter((sId) => sId !== songId) } : p
      )
    );
  };

  const handleAddToPlaylist = (mixId: string, playlistId: string) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id === playlistId) {
          if (p.songIds.includes(mixId)) return p;
          return { ...p, songIds: [...p.songIds, mixId] };
        }
        return p;
      })
    );
    const targetPl = playlists.find((p) => p.id === playlistId);
    setAdminToast(`Added track to playlist "${targetPl?.name || 'Playlist'}"!`);
    setTimeout(() => setAdminToast(null), 2500);
  };

  // Event Flyers Handlers
  const handleAddFlyer = (flyerData: Omit<EventFlyer, 'id' | 'createdAt' | 'postedBy'>) => {
    const newFlyer: EventFlyer = {
      ...flyerData,
      id: `flyer-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      postedBy: 'Administrator'
    };
    setFlyers((prev) => [newFlyer, ...prev]);
  };

  const handleDeleteFlyer = (id: string) => {
    setFlyers((prev) => prev.filter((f) => f.id !== id));
    setAdminToast('Event flyer removed from Notice Board.');
    setTimeout(() => setAdminToast(null), 3000);
  };

  // Support Desk Handlers
  const handleSubmitSupportTicket = (ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>) => {
    const newTkt: SupportTicket = {
      ...ticketData,
      id: `tkt-${Date.now()}`,
      status: 'open',
      createdAt: new Date().toISOString()
    };
    setSupportTickets((prev) => [newTkt, ...prev]);
  };

  const handleAdminReplySupportTicket = (
    ticketId: string,
    reply: string,
    status: 'in_progress' | 'resolved'
  ) => {
    setSupportTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              adminReply: reply,
              status,
              resolvedAt: status === 'resolved' ? new Date().toISOString().split('T')[0] : t.resolvedAt
            }
          : t
      )
    );
  };

  // Catalog Handlers (Admin)
  const handleAddSongDirect = (newSong: Song) => {
    setSongs((prev) => [newSong, ...prev]);
  };

  const handleDeleteSong = (songId: string) => {
    setSongs((prev) => prev.filter((s) => s.id !== songId));
    setAdminToast('Track removed from catalog.');
    setTimeout(() => setAdminToast(null), 3000);
  };

  const handleUpdateReferralCode = (oldCode: string, newCode: string, newDesc: string) => {
    setReferralCodes((prev) =>
      prev.map((rc) =>
        rc.code === oldCode ? { ...rc, code: newCode, description: newDesc } : rc
      )
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        background: 'radial-gradient(circle at 50% 0%, #111a2e 0%, #07090e 65%)',
        color: '#f8fafc',
        overflowX: 'hidden'
      }}
    >
      {/* Hidden Native HTML5 Audio Engine */}
      <audio
        ref={audioRef}
        src={currentSong?.audioUrl}
        preload="metadata"
      />

      {/* Persistent Global Top Navigation Bar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={(page) => {
          if (page === 'admin' && currentUser?.role !== 'admin') {
            setAuthMessage('🔒 Administrator access required.');
            setAuthTab('login');
            setAuthModalOpen(true);
            return;
          }
          if (page === 'create-playlist' && !currentUser) {
            setAuthMessage('🔒 Sign in to create and manage custom playlists.');
            setAuthTab('login');
            setAuthModalOpen(true);
            return;
          }
          setCurrentPage(page);
        }}
        currentUser={currentUser}
        onOpenAuth={(mode) => {
          setAuthMessage(null);
          setAuthTab(mode || 'login');
          setAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onOpenPreferences={() => setPreferencesModalOpen(true)}
        onOpenEditProfile={() => setEditProfileModalOpen(true)}
      />

      {/* Notification Toast Alert */}
      {adminToast && (
        <div
          style={{
            position: 'fixed',
            bottom: currentSong ? '100px' : '24px',
            right: '24px',
            zIndex: 9999,
            background: 'rgba(7, 9, 14, 0.95)',
            border: '1px solid #00f59b',
            color: '#00f59b',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7)',
            fontSize: '0.88rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{adminToast}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          width: '100%',
          paddingBottom: currentSong ? '110px' : '40px'
        }}
      >
        {/* VIEW 1: HOME LANDING PAGE */}
        {currentPage === 'home' && (
          <LandingPage
            hideNav={true}
            mmReleases={mmReleases}
            allMixes={songs.filter((s) => s.isMix || s.duration >= 240)}
            currentUser={currentUser}
            landingFeatureImage={landingFeatureImage}
            flyers={flyers}
            supportTickets={supportTickets}
            onSubmitTicket={handleSubmitSupportTicket}
            onOpenApp={(tab) => {
              if (tab === 'mixes') setCurrentPage('mixes');
              else if (tab === 'releases') setCurrentPage('releases');
              else if (tab === 'notices') setCurrentPage('notices');
              else if (tab === 'support') setCurrentPage('support');
              else if (tab === 'playlists' || tab === 'create-playlist') setCurrentPage('create-playlist');
              else if (tab === 'admin') setCurrentPage('admin');
              else setCurrentPage('mixes');
            }}
            onOpenAuth={(mode) => {
              setAuthMessage(null);
              setAuthTab(mode || 'login');
              setAuthModalOpen(true);
            }}
            onLogout={handleLogout}
            onOpenAdmin={() => setCurrentPage('admin')}
            onPlaySong={handlePlaySong}
          />
        )}

        {/* VIEW 2: LISTEN TO MUSIC & MIXES */}
        {currentPage === 'mixes' && (
          <div className="page-container" style={{ maxWidth: '1360px', margin: '0 auto', paddingTop: '28px' }}>
            <MusicMixesView
              songs={songs}
              currentSong={currentSong}
              isPlaying={isPlaying}
              onPlaySong={handlePlaySong}
              onOpenCreatePlaylist={() => {
                if (!currentUser) {
                  setAuthMessage('Sign in to create custom playlists.');
                  setAuthTab('login');
                  setAuthModalOpen(true);
                  return;
                }
                setCurrentPage('create-playlist');
              }}
              onAddToPlaylist={handleAddToPlaylist}
              playlists={playlists}
              currentUser={currentUser}
            />
          </div>
        )}

        {/* VIEW 3: MY MM PRODUCTIONS (FREE OFFICIAL RELEASES) */}
        {currentPage === 'releases' && (
          <div style={{ paddingTop: '28px' }}>
            <ReleasesView
              mmReleases={mmReleases}
              currentSong={currentSong}
              isPlaying={isPlaying}
              onPlaySong={handlePlaySong}
              dashboardFeatureImage={dashboardFeatureImage}
              onNavigateHome={() => setCurrentPage('home')}
            />
          </div>
        )}

        {/* VIEW 4: NOTICE BOARD & EVENT FLYERS */}
        {currentPage === 'notices' && (
          <div className="page-container" style={{ maxWidth: '1360px', margin: '0 auto', paddingTop: '28px' }}>
            <NoticeBoardView
              flyers={flyers}
              currentUser={currentUser}
              onOpenAdminFlyerUpload={() => setCurrentPage('admin')}
              onDeleteFlyer={handleDeleteFlyer}
            />
          </div>
        )}

        {/* VIEW 5: SUPPORT DESK */}
        {currentPage === 'support' && (
          <div className="page-container" style={{ maxWidth: '1360px', margin: '0 auto', paddingTop: '28px' }}>
            <SupportView
              currentUser={currentUser}
              tickets={supportTickets}
              onSubmitTicket={handleSubmitSupportTicket}
              onAdminReplyTicket={handleAdminReplySupportTicket}
              onOpenAuth={() => {
                setAuthMessage('Sign in to submit and track your support inquiries.');
                setAuthTab('login');
                setAuthModalOpen(true);
              }}
            />
          </div>
        )}

        {/* VIEW 6: CREATE PLAYLIST (SEPARATE PAGE FOR USER / ADMIN) */}
        {currentPage === 'create-playlist' && (
          <div style={{ paddingTop: '28px' }}>
            <CreatePlaylistPage
              playlists={playlists}
              songs={songs}
              currentSong={currentSong}
              isPlaying={isPlaying}
              onPlaySong={handlePlaySong}
              onCreatePlaylist={handleCreatePlaylist}
              onDeletePlaylist={handleDeletePlaylist}
              onRemoveSongFromPlaylist={handleRemoveSongFromPlaylist}
              currentUser={currentUser}
              onOpenAuth={(mode) => {
                setAuthMessage(null);
                setAuthTab(mode || 'login');
                setAuthModalOpen(true);
              }}
            />
          </div>
        )}

        {/* VIEW 7: ADMIN PANEL (SEPARATE PAGE STRICTLY FOR ADMIN) */}
        {currentPage === 'admin' && (
          <div style={{ paddingTop: '28px' }}>
            <AdminPanelView
              currentUser={currentUser}
              users={users}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              flyers={flyers}
              onAddFlyer={handleAddFlyer}
              onDeleteFlyer={handleDeleteFlyer}
              supportTickets={supportTickets}
              onAdminReplyTicket={handleAdminReplySupportTicket}
              songs={songs}
              onAddSong={handleAddSongDirect}
              onDeleteSong={handleDeleteSong}
              currentSong={currentSong}
              isPlaying={isPlaying}
              onPlaySong={handlePlaySong}
              referralCodes={referralCodes}
              onUpdateReferralCode={handleUpdateReferralCode}
              landingFeatureImage={landingFeatureImage}
              onSaveLandingFeatureImage={(url) => setLandingFeatureImage(url)}
              dashboardFeatureImage={dashboardFeatureImage}
              onSaveDashboardFeatureImage={(url) => setDashboardFeatureImage(url)}
              onToast={(msg) => {
                setAdminToast(msg);
                setTimeout(() => setAdminToast(null), 3500);
              }}
              onNavigateHome={() => setCurrentPage('home')}
            />
          </div>
        )}
      </main>

      {/* =========================================================================
          PERSISTENT BOTTOM PLAYER BAR (Continuous Audio Across All Pages)
          ========================================================================= */}
      {currentSong && (
        <footer className="player-bar" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 900 }}>
          {/* Left: Track Meta */}
          <div className="player-left">
            <img
              src={currentSong.coverUrl || '/headphone_logo.png'}
              alt={currentSong.title}
              className={`player-cover ${isPlaying ? 'is-spinning' : ''}`}
              style={{ borderRadius: isPlaying ? '50%' : '12px', transition: 'border-radius 0.3s ease' }}
            />
            <div className="player-track-info">
              <span className="player-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{currentSong.title}</span>
                {isPlaying && (
                  <span className="mini-equalizer" style={{ transform: 'scale(0.8)' }}>
                    <span className="eq-bar"></span>
                    <span className="eq-bar"></span>
                    <span className="eq-bar"></span>
                  </span>
                )}
              </span>
              {currentSong.artist?.trim() ? <span className="player-artist">{currentSong.artist}</span> : null}
            </div>
          </div>

          {/* Center: Playback Controls & Scrubber */}
          <div className="player-center">
            <div className="player-controls">
              <button type="button" className="ctrl-btn" onClick={handlePrevSong} title="Previous Track">
                <SkipBack size={22} />
              </button>
              <button
                type="button"
                className="ctrl-btn ctrl-btn-play"
                onClick={handleTogglePlayPause}
                title={isPlaying ? 'Pause' : 'Play'}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
              </button>
              <button type="button" className="ctrl-btn" onClick={handleNextSong} title="Next Track">
                <SkipForward size={22} />
              </button>
            </div>

            <div className="progress-container">
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

          {/* Right: Volume & Tier Actions */}
          <div className="player-right">
            {currentSong?.isMmRelease ? (
              <span
                className="badge"
                style={{
                  background: '#dcfce7',
                  color: '#15803d',
                  padding: '5px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.74rem',
                  fontWeight: 700
                }}
              >
                <Headphones size={12} />
                <span>Free MM Release</span>
              </span>
            ) : !currentUser ? (
              <button
                type="button"
                className="badge"
                style={{
                  cursor: 'pointer',
                  background: '#fee2e2',
                  color: '#b91c1c',
                  border: 'none',
                  padding: '6px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onClick={() => {
                  setAuthMessage('Login to play full VIP catalog tracks.');
                  setAuthTab('login');
                  setAuthModalOpen(true);
                }}
              >
                <Lock size={12} />
                <span>Login to Stream</span>
              </button>
            ) : (
              <span
                className="badge"
                style={{
                  background: '#f1f5f9',
                  color: '#0f172a',
                  padding: '5px 10px',
                  fontSize: '0.74rem',
                  fontWeight: 700
                }}
              >
                VIP Stream
              </span>
            )}

            {currentSong?.isDownloadable && (
              <a
                href={currentSong.audioUrl}
                download={currentSong.artist?.trim() ? `${currentSong.title} - ${currentSong.artist}.mp3` : `${currentSong.title}.mp3`}
                className="ctrl-btn"
                style={{ color: '#16a34a', display: 'flex', alignItems: 'center' }}
                title="Download this audio track"
              >
                <Download size={18} />
              </a>
            )}

            <div className="volume-box">
              <button
                type="button"
                className="ctrl-btn"
                onClick={() => setIsMuted(!isMuted)}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="volume-slider"
              />
            </div>
          </div>
        </footer>
      )}

      {/* =========================================================================
          GLOBAL AUTH MODAL (Login & Referral Registration)
          ========================================================================= */}
      {authModalOpen && (
        <div className="modal-overlay" onClick={() => setAuthModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {authTab === 'login' ? 'Music Marshall Sign In' : 'Exclusive VIP Registration'}
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setAuthModalOpen(false)}
                title="Close"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {authMessage && (
                <div className="alert-box alert-warning">
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    <span>{authMessage}</span>
                  </div>
                </div>
              )}

              <div className="tab-toggle">
                <button
                  type="button"
                  className={`tab-btn ${authTab === 'login' ? 'active' : ''}`}
                  onClick={() => {
                    setAuthTab('login');
                    setRegError(null);
                  }}
                >
                  Log In
                </button>
                <button
                  type="button"
                  className={`tab-btn ${authTab === 'register' ? 'active' : ''}`}
                  onClick={() => {
                    setAuthTab('register');
                    setRegError(null);
                  }}
                >
                  Register
                </button>
              </div>

              {authTab === 'login' && (
                <form onSubmit={handleLoginSubmit}>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      required
                      className="form-control"
                      placeholder="Enter your email (e.g. admin@marshall.com)"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      required
                      className="form-control"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '12px' }}
                  >
                    Sign In
                  </button>
                </form>
              )}

              {authTab === 'register' && (
                <form onSubmit={handleRegisterSubmit}>
                  {regError && (
                    <div className="alert-box alert-error">
                      {regError}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label>First Name *</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="Marcus"
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Garvey"
                        value={regLastName}
                        onChange={(e) => setRegLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      required
                      className="form-control"
                      placeholder="listener@sound.fm"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Password *</label>
                    <input
                      type="password"
                      required
                      className="form-control"
                      placeholder="Create a password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Compulsory VIP Promo Code *</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. MARSHALL-VIP"
                      value={regReferralCode}
                      onChange={(e) => setRegReferralCode(e.target.value.toUpperCase())}
                      style={{ textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}
                    />
                    <small style={{ color: '#94a3b8', fontSize: '0.74rem', marginTop: '4px', display: 'block' }}>
                      (Active Promo Code: <strong style={{ color: '#00f59b' }}>{referralCodes[0]?.code || 'MARSHALL-VIP'}</strong>)
                    </small>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '14px' }}
                  >
                    Complete Registration
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Welcome Email Modal */}
      {welcomeEmailModalOpen && welcomeEmailUser && (
        <WelcomeEmailModal
          isOpen={welcomeEmailModalOpen}
          user={welcomeEmailUser}
          onClose={() => setWelcomeEmailModalOpen(false)}
          onStartListening={() => {
            setWelcomeEmailModalOpen(false);
            setCurrentPage('mixes');
          }}
        />
      )}

      {/* Preferences Modal */}
      {preferencesModalOpen && (
        <PreferencesModal
          isOpen={preferencesModalOpen}
          onClose={() => setPreferencesModalOpen(false)}
          preferences={preferences}
          onSavePreferences={(p: UserPreferences) => {
            setPreferences(p);
            setPreferencesModalOpen(false);
            setAdminToast('✓ Studio preferences saved.');
            setTimeout(() => setAdminToast(null), 3000);
          }}
          userRole={currentUser?.role || 'user'}
        />
      )}

      {/* Edit Profile Modal */}
      {editProfileModalOpen && currentUser && (
        <EditProfileModal
          isOpen={editProfileModalOpen}
          onClose={() => setEditProfileModalOpen(false)}
          currentUser={currentUser}
          onSaveProfile={handleSaveProfile}
        />
      )}
    </div>
  );
}
export default App;
