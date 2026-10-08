import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  Users,
  Calendar,
  HelpCircle,
  Upload,
  Ticket,
  Search,
  CheckCircle2,
  Edit3,
  Trash2,
  UserCheck,
  UserX,
  Send,
  Plus,
  FileAudio,
  Image as ImageIcon,
  Clock,
  MapPin,
  Save,
  Play,
  Pause
} from 'lucide-react';
import type {
  User,
  EventFlyer,
  SupportTicket,
  Song,
  ReferralCode
} from '../types';
import { AdminEditUserModal } from './AdminEditUserModal';
import { AdminEmailBlastCard } from './AdminEmailBlastCard';

interface AdminPanelViewProps {
  currentUser: User | null;
  users: User[];
  onUpdateUser: (updatedUser: User) => void;
  onDeleteUser: (userId: string) => void;
  flyers: EventFlyer[];
  onAddFlyer: (flyerData: Omit<EventFlyer, 'id' | 'createdAt' | 'postedBy'>) => void;
  onDeleteFlyer: (flyerId: string) => void;
  supportTickets: SupportTicket[];
  onAdminReplyTicket: (ticketId: string, reply: string, status: 'in_progress' | 'resolved') => void;
  songs: Song[];
  onAddSong: (newSong: Song) => void;
  onDeleteSong: (songId: string) => void;
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  referralCodes: ReferralCode[];
  onUpdateReferralCode: (oldCode: string, newCode: string, newDesc: string) => void;
  landingFeatureImage?: string;
  onSaveLandingFeatureImage: (url: string) => void;
  dashboardFeatureImage?: string;
  onSaveDashboardFeatureImage: (url: string) => void;
  onToast: (msg: string) => void;
  onNavigateHome: () => void;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({
  currentUser,
  users,
  onUpdateUser,
  onDeleteUser,
  flyers,
  onAddFlyer,
  onDeleteFlyer,
  supportTickets,
  onAdminReplyTicket,
  songs,
  onAddSong,
  onDeleteSong,
  currentSong,
  isPlaying,
  onPlaySong,
  referralCodes,
  onUpdateReferralCode,
  landingFeatureImage,
  onSaveLandingFeatureImage,
  dashboardFeatureImage,
  onSaveDashboardFeatureImage,
  onToast,
  onNavigateHome
}) => {
  // Active Admin Section Tab
  const [adminTab, setAdminTab] = useState<'users' | 'notices' | 'support' | 'catalog' | 'promo'>('users');

  // --- 1. USER MANAGEMENT STATE ---
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'pending' | 'approved' | 'deactivated' | 'admin'>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const filteredUsers = users.filter((u) => {
    // Status filter
    if (userStatusFilter === 'pending' && u.accountStatus !== 'pending_approval') return false;
    if (userStatusFilter === 'approved' && u.accountStatus !== 'approved') return false;
    if (userStatusFilter === 'deactivated' && u.accountStatus !== 'deactivated') return false;
    if (userStatusFilter === 'admin' && u.role !== 'admin') return false;

    // Search query
    if (!userSearchQuery.trim()) return true;
    const q = userSearchQuery.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.referralCode?.toLowerCase().includes(q) ||
      `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase().includes(q)
    );
  });

  const pendingUsersCount = users.filter((u) => u.accountStatus === 'pending_approval').length;
  const approvedUsersCount = users.filter((u) => u.accountStatus === 'approved').length;

  const handleApproveUser = (user: User) => {
    const updated: User = {
      ...user,
      accountStatus: 'approved',
      isEmailVerified: true,
      approvedAt: new Date().toISOString().split('T')[0]
    };
    onUpdateUser(updated);
    onToast(`✓ Listener account ${user.username} approved! Activation email dispatched via SMTP.`);
  };

  const handleToggleDeactivateUser = (user: User) => {
    const newStatus = user.accountStatus === 'deactivated' ? 'approved' : 'deactivated';
    onUpdateUser({
      ...user,
      accountStatus: newStatus
    });
    onToast(`Account ${user.username} marked as ${newStatus}.`);
  };

  // --- 2. NOTICE BOARD FLYER STATE ---
  const [flyerTitle, setFlyerTitle] = useState('');
  const [flyerDate, setFlyerDate] = useState('');
  const [flyerLocation, setFlyerLocation] = useState('');
  const [flyerDesc, setFlyerDesc] = useState('');
  const [flyerImgUrl, setFlyerImgUrl] = useState('');
  const [flyerExtLink, setFlyerExtLink] = useState('');
  const flyerFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFlyerImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFlyerImgUrl(reader.result as string);
        onToast(`✓ Flyer image loaded: ${file.name}`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateFlyerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flyerTitle.trim() || !flyerDate.trim() || !flyerLocation.trim()) return;

    onAddFlyer({
      title: flyerTitle.trim(),
      eventDate: flyerDate.trim(),
      location: flyerLocation.trim(),
      description: flyerDesc.trim(),
      flyerUrl: flyerImgUrl || '/headphone_logo.png',
      externalLink: flyerExtLink.trim() || undefined
    });

    setFlyerTitle('');
    setFlyerDate('');
    setFlyerLocation('');
    setFlyerDesc('');
    setFlyerImgUrl('');
    setFlyerExtLink('');
    onToast('✓ Event flyer published to Notice Board bulletin!');
  };

  // --- 3. SUPPORT DESK STATE ---
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [ticketPriorityFilter, setTicketPriorityFilter] = useState<'all' | 'urgent' | 'high' | 'medium' | 'low'>('all');
  const [ticketReplies, setTicketReplies] = useState<{ [id: string]: string }>({});

  const filteredTickets = supportTickets.filter((t) => {
    if (ticketStatusFilter !== 'all' && t.status !== ticketStatusFilter) return false;
    if (ticketPriorityFilter !== 'all' && t.priority !== ticketPriorityFilter) return false;
    return true;
  });

  const openTicketsCount = supportTickets.filter((t) => t.status === 'open').length;

  const handleSendTicketReply = (ticketId: string, status: 'in_progress' | 'resolved') => {
    const replyText = ticketReplies[ticketId]?.trim();
    if (!replyText) {
      alert('Please enter a response message before submitting.');
      return;
    }
    onAdminReplyTicket(ticketId, replyText, status);
    setTicketReplies((prev) => ({ ...prev, [ticketId]: '' }));
    onToast(`✓ Reply sent and ticket marked as ${status}.`);
  };

  // --- 4. AUDIO CATALOG UPLOAD STATE ---
  const [audioSourceType, setAudioSourceType] = useState<'upload' | 'preset'>('upload');
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newAlbum, setNewAlbum] = useState('Music Marshall Studio Master');
  const [newGenre, setNewGenre] = useState('Rocksteady');
  const [newAudioUrl, setNewAudioUrl] = useState(songs[0]?.audioUrl || '');
  const [isNewMmRelease, setIsNewMmRelease] = useState(true);
  const [isNewMix, setIsNewMix] = useState(false);
  const [isNewDownloadable, setIsNewDownloadable] = useState(true);
  const [uploadedAudioFile, setUploadedAudioFile] = useState<File | null>(null);
  const [uploadedCoverUrl, setUploadedCoverUrl] = useState<string>('');
  const [detectedDuration, setDetectedDuration] = useState<number>(240);

  const audioFileInputRef = useRef<HTMLInputElement | null>(null);
  const coverFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAudioFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedAudioFile(file);
      const url = URL.createObjectURL(file);
      setNewAudioUrl(url);

      const rawName = file.name.replace(/\.[^/.]+$/, '');
      if (!newTitle) setNewTitle(rawName);

      const tempAudio = new Audio();
      tempAudio.src = url;
      tempAudio.onloadedmetadata = () => {
        if (tempAudio.duration && !isNaN(tempAudio.duration)) {
          setDetectedDuration(Math.round(tempAudio.duration));
        }
      };
      onToast(`✓ Audio file loaded: ${file.name}`);
    }
  };

  const handleCoverFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedCoverUrl(reader.result as string);
        onToast(`✓ Cover artwork loaded: ${file.name}`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublishSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newSong: Song = {
      id: `song-${Date.now()}`,
      title: newTitle.trim(),
      artist: newArtist.trim() || 'Wayne Armond / Music Marshall',
      album: newAlbum.trim(),
      duration: detectedDuration || 210,
      audioUrl: newAudioUrl,
      coverUrl: uploadedCoverUrl || '/headphone_logo.png',
      genre: newGenre,
      mood: 'chill',
      bpm: 90,
      isMmRelease: isNewMmRelease,
      isMix: isNewMix,
      isDownloadable: isNewDownloadable,
      uploadedAt: new Date().toISOString().split('T')[0]
    };

    onAddSong(newSong);
    setNewTitle('');
    setNewArtist('');
    setUploadedAudioFile(null);
    setUploadedCoverUrl('');
    onToast(`✓ Published track "${newSong.title}" to catalog!`);
  };

  // --- 5. PROMO CODE STATE ---
  const primaryPromo = referralCodes[0] || {
    code: 'MARSHALL-VIP',
    description: 'Official Music Marshall VIP Access',
    uses: 0
  };
  const [isEditingPromo, setIsEditingPromo] = useState(false);
  const [editPromoCodeVal, setEditPromoCodeVal] = useState(primaryPromo.code);
  const [editPromoDescVal, setEditPromoDescVal] = useState(primaryPromo.description);

  const handleSavePromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPromoCodeVal.trim()) return;
    onUpdateReferralCode(primaryPromo.code, editPromoCodeVal.trim().toUpperCase(), editPromoDescVal.trim());
    setIsEditingPromo(false);
    onToast(`✓ VIP Registration promo code updated to "${editPromoCodeVal.trim().toUpperCase()}".`);
  };

  // Banners input state
  const [landingBannerInput, setLandingBannerInput] = useState(landingFeatureImage || '');
  const [catalogBannerInput, setCatalogBannerInput] = useState(dashboardFeatureImage || '');

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Guard: Platform Admin Only (checked after all hooks to satisfy Rules of Hooks)
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="page-container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div
          style={{
            maxWidth: '480px',
            margin: '0 auto',
            background: 'rgba(15, 20, 36, 0.9)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '20px',
            padding: '40px 30px'
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            <ShieldCheck size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
            Administrator Access Restricted
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '24px' }}>
            The Music Marshall Control Panel is reserved strictly for authenticated platform administrators.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onNavigateHome}
          >
            Return to Music Marshall Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '1360px', margin: '0 auto', paddingBottom: '120px' }}>
      {/* Admin Control Center Header */}
      <div
        className="section-header"
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '24px',
          marginBottom: '28px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, rgba(0, 245, 155, 0.15) 0%, rgba(0, 210, 255, 0.15) 100%)',
                color: '#00f59b',
                padding: '4px 14px',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 800,
                border: '1px solid rgba(0, 245, 155, 0.3)',
                marginBottom: '10px'
              }}
            >
              <ShieldCheck size={14} color="#00f59b" />
              <span>ADMINISTRATIVE CONTROL CENTER</span>
            </div>
            <h1
              style={{
                fontSize: '2.1rem',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.025em',
                margin: '0 0 6px 0'
              }}
            >
              Music Marshall Admin Panel
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.94rem', margin: 0, maxWidth: '720px' }}>
              Clean, unified command desk to manage listener accounts, user approvals, event flyer notices, support inquiries, and music catalog.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                fontSize: '0.8rem',
                color: '#94a3b8',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              Logged in as: <strong style={{ color: '#00f59b' }}>{currentUser.username}</strong>
            </span>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px',
            marginTop: '24px'
          }}
        >
          <div
            style={{
              background: 'rgba(15, 20, 36, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(0, 245, 155, 0.12)', color: '#00f59b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>
                Total Users
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                {users.length}
              </div>
            </div>
          </div>

          <div
            style={{
              background: pendingUsersCount > 0 ? 'rgba(251, 191, 36, 0.12)' : 'rgba(15, 20, 36, 0.8)',
              border: `1px solid ${pendingUsersCount > 0 ? 'rgba(251, 191, 36, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#fbbf24', fontWeight: 700 }}>
                Pending Review
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                {pendingUsersCount}
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(15, 20, 36, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>
                Notice Flyers
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                {flyers.length}
              </div>
            </div>
          </div>

          <div
            style={{
              background: openTicketsCount > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(15, 20, 36, 0.8)',
              border: `1px solid ${openTicketsCount > 0 ? 'rgba(239, 68, 68, 0.35)' : 'rgba(255, 255, 255, 0.08)'}`,
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HelpCircle size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#ef4444', fontWeight: 700 }}>
                Open Tickets
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                {openTicketsCount}
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(15, 20, 36, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileAudio size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>
                Catalog Tracks
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                {songs.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Feature Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '28px',
          overflowX: 'auto',
          paddingBottom: '4px'
        }}
      >
        <button
          type="button"
          onClick={() => setAdminTab('users')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 700,
            background: adminTab === 'users' ? 'rgba(0, 245, 155, 0.15)' : 'transparent',
            color: adminTab === 'users' ? '#00f59b' : '#94a3b8',
            borderBottom: adminTab === 'users' ? '2px solid #00f59b' : '2px solid transparent',
            whiteSpace: 'nowrap'
          }}
        >
          <Users size={16} />
          <span>All Users ({users.length})</span>
          {pendingUsersCount > 0 && (
            <span
              style={{
                background: '#fbbf24',
                color: '#07090e',
                fontSize: '0.7rem',
                fontWeight: 900,
                padding: '1px 6px',
                borderRadius: '9999px'
              }}
            >
              {pendingUsersCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('notices')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 700,
            background: adminTab === 'notices' ? 'rgba(0, 245, 155, 0.15)' : 'transparent',
            color: adminTab === 'notices' ? '#00f59b' : '#94a3b8',
            borderBottom: adminTab === 'notices' ? '2px solid #00f59b' : '2px solid transparent',
            whiteSpace: 'nowrap'
          }}
        >
          <Calendar size={16} />
          <span>Notice Board Admin ({flyers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('support')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 700,
            background: adminTab === 'support' ? 'rgba(0, 245, 155, 0.15)' : 'transparent',
            color: adminTab === 'support' ? '#00f59b' : '#94a3b8',
            borderBottom: adminTab === 'support' ? '2px solid #00f59b' : '2px solid transparent',
            whiteSpace: 'nowrap'
          }}
        >
          <HelpCircle size={16} />
          <span>Support Desk Admin ({supportTickets.length})</span>
          {openTicketsCount > 0 && (
            <span
              style={{
                background: '#ef4444',
                color: '#ffffff',
                fontSize: '0.7rem',
                fontWeight: 900,
                padding: '1px 6px',
                borderRadius: '9999px'
              }}
            >
              {openTicketsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('catalog')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 700,
            background: adminTab === 'catalog' ? 'rgba(0, 245, 155, 0.15)' : 'transparent',
            color: adminTab === 'catalog' ? '#00f59b' : '#94a3b8',
            borderBottom: adminTab === 'catalog' ? '2px solid #00f59b' : '2px solid transparent',
            whiteSpace: 'nowrap'
          }}
        >
          <Upload size={16} />
          <span>Audio Upload & Catalog</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('promo')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 700,
            background: adminTab === 'promo' ? 'rgba(0, 245, 155, 0.15)' : 'transparent',
            color: adminTab === 'promo' ? '#00f59b' : '#94a3b8',
            borderBottom: adminTab === 'promo' ? '2px solid #00f59b' : '2px solid transparent',
            whiteSpace: 'nowrap'
          }}
        >
          <Ticket size={16} />
          <span>VIP Promo & Banners</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: ALL USERS MANAGEMENT ("ALL USER USERS")
          ========================================================================= */}
      {adminTab === 'users' && (
        <div>
          {/* Search & Filters */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
              marginBottom: '20px'
            }}
          >
            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`btn btn-sm ${userStatusFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setUserStatusFilter('all')}
              >
                All Users ({users.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${userStatusFilter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setUserStatusFilter('pending')}
                style={{
                  color: userStatusFilter === 'pending' ? undefined : '#fbbf24',
                  borderColor: userStatusFilter === 'pending' ? undefined : 'rgba(251, 191, 36, 0.3)'
                }}
              >
                Pending Review ({pendingUsersCount})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${userStatusFilter === 'approved' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setUserStatusFilter('approved')}
              >
                Approved ({approvedUsersCount})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${userStatusFilter === 'deactivated' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setUserStatusFilter('deactivated')}
              >
                Deactivated
              </button>
              <button
                type="button"
                className={`btn btn-sm ${userStatusFilter === 'admin' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setUserStatusFilter('admin')}
              >
                Admins
              </button>
            </div>

            {/* User Search Input */}
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '11px', color: '#64748b' }} />
              <input
                type="text"
                placeholder="Search username, email, code..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  fontSize: '0.86rem'
                }}
              />
            </div>
          </div>

          {/* User Table */}
          <div
            style={{
              background: 'rgba(15, 20, 36, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              overflow: 'hidden',
              marginBottom: '32px'
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table className="song-table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>Listener / User</th>
                    <th>Email Address</th>
                    <th>Role</th>
                    <th>Account Status</th>
                    <th>Verification</th>
                    <th>Referral Code</th>
                    <th>Loyalty Tier</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                        No users match the search and filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const isAdm = user.role === 'admin';
                      const isPending = user.accountStatus === 'pending_approval';
                      const isDeactivated = user.accountStatus === 'deactivated';

                      return (
                        <tr key={user.id} className="song-row">
                          {/* User info */}
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div
                                style={{
                                  width: '34px',
                                  height: '34px',
                                  borderRadius: '50%',
                                  background: isAdm
                                    ? 'linear-gradient(135deg, #00f59b 0%, #00d2ff 100%)'
                                    : 'rgba(255, 255, 255, 0.1)',
                                  color: isAdm ? '#07090e' : '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800,
                                  fontSize: '0.8rem',
                                  flexShrink: 0
                                }}
                              >
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.88rem' }}>
                                  {user.username}
                                </div>
                                {(user.firstName || user.lastName) && (
                                  <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                                    {user.firstName} {user.lastName}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Email */}
                          <td style={{ color: '#cbd5e1', fontSize: '0.84rem' }}>
                            {user.email}
                          </td>

                          {/* Role */}
                          <td>
                            {isAdm ? (
                              <span
                                style={{
                                  background: 'rgba(0, 245, 155, 0.15)',
                                  color: '#00f59b',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  border: '1px solid rgba(0, 245, 155, 0.3)'
                                }}
                              >
                                Admin 🛡️
                              </span>
                            ) : (
                              <span
                                style={{
                                  background: 'rgba(255, 255, 255, 0.08)',
                                  color: '#94a3b8',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700
                                }}
                              >
                                Member
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td>
                            {isPending ? (
                              <span
                                style={{
                                  background: 'rgba(251, 191, 36, 0.15)',
                                  color: '#fbbf24',
                                  padding: '4px 10px',
                                  borderRadius: '9999px',
                                  fontSize: '0.74rem',
                                  fontWeight: 800,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <Clock size={12} />
                                <span>Pending Approval</span>
                              </span>
                            ) : isDeactivated ? (
                              <span
                                style={{
                                  background: 'rgba(239, 68, 68, 0.15)',
                                  color: '#ef4444',
                                  padding: '4px 10px',
                                  borderRadius: '9999px',
                                  fontSize: '0.74rem',
                                  fontWeight: 800
                                }}
                              >
                                Deactivated
                              </span>
                            ) : (
                              <span
                                style={{
                                  background: 'rgba(34, 197, 94, 0.15)',
                                  color: '#22c55e',
                                  padding: '4px 10px',
                                  borderRadius: '9999px',
                                  fontSize: '0.74rem',
                                  fontWeight: 800,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <CheckCircle2 size={12} />
                                <span>Approved</span>
                              </span>
                            )}
                          </td>

                          {/* Email Verified */}
                          <td>
                            {user.isEmailVerified ? (
                              <span style={{ color: '#22c55e', fontSize: '0.76rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle2 size={13} />
                                <span>Verified</span>
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '0.76rem' }}>
                                Unverified
                              </span>
                            )}
                          </td>

                          {/* Referral Code */}
                          <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#cbd5e1' }}>
                            {user.referralCode || 'DIRECT'}
                          </td>

                          {/* Loyalty Tier */}
                          <td>
                            <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                              {user.loyaltyTier || 'Standard'} ({user.loyaltyPoints || 0} pts)
                            </span>
                          </td>

                          {/* Actions */}
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              {isPending && (
                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleApproveUser(user)}
                                  title="Approve member and dispatch activation email"
                                  style={{ padding: '4px 10px', fontSize: '0.75rem', background: '#16a34a', borderColor: '#16a34a' }}
                                >
                                  <UserCheck size={13} />
                                  <span>Approve</span>
                                </button>
                              )}

                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => setEditingUser(user)}
                                title="Edit user details"
                                style={{ padding: '4px 8px' }}
                              >
                                <Edit3 size={13} />
                              </button>

                              {!isAdm && (
                                <>
                                  <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    onClick={() => handleToggleDeactivateUser(user)}
                                    title={isDeactivated ? 'Reactivate listener' : 'Deactivate listener'}
                                    style={{
                                      padding: '4px 8px',
                                      color: isDeactivated ? '#22c55e' : '#f59e0b',
                                      borderColor: isDeactivated ? 'rgba(34, 197, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'
                                    }}
                                  >
                                    {isDeactivated ? <UserCheck size={13} /> : <UserX size={13} />}
                                  </button>

                                  <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to delete user "${user.username}"?`)) {
                                        onDeleteUser(user.id);
                                        onToast(`User ${user.username} deleted.`);
                                      }
                                    }}
                                    title="Delete user"
                                    style={{ padding: '4px 8px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Integrated Broadcast Email Announcement Tool */}
          <div style={{ marginTop: '20px' }}>
            <AdminEmailBlastCard users={users} onToast={onToast} />
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: NOTICE BOARD ADMIN FEATURES
          ========================================================================= */}
      {adminTab === 'notices' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
          {/* Post New Event Flyer Form */}
          <div
            style={{
              background: 'rgba(15, 20, 36, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Post Event Flyer & Notice
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Announce upcoming sessions, soundclashes, and concerts on the Notice Board
                </span>
              </div>
            </div>

            <form onSubmit={handleCreateFlyerSubmit}>
              <div className="form-group">
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1' }}>Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kingston Dub Club & Soundclash Festival"
                  value={flyerTitle}
                  onChange={(e) => setFlyerTitle(e.target.value)}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1' }}>Event Date *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nov 28, 2026 • 8:00 PM"
                    value={flyerDate}
                    onChange={(e) => setFlyerDate(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1' }}>Location / Venue *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Skyline Drive, Kingston"
                    value={flyerLocation}
                    onChange={(e) => setFlyerLocation(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1' }}>Description</label>
                <textarea
                  rows={3}
                  placeholder="Details about artists performing, gate opening, admission..."
                  value={flyerDesc}
                  onChange={(e) => setFlyerDesc(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1' }}>External Ticket Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://tickets.mymusicalmarshall.com/event"
                  value={flyerExtLink}
                  onChange={(e) => setFlyerExtLink(e.target.value)}
                  className="form-control"
                />
              </div>

              {/* Flyer Image Upload */}
              <div className="form-group">
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1' }}>Flyer Artwork (Image File or URL)</label>
                <input
                  type="file"
                  ref={flyerFileInputRef}
                  accept="image/*"
                  onChange={handleFlyerImageSelect}
                  style={{ display: 'none' }}
                />
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                  {flyerImgUrl ? (
                    <img
                      src={flyerImgUrl}
                      alt="Flyer preview"
                      style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                    />
                  ) : (
                    <div style={{ width: '56px', height: '56px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                      <ImageIcon size={20} />
                    </div>
                  )}
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => flyerFileInputRef.current?.click()}
                  >
                    <Upload size={13} />
                    <span>Upload Image from Device</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Or paste an image URL (https://...)"
                  value={flyerImgUrl}
                  onChange={(e) => setFlyerImgUrl(e.target.value)}
                  className="form-control"
                  style={{ fontSize: '0.82rem' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '10px' }}
              >
                <Plus size={16} />
                <span>Publish Flyer to Notice Board</span>
              </button>
            </form>
          </div>

          {/* Manage Current Flyers List */}
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '14px', color: '#ffffff' }}>
              Active Notice Board Flyers ({flyers.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {flyers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(15, 20, 36, 0.5)', borderRadius: '14px', color: '#64748b' }}>
                  No event flyers active on the Notice Board.
                </div>
              ) : (
                flyers.map((flyer) => (
                  <div
                    key={flyer.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px',
                      borderRadius: '12px',
                      background: 'rgba(15, 20, 36, 0.75)',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <img
                        src={flyer.flyerUrl || '/headphone_logo.png'}
                        alt={flyer.title}
                        style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff', margin: '0 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {flyer.title}
                        </h4>
                        <div style={{ fontSize: '0.78rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} />
                          <span>{flyer.eventDate}</span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={11} />
                          <span>{flyer.location}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        if (confirm(`Remove event flyer "${flyer.title}" from Notice Board?`)) {
                          onDeleteFlyer(flyer.id);
                        }
                      }}
                      title="Delete event flyer"
                      style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', padding: '6px 10px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: SUPPORT DESK ADMIN FEATURES
          ========================================================================= */}
      {adminTab === 'support' && (
        <div>
          {/* Support Filter Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '20px'
            }}
          >
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`btn btn-sm ${ticketStatusFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setTicketStatusFilter('all')}
              >
                All Tickets ({supportTickets.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${ticketStatusFilter === 'open' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setTicketStatusFilter('open')}
                style={{
                  color: ticketStatusFilter === 'open' ? undefined : '#ef4444',
                  borderColor: ticketStatusFilter === 'open' ? undefined : 'rgba(239, 68, 68, 0.3)'
                }}
              >
                Open ({openTicketsCount})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${ticketStatusFilter === 'in_progress' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setTicketStatusFilter('in_progress')}
                style={{
                  color: ticketStatusFilter === 'in_progress' ? undefined : '#fbbf24',
                  borderColor: ticketStatusFilter === 'in_progress' ? undefined : 'rgba(251, 191, 36, 0.3)'
                }}
              >
                In Progress
              </button>
              <button
                type="button"
                className={`btn btn-sm ${ticketStatusFilter === 'resolved' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setTicketStatusFilter('resolved')}
                style={{
                  color: ticketStatusFilter === 'resolved' ? undefined : '#22c55e',
                  borderColor: ticketStatusFilter === 'resolved' ? undefined : 'rgba(34, 197, 94, 0.3)'
                }}
              >
                Resolved
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Priority:</span>
              <select
                className="form-control"
                style={{ width: '130px', padding: '4px 8px', fontSize: '0.8rem' }}
                value={ticketPriorityFilter}
                onChange={(e) => setTicketPriorityFilter(e.target.value as any)}
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Tickets Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredTickets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', background: 'rgba(15, 20, 36, 0.5)', borderRadius: '16px', color: '#64748b' }}>
                No support tickets found in this filter category.
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const isReplyEmpty = !ticketReplies[ticket.id]?.trim();
                return (
                  <div
                    key={ticket.id}
                    style={{
                      background: 'rgba(15, 20, 36, 0.85)',
                      border: `1px solid ${ticket.status === 'open' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(255, 255, 255, 0.08)'}`,
                      borderRadius: '16px',
                      padding: '20px',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span
                            style={{
                              background: ticket.status === 'open' ? 'rgba(239, 68, 68, 0.15)' : ticket.status === 'in_progress' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                              color: ticket.status === 'open' ? '#ef4444' : ticket.status === 'in_progress' ? '#fbbf24' : '#22c55e',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              textTransform: 'uppercase'
                            }}
                          >
                            {ticket.status.replace('_', ' ')}
                          </span>

                          <span
                            style={{
                              background: 'rgba(56, 189, 248, 0.12)',
                              color: '#38bdf8',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 700
                            }}
                          >
                            {ticket.category}
                          </span>

                          <span
                            style={{
                              fontSize: '0.72rem',
                              color: ticket.priority === 'urgent' ? '#ef4444' : ticket.priority === 'high' ? '#fbbf24' : '#94a3b8',
                              fontWeight: 700
                            }}
                          >
                            Priority: {ticket.priority.toUpperCase()}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '4px 0' }}>
                          {ticket.subject}
                        </h4>
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                          From: <strong style={{ color: '#ffffff' }}>{ticket.username}</strong> ({ticket.email}) • Submitted: {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Member's Original Message */}
                    <div
                      style={{
                        background: 'rgba(7, 9, 14, 0.65)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        fontSize: '0.86rem',
                        color: '#cbd5e1',
                        lineHeight: 1.5,
                        marginBottom: '14px'
                      }}
                    >
                      {ticket.message}
                    </div>

                    {/* Previous Admin Reply if exists */}
                    {ticket.adminReply && (
                      <div
                        style={{
                          background: 'rgba(0, 245, 155, 0.08)',
                          border: '1px solid rgba(0, 245, 155, 0.25)',
                          borderRadius: '10px',
                          padding: '12px 14px',
                          marginBottom: '14px'
                        }}
                      >
                        <div style={{ fontSize: '0.74rem', color: '#00f59b', fontWeight: 800, marginBottom: '4px' }}>
                          ✓ Previous Administrator Reply:
                        </div>
                        <div style={{ fontSize: '0.84rem', color: '#f8fafc', lineHeight: 1.4 }}>
                          {ticket.adminReply}
                        </div>
                        {ticket.resolvedAt && (
                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                            Resolved on {ticket.resolvedAt}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Reply Input Area */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <textarea
                        rows={2}
                        placeholder="Type official administrator response to send to user..."
                        value={ticketReplies[ticket.id] || ''}
                        onChange={(e) => setTicketReplies((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                        className="form-control"
                        style={{ fontSize: '0.84rem' }}
                      />
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          disabled={isReplyEmpty}
                          onClick={() => handleSendTicketReply(ticket.id, 'in_progress')}
                          style={{ fontSize: '0.78rem' }}
                        >
                          <Send size={12} />
                          <span>Reply & Mark In Progress</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          disabled={isReplyEmpty}
                          onClick={() => handleSendTicketReply(ticket.id, 'resolved')}
                          style={{ fontSize: '0.78rem', background: '#16a34a', borderColor: '#16a34a' }}
                        >
                          <CheckCircle2 size={12} />
                          <span>Reply & Mark Resolved</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: AUDIO CATALOG UPLOAD & TRACKS
          ========================================================================= */}
      {adminTab === 'catalog' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px' }}>
          {/* Upload Track Form */}
          <div
            style={{
              background: 'rgba(15, 20, 36, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0, 245, 155, 0.15)', color: '#00f59b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Upload size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Upload & Add Song to Catalog
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Publish new high-fidelity studio tracks or continuous mix sets
                </span>
              </div>
            </div>

            <form onSubmit={handlePublishSong}>
              <div className="form-group">
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1' }}>Audio Source</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${audioSourceType === 'upload' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setAudioSourceType('upload')}
                  >
                    <Upload size={13} />
                    <span>Upload from Device</span>
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${audioSourceType === 'preset' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setAudioSourceType('preset')}
                  >
                    <FileAudio size={13} />
                    <span>Server Master Preset</span>
                  </button>
                </div>
              </div>

              {audioSourceType === 'upload' ? (
                <div className="form-group">
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1' }}>Audio File (.mp3, .wav, .flac, .m4a)</label>
                  <input
                    type="file"
                    ref={audioFileInputRef}
                    accept="audio/*"
                    onChange={handleAudioFileSelect}
                    style={{ display: 'none' }}
                  />
                  <div
                    onClick={() => audioFileInputRef.current?.click()}
                    style={{
                      border: '2px dashed rgba(0, 245, 155, 0.35)',
                      borderRadius: '12px',
                      padding: '18px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: uploadedAudioFile ? 'rgba(0, 245, 155, 0.08)' : 'rgba(255, 255, 255, 0.02)'
                    }}
                  >
                    <FileAudio size={24} color="#00f59b" style={{ margin: '0 auto 6px' }} />
                    {uploadedAudioFile ? (
                      <div style={{ fontSize: '0.86rem', color: '#00f59b', fontWeight: 700 }}>
                        ✓ {uploadedAudioFile.name} ({(uploadedAudioFile.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.84rem', color: '#cbd5e1' }}>
                        Click to select audio file from your computer
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1' }}>Preset Master Track</label>
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
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1' }}>Track Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rocksteady Vibration Master Dub"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1' }}>Artist Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Wayne Armond"
                    value={newArtist}
                    onChange={(e) => setNewArtist(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1' }}>Genre</label>
                  <input
                    type="text"
                    placeholder="e.g. Rocksteady / Reggae"
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1' }}>Album / Release Name</label>
                <input
                  type="text"
                  placeholder="e.g. Music Marshall Studio Master"
                  value={newAlbum}
                  onChange={(e) => setNewAlbum(e.target.value)}
                  className="form-control"
                />
              </div>

              {/* Tier & Tags */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  marginBottom: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.84rem', color: '#ffffff' }}>
                  <input
                    type="checkbox"
                    checked={isNewMmRelease}
                    onChange={(e) => setIsNewMmRelease(e.target.checked)}
                    style={{ accentColor: '#00f59b' }}
                  />
                  <span>My MM Release (Playable 100% Free Without Login)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.84rem', color: '#ffffff' }}>
                  <input
                    type="checkbox"
                    checked={isNewMix}
                    onChange={(e) => setIsNewMix(e.target.checked)}
                    style={{ accentColor: '#38bdf8' }}
                  />
                  <span>Tag as Continuous Music Mix / Set 🔥</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.84rem', color: '#ffffff' }}>
                  <input
                    type="checkbox"
                    checked={isNewDownloadable}
                    onChange={(e) => setIsNewDownloadable(e.target.checked)}
                    style={{ accentColor: '#16a34a' }}
                  />
                  <span>Allow Audio Download ⬇</span>
                </label>
              </div>

              {/* Cover Art Upload */}
              <div className="form-group">
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1' }}>Cover Art Artwork</label>
                <input
                  type="file"
                  ref={coverFileInputRef}
                  accept="image/*"
                  onChange={handleCoverFileSelect}
                  style={{ display: 'none' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={uploadedCoverUrl || '/headphone_logo.png'}
                    alt="Cover"
                    style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => coverFileInputRef.current?.click()}
                  >
                    <ImageIcon size={13} />
                    <span>Upload Artwork File</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '6px' }}
              >
                <Plus size={16} />
                <span>Publish Song to Catalog</span>
              </button>
            </form>
          </div>

          {/* Current Catalog Tracks List */}
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '14px', color: '#ffffff' }}>
              Published Catalog Master Tracks ({songs.length})
            </h3>

            <div
              style={{
                maxHeight: '620px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              {songs.map((song) => {
                const isCurrent = currentSong?.id === song.id;
                return (
                  <div
                    key={song.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: isCurrent ? 'rgba(0, 245, 155, 0.1)' : 'rgba(15, 20, 36, 0.75)',
                      border: `1px solid ${isCurrent ? 'rgba(0, 245, 155, 0.3)' : 'rgba(255, 255, 255, 0.06)'}`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <button
                        type="button"
                        onClick={() => onPlaySong(song)}
                        className="btn-play-table"
                        style={{ width: '32px', height: '32px' }}
                      >
                        {isCurrent && isPlaying ? <Pause size={14} fill="white" /> : <Play size={14} fill="white" />}
                      </button>

                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {song.title}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                          {song.artist} • {song.genre} • {formatTime(song.duration)}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      {song.isMmRelease && (
                        <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                          FREE MM
                        </span>
                      )}
                      {song.isMix && (
                        <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                          MIX
                        </span>
                      )}
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          if (confirm(`Remove track "${song.title}" from catalog?`)) {
                            onDeleteSong(song.id);
                          }
                        }}
                        style={{ padding: '4px 8px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.25)' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: VIP REGISTRATION PROMO CODE & BANNERS
          ========================================================================= */}
      {adminTab === 'promo' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
          {/* VIP Promo Code Card */}
          <div
            style={{
              background: 'rgba(15, 20, 36, 0.85)',
              border: '1px solid rgba(251, 191, 36, 0.35)',
              borderRadius: '16px',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Ticket size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Active VIP Registration Promo Code
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Listeners must provide this promo code to complete registration
                </span>
              </div>
            </div>

            {isEditingPromo ? (
              <form onSubmit={handleSavePromoCode} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1' }}>Promo Code *</label>
                  <input
                    type="text"
                    required
                    value={editPromoCodeVal}
                    onChange={(e) => setEditPromoCodeVal(e.target.value)}
                    className="form-control"
                    style={{ textTransform: 'uppercase', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.05em' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1' }}>Campaign Description</label>
                  <input
                    type="text"
                    value={editPromoDescVal}
                    onChange={(e) => setEditPromoDescVal(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button type="submit" className="btn btn-primary btn-sm" style={{ background: '#16a34a', borderColor: '#16a34a' }}>
                    <Save size={14} />
                    <span>Save Promo Code</span>
                  </button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsEditingPromo(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(15, 20, 36, 0.9) 100%)',
                  borderRadius: '12px',
                  border: '1px solid rgba(251, 191, 36, 0.25)',
                  padding: '20px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#fbbf24', fontWeight: 800 }}>
                      Active Registration Code
                    </span>
                    <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.06em' }}>
                      {primaryPromo.code}
                    </div>
                  </div>
                  <span style={{ background: 'rgba(0, 245, 155, 0.15)', color: '#00f59b', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800 }}>
                    {primaryPromo.uses} Redemptions
                  </span>
                </div>

                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 16px 0' }}>
                  {primaryPromo.description}
                </p>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      navigator.clipboard.writeText(primaryPromo.code);
                      onToast(`✓ Copied promo code "${primaryPromo.code}" to clipboard!`);
                    }}
                  >
                    <span>Copy Code</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setEditPromoCodeVal(primaryPromo.code);
                      setEditPromoDescVal(primaryPromo.description);
                      setIsEditingPromo(true);
                    }}
                  >
                    <Edit3 size={13} />
                    <span>Edit Code</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Banner Images Management Card */}
          <div
            style={{
              background: 'rgba(15, 20, 36, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(0, 245, 155, 0.15)', color: '#00f59b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ImageIcon size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Feature Banner Images
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Update promotional hero artwork across the site
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                  Landing Page Hero Banner URL
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="/mm_banner.png or https://..."
                    value={landingBannerInput}
                    onChange={(e) => setLandingBannerInput(e.target.value)}
                    className="form-control"
                    style={{ fontSize: '0.84rem' }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      onSaveLandingFeatureImage(landingBannerInput);
                      onToast('✓ Landing hero banner updated.');
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                  Catalog Feature Banner URL
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="/mm_banner.png or https://..."
                    value={catalogBannerInput}
                    onChange={(e) => setCatalogBannerInput(e.target.value)}
                    className="form-control"
                    style={{ fontSize: '0.84rem' }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      onSaveDashboardFeatureImage(catalogBannerInput);
                      onToast('✓ Catalog banner updated.');
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Edit Modal */}
      {editingUser && (
        <AdminEditUserModal
          isOpen={Boolean(editingUser)}
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaveUser={(updatedUser) => {
            onUpdateUser(updatedUser);
            onToast(`✓ User ${updatedUser.username} details saved successfully.`);
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
};
