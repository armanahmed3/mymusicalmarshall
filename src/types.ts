export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  durationFormatted?: string; // Exact MM:SS duration from MS SQL database (e.g. 404:29)
  audioPath?: string; // Exact database audio path (e.g. /AudioFileUpload/Disco_MixV01_Branded1194021647.mp3)
  mixLength?: string; // Exact database mixLength (e.g. 404.49)
  audioUrl: string;
  coverUrl: string;
  genre: string;
  mood: 'chill' | 'workout' | 'focus' | 'party' | 'soul';
  bpm: number;
  isMmRelease?: boolean;
  description?: string;
  isMix?: boolean; // Tag for music mixes / DJ juggling sets
  isDownloadable?: boolean; // Tag for downloadable songs/mixes
  db_id?: number; // Authentic database ID (mixId) from MS SQL
  mixName?: string; // Authentic MS SQL mixName (e.g. Easy_Flow_Mix)
  uploadedAt?: string;
}

export interface UserPreferences {
  repeatMixLoop: boolean;
  stopNewMixAlerts: boolean;
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'user';
  referralCode: string;
  referredBy: string;
  createdAt: string;
  isEmailVerified: boolean;
  verificationCode?: string;
  verificationCodeExpires?: number;
  verifiedAt?: string;
  accountStatus: 'pending_approval' | 'approved' | 'rejected' | 'deactivated';
  approvedAt?: string;
  preferences?: UserPreferences;
  phone?: string;
  bio?: string;
  favoriteGenre?: string;
  // Loyalty Program
  isLoyaltyEnrolled?: boolean;
  loyaltyTier?: 'Bronze Member' | 'Silver Member' | 'Gold Elite' | 'Platinum Marshall';
  loyaltyPoints?: number;
  loyaltyEnrolledAt?: string;
}

export interface ReferralCode {
  code: string;
  description: string;
  uses: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  songIds: string[];
  coverUrl?: string;
}

export interface EventFlyer {
  id: string;
  title: string;
  eventDate: string;
  location: string;
  description: string;
  flyerUrl: string;
  postedBy: string;
  createdAt: string;
  externalLink?: string;
}

export interface SupportTicket {
  id: string;
  userId?: string;
  username: string;
  email: string;
  subject: string;
  category: 'Technical Support' | 'Account & Verification' | 'Audio Playback' | 'Admin Inquiry' | 'General';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  adminReply?: string;
  resolvedAt?: string;
}

export type ActiveTab =
  | 'home'
  | 'releases'
  | 'mixes'
  | 'playlists'
  | 'notices'
  | 'support'
  | 'search'
  | 'ai'
  | 'admin';

export type AppPage =
  | 'home'
  | 'mixes'
  | 'releases'
  | 'notices'
  | 'support'
  | 'create-playlist'
  | 'admin';

export type AppMode = 'landing' | 'app';

export interface AppParameters {
  Feat_MixName: string;
  Feat_MixPath: string;
}

