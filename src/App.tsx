import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Search,
  Music,
  Shield,
  User as UserIcon,
  LogOut,
  Plus,
  Lock,
  X,
  CheckCircle2,
  AlertCircle,
  Upload,
  FileAudio,
  Image as ImageIcon,
  Disc3,
  Headphones,
  Edit3,
  Save,
  Home,
  Menu,
  Repeat,
  Download,
  ListMusic,
  HelpCircle,
  Calendar,
  Settings,
  ChevronDown,
  Ticket,
  ShieldCheck
} from 'lucide-react';
import type { Song, User, ReferralCode, ActiveTab, AppMode, Playlist, EventFlyer, SupportTicket, UserPreferences } from './types';
import {
  INITIAL_SONGS,
  INITIAL_REFERRAL_CODES,
  INITIAL_USERS,
  INITIAL_PLAYLISTS,
  INITIAL_FLYERS,
  INITIAL_SUPPORT_TICKETS
} from './data/initialSongs';
import { LandingPage } from './components/LandingPage';
import { PreferencesModal } from './components/PreferencesModal';
import { MusicMixesView } from './components/MusicMixesView';
import { PlaylistsView } from './components/PlaylistsView';
import { NoticeBoardView } from './components/NoticeBoardView';
import { SupportView } from './components/SupportView';
import { AdminFeatureImageCard } from './components/AdminFeatureImageCard';
import { WelcomeEmailModal } from './components/WelcomeEmailModal';

export function App() {
  // --- Mode: Public Landing Page vs Web App ---
  const [appMode, setAppMode] = useState<AppMode>('landing');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // --- Persistent Storage State ---
  const [songs, setSongs] = useState<Song[]>(() => {
    const saved = localStorage.getItem('mm_songs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure new downloaded releases are loaded if saved list is smaller
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
        // Ensure admin account has approved status and existing users have accountStatus
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

  // --- Navigation & View State ---
  const [activeTab, setActiveTab] = useState<ActiveTab>('releases');
  const [searchQuery, setSearchQuery] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  // --- Auth Form Fields ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regReferralCode, setRegReferralCode] = useState('');
  const [regError, setRegError] = useState<string | null>(null);

  // --- Audio Player State ---
  const [currentSong, setCurrentSong] = useState<Song | null>(() => INITIAL_SONGS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(INITIAL_SONGS[0].duration);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);


  // --- Admin Form & File Upload State ---
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newAlbum, setNewAlbum] = useState('Music Marshall Studio Master');
  const [audioSourceType, setAudioSourceType] = useState<'upload' | 'preset'>('upload');
  const [newAudioUrl, setNewAudioUrl] = useState('/audio/WhatWillBe222604854.mp3');
  const [uploadedAudioFile, setUploadedAudioFile] = useState<File | null>(null);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);
  const [detectedDuration, setDetectedDuration] = useState<number>(240);
  const [uploadedCoverUrl, setUploadedCoverUrl] = useState<string | null>(null);
  const [isNewMmRelease, setIsNewMmRelease] = useState<boolean>(true);
  const [isNewMix, setIsNewMix] = useState<boolean>(false);
  const [isNewDownloadable, setIsNewDownloadable] = useState<boolean>(true);
  const [adminToast, setAdminToast] = useState<string | null>(null);

  // --- Feature States: Playlists, Notice Board Flyers, Support Desk ---
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem('mm_playlists');
    return saved ? JSON.parse(saved) : INITIAL_PLAYLISTS;
  });
  const [createPlaylistModalOpen, setCreatePlaylistModalOpen] = useState(false);
  const [preselectedMixId, setPreselectedMixId] = useState<string | null>(null);

  const [flyers, setFlyers] = useState<EventFlyer[]>(() => {
    const saved = localStorage.getItem('mm_flyers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter((f: EventFlyer) => f.id !== 'flyer-01' && f.id !== 'flyer-02');
      } catch {}
    }
    return INITIAL_FLYERS;
  });

  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('mm_support_tickets');
    return saved ? JSON.parse(saved) : INITIAL_SUPPORT_TICKETS;
  });

  // Feature Images for Landing Page & After-Login Dashboard
  const [landingFeatureImage, setLandingFeatureImage] = useState<string>(() => {
    return localStorage.getItem('mm_landing_feature_image') || '/mm_banner.png';
  });
  const [dashboardFeatureImage, setDashboardFeatureImage] = useState<string>(() => {
    return localStorage.getItem('mm_dashboard_feature_image') || '/mm_banner.png';
  });

  // User Preferences: Repeat mix (loop) & stop new mix alerts
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('mm_preferences');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return { repeatMixLoop: true, stopNewMixAlerts: false };
  });
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Welcome Email Modal State
  const [welcomeEmailUser, setWelcomeEmailUser] = useState<User | null>(null);
  const [welcomeEmailModalOpen, setWelcomeEmailModalOpen] = useState(false);

  // --- Promo Code Management State ---
  const [editingPromoCode, setEditingPromoCode] = useState<string | null>(null);
  const [editPromoCodeVal, setEditPromoCodeVal] = useState('');
  const [editPromoDescVal, setEditPromoDescVal] = useState('');

  const audioFileInputRef = useRef<HTMLInputElement | null>(null);
  const coverFileInputRef = useRef<HTMLInputElement | null>(null);

  // List of official My MM Releases (available without login)
  const mmReleases = songs.filter((s) => s.isMmRelease);

  // Save changes to localStorage
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
    localStorage.setItem('mm_preferences', JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('mm_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('mm_current_user');
      setAppMode('landing');
    }
  }, [currentUser]);

  // Audio element event bindings
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlayEvent = () => setIsPlaying(true);
    const handlePauseEvent = () => setIsPlaying(false);

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    // Repeat the mix selected when it ends (loop) if enabled
    const handleEnded = () => {
      if (preferences.repeatMixLoop) {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        }
      } else {
        handleNextSong();
      }
    };

    audio.addEventListener('play', handlePlayEvent);
    audio.addEventListener('pause', handlePauseEvent);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlayEvent);
      audio.removeEventListener('pause', handlePauseEvent);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentSong, songs, preferences.repeatMixLoop]);

  // Sync volume with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- Player Handlers ---
  const handlePlaySong = (song: Song) => {
    // "make category new tab My MM Release section in their songs are play and vaalible without login"
    // "and listen to music songs only avalaible and listen with login"
    if (!song.isMmRelease && !currentUser) {
      setAuthMessage('🔒 VIP Track: Streaming the extended studio vault requires an account. Log in or register with your compulsory referral code to play.');
      setAuthTab('login');
      setAuthModalOpen(true);
      return;
    }

    if (currentSong?.id === song.id) {
      if (audioRef.current) {
        if (audioRef.current.paused) {
          audioRef.current.play().catch((err) => console.warn('Play error:', err));
        } else {
          audioRef.current.pause();
        }
      }
    } else {
      setCurrentSong(song);
      setCurrentTime(0);
      if (audioRef.current) {
        audioRef.current.src = song.audioUrl;
        audioRef.current.load();
        audioRef.current.play().catch((err) => console.warn('Play error:', err));
      }
    }
  };

  const handleTogglePlayPause = () => {
    if (!currentSong && songs.length > 0) {
      handlePlaySong(songs[0]);
      return;
    }

    if (currentSong && !currentSong.isMmRelease && !currentUser) {
      setAuthMessage('🔒 VIP Track: Please sign in or register to stream this track.');
      setAuthModalOpen(true);
      return;
    }

    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play().catch((err) => console.warn('Play error:', err));
      } else {
        audioRef.current.pause();
      }
    }
  };

  const handleNextSong = () => {
    if (!songs.length) return;
    const currentIndex = songs.findIndex((s) => s.id === currentSong?.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    handlePlaySong(songs[nextIndex]);
  };

  const handlePrevSong = () => {
    if (!songs.length) return;
    const currentIndex = songs.findIndex((s) => s.id === currentSong?.id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    handlePlaySong(songs[prevIndex]);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  // --- Direct Auth Handlers (No 2FA / No Email Confirmation Complexity) ---
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = users.find((u) => u.email.toLowerCase() === loginEmail.toLowerCase());
    if (foundUser) {
      if (foundUser.accountStatus === 'deactivated') {
        setAuthMessage('🚫 Your account has been deactivated by administrator. Please contact technical and admin support.');
        return;
      }

      setCurrentUser(foundUser);
      setAppMode('landing');
      setAuthModalOpen(false);
      setLoginEmail('');
      setLoginPassword('');
      setAuthMessage(null);
      setAdminToast(`✓ Welcome back, ${foundUser.username}!`);
      setTimeout(() => setAdminToast(null), 3500);
    } else {
      setAuthMessage('User account not found. Please register with a referral code or check credentials.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    const cleanFirstName = regFirstName.trim();
    const cleanLastName = regLastName.trim();
    const cleanEmail = regEmail.trim();
    const cleanCode = regReferralCode.trim().toUpperCase();

    if (!cleanFirstName) {
      setRegError('Please enter your First Name.');
      return;
    }

    if (!cleanEmail) {
      setRegError('Please enter your Email address.');
      return;
    }

    if (!regPassword) {
      setRegError('Please enter a Password.');
      return;
    }

    if (!cleanCode) {
      setRegError('Membership is by referral only. Please use the contact us link to request a code.');
      return;
    }

    // Validate referral code against platform codes or existing user referral codes
    const isPlatformCode = referralCodes.some((rc) => rc.code.toUpperCase() === cleanCode);
    const isUserReferral = users.some((u) => u.referralCode.toUpperCase() === cleanCode);

    if (!isPlatformCode && !isUserReferral) {
      setRegError(`❌ Invalid referral code "${cleanCode}". (Membership is by referral only. Please use the contact us link to request a code)`);
      return;
    }

    if (users.some((u) => u.email.toLowerCase() === cleanEmail.toLowerCase())) {
      setRegError('An account with this email already exists.');
      return;
    }

    // Increment referral count
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

    // Show Welcome Email Modal immediately to user
    setWelcomeEmailUser(newUser);
    setWelcomeEmailModalOpen(true);

    // Dispatch welcome email via SMTP in background
    fetch('/api/send-welcome-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: newUser.email,
        username: newUser.username,
        referralCode: newUser.referralCode
      })
    }).catch((err) => console.log('Welcome email dispatch fallback:', err));

    setAdminToast(`✓ Welcome to Music Marshall, ${cleanFirstName}! Welcome email sent.`);
    setTimeout(() => setAdminToast(null), 5000);

    setRegFirstName('');
    setRegLastName('');
    setRegEmail('');
    setRegPassword('');
    setRegReferralCode('');
    setRegError(null);
    setAuthMessage(null);
  };

  // --- Admin Promo Code Edit Handlers ---
  const handleStartEditPromo = (item: ReferralCode) => {
    setEditingPromoCode(item.code);
    setEditPromoCodeVal(item.code);
    setEditPromoDescVal(item.description);
  };

  const handleSaveEditPromo = (oldCode: string) => {
    const cleanCode = editPromoCodeVal.trim().toUpperCase();
    if (!cleanCode) {
      setAdminToast('Promo code cannot be empty.');
      setTimeout(() => setAdminToast(null), 3000);
      return;
    }

    if (cleanCode !== oldCode && referralCodes.some((rc) => rc.code.toUpperCase() === cleanCode)) {
      setAdminToast(`Promo code "${cleanCode}" already exists.`);
      setTimeout(() => setAdminToast(null), 3000);
      return;
    }

    setReferralCodes((prev) =>
      prev.map((rc) =>
        rc.code === oldCode
          ? { ...rc, code: cleanCode, description: editPromoDescVal.trim() }
          : rc
      )
    );
    setEditingPromoCode(null);
    setAdminToast(`✓ Updated promo code "${cleanCode}"`);
    setTimeout(() => setAdminToast(null), 3500);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAppMode('landing');
    setActiveTab('releases');
    setMobileSidebarOpen(false);
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    }
  };

  // --- Song Upload Handlers ---
  const handleAudioFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedAudioFile(file);
    const blobUrl = URL.createObjectURL(file);
    setUploadedAudioUrl(blobUrl);

    if (!newTitle.trim()) {
      const rawName = file.name.replace(/\.[^/.]+$/, '');
      setNewTitle(rawName.replace(/[-_]/g, ' '));
    }

    const tempAudio = new Audio(blobUrl);
    tempAudio.onloadedmetadata = () => {
      if (tempAudio.duration && !isNaN(tempAudio.duration)) {
        setDetectedDuration(Math.round(tempAudio.duration));
      }
    };
  };

  const handleCoverFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const blobUrl = URL.createObjectURL(file);
    setUploadedCoverUrl(blobUrl);
  };

  // --- Admin Handlers ---
  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setAdminToast('Please provide a track title');
      return;
    }

    const finalAudioUrl =
      audioSourceType === 'upload' && uploadedAudioUrl ? uploadedAudioUrl : newAudioUrl;

    if (!finalAudioUrl) {
      setAdminToast('Please select or upload an audio file');
      return;
    }

    const finalCoverUrl = uploadedCoverUrl || '/mm_logo.jpg';
    const finalDuration = audioSourceType === 'upload' ? detectedDuration : 240;

    const created: Song = {
      id: `song-${Date.now()}`,
      title: newTitle.trim(),
      artist: newArtist.trim() || 'Music Marshall Artist',
      album: newAlbum.trim() || 'Official Release',
      duration: finalDuration,
      audioUrl: finalAudioUrl,
      coverUrl: finalCoverUrl,
      genre: 'Reggae',
      mood: 'chill',
      bpm: 95,
      isMmRelease: isNewMmRelease,
      isMix: isNewMix,
      isDownloadable: isNewDownloadable,
      description: isNewMmRelease ? 'Official My MM Release — Free to stream.' : 'VIP Master Vault Track.'
    };

    setSongs((prev) => [created, ...prev]);
    setNewTitle('');
    setNewArtist('');
    setUploadedAudioFile(null);
    setUploadedAudioUrl(null);
    setUploadedCoverUrl(null);

    // Stop receiving alerts when new mixes are uploaded preference check
    if (isNewMix && !preferences.stopNewMixAlerts) {
      setAdminToast(`🔥 New Mix Alert: "${created.title}" is now streaming!`);
    } else {
      setAdminToast(`Track "${created.title}" uploaded & added to catalog!`);
    }
    setTimeout(() => setAdminToast(null), 3500);
  };

  // --- Playlist Handlers ---
  const handleCreatePlaylist = (name: string, description: string, songIds: string[]) => {
    const newPl: Playlist = {
      id: `pl-${Date.now()}`,
      name,
      description,
      createdBy: currentUser ? currentUser.username : 'Music Marshall Fan',
      createdAt: new Date().toISOString().split('T')[0],
      songIds,
      coverUrl: '/mm_banner.png'
    };
    setPlaylists((prev) => [newPl, ...prev]);
    setAdminToast(`Playlist "${name}" created with ${songIds.length} tracks!`);
    setTimeout(() => setAdminToast(null), 3000);
  };

  const handleDeletePlaylist = (id: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
    setAdminToast('Playlist deleted.');
    setTimeout(() => setAdminToast(null), 3000);
  };

  const handleRemoveSongFromPlaylist = (playlistId: string, songId: string) => {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId ? { ...p, songIds: p.songIds.filter((sId) => sId !== songId) } : p
      )
    );
    setAdminToast('Track removed from playlist.');
    setTimeout(() => setAdminToast(null), 2500);
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
    setAdminToast(`Added to "${targetPl?.name || 'Playlist'}"!`);
    setTimeout(() => setAdminToast(null), 2500);
  };

  // --- Event Flyer Handlers ---
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

  // --- Technical & Admin Support Handlers ---
  const handleSubmitSupportTicket = (
    ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>
  ) => {
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
    setAdminToast(`Support ticket status updated to ${status}.`);
    setTimeout(() => setAdminToast(null), 3000);
  };

  // Filter songs for search tab
  const displayedSongs = songs.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      s.genre.toLowerCase().includes(q) ||
      s.album.toLowerCase().includes(q)
    );
  });

  // Render Landing Page first as requested ("without showing that dashboard first make landing page...")
  // CRITICAL: NEVER display the Music Lab if not logged in!
  if (appMode === 'landing' || !currentUser) {
    return (
      <>
        <LandingPage
          mmReleases={mmReleases}
          allMixes={songs.filter((s) => s.isMix || s.title.toLowerCase().includes('mix') || s.title.toLowerCase().includes('juggling') || s.title.toLowerCase().includes('medley'))}
          currentUser={currentUser}
          landingFeatureImage={landingFeatureImage}
          flyers={flyers}
          supportTickets={supportTickets}
          onSubmitTicket={handleSubmitSupportTicket}
          onOpenApp={(tab) => {
            if (!currentUser) {
              setAuthMessage('🔒 Please sign in with your email and password to access "Listen to Music".');
              setAuthTab('login');
              setAuthModalOpen(true);
              return;
            }
            setAppMode('app');
            if (tab) setActiveTab(tab as any);
          }}
          onOpenAuth={(mode) => {
            setAuthTab(mode || 'login');
            setAuthModalOpen(true);
          }}
          onLogout={() => {
            setCurrentUser(null);
            localStorage.removeItem('mm_current_user');
            setAppMode('landing');
            setAdminToast('✓ You have been logged out.');
            setTimeout(() => setAdminToast(null), 3000);
          }}
          onOpenAdmin={() => {
            setAppMode('app');
            setActiveTab('admin');
          }}
        />

        {/* Global Auth Modal */}
        {authModalOpen && (
          <div className="modal-overlay" onClick={() => setAuthModalOpen(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">
                  {authTab === 'login' ? 'Music Marshall Sign In' : 'Exclusive Registration'}
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
                    className={`tab-btn ${authTab === 'login' ? 'active' : ''}`}
                    onClick={() => {
                      setAuthTab('login');
                      setRegError(null);
                    }}
                  >
                    Log In
                  </button>
                  <button
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
                        placeholder="Enter your email address"
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

                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="First Name"
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Last Name (not required)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Last Name (optional)"
                        value={regLastName}
                        onChange={(e) => setRegLastName(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Email address</label>
                      <input
                        type="email"
                        required
                        className="form-control"
                        placeholder="name@example.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Password</label>
                      <input
                        type="password"
                        required
                        className="form-control"
                        placeholder="••••••••"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                      />
                    </div>

                    <div
                      className="form-group"
                      style={{
                        background: 'rgba(0, 245, 155, 0.04)',
                        padding: '14px',
                        borderRadius: '10px',
                        border: '1px solid rgba(0, 245, 155, 0.22)',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      <label style={{ color: 'var(--brand-accent, #00f59b)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Referral Code</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#94a3b8' }}>VIP Access Only</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="ENTER VIP REFERRAL CODE"
                        value={regReferralCode}
                        onChange={(e) => setRegReferralCode(e.target.value)}
                        style={{
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          letterSpacing: '0.05em',
                          background: 'rgba(0, 0, 0, 0.35)',
                          border: '1px solid rgba(0, 245, 155, 0.3)',
                          color: '#ffffff',
                        }}
                      />
                      <small style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '6px', display: 'block', lineHeight: 1.4 }}>
                        (Membership is by referral only. Please use the{' '}
                        <a
                          href="#contact-us"
                          onClick={(e) => {
                            e.preventDefault();
                            setAuthModalOpen(false);
                            if (appMode === 'landing') {
                              const el = document.getElementById('contact-us');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            } else {
                              setActiveTab('support');
                            }
                          }}
                          style={{ color: 'var(--brand-accent, #00f59b)', textDecoration: 'underline', fontWeight: 600, cursor: 'pointer' }}
                        >
                          contact us
                        </a>{' '}
                        link to request a code)
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

      </>
    );
  }

  // --- Web App Mode (Spotify-Style Player) ---
  return (
    <div className="app-layout">
      {/* Hidden Native HTML5 Audio */}
      <audio
        ref={audioRef}
        src={currentSong?.audioUrl}
        preload="metadata"
      />

      {/* ==========================================================================
          PERSISTENT TOP NAVIGATION BAR (Always visible in user dashboard)
          ========================================================================== */}
      <header className="landing-nav dashboard-nav" id="top-nav">
        <div className="landing-nav-inner">
          <div
            className="landing-logo"
            onClick={() => {
              setAppMode('landing');
              setMobileSidebarOpen(false);
            }}
            title="Return to Public Home Page"
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

          <nav className="landing-links">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setAppMode('landing');
              }}
            >
              Home
            </a>
            <button
              type="button"
              className={`landing-nav-link-btn ${activeTab === 'mixes' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('mixes')}
              title="Listen to Music & Mixes"
            >
              <Headphones size={15} />
              <span>Listen to Music</span>
            </button>
            <a
              href="#mm-releases"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('releases');
              }}
              className={activeTab === 'releases' ? 'active' : ''}
            >
              My MM Productions
            </a>
            <a
              href="#notice-board"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('notices');
              }}
              className={activeTab === 'notices' ? 'active' : ''}
            >
              Notice Board
            </a>
            <a
              href="#contact-us"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('support');
              }}
              className={activeTab === 'support' ? 'active' : ''}
            >
              Support Desk
            </a>
          </nav>

          <div className="landing-nav-actions">
            {currentUser && currentUser.role === 'admin' && (
              <button
                className={`btn btn-outline btn-sm ${activeTab === 'admin' ? 'btn-primary' : ''}`}
                onClick={() => setActiveTab('admin')}
                title="Open Administrator Control Center"
              >
                <ShieldCheck size={14} color="#00f59b" />
                <span>Admin Panel</span>
              </button>
            )}

            {currentUser && (
              <button
                className="btn btn-primary btn-sm"
                onClick={handleLogout}
                title={`Signed in as ${currentUser.username}. Click to log out.`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <LogOut size={13} />
                <span>Logout ({currentUser.username})</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="app-body">
        {/* Mobile Sidebar Backdrop Overlay */}
        {mobileSidebarOpen && (
          <div
            className="sidebar-backdrop"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ==========================================================================
            SIDEBAR (LEFT)
            ========================================================================== */}
        <aside className={`sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
          {/* Sidebar Top Header & Brand Lockup */}
          <div className="sidebar-header">
            <div
              className="sidebar-brand"
              onClick={() => {
                setAppMode('landing');
                setMobileSidebarOpen(false);
              }}
              title="Return to Public Home Page"
            >
              <div className="sidebar-brand-avatar">
                <img src="/mm_logo.jpg" alt="Music Marshall" />
                <span className="brand-status-indicator" />
              </div>
              <div className="sidebar-brand-meta">
                <span className="sidebar-brand-title">Music Marshall</span>
                <span className="sidebar-brand-badge">HI-FI STREAMING</span>
              </div>
            </div>

            <button
              type="button"
              className="sidebar-home-quickbtn"
              onClick={() => {
                setAppMode('landing');
                setMobileSidebarOpen(false);
              }}
              title="Return to Public Home Page"
            >
              <Home size={14} />
              <span>Home</span>
            </button>
          </div>

          {/* Navigation Links Grouped by Category */}
          <nav className="sidebar-nav">
            <div className="sidebar-section-label">Main Catalog</div>

            {/* My MM Releases (FREE TO PLAY WITHOUT LOGIN) */}
            <button
              className={`nav-link ${activeTab === 'releases' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('releases');
                setMobileSidebarOpen(false);
              }}
            >
              <Disc3 size={18} className="nav-icon" />
              <span className="nav-label">My MM Productions</span>
              <span className="nav-pill nav-pill-emerald">FREE</span>
            </button>

            {/* Master Music Mixes */}
            <button
              className={`nav-link ${activeTab === 'mixes' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('mixes');
                setMobileSidebarOpen(false);
              }}
            >
              <Headphones size={18} className="nav-icon" />
              <span className="nav-label">Master Mixes</span>
              <span className="nav-pill nav-pill-cyan">MIXES</span>
            </button>

            {/* Mix Playlists with Clean Add Button */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <button
                className={`nav-link ${activeTab === 'playlists' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('playlists');
                  setMobileSidebarOpen(false);
                }}
              >
                <ListMusic size={18} className="nav-icon" />
                <span className="nav-label">Mix Playlists</span>
                <span className="nav-pill nav-pill-purple">{playlists.length}</span>
              </button>

              <button
                type="button"
                className="sidebar-add-playlist-btn"
                onClick={() => {
                  setPreselectedMixId(null);
                  setCreatePlaylistModalOpen(true);
                }}
                title="Create a new playlist from mixes"
              >
                <Plus size={13} />
                <span>+ Create Playlist</span>
              </button>
            </div>

            <div className="sidebar-section-label">Studio Vault</div>

            {/* Extended Library */}
            <button
              className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('home');
                setMobileSidebarOpen(false);
              }}
            >
              <Music size={18} className="nav-icon" />
              <span className="nav-label">All Master Tracks</span>
            </button>

            <button
              className={`nav-link ${activeTab === 'search' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('search');
                setMobileSidebarOpen(false);
              }}
            >
              <Search size={18} className="nav-icon" />
              <span className="nav-label">Search Library</span>
            </button>


            <div className="sidebar-section-label">Community & Support</div>

            {/* Notice Board & Events */}
            <button
              className={`nav-link ${activeTab === 'notices' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('notices');
                setMobileSidebarOpen(false);
              }}
            >
              <Calendar size={18} className="nav-icon" />
              <span className="nav-label">Notice Board</span>
            </button>

            {/* Technical & Admin Support */}
            <button
              className={`nav-link ${activeTab === 'support' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('support');
                setMobileSidebarOpen(false);
              }}
            >
              <HelpCircle size={18} className="nav-icon" />
              <span className="nav-label">Support Desk</span>
            </button>

            {currentUser?.role === 'admin' && (
              <>
                <div className="sidebar-section-label">Administration</div>
                <button
                  className={`nav-link ${activeTab === 'admin' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('admin');
                    setMobileSidebarOpen(false);
                  }}
                >
                  <Shield size={18} className="nav-icon" />
                  <span className="nav-label">Admin Panel</span>
                  <span className="nav-pill nav-pill-gold">ADMIN</span>
                </button>
              </>
            )}
          </nav>

          {/* Preferences Control Box */}
          <div className="sidebar-pref-box">
            <button
              type="button"
              className="sidebar-pref-btn"
              onClick={() => setPreferencesModalOpen(true)}
              title="Edit playback preferences (loop mix, stop alerts)"
            >
              <div className="sidebar-pref-left">
                <Settings size={14} className="sidebar-pref-icon" />
                <span className="sidebar-pref-title">Preferences</span>
              </div>
              <div className={`sidebar-pref-badge ${preferences.repeatMixLoop ? 'active' : ''}`}>
                <span className="pref-indicator-dot" />
                <span>{preferences.repeatMixLoop ? 'Loop ON' : 'Loop OFF'}</span>
              </div>
            </button>
          </div>
        </aside>

        {/* ==========================================================================
            MAIN CONTENT VIEWPORT
            ========================================================================== */}
        <main className="main-viewport">
          {/* Sticky Top Header */}
          <header className="top-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
              <button
                className="mobile-menu-btn"
                onClick={() => setMobileSidebarOpen((prev) => !prev)}
                title="Toggle Menu"
                aria-label="Toggle navigation menu"
              >
                <Menu size={22} />
              </button>

              <div className="search-box">
                <Search size={16} color="#64748b" />
                <input
                  type="text"
                  placeholder="Search tracks, artists, genres..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (activeTab !== 'search') {
                      setActiveTab('search');
                    }
                  }}
                />
                <span className="search-kbd-hint">⌘K</span>
              </div>
            </div>

            <div className="header-user-actions">
              <div className="studio-hi-res-badge" title="Music Marshall Direct Hi-Res Audio Engine">
                <span className="studio-pulse-dot"></span>
                <span>96kHz / 24-bit Hi-Res</span>
              </div>
              {currentUser ? (
                <div className="user-dropdown-wrapper">
                  <button
                    type="button"
                    className={`user-profile-trigger ${userDropdownOpen ? 'is-active' : ''}`}
                    onClick={() => setUserDropdownOpen((prev) => !prev)}
                    title="Open user profile & actions menu"
                    aria-expanded={userDropdownOpen}
                  >
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: currentUser.role === 'admin' ? 'linear-gradient(135deg, #00f59b 0%, #00d2ff 100%)' : 'rgba(255, 255, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: currentUser.role === 'admin' ? '#07090e' : '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.78rem'
                    }}>
                      {currentUser.username.charAt(0).toUpperCase()}
                    </div>
                    <span>{currentUser.username}</span>
                    <span className="user-role-tag">{currentUser.role}</span>
                    {currentUser.isEmailVerified && (
                      <span className={`user-verified-badge ${currentUser.role === 'admin' ? 'admin' : ''}`}>
                        {currentUser.role === 'admin' ? 'Admin 🛡️' : 'Verified ✓'}
                      </span>
                    )}
                    <ChevronDown size={14} className="chevron-icon" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="luxury-dropdown-menu user-dropdown-popover"
                      style={{ position: 'absolute' }}
                    >
                      <div className="luxury-dropdown-header">
                        <div className="luxury-dropdown-title">
                          <UserIcon size={13} />
                          <span>{currentUser.username}</span>
                          <span className="user-role-tag" style={{ marginLeft: 'auto' }}>{currentUser.role}</span>
                        </div>
                        <div className="luxury-dropdown-subtitle" style={{ fontSize: '0.74rem' }}>
                          {currentUser.email}
                        </div>
                        <div style={{ marginTop: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
                            Ref: <strong>{currentUser.referralCode}</strong>
                          </span>
                          {currentUser.isLoyaltyEnrolled && (
                            <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', fontWeight: 700 }}>
                              {currentUser.loyaltyTier || 'VIP Member'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <button
                          type="button"
                          className="luxury-dropdown-item"
                          onClick={() => {
                            setAppMode('landing');
                            setUserDropdownOpen(false);
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Home size={14} />
                            <span>Return to Home Page</span>
                          </span>
                        </button>

                        <button
                          type="button"
                          className="luxury-dropdown-item"
                          onClick={() => {
                            setActiveTab('releases');
                            setUserDropdownOpen(false);
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Disc3 size={14} />
                            <span>My MM Productions</span>
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#00f59b', fontWeight: 800 }}>Free</span>
                        </button>

                        <button
                          type="button"
                          className="luxury-dropdown-item"
                          onClick={() => {
                            setActiveTab('mixes');
                            setUserDropdownOpen(false);
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ListMusic size={14} />
                            <span>Master Mixes & Vault</span>
                          </span>
                        </button>

                        <button
                          type="button"
                          className="luxury-dropdown-item"
                          onClick={() => {
                            setActiveTab('support');
                            setUserDropdownOpen(false);
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <HelpCircle size={14} />
                            <span>Support & Helpdesk</span>
                          </span>
                        </button>

                        {currentUser.role === 'admin' && (
                          <button
                            type="button"
                            className="luxury-dropdown-item"
                            style={{ color: '#00d2ff', fontWeight: 700 }}
                            onClick={() => {
                              setActiveTab('admin');
                              setUserDropdownOpen(false);
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Shield size={14} />
                              <span>Admin Control Panel</span>
                            </span>
                          </button>
                        )}

                        <div className="luxury-dropdown-divider" />

                        <button
                          type="button"
                          className="luxury-dropdown-item"
                          onClick={() => {
                            setPreferencesModalOpen(true);
                            setUserDropdownOpen(false);
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Settings size={14} />
                            <span>Studio Preferences</span>
                          </span>
                          <span style={{ fontSize: '0.7rem', color: preferences.repeatMixLoop ? '#00f59b' : '#94a3b8', fontWeight: 700 }}>
                            {preferences.repeatMixLoop ? 'Loop: ON' : 'Loop: OFF'}
                          </span>
                        </button>

                        <div className="luxury-dropdown-divider" />

                        <button
                          type="button"
                          className="luxury-dropdown-item danger"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            handleLogout();
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <LogOut size={14} />
                            <span>Sign Out / Logout</span>
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge-free-notice" style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 700 }}>
                    MM Releases Free to Play
                  </span>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setAuthMessage(null);
                      setAuthTab('login');
                      setAuthModalOpen(true);
                    }}
                  >
                    Log In
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setAuthMessage(null);
                      setAuthTab('register');
                      setAuthModalOpen(true);
                    }}
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </header>

          {/* Dynamic Content Views */}
          <div className="page-container">
            {/* VIEW 0: MY MM RELEASES (AVAILABLE WITHOUT LOGIN) */}
            {activeTab === 'releases' && (
              <div>
                <div className="hero-card" style={{ background: 'linear-gradient(135deg, #052e16 0%, #0f172a 100%)' }}>
                  <div className="hero-content">
                    <span className="hero-pill" style={{ background: 'rgba(74, 222, 128, 0.2)', color: '#4ade80' }}>
                      Official Releases • Free to Stream Without Login
                    </span>
                    <h1 className="hero-title">My MM Productions</h1>
                    <p className="hero-desc">
                      Official songs downloaded directly from <em>mymusicmarshall.com/Mix/ListReleases</em>. 
                      These tracks are freely available to everyone without requiring an account.
                    </p>
                    <div className="hero-actions-group" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                      <button
                        className="btn btn-accent btn-hero-lg"
                        onClick={() => handlePlaySong(mmReleases[0])}
                      >
                        <Play size={18} fill="white" />
                        <span>Play What Will Be</span>
                      </button>
                      <button
                        className="btn btn-outline btn-hero-lg hero-home-btn"
                        style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.08)' }}
                        onClick={() => setAppMode('landing')}
                        title="Return to Home Page"
                      >
                        <Home size={18} />
                        <span>Home Page</span>
                      </button>
                    </div>
                  </div>
                  <img
                    src={dashboardFeatureImage || "/mm_banner.png"}
                    alt="Music Marshall Banner"
                    className="hero-banner-img"
                  />
                </div>

                <div className="section-header">
                  <div>
                    <h2 className="section-title">Official MM Productions ({mmReleases.length})</h2>
                    <p className="section-subtitle">
                      Streamable by all guests and members with zero restrictions
                    </p>
                  </div>
                </div>

                <table className="song-table">
                  <thead>
                    <tr>
                      <th>Title & Artist</th>
                      <th>Album / Description</th>
                      <th>Genre</th>
                      <th>Duration</th>
                      <th style={{ textAlign: 'center' }}>Stream</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mmReleases.map((song) => {
                      const isCurrent = currentSong?.id === song.id;
                      return (
                        <tr
                          key={song.id}
                          className={`song-row ${isCurrent ? 'is-active' : ''}`}
                          onClick={() => handlePlaySong(song)}
                        >
                          <td>
                            <div className="song-title-group">
                              <div style={{ position: 'relative', width: '40px', height: '40px', flexShrink: 0 }}>
                                <img
                                  src="/headphone_logo.png"
                                  alt={song.title}
                                  className="song-cover-thumb"
                                  style={{ width: '100%', height: '100%', margin: 0 }}
                                />
                                {isCurrent && isPlaying && (
                                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div className="mini-equalizer">
                                      <span className="eq-bar"></span>
                                      <span className="eq-bar"></span>
                                      <span className="eq-bar"></span>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="song-title-meta">
                                <span className="song-title">{song.title}</span>
                                {song.artist?.trim() ? <span className="song-artist">{song.artist}</span> : null}
                              </div>
                            </div>
                          </td>
                          <td style={{ color: '#64748b', fontSize: '0.86rem' }}>
                            {song.description || song.album}
                          </td>
                          <td>
                            <span className="badge badge-genre">{song.genre}</span>
                          </td>
                          <td style={{ color: '#64748b', fontSize: '0.86rem' }}>
                            {formatTime(song.duration)}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              className="btn-play-table"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlaySong(song);
                              }}
                              title="Play Free (No Login Needed)"
                            >
                              {isCurrent && isPlaying ? (
                                <Pause size={18} fill="white" />
                              ) : (
                                <Play size={18} fill="white" />
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* VIEW: MASTER MUSIC MIXES (SELECT MUSIC MIX TO PLAY FROM A LIST) */}
            {activeTab === 'mixes' && (
              <MusicMixesView
                songs={songs}
                currentSong={currentSong}
                isPlaying={isPlaying}
                onPlaySong={handlePlaySong}
                onOpenCreatePlaylist={(mixId) => {
                  setPreselectedMixId(mixId || null);
                  setCreatePlaylistModalOpen(true);
                }}
                onAddToPlaylist={handleAddToPlaylist}
                playlists={playlists}
                currentUser={currentUser}
                repeatMixLoop={preferences.repeatMixLoop}
                onToggleLoop={() =>
                  setPreferences((p) => ({ ...p, repeatMixLoop: !p.repeatMixLoop }))
                }
              />
            )}

            {/* VIEW: MIX PLAYLISTS (CREATE A PLAYLIST & VIEW PLAYLIST) */}
            {activeTab === 'playlists' && (
              <PlaylistsView
                playlists={playlists}
                songs={songs}
                currentSong={currentSong}
                isPlaying={isPlaying}
                onPlaySong={handlePlaySong}
                onCreatePlaylist={handleCreatePlaylist}
                onDeletePlaylist={handleDeletePlaylist}
                onRemoveSongFromPlaylist={handleRemoveSongFromPlaylist}
                currentUser={currentUser}
                createModalOpen={createPlaylistModalOpen}
                onCloseCreateModal={() => {
                  setCreatePlaylistModalOpen(false);
                  setPreselectedMixId(null);
                }}
                onOpenCreateModal={() => {
                  setPreselectedMixId(null);
                  setCreatePlaylistModalOpen(true);
                }}
                preselectedSongId={preselectedMixId}
              />
            )}

            {/* VIEW: NOTICE BOARD & EVENT FLYERS */}
            {activeTab === 'notices' && (
              <NoticeBoardView
                flyers={flyers}
                currentUser={currentUser}
                onOpenAdminFlyerUpload={() => setActiveTab('admin')}
                onDeleteFlyer={handleDeleteFlyer}
              />
            )}

            {/* VIEW: TECHNICAL & ADMIN SUPPORT */}
            {activeTab === 'support' && (
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
            )}

            {/* VIEW 1: HOME (ALL TRACKS) */}
            {activeTab === 'home' && (
              <div>
                <div className="section-header">
                  <div>
                    <h2 className="section-title">All Catalog Tracks ({songs.length})</h2>
                    <p className="section-subtitle">
                      My MM Releases are free to stream. Extended catalog masters require VIP login.
                    </p>
                  </div>
                </div>

                <table className="song-table">
                  <thead>
                    <tr>
                      <th className="col-num">#</th>
                      <th>Title & Artist</th>
                      <th>Access Tier</th>
                      <th>Genre</th>
                      <th>Duration</th>
                      <th style={{ textAlign: 'center' }}>Play</th>
                    </tr>
                  </thead>
                  <tbody>
                    {songs.map((song, index) => {
                      const isCurrent = currentSong?.id === song.id;
                      return (
                        <tr
                          key={song.id}
                          className={`song-row ${isCurrent ? 'is-active' : ''}`}
                          onClick={() => handlePlaySong(song)}
                        >
                          <td className="col-num">
                            {isCurrent && isPlaying ? (
                              <div className="mini-equalizer" title="Playing Now">
                                <span className="eq-bar"></span>
                                <span className="eq-bar"></span>
                                <span className="eq-bar"></span>
                              </div>
                            ) : (
                              index + 1
                            )}
                          </td>
                          <td>
                            <div className="song-title-group">
                              <img
                                src={song.coverUrl}
                                alt={song.title}
                                className="song-cover-thumb"
                              />
                              <div className="song-title-meta">
                                <span className="song-title">{song.title}</span>
                                {song.artist?.trim() ? <span className="song-artist">{song.artist}</span> : null}
                              </div>
                            </div>
                          </td>
                          <td>
                            {song.isMmRelease ? (
                              <span className="badge" style={{ background: '#dcfce7', color: '#166534', fontWeight: 700 }}>
                                Free Release
                              </span>
                            ) : (
                              <span className="badge" style={{ background: '#fef3c7', color: '#92400e', fontWeight: 700 }}>
                                VIP Only
                              </span>
                            )}
                          </td>
                          <td>
                            <span className="badge badge-genre">{song.genre}</span>
                          </td>
                          <td style={{ color: '#64748b', fontSize: '0.86rem' }}>
                            {formatTime(song.duration)}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              className="btn-play-table"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlaySong(song);
                              }}
                              title={song.isMmRelease || currentUser ? 'Play' : 'Sign in to stream VIP track'}
                            >
                              {isCurrent && isPlaying ? (
                                <Pause size={18} fill="white" />
                              ) : (
                                <Play size={18} fill="white" />
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* VIEW 2: SEARCH */}
            {activeTab === 'search' && (
              <div>
                <div className="section-header">
                  <div>
                    <h2 className="section-title">Search Songs</h2>
                    <p className="section-subtitle">
                      Filter by track title, artist name, or genre
                    </p>
                  </div>
                </div>

                {displayedSongs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
                    <p>No tracks matching "{searchQuery}"</p>
                  </div>
                ) : (
                  <table className="song-table">
                    <thead>
                      <tr>
                        <th className="col-num">#</th>
                        <th>Title & Artist</th>
                        <th>Access</th>
                        <th>Genre</th>
                        <th>Duration</th>
                        <th style={{ textAlign: 'center' }}>Play</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedSongs.map((song, index) => {
                        const isCurrent = currentSong?.id === song.id;
                        return (
                          <tr
                            key={song.id}
                            className={`song-row ${isCurrent ? 'is-active' : ''}`}
                            onClick={() => handlePlaySong(song)}
                          >
                            <td className="col-num">
                              {isCurrent && isPlaying ? (
                                <div className="mini-equalizer" title="Playing Now">
                                  <span className="eq-bar"></span>
                                  <span className="eq-bar"></span>
                                  <span className="eq-bar"></span>
                                </div>
                              ) : (
                                index + 1
                              )}
                            </td>
                            <td>
                              <div className="song-title-group">
                                <img
                                  src={song.coverUrl}
                                  alt={song.title}
                                  className="song-cover-thumb"
                                />
                                <div className="song-title-meta">
                                  <span className="song-title">{song.title}</span>
                                  {song.artist?.trim() ? <span className="song-artist">{song.artist}</span> : null}
                                </div>
                              </div>
                            </td>
                            <td>
                              {song.isMmRelease ? (
                                <span className="badge" style={{ background: '#dcfce7', color: '#166534' }}>Free</span>
                              ) : (
                                <span className="badge" style={{ background: '#fef3c7', color: '#92400e' }}>VIP</span>
                              )}
                            </td>
                            <td>
                              <span className="badge badge-genre">{song.genre}</span>
                            </td>
                            <td style={{ color: '#64748b', fontSize: '0.86rem' }}>
                              {formatTime(song.duration)}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                className="btn-play-table"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlaySong(song);
                                }}
                              >
                                {isCurrent && isPlaying ? (
                                  <Pause size={18} fill="white" />
                                ) : (
                                  <Play size={18} fill="white" />
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}


            {/* VIEW 4: ADMIN PANEL (STRICTLY ADMINS ONLY) */}
            {activeTab === 'admin' && (
              currentUser?.role === 'admin' ? (
                <div>
                  <div className="section-header">
                    <div>
                      <h2 className="section-title">Music Marshall Control Panel</h2>
                      <p className="section-subtitle">
                        Administrative command center for memberships, audio catalog, flyers, and broadcasting.
                      </p>
                    </div>
                  </div>

                  {/* Top Grid: Upload & Add Song (Left) and 1 Promo Code (Right) */}
                  <div className="admin-grid" style={{ marginBottom: '24px' }}>
                        <div className="admin-card">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                            <Upload size={18} />
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                              Upload & Add Song
                            </h3>
                          </div>

                          <form onSubmit={handleAddSong}>
                            <div className="form-group">
                              <label>Audio Source</label>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  type="button"
                                  className={`btn btn-sm ${audioSourceType === 'upload' ? 'btn-primary' : 'btn-outline'}`}
                                  onClick={() => setAudioSourceType('upload')}
                                >
                                  <Upload size={14} />
                                  <span>Upload from Computer</span>
                                </button>
                                <button
                                  type="button"
                                  className={`btn btn-sm ${audioSourceType === 'preset' ? 'btn-primary' : 'btn-outline'}`}
                                  onClick={() => setAudioSourceType('preset')}
                                >
                                  <FileAudio size={14} />
                                  <span>Server Master Files</span>
                                </button>
                              </div>
                            </div>

                            {audioSourceType === 'upload' && (
                              <div className="form-group">
                                <label>Audio File (.mp3, .wav, .flac, .m4a)</label>
                                <input
                                  type="file"
                                  ref={audioFileInputRef}
                                  accept="audio/*"
                                  onChange={handleAudioFileSelect}
                                  style={{ display: 'none' }}
                                />
                                <div
                                  className={`file-upload-box ${uploadedAudioFile ? 'has-file' : ''}`}
                                  onClick={() => audioFileInputRef.current?.click()}
                                >
                                  <FileAudio size={28} className="file-upload-icon" />
                                  {uploadedAudioFile ? (
                                    <>
                                      <span className="file-pill">
                                        ✓ {uploadedAudioFile.name} ({(uploadedAudioFile.size / 1024 / 1024).toFixed(2)} MB)
                                      </span>
                                      <span className="file-upload-hint">
                                        Detected Length: {formatTime(detectedDuration)} • Click to replace
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="file-upload-text">Click to choose or drag & drop an audio file</span>
                                      <span className="file-upload-hint">Supports MP3, WAV, AAC, FLAC high-res audio</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}

                            {audioSourceType === 'preset' && (
                              <div className="form-group">
                                <label>Pre-Downloaded Master Track</label>
                                <select
                                  className="form-control"
                                  value={newAudioUrl}
                                  onChange={(e) => setNewAudioUrl(e.target.value)}
                                >
                                  {songs.map((s) => (
                                    <option key={s.id} value={s.audioUrl}>
                                      {s.title} ({s.artist})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            <div className="form-group">
                              <label>Track Title</label>
                              <input
                                type="text"
                                required
                                className="form-control"
                                placeholder="e.g., Reggae Vibration"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                              />
                            </div>

                            <div className="form-group">
                              <label>Artist Name</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="e.g., Stevie Malekuu"
                                value={newArtist}
                                onChange={(e) => setNewArtist(e.target.value)}
                              />
                            </div>

                            <div className="form-group">
                              <label>Album / Release Name</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Music Marshall Studio Master"
                                value={newAlbum}
                                onChange={(e) => setNewAlbum(e.target.value)}
                              />
                            </div>

                            <div className="form-group">
                              <label>Release Category</label>
                              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                                  <input
                                    type="radio"
                                    name="releaseType"
                                    checked={isNewMmRelease}
                                    onChange={() => setIsNewMmRelease(true)}
                                  />
                                  <span>My MM Release (Playable without login)</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                                  <input
                                    type="radio"
                                    name="releaseType"
                                    checked={!isNewMmRelease}
                                    onChange={() => setIsNewMmRelease(false)}
                                  />
                                  <span>VIP Vault (Requires Login)</span>
                                </label>
                              </div>
                            </div>

                            {/* Mix Tag & Downloadable Tag */}
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '12px',
                                background: 'rgba(255, 255, 255, 0.04)',
                                padding: '12px 14px',
                                borderRadius: '10px',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                marginBottom: '14px'
                              }}
                            >
                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                                <input
                                  type="checkbox"
                                  checked={isNewMix}
                                  onChange={(e) => setIsNewMix(e.target.checked)}
                                  style={{ accentColor: '#38bdf8' }}
                                />
                                <span>Tag as Music Mix / Set 🔥</span>
                              </label>

                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                                <input
                                  type="checkbox"
                                  checked={isNewDownloadable}
                                  onChange={(e) => setIsNewDownloadable(e.target.checked)}
                                  style={{ accentColor: '#16a34a' }}
                                />
                                <span>Allow Audio Download ⬇</span>
                              </label>
                            </div>

                            {/* Cover Art Image Upload */}
                            <div className="form-group">
                              <label>Cover Art (Optional Image)</label>
                              <input
                                type="file"
                                ref={coverFileInputRef}
                                accept="image/*"
                                onChange={handleCoverFileSelect}
                                style={{ display: 'none' }}
                              />
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <img
                                  src={uploadedCoverUrl || '/mm_logo.jpg'}
                                  alt="Cover preview"
                                  style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(255, 255, 255, 0.15)' }}
                                />
                                <button
                                  type="button"
                                  className="btn btn-outline btn-sm"
                                  onClick={() => coverFileInputRef.current?.click()}
                                >
                                  <ImageIcon size={14} />
                                  <span>{uploadedCoverUrl ? 'Change Cover' : 'Upload Cover Image'}</span>
                                </button>
                              </div>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                              <Plus size={16} />
                              <span>Publish Song to Catalog</span>
                            </button>
                          </form>
                        </div>

                    {/* 2. VIP Registration Promo Code (Only 1 Promo Code Shows) */}
                    <div className="admin-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                        <Ticket size={20} color="#fbbf24" />
                        <div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                            VIP Registration Promo Code
                          </h3>
                          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                            Single active code required for new listener registrations.
                          </p>
                        </div>
                      </div>

                      {(() => {
                        const primaryPromo = referralCodes[0] || {
                          code: 'MARSHALL-VIP',
                          description: 'Official Music Marshall VIP Access',
                          uses: 0
                        };
                        const isEditing = editingPromoCode === primaryPromo.code;

                        return (
                          <div>
                            {isEditing ? (
                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '12px',
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  padding: '16px',
                                  borderRadius: '12px',
                                  border: '1px solid rgba(255, 255, 255, 0.12)'
                                }}
                              >
                                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                                  Update Active Promo Code
                                </label>
                                <input
                                  type="text"
                                  value={editPromoCodeVal}
                                  onChange={(e) => setEditPromoCodeVal(e.target.value)}
                                  className="form-control"
                                  style={{ textTransform: 'uppercase', fontWeight: 800, fontSize: '0.95rem' }}
                                  placeholder="PROMO CODE"
                                />
                                <input
                                  type="text"
                                  value={editPromoDescVal}
                                  onChange={(e) => setEditPromoDescVal(e.target.value)}
                                  className="form-control"
                                  style={{ fontSize: '0.85rem' }}
                                  placeholder="Campaign description"
                                />
                                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                  <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    style={{ background: '#16a34a', borderColor: '#16a34a' }}
                                    onClick={() => handleSaveEditPromo(primaryPromo.code)}
                                  >
                                    <Save size={14} />
                                    <span>Save Promo Code</span>
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    onClick={() => setEditingPromoCode(null)}
                                  >
                                    <X size={14} />
                                    <span>Cancel</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                style={{
                                  padding: '24px 20px',
                                  borderRadius: '14px',
                                  border: '1px solid rgba(251, 191, 36, 0.35)',
                                  background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(15, 20, 36, 0.85) 100%)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '16px'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                                  <div>
                                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fbbf24', fontWeight: 800 }}>
                                      Active Code
                                    </span>
                                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.06em', marginTop: '2px' }}>
                                      {primaryPromo.code}
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span
                                      className="badge"
                                      style={{
                                        background: 'rgba(0, 245, 155, 0.15)',
                                        color: '#00f59b',
                                        border: '1px solid rgba(0, 245, 155, 0.3)',
                                        fontSize: '0.78rem',
                                        padding: '6px 12px',
                                        fontWeight: 700
                                      }}
                                    >
                                      {primaryPromo.uses} Redemptions
                                    </span>
                                    <button
                                      type="button"
                                      className="btn btn-outline btn-sm"
                                      style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                                      onClick={() => handleStartEditPromo(primaryPromo)}
                                      title="Edit this promo code"
                                    >
                                      <Edit3 size={13} />
                                      <span>Edit</span>
                                    </button>
                                  </div>
                                </div>

                                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                                  {primaryPromo.description}
                                </p>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                  <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                                    onClick={() => {
                                      navigator.clipboard.writeText(primaryPromo.code);
                                      setAdminToast(`Copied promo code "${primaryPromo.code}" to clipboard!`);
                                      setTimeout(() => setAdminToast(null), 3000);
                                    }}
                                  >
                                    <span>Copy Code</span>
                                  </button>
                                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                                    Share with listeners to register on the platform
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* 3. Branding & Banners + 4. Notice Board Flyers */}
                  <AdminFeatureImageCard
                    landingFeatureImage={landingFeatureImage}
                    onSaveLandingFeatureImage={(url) => setLandingFeatureImage(url)}
                    dashboardFeatureImage={dashboardFeatureImage}
                    onSaveDashboardFeatureImage={(url) => setDashboardFeatureImage(url)}
                    onAddEventFlyer={handleAddFlyer}
                    onToast={(msg) => {
                      setAdminToast(msg);
                      setTimeout(() => setAdminToast(null), 3500);
                    }}
                  />
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '80px 20px', maxWidth: '480px', margin: '0 auto' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fee2e2', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Shield size={28} />
                  </div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Administrator Access Only</h2>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '24px' }}>
                    The Music Marshall Control Panel is strictly restricted to platform administrators. Please sign in with an administrator account to manage tracks and users.
                  </p>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setAuthMessage('Sign in with admin credentials to access the control panel.');
                        setAuthTab('login');
                        setAuthModalOpen(true);
                      }}
                    >
                      Sign In as Administrator
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => setActiveTab('releases')}
                    >
                      Back to Music
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </main>
      </div>

      {/* ==========================================================================
          BOTTOM PLAYER BAR (SPOTIFY STYLE)
          ========================================================================== */}
      <footer className="player-bar">
        {/* Left: Track Meta */}
        <div className="player-left">
          {currentSong ? (
            <>
              <img
                src={currentSong.coverUrl}
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
            </>
          ) : (
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Select a song to play
            </div>
          )}
        </div>

        {/* Center: Playback Controls & Scrubber */}
        <div className="player-center">
          <div className="player-controls">
            <button
              className={`ctrl-btn ${preferences.repeatMixLoop ? 'active-loop' : ''}`}
              style={{ color: preferences.repeatMixLoop ? '#22c55e' : '#64748b' }}
              onClick={() =>
                setPreferences((p) => ({ ...p, repeatMixLoop: !p.repeatMixLoop }))
              }
              title={preferences.repeatMixLoop ? 'Repeat mix selected: ON (Looping)' : 'Repeat mix selected: OFF'}
            >
              <Repeat size={18} />
            </button>
            <button className="ctrl-btn" onClick={handlePrevSong} title="Previous Track">
              <SkipBack size={22} />
            </button>
            <button
              className="ctrl-btn ctrl-btn-play"
              onClick={handleTogglePlayPause}
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
            </button>
            <button className="ctrl-btn" onClick={handleNextSong} title="Next Track">
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

        {/* Right: Volume & Tier Indicator */}
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

          {/* Download button for downloadable tracks */}
          {currentSong?.isDownloadable ? (
            <a
              href={currentSong.audioUrl}
              download={currentSong.artist?.trim() ? `${currentSong.title} - ${currentSong.artist}.mp3` : `${currentSong.title}.mp3`}
              className="ctrl-btn"
              style={{ color: '#16a34a', display: 'flex', alignItems: 'center' }}
              title="Download this audio mix (High-Res Studio MP3)"
            >
              <Download size={18} />
            </a>
          ) : (
            <span
              className="ctrl-btn"
              style={{ color: '#94a3b8', opacity: 0.35, cursor: 'not-allowed', display: 'flex', alignItems: 'center' }}
              title="Download restricted for this studio master"
            >
              <Download size={18} />
            </span>
          )}

          <div className="volume-box">
            <button
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

      {/* ==========================================================================
          AUTH & COMPULSORY REFERRAL MODAL
          ========================================================================== */}
      {authModalOpen && (
        <div className="modal-overlay" onClick={() => setAuthModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {authTab === 'login' ? 'Music Marshall Sign In' : 'Exclusive Registration'}
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
                  className={`tab-btn ${authTab === 'login' ? 'active' : ''}`}
                  onClick={() => {
                    setAuthTab('login');
                    setRegError(null);
                  }}
                >
                  Log In
                </button>
                <button
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
                      placeholder="Enter your email address"
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

                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="First Name"
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Last Name (not required)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Last Name (optional)"
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Email address</label>
                    <input
                      type="email"
                      required
                      className="form-control"
                      placeholder="name@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      required
                      className="form-control"
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                    />
                  </div>

                  <div
                    className="form-group"
                    style={{
                      background: 'rgba(0, 245, 155, 0.04)',
                      padding: '14px',
                      borderRadius: '10px',
                      border: '1px solid rgba(0, 245, 155, 0.22)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    <label style={{ color: 'var(--brand-accent, #00f59b)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Referral Code</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#94a3b8' }}>VIP Access Only</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="ENTER VIP REFERRAL CODE"
                      value={regReferralCode}
                      onChange={(e) => setRegReferralCode(e.target.value)}
                      style={{
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        background: 'rgba(0, 0, 0, 0.35)',
                        border: '1px solid rgba(0, 245, 155, 0.3)',
                        color: '#ffffff',
                      }}
                    />
                    <small style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '6px', display: 'block', lineHeight: 1.4 }}>
                      (Membership is by referral only. Please use the{' '}
                      <a
                        href="#contact-us"
                        onClick={(e) => {
                          e.preventDefault();
                          setAuthModalOpen(false);
                          setActiveTab('support');
                          const el = document.getElementById('contact-us');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        style={{ color: 'var(--brand-accent, #00f59b)', textDecoration: 'underline', fontWeight: 600, cursor: 'pointer' }}
                      >
                        contact us
                      </a>{' '}
                      link to request a code)
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

      {/* Admin Notification Toast */}
      {adminToast && (
        <div className="toast-notice">
          <CheckCircle2 size={18} color="#4ade80" />
          <span>{adminToast}</span>
        </div>
      )}


      {/* Preferences Modal (Loop Mix & Stop Alerts) */}
      <PreferencesModal
        isOpen={preferencesModalOpen}
        onClose={() => setPreferencesModalOpen(false)}
        preferences={preferences}
        onSavePreferences={(newPrefs) => {
          setPreferences(newPrefs);
          setAdminToast('Playback & notification preferences saved!');
          setTimeout(() => setAdminToast(null), 3000);
        }}
        userRole={currentUser?.role}
      />

      {/* Welcome Email Modal (Triggered immediately after user registration) */}
      <WelcomeEmailModal
        user={welcomeEmailUser}
        isOpen={welcomeEmailModalOpen}
        onClose={() => setWelcomeEmailModalOpen(false)}
        onStartListening={() => {
          setWelcomeEmailModalOpen(false);
          setAppMode('app');
          setActiveTab('mixes');
        }}
      />
    </div>
  );
}

export default App;
