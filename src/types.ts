export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  audioUrl: string;
  coverUrl: string;
  genre: string;
  mood: 'chill' | 'workout' | 'focus' | 'party' | 'soul';
  bpm: number;
  isMmRelease?: boolean;
  description?: string;
  isMix?: boolean; // Tag for music mixes / DJ juggling sets
  isDownloadable?: boolean; // Tag for downloadable songs/mixes
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
  loyaltyTier?: 'Bronze Member' | 'Silver VIP' | 'Gold Elite' | 'Platinum Marshall';
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

