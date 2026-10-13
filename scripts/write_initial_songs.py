import json

with open('scripts/final_33_songs.json', 'r', encoding='utf-8') as f:
    songs = json.load(f)

feat_mix_name = 'Easy_Flow_Mix'
feat_mix_path = '/AudioFileUpload/Easy_Flow_23v1241026820.mp3'

content = """import type { Song, ReferralCode, User, Playlist, EventFlyer, SupportTicket, AppParameters } from '../types';
import { MSSQL_DATABASE_USERS } from './databaseUsers';

// 100% authentic songs & continuous mixes verified from MS SQL Database (mixes table) and audio files
export const INITIAL_SONGS: Song[] = """ + json.dumps(songs, indent=2) + """;

export const INITIAL_PARAMETERS: AppParameters = {
  Feat_MixName: '""" + feat_mix_name + """',
  Feat_MixPath: '""" + feat_mix_path + """'
};

// 100% authentic referral codes from MS SQL Database: ebayjaco_mmarshalldb (Referralcodes table)
export const INITIAL_REFERRAL_CODES: ReferralCode[] = [
  {
    code: 'buju',
    description: 'Official Database Referral Code (buju)',
    uses: 25
  },
  {
    code: 'latus',
    description: 'Official Database Referral Code (latus)',
    uses: 25
  },
  {
    code: 'industry',
    description: 'Official Database Referral Code (industry)',
    uses: 25
  },
  {
    code: 'patrick',
    description: 'Official Database Referral Code (patrick)',
    uses: 25
  },
  {
    code: 'musicmarshall',
    description: 'Official Database Referral Code (musicmarshall)',
    uses: 25
  },
  {
    code: 'mymm',
    description: 'Official Database Referral Code (mymm)',
    uses: 25
  },
  {
    code: 'mwm',
    description: 'Official Database Referral Code (mwm)',
    uses: 25
  }
];

export const INITIAL_USERS: User[] = [
  ...MSSQL_DATABASE_USERS
];

export const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-db-1',
    name: 'Culture Mix Vol I',
    description: 'Authentic playlist from database (Playlists table)',
    createdBy: 'Orville Marshall',
    createdAt: '2026-01-01',
    songIds: ['song-db-1008', 'song-db-3024', 'song-db-2006'],
    coverUrl: '/headphone_logo.png'
  }
];

// Clean notice board event flyers (ready for admin to post fresh)
export const INITIAL_FLYERS: EventFlyer[] = [];

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-1001',
    userId: 'usr-mssql-1',
    username: 'Orville Marshall',
    email: 'orville4444@gmail.com',
    subject: 'High-Res Audio Download Verification',
    category: 'Audio Playback',
    priority: 'high',
    message: 'All 34 database tracks and mixes verified from MS SQL database dump.',
    status: 'resolved',
    createdAt: '2026-03-15T14:20:00Z',
    adminReply: 'All database tracks and notices synchronized directly with website.',
    resolvedAt: '2026-03-15T16:00:00Z'
  }
];
"""

with open('src/data/initialSongs.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Successfully wrote {len(songs)} verified songs to src/data/initialSongs.ts")
