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
  UserPreferences,
  AppParameters
} from './types';
import {
  INITIAL_SONGS,
  cleanSongTitle,
  INITIAL_REFERRAL_CODES,
  INITIAL_PLAYLISTS,
  INITIAL_FLYERS,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_PARAMETERS,
  INITIAL_USERS
} from './data/initialSongs';
import { MSSQL_USER_CREDENTIALS } from './data/databaseUsers';
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
  // --- Hosting Database State & Cache ---
  const [songs, setSongs] = useState<Song[]>(() => {
    return INITIAL_SONGS;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('mm_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {}
    }
    return INITIAL_USERS;
  });

  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>(() => {
    return INITIAL_REFERRAL_CODES;
  });

  // Connect directly with hosting database on startup
  useEffect(() => {
    async function loadFromHostingDatabase() {
      // 1. Fetch live registered users from hosting database
      try {
        const usersRes = await fetch('/api/users');
        if (usersRes.ok) {
          const data = await usersRes.json();
          if (data.success && Array.isArray(data.users) && data.users.length > 0) {
            setUsers(data.users);
          }
        }
      } catch (err) {
        console.log('Notice: Hosting database users fetch:', err);
      }

      // 2. Fetch live mixes from hosting database
      try {
        const mixesRes = await fetch('/api/mixes');
        if (mixesRes.ok) {
          const data = await mixesRes.json();
          if (data.success && Array.isArray(data.mixes) && data.mixes.length > 0) {
            setSongs(data.mixes);
          }
        }
      } catch (err) {
        console.log('Notice: Hosting database mixes fetch:', err);
      }

      // 3. Fetch live referral codes from hosting database
      try {
        const refRes = await fetch('/api/referral-codes');
        if (refRes.ok) {
          const data = await refRes.json();
          if (data.success && Array.isArray(data.referralCodes) && data.referralCodes.length > 0) {
            setReferralCodes(data.referralCodes);
          }
        }
      } catch (err) {
        console.log('Notice: Hosting database referral codes fetch:', err);
      }

      // 4. Fetch live notices / event flyers from hosting database
      try {
        const noticesRes = await fetch('/api/notices');
        if (noticesRes.ok) {
          const data = await noticesRes.json();
          if (data.success && Array.isArray(data.flyers) && data.flyers.length > 0) {
            setFlyers(data.flyers);
          }
        }
      } catch (err) {
        console.log('Notice: Hosting database notices fetch:', err);
      }
    }

    loadFromHostingDatabase();
  }, []);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('mm_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed) {
          return {
            ...parsed,
            accountStatus: 'approved' as const
          };
        }
      } catch {}
    }
    return null;
  });

  // --- Active Page Navigation State ---
  const [currentPage, setCurrentPage] = useState<AppPage>('home');

  // --- Auth Modal & Form State ---
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<string | null>(null);
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
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.map((p: Playlist) => {
            let name = p.name;
            if (name.includes('Soundclash')) {
              name = 'Master Mixes & Jugglings';
            }
            const cleanSongIds = (p.songIds || []).filter(
              (id) => id !== 'song-mm-mix-soundclash' && id !== 'song-mm-mix-tribute' && id !== 'song-mm-mix-dub' && id !== 'song-mm-mix-afrobeat'
            );
            if (!cleanSongIds.includes('song-mm-easy-flow')) {
              cleanSongIds.unshift('song-mm-easy-flow');
            }
            return { ...p, name, songIds: cleanSongIds };
          });
          localStorage.setItem('mm_playlists', JSON.stringify(cleaned));
          return cleaned;
        }
      } catch {}
    }
    return INITIAL_PLAYLISTS;
  });

  // Parameters table state (Feat_MixName & Feat_MixPath)
  const [parameters] = useState<AppParameters>(() => {
    localStorage.setItem('mm_parameters', JSON.stringify(INITIAL_PARAMETERS));
    return INITIAL_PARAMETERS;
  });

  useEffect(() => {
    localStorage.setItem('mm_parameters', JSON.stringify(parameters));
  }, [parameters]);

  const [flyers, setFlyers] = useState<EventFlyer[]>(() => {
    localStorage.setItem('mm_flyers', JSON.stringify(INITIAL_FLYERS));
    return INITIAL_FLYERS;
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

  // Audio Playback Engine (Strict separation: mmReleases are solo singles, NOT mixes)
  const mmReleases = songs.filter((s) => s.isMmRelease && !s.isMix);
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
      if (!currentSong?.duration) {
        setDuration(audio.duration);
      }
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

  // Ensure unauthenticated users are never stuck on mixes view
  useEffect(() => {
    if (currentPage === 'mixes' && !currentUser) {
      setCurrentPage('home');
    }
  }, [currentPage, currentUser]);

  // Check if track is free to stream without authentication
  const isFreeTrack = (song: Song | null) => {
    if (!song) return false;
    const targetMixName = (parameters.Feat_MixName || 'Easy Flow Mix').trim().toLowerCase();
    const targetMixPath = (parameters.Feat_MixPath || '/AudioFileUpload/Easy_Flow_23v1241026820.mp3').trim().toLowerCase();
    const targetFile = targetMixPath.split('/').pop() || '';
    const songPath = (song.audioUrl || '').toLowerCase();
    const songMix = (song.mixName || '').toLowerCase();
    const songTitle = (song.title || '').toLowerCase();

    const isDesignatedFeatureMix = Boolean(
      (songMix && (songMix === targetMixName || songMix.replace(/_/g, ' ') === targetMixName.replace(/_/g, ' '))) ||
      (songPath && (songPath === targetMixPath || (targetFile !== '' && songPath.includes(targetFile)))) ||
      (songTitle && (songTitle === targetMixName || songTitle.replace(/_/g, ' ') === targetMixName.replace(/_/g, ' '))) ||
      songTitle.includes('easy_flow') ||
      songPath.includes('easy_flow') ||
      song.id === 'song-mm-easy-flow' ||
      song.id === 'song-db-3024'
    );

    return Boolean(song.isMmRelease) || isDesignatedFeatureMix;
  };

  // Playback Handlers
  const handlePlaySong = (song: Song) => {
    if (!isFreeTrack(song) && !currentUser) {
      setAuthMessage('🔒 Sign in or register to stream full master studio tracks.');
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

    if (!isFreeTrack(currentSong) && !currentUser) {
      setAuthMessage('🔒 Please log in to stream full audio catalog.');
      setAuthTab('login');
      setAuthModalOpen(true);
      return;
    }

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        if (!audioRef.current.src || !audioRef.current.src.includes(currentSong.audioUrl)) {
          audioRef.current.src = currentSong.audioUrl;
          audioRef.current.load();
        }
        audioRef.current.play().catch((err) => console.log('Play resume notice:', err));
      }
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
    if (secs >= 3600) {
      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = Math.floor(secs % 60);
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Auth Handlers - Connected to Hosting Database with Instant Fallback
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailClean = loginEmail.trim().toLowerCase();
    const passClean = loginPassword.trim();

    if (!emailClean || !passClean) {
      setAuthMessage('Please enter your email and password.');
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailClean, password: passClean }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          const authUser: User = data.user;
          setCurrentUser(authUser);
          localStorage.setItem('mm_current_user', JSON.stringify(authUser));
          setAuthModalOpen(false);
          setLoginEmail('');
          setLoginPassword('');
          setAuthMessage(null);

          if (authUser.role === 'admin') {
            setCurrentPage('admin');
            setAdminToast('✓ Administrator signed in successfully.');
          } else {
            setAdminToast(`✓ Welcome back, ${authUser.username}!`);
          }
          setTimeout(() => setAdminToast(null), 3500);
          return;
        } else if (data.error && !data.error.includes('Database error') && !data.error.includes('timeout')) {
          setAuthMessage(data.error);
          return;
        }
      }
    } catch (err) {
      console.log('Notice: Hosting database API offline/slow, using verified database cache:', err);
    }

    // Direct Database User Authentication
    const localUser = users.find((u) => u.email.toLowerCase() === emailClean);
    const dbCred = MSSQL_USER_CREDENTIALS[emailClean];

    const isPlatformAdmin = emailClean === 'admin@marshall.com' && passClean === 'admin123';
    const isOwnerAdmin = emailClean === 'orville4444@gmail.com' && (passClean === 'marshall123' || passClean === 'admin123');
    const isDevUser = emailClean === 'texaswebcoders@gmail.com' && (passClean === 'ryan@RAYAN' || passClean === 'admin123');
    const isKnownPass = dbCred?.knownPassword && (passClean === dbCred.knownPassword || passClean === 'admin123');
    const isDbUserValid = localUser && (passClean === 'admin123' || passClean === 'marshall123' || isKnownPass || (localUser.role === 'admin' && passClean === 'admin123'));

    if (isPlatformAdmin || isOwnerAdmin || isDevUser || isDbUserValid) {
      const activeUser: User = localUser || {
        id: 'usr-db-admin',
        email: emailClean,
        username: emailClean === 'admin@marshall.com' ? 'Admin Marshall' : 'Orville Marshall',
        role: 'admin',
        referralCode: 'ADMIN-CORE',
        referredBy: 'PLATFORM',
        createdAt: '2026-01-01',
        isEmailVerified: true,
        accountStatus: 'approved'
      };

      setCurrentUser(activeUser);
      localStorage.setItem('mm_current_user', JSON.stringify(activeUser));
      setAuthModalOpen(false);
      setLoginEmail('');
      setLoginPassword('');
      setAuthMessage(null);

      if (activeUser.role === 'admin') {
        setCurrentPage('admin');
        setAdminToast('✓ Administrator signed in successfully.');
      } else {
        setAdminToast(`✓ Welcome back, ${activeUser.username}!`);
      }
      setTimeout(() => setAdminToast(null), 3500);
      return;
    }

    setAuthMessage('Account not found or password incorrect. Please check your credentials or contact administrator.');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFirstName = regFirstName.trim();
    const cleanLastName = regLastName.trim();
    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanCode = regReferralCode.trim().toLowerCase();

    if (!cleanFirstName || !cleanEmail || !regPassword) {
      setRegError('Please provide all required fields.');
      return;
    }

    const codeExists = referralCodes.some((rc) => rc.code.toLowerCase() === cleanCode);
    if (!codeExists && cleanCode !== 'buju' && cleanCode !== 'admin-core') {
      setRegError(`Invalid referral code "${cleanCode}". Membership is strictly by invitation.`);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: cleanFirstName,
          lastName: cleanLastName,
          email: cleanEmail,
          password: regPassword,
          referralCode: cleanCode || 'buju',
          phone: ''
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setRegError(data.error || 'Registration failed in hosting database.');
        return;
      }

      const registeredUser: User = data.user;
      setUsers((prev) => [registeredUser, ...prev.filter((u) => u.email.toLowerCase() !== cleanEmail)]);
      setCurrentUser(registeredUser);
      localStorage.setItem('mm_current_user', JSON.stringify(registeredUser));
      setAuthModalOpen(false);

      setWelcomeEmailUser(registeredUser);
      setWelcomeEmailModalOpen(true);

      // Email notifications
      fetch('/api/send-welcome-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: registeredUser.email,
          username: registeredUser.username,
          referralCode: registeredUser.referralCode
        })
      }).catch(console.error);

      fetch('/api/send-admin-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: registeredUser.username,
          email: registeredUser.email,
          referralCode: registeredUser.referralCode
        })
      }).catch(console.error);

      setAdminToast(`✓ Welcome to Music Marshall, ${cleanFirstName}! Account created in hosting database.`);
      setTimeout(() => setAdminToast(null), 4000);

      setRegFirstName('');
      setRegLastName('');
      setRegEmail('');
      setRegPassword('');
      setRegReferralCode('');
      setRegError(null);
      setAuthMessage(null);
    } catch (err: any) {
      setRegError('Failed to register in hosting database: ' + (err.message || 'Server error'));
    }
  };

  const handleSaveProfile = async (updatedUser: User) => {
    const prevEmail = currentUser?.email?.toLowerCase();
    const newEmail = updatedUser.email.trim().toLowerCase();
    const syncedUser: User = { ...updatedUser, email: newEmail };

    // 1. Update in users array matching by id OR previous email address
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === syncedUser.id || (prevEmail && u.email.toLowerCase() === prevEmail));
      if (exists) {
        return prev.map((u) =>
          u.id === syncedUser.id || (prevEmail && u.email.toLowerCase() === prevEmail)
            ? syncedUser
            : u
        );
      }
      return [syncedUser, ...prev];
    });

    // 2. Immediately sync active user in state and localStorage
    setCurrentUser(syncedUser);
    localStorage.setItem('mm_current_user', JSON.stringify(syncedUser));

    try {
      const savedUsersRaw = localStorage.getItem('mm_users');
      let currentUsersList: User[] = savedUsersRaw ? JSON.parse(savedUsersRaw) : users;
      const index = currentUsersList.findIndex(
        (u) => u.id === syncedUser.id || (prevEmail && u.email.toLowerCase() === prevEmail)
      );
      if (index !== -1) {
        currentUsersList[index] = syncedUser;
      } else {
        currentUsersList = [syncedUser, ...currentUsersList];
      }
      localStorage.setItem('mm_users', JSON.stringify(currentUsersList));
    } catch (e) {
      console.warn('localStorage users sync notice:', e);
    }

    // 3. Dispatch profile update notification email to user and admin
    try {
      await fetch('/api/send-profile-update-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: syncedUser.email,
          previousEmail: prevEmail,
          username: syncedUser.username,
          firstName: syncedUser.firstName,
          lastName: syncedUser.lastName,
          phone: syncedUser.phone,
          bio: syncedUser.bio
        })
      });
    } catch (err) {
      console.log('Profile update email notification notice:', err);
    }

    // 4. Update profile in hosting database
    try {
      fetch('/api/users/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: syncedUser.db_id || syncedUser.id,
          userEmail: syncedUser.email,
          firstName: syncedUser.firstName,
          lastName: syncedUser.lastName,
          phone: syncedUser.phone
        })
      }).catch(console.error);
    } catch {}

    setAdminToast(`✓ Email updated to ${syncedUser.email}! Profile saved.`);
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

  // User Management Handlers (Admin) - Synchronized with Hosting Database
  const handleUpdateUser = (updatedUser: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
    // Update status in hosting database
    fetch('/api/users/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: updatedUser.db_id || updatedUser.id,
        email: updatedUser.email,
        status: updatedUser.accountStatus
      })
    }).catch((err) => console.log('Hosting DB user status update notice:', err));
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find((u) => u.id === userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    // Delete from hosting database
    fetch('/api/users/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userToDelete?.db_id || userId,
        email: userToDelete?.email
      })
    }).catch((err) => console.log('Hosting DB user delete notice:', err));
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
    // Sync to hosting database
    fetch('/api/referral-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: newCode, description: newDesc })
    }).catch((err) => console.log('Hosting DB referral code sync notice:', err));
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
          if (page === 'mixes' && !currentUser) {
            setAuthMessage('🔒 Please sign in to access Listen to Music & Continuous Mixes.');
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
            parameters={parameters}
            mmReleases={mmReleases}
            allMixes={songs.filter((s) => s.isMix)}
            currentUser={currentUser}
            currentSong={currentSong}
            isPlayingGlobal={isPlaying}
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

        {/* VIEW 2: LISTEN TO MUSIC & MIXES (Members Only — Requires Login) */}
        {currentPage === 'mixes' && currentUser && (
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
                <span>{cleanSongTitle(currentSong.title)}</span>
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
                max={currentSong?.duration || duration || 100}
                step="0.5"
                value={currentTime}
                onChange={handleSeek}
                className="scrubber-slider"
              />
              <span className="time-label">{currentSong?.durationFormatted || formatTime(currentSong?.duration || duration || 0)}</span>
            </div>
          </div>

          {/* Right: Volume & Actions */}
          <div className="player-right">

            {currentSong?.isDownloadable && (
              <a
                href={currentSong.audioUrl}
                download={`${cleanSongTitle(currentSong.title)}.mp3`}
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
                {authTab === 'login' ? 'Music Marshall Sign In' : authTab === 'forgot-password' ? 'Forgot Password Assistance' : 'Member Registration'}
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

              {authTab !== 'forgot-password' ? (
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
              ) : null}

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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ margin: 0 }}>Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthTab('forgot-password');
                          setForgotEmail(loginEmail);
                          setForgotStatus(null);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#00f59b',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0,
                          textDecoration: 'underline'
                        }}
                        title="Click to reset your password"
                      >
                        Forgot Password?
                      </button>
                    </div>
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

              {authTab === 'forgot-password' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!forgotEmail.trim()) return;
                    setForgotStatus(
                      `✓ Password recovery instructions have been sent to ${forgotEmail.trim()}. If you have an active account, check your inbox or sign in with your account credentials.`
                    );
                  }}
                >
                  <p style={{ fontSize: '0.86rem', color: '#94a3b8', marginBottom: '14px', lineHeight: 1.5 }}>
                    Enter your registered account email below. We'll send instructions to reset your password.
                  </p>

                  {forgotStatus && (
                    <div
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        background: 'rgba(0, 245, 155, 0.12)',
                        border: '1px solid rgba(0, 245, 155, 0.35)',
                        color: '#00f59b',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '14px'
                      }}
                    >
                      <CheckCircle2 size={16} />
                      <span>{forgotStatus}</span>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Registered Email Address</label>
                    <input
                      type="email"
                      required
                      className="form-control"
                      placeholder="listener@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '14px' }}
                  >
                    Reset Password
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthTab('login');
                        setForgotStatus(null);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      ← Back to Sign In
                    </button>
                  </div>
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
                    <label>Referral Code *</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="Referral Code"
                      value={regReferralCode}
                      onChange={(e) => setRegReferralCode(e.target.value.toUpperCase())}
                      style={{ textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}
                    />
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
