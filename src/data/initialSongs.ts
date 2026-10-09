import type { Song, ReferralCode, User, Playlist, EventFlyer, SupportTicket, AppParameters } from '../types';

// All official audio tracks downloaded directly from https://mymusicmarshall.com/
export const INITIAL_SONGS: Song[] = [
  // ==========================================
  // MY MM PRODUCTIONS (OFFICIAL SINGLE RELEASES)
  // Available to stream freely without login
  // ==========================================
  {
    id: 'song-mm-2006',
    title: 'What Will Be',
    artist: 'Stevie Malekuu',
    album: 'My MM Release Archive',
    duration: 240,
    audioUrl: '/audio/WhatWillBe222604854.mp3',
    coverUrl: '/headphone_logo.png',
    genre: 'Reggae / Soul',
    mood: 'chill',
    bpm: 94,
    isMmRelease: true,
    isMix: false,
    isDownloadable: true,
    description: 'Official My MM Release by Stevie Malekuu — Available to stream without login.'
  },
  {
    id: 'song-mm-2007',
    title: "Don't Trust Dem",
    artist: 'Stevie Malekuu',
    album: 'My MM Release Archive',
    duration: 270,
    audioUrl: '/audio/Dont_Trust_Them220406320.mp3',
    coverUrl: '/headphone_logo.png',
    genre: 'Roots Reggae',
    mood: 'workout',
    bpm: 98,
    isMmRelease: true,
    isMix: false,
    isDownloadable: false,
    description: 'Heavy conscious roots rhythm by Stevie Malekuu — Free MM Release.'
  },
  {
    id: 'song-mm-2008',
    title: 'War A Gwaan',
    artist: 'Luciano',
    album: 'My MM Release Archive',
    duration: 240,
    audioUrl: '/audio/War_A_Gwaan220459279.mp3',
    coverUrl: '/headphone_logo.png',
    genre: 'Conscious Reggae',
    mood: 'focus',
    bpm: 92,
    isMmRelease: true,
    isMix: false,
    isDownloadable: false,
    description: 'The messenger Luciano calling for universal harmony — Free MM Release.'
  },
  {
    id: 'song-mm-2010',
    title: 'Tennessee Whiskey',
    artist: 'Wayne Armond',
    album: 'My MM Release Archive',
    duration: 240,
    audioUrl: '/audio/TENNESSEE_WHISKEY220827858.mp3',
    coverUrl: '/headphone_logo.png',
    genre: 'Soul / Blues',
    mood: 'soul',
    bpm: 82,
    isMmRelease: true,
    isMix: false,
    isDownloadable: true,
    description: 'Acoustic blues and reggae soul rendition by Wayne Armond — Free MM Release.'
  },
  {
    id: 'song-mm-2011',
    title: 'Righteous People',
    artist: 'Wayne Armond',
    album: 'My MM Release Archive',
    duration: 240,
    audioUrl: '/audio/Righteous_People223901125.mp3',
    coverUrl: '/headphone_logo.png',
    genre: 'R&B',
    mood: 'chill',
    bpm: 88,
    isMmRelease: true,
    isMix: false,
    isDownloadable: false,
    description: 'Righteous People - Wayne Armond — Free MM Release.'
  },
  {
    id: 'song-mm-3025',
    title: 'Kush',
    artist: 'Wayne Armond',
    album: 'My MM Release Archive',
    duration: 220,
    audioUrl: '/audio/Kush-WayneArmond255935568.mp3',
    coverUrl: '/headphone_logo.png',
    genre: 'Roots Reggae',
    mood: 'chill',
    bpm: 88,
    isMmRelease: true,
    isMix: false,
    isDownloadable: true,
    description: 'Mellow roots guitar and smooth vocal delivery by Wayne Armond.'
  },
  {
    id: 'song-mm-3026',
    title: 'Chances Are',
    artist: 'Yishka',
    album: 'My MM Release Archive',
    duration: 285,
    audioUrl: '/audio/CHANCES_ARE-Yishka251130187.mp3',
    coverUrl: '/headphone_logo.png',
    genre: 'Smooth Reggae',
    mood: 'soul',
    bpm: 84,
    isMmRelease: true,
    isMix: false,
    isDownloadable: false,
    description: 'Sensational saxophone & lovers melody recorded exclusively for Music Marshall.'
  },
  {
    id: 'song-mm-3027',
    title: 'Hello Africa',
    artist: 'Stevie Malekuu',
    album: 'My MM Release Archive',
    duration: 180,
    audioUrl: '/audio/Hello_Africa-StevieMalekuu252025093.mp3',
    coverUrl: '/headphone_logo.png',
    genre: 'Afro Reggae',
    mood: 'party',
    bpm: 102,
    isMmRelease: true,
    isMix: false,
    isDownloadable: true,
    description: 'Uplifting celebratory rhythm connecting Caribbean roots with Mother Africa.'
  },
  {
    id: 'song-mm-3028',
    title: 'Groovy Reggae (Sax)',
    artist: 'Yishka',
    album: 'My MM Release Archive',
    duration: 180,
    audioUrl: '/audio/Groovy_Reggae_Sax-Yishka252426431.mp3',
    coverUrl: '/headphone_logo.png',
    genre: 'Instrumental / Sax',
    mood: 'chill',
    bpm: 90,
    isMmRelease: true,
    isMix: false,
    isDownloadable: false,
    description: 'Pure instrumental saxophone performance by Yishka.'
  },
  {
    id: 'song-mm-3029',
    title: 'Your Eyes',
    artist: 'Teacha Barnes',
    album: 'My MM Release Archive',
    duration: 253,
    audioUrl: '/audio/Your_Eyes-TeachaBarnes252816585.mp3',
    coverUrl: '/headphone_logo.png',
    genre: 'Lovers Rock',
    mood: 'soul',
    bpm: 86,
    isMmRelease: true,
    isMix: false,
    isDownloadable: false,
    description: 'Heartfelt lovers rock ballad by Jamaican sensation Teacha Barnes.'
  },
  {
    id: 'song-mm-3030',
    title: "Who's Loving You",
    artist: 'Wayne Armond',
    album: 'My MM Release Archive',
    duration: 172,
    audioUrl: '/audio/Who_s_Loving_You-WayneArmond253149479.mp3',
    coverUrl: '/headphone_logo.png',
    genre: 'Soulful Reggae',
    mood: 'chill',
    bpm: 85,
    isMmRelease: true,
    isMix: false,
    isDownloadable: true,
    description: 'Soulful guitar-driven serenade performed by Wayne Armond.'
  },
  {
    id: 'song-mm-3031',
    title: 'Heart Attack',
    artist: 'Teacha Barnes',
    album: 'My MM Release Archive',
    duration: 208,
    audioUrl: '/audio/Heart_Attack-TeachaBarnes250526382.mp3',
    coverUrl: '/headphone_logo.png',
    genre: 'Dancehall Reggae',
    mood: 'workout',
    bpm: 106,
    isMmRelease: true,
    isMix: false,
    isDownloadable: false,
    description: 'Fast energetic dancehall rhythm by Teacha Barnes.'
  },
  {
    id: 'song-mm-3032',
    title: 'Take A Chance',
    artist: 'The Greaves Brothers',
    album: 'My MM Release Archive',
    duration: 223,
    audioUrl: '/audio/Take_a_Chance-TheGreavesBrothers250853064.mp3',
    coverUrl: '/headphone_logo.png',
    genre: 'Classic Reggae',
    mood: 'chill',
    bpm: 90,
    isMmRelease: true,
    isMix: false,
    isDownloadable: false,
    description: 'Harmonious family roots vocal performance by The Greaves Brothers.'
  },

  // ==========================================
  // LISTEN TO MUSIC & CONTINUOUS MIXES
  // Continuous DJ sets & jugglings from mixes database (Requires Login)
  // ==========================================
  {
    id: 'song-mm-easy-flow',
    title: 'Easy_Flow_Mix',
    artist: 'DJ Music Marshall',
    album: 'Master DJ Mixes & Jugglings',
    duration: 1800,
    audioUrl: '/audio/Easy_Flow_23v1241026820.mp3',
    coverUrl: '/headphone_logo.png',
    genre: 'Reggae',
    mood: 'chill',
    bpm: 88,
    isMmRelease: false,
    isMix: true,
    isDownloadable: true,
    description: "Lover's rock and conscious reggae music"
  },
  {
    id: 'song-mm-2012',
    title: 'Wayne Armond Picks on Alton Ellis (Full Continuous Mixx)',
    artist: 'Wayne Armond',
    album: 'Master DJ Mixes & Jugglings',
    duration: 2730,
    audioUrl: '/audio/Wayne_Alton_Full_Mixx220453461.mp3',
    coverUrl: '/headphone_logo.png',
    genre: 'Reggae',
    mood: 'focus',
    bpm: 86,
    isMmRelease: false,
    isMix: true,
    isDownloadable: true,
    description: 'Wayne Armond Picks on Alton Ellis'
  },
  {
    id: 'song-mm-3015',
    title: 'Afrobeat Medley (Continuous Club Mix)',
    artist: 'DJ Music Marshall',
    album: 'Master DJ Mixes & Jugglings',
    duration: 292,
    audioUrl: '/audio/Afrobeat_Medley221610074.mp3',
    coverUrl: '/headphone_logo.png',
    genre: 'Afrobeat',
    mood: 'workout',
    bpm: 116,
    isMmRelease: false,
    isMix: true,
    isDownloadable: true,
    description: 'Afrobeat Meets R&B'
  },
  {
    id: 'song-mm-3017',
    title: 'Positive Transfusion EP Juggling (Continuous Set)',
    artist: 'DJ Music Marshall',
    album: 'Master DJ Mixes & Jugglings',
    duration: 1800,
    audioUrl: '/audio/Positive_Transfusion_Juggling_v2222755873.mp3',
    coverUrl: '/headphone_logo.png',
    genre: 'Reggae',
    mood: 'party',
    bpm: 104,
    isMmRelease: false,
    isMix: true,
    isDownloadable: true,
    description: 'Positive Transfusion EP Juggling'
  },
  {
    id: 'song-mm-master-vault',
    title: 'Party Vocals Mixx (Extended Studio Stems)',
    artist: 'Music Marshall Lab',
    album: 'Master Sound Vault',
    duration: 1440,
    audioUrl: '/audio/vocals_Mixx_01222201457.mp3',
    coverUrl: '/headphone_logo.png',
    genre: 'Reggae',
    mood: 'soul',
    bpm: 90,
    isMmRelease: false,
    isMix: true,
    isDownloadable: true,
    description: 'Reggae & Dancehall Vocals — Members Only'
  }
];

export const INITIAL_PARAMETERS: AppParameters = {
  Feat_MixName: 'Easy_Flow_Mix',
  Feat_MixPath: '/audio/Easy_Flow_23v1241026820.mp3'
};

import { MSSQL_DATABASE_USERS } from './databaseUsers';

export const INITIAL_REFERRAL_CODES: ReferralCode[] = [
  { code: 'buju', description: 'Original Music Marshall Referral Code (ebayjaco_mmarshalldb)', uses: 49 },
  { code: 'MARSHALL-2026', description: 'Music Marshall Official Referral Access', uses: 0 },
  { code: 'MARSHALL-VIP', description: 'Music Marshall Official Referral Access', uses: 0 },
  { code: 'SPOTIFY-2026', description: 'Exclusive Spotify Switcher Invite', uses: 0 },
  { code: 'SOUND-ELITE', description: 'Master Sound Platform Invite', uses: 0 }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin',
    email: 'admin@marshall.com',
    username: 'AdminMarshall',
    role: 'admin',
    referralCode: 'ADMIN-CORE',
    referredBy: 'PLATFORM',
    createdAt: '2026-01-01',
    isEmailVerified: true,
    verifiedAt: '2026-01-01',
    accountStatus: 'approved',
    approvedAt: '2026-01-01',
    isLoyaltyEnrolled: true,
    loyaltyTier: 'Platinum Marshall',
    loyaltyPoints: 2500,
    loyaltyEnrolledAt: '2026-01-01',
    preferences: {
      repeatMixLoop: true,
      stopNewMixAlerts: false
    }
  },
  ...MSSQL_DATABASE_USERS
];

export const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-marshall-select',
    name: 'Master Mixes & Jugglings',
    description: 'Continuous party energy and live juggle sets handpicked by DJ Music Marshall.',
    createdBy: 'AdminMarshall',
    createdAt: '2026-03-01',
    songIds: ['song-mm-easy-flow', 'song-mm-3017', 'song-mm-2012', 'song-mm-3015', 'song-mm-master-vault'],
    coverUrl: '/mm_banner.png'
  },
  {
    id: 'pl-reggae-soul',
    name: 'Lovers Rock & Roots Vibration',
    description: 'Smooth acoustic renditions and sweet saxophone grooves for chill sessions.',
    createdBy: 'AdminMarshall',
    createdAt: '2026-03-05',
    songIds: ['song-mm-2010', 'song-mm-3026', 'song-mm-3028', 'song-mm-3029'],
    coverUrl: '/mm_logo.jpg'
  }
];

export const INITIAL_FLYERS: EventFlyer[] = [];

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-1001',
    userId: 'usr-admin',
    username: 'DemoListener',
    email: 'listener@musicmarshall.com',
    subject: 'High-Res FLAC Audio Download Question',
    category: 'Audio Playback',
    priority: 'medium',
    message: 'Hello! Are downloadable mixes delivered in 24-bit 96kHz or 320kbps MP3 format? Loving the Alton Ellis mix!',
    status: 'resolved',
    createdAt: '2026-03-15T14:20:00Z',
    adminReply: 'Hi! All tagged downloadable master tracks and mixes are delivered in pristine 320kbps high-bitrate studio quality directly from our masters.',
    resolvedAt: '2026-03-15T16:00:00Z'
  }
];
