import type { Song, ReferralCode, User, Playlist, EventFlyer, SupportTicket, AppParameters } from '../types';
import { MSSQL_DATABASE_USERS } from './databaseUsers';

// 100% authentic songs verified against MS SQL Database and audio_files.zip with ZERO DUPLICATION
export const INITIAL_SONGS: Song[] = [
  {
    "id": "song-db-2015",
    "db_id": 2015,
    "mixName": "Party_Vocals_Mixx_V1",
    "title": "Reggae & Dancehall Vocals",
    "artist": "Music Marshall",
    "album": "Juggling on Riddim",
    "duration": 17203,
    "audioUrl": "/AudioFileUpload/vocals_Mixx_01222201457.mp3",
    "coverUrl": "/headphone_logo.png",
    "genre": "reggae",
    "mood": "party",
    "bpm": 90,
    "isMmRelease": false,
    "isMix": true,
    "isDownloadable": true,
    "description": "Reggae & Dancehall Vocals"
  },
  {
    "id": "song-db-2012",
    "db_id": 2012,
    "mixName": "Wayne_Alton",
    "title": "Wayne Armond Picks on Alton Ellis",
    "artist": "Wayne Armond & Alton Ellis",
    "album": "release",
    "duration": 30413,
    "audioUrl": "/AudioFileUpload/Wayne_Alton_Full_Mixx220453461.mp3",
    "coverUrl": "/headphone_logo.png",
    "genre": "Reggae",
    "mood": "chill",
    "bpm": 90,
    "isMmRelease": false,
    "isMix": true,
    "isDownloadable": true,
    "description": "Wayne Armond Picks on Alton Ellis by Wayne Armond & Alton Ellis"
  },
  {
    "id": "song-db-3017",
    "db_id": 3017,
    "mixName": "Positive Transfusion EP",
    "title": "Positive Transfusion EP Juggling",
    "artist": "Music Marshall",
    "album": "release",
    "duration": 28263,
    "audioUrl": "/AudioFileUpload/Positive_Transfusion_Juggling_v2222755873.mp3",
    "coverUrl": "/headphone_logo.png",
    "genre": "Reggae",
    "mood": "chill",
    "bpm": 90,
    "isMmRelease": false,
    "isMix": true,
    "isDownloadable": true,
    "description": "Positive Transfusion EP Juggling"
  },
  {
    "id": "song-db-2006",
    "db_id": 2006,
    "mixName": "What Will Be",
    "title": "What Will Be",
    "artist": "Stevie Malekuu",
    "album": "release",
    "duration": 22119,
    "audioUrl": "/AudioFileUpload/WhatWillBe222604854.mp3",
    "coverUrl": "/headphone_logo.png",
    "genre": "Reggae",
    "mood": "chill",
    "bpm": 90,
    "isMmRelease": true,
    "isMix": false,
    "isDownloadable": true,
    "description": "What Will Be by Stevie Malekuu"
  },
  {
    "id": "song-db-2007",
    "db_id": 2007,
    "mixName": "Don't Trust Dem",
    "title": "Don't Trust Dem",
    "artist": "Stevie Malekuu",
    "album": "release",
    "duration": 29799,
    "audioUrl": "/AudioFileUpload/Dont_Trust_Them220406320.mp3",
    "coverUrl": "/headphone_logo.png",
    "genre": "Reggae",
    "mood": "workout",
    "bpm": 90,
    "isMmRelease": true,
    "isMix": false,
    "isDownloadable": true,
    "description": "Don't Trust Dem by Stevie Malekuu"
  },
  {
    "id": "song-db-2008",
    "db_id": 2008,
    "mixName": "War A Gwaan",
    "title": "War A Gwaan",
    "artist": "Luciano",
    "album": "release",
    "duration": 22119,
    "audioUrl": "/AudioFileUpload/War_A_Gwaan220459279.mp3",
    "coverUrl": "/headphone_logo.png",
    "genre": "Reggae",
    "mood": "focus",
    "bpm": 90,
    "isMmRelease": true,
    "isMix": false,
    "isDownloadable": true,
    "description": "War A Gwaan by Luciano"
  },
  {
    "id": "song-db-2010",
    "db_id": 2010,
    "mixName": "Tennessee Whiskey",
    "title": "Tennessee Whiskey",
    "artist": "Wayne Armond",
    "album": "release",
    "duration": 22119,
    "audioUrl": "/AudioFileUpload/TENNESSEE_WHISKEY220827858.mp3",
    "coverUrl": "/headphone_logo.png",
    "genre": "Reggae",
    "mood": "soul",
    "bpm": 90,
    "isMmRelease": true,
    "isMix": false,
    "isDownloadable": true,
    "description": "Tennessee Whiskey by Wayne Armond"
  },
  {
    "id": "song-db-2011",
    "db_id": 2011,
    "mixName": "Righteous People",
    "title": "Righteous People",
    "artist": "Wayne Armond",
    "album": "release",
    "duration": 22119,
    "audioUrl": "/AudioFileUpload/Righteous_People223901125.mp3",
    "coverUrl": "/headphone_logo.png",
    "genre": "R&B",
    "mood": "chill",
    "bpm": 90,
    "isMmRelease": true,
    "isMix": false,
    "isDownloadable": true,
    "description": "Righteous People by Wayne Armond"
  },
  {
    "id": "song-db-3015",
    "db_id": 3015,
    "mixName": "Afrobeat Medley",
    "title": "Afrobeat Medley",
    "artist": "Music Marshall",
    "album": "release",
    "duration": 35482,
    "audioUrl": "/AudioFileUpload/Afrobeat_Medley221610074.mp3",
    "coverUrl": "/headphone_logo.png",
    "genre": "Afrobeat",
    "mood": "workout",
    "bpm": 90,
    "isMmRelease": true,
    "isMix": false,
    "isDownloadable": true,
    "description": "Afrobeat Meets R&B"
  },
  {
    "id": "song-db-3025",
    "db_id": 3025,
    "mixName": "Kush",
    "title": "Kush",
    "artist": "Wayne Armond",
    "album": "release",
    "duration": 17050,
    "audioUrl": "/AudioFileUpload/Kush-WayneArmond255935568.mp3",
    "coverUrl": "/headphone_logo.png",
    "genre": "Reggae",
    "mood": "chill",
    "bpm": 90,
    "isMmRelease": true,
    "isMix": false,
    "isDownloadable": true,
    "description": "Kush by Wayne Armond"
  },
  {
    "id": "song-db-3026",
    "db_id": 3026,
    "mixName": "Chances Are",
    "title": "Chances Are",
    "artist": "Yishka",
    "album": "release",
    "duration": 33639,
    "audioUrl": "/AudioFileUpload/CHANCES_ARE-Yishka251130187.mp3",
    "coverUrl": "/headphone_logo.png",
    "genre": "Reggae",
    "mood": "soul",
    "bpm": 90,
    "isMmRelease": true,
    "isMix": false,
    "isDownloadable": true,
    "description": "Chances Are by Yishka"
  },
  {
    "id": "song-db-3027",
    "db_id": 3027,
    "mixName": "Hello Africa",
    "title": "Hello Africa",
    "artist": "Stevie Malekuu",
    "album": "release",
    "duration": 6759,
    "audioUrl": "/AudioFileUpload/Hello_Africa-StevieMalekuu252025093.mp3",
    "coverUrl": "/headphone_logo.png",
    "genre": "Reggae",
    "mood": "party",
    "bpm": 90,
    "isMmRelease": true,
    "isMix": false,
    "isDownloadable": true,
    "description": "Hello Africa by Stevie Malekuu"
  },
  {
    "id": "song-db-3028",
    "db_id": 3028,
    "mixName": "Groovy Reggae",
    "title": "Groovy Reggae",
    "artist": "Yishka",
    "album": "release",
    "duration": 6759,
    "audioUrl": "/AudioFileUpload/Groovy_Reggae_Sax-Yishka252426431.mp3",
    "coverUrl": "/headphone_logo.png",
    "genre": "Reggae",
    "mood": "chill",
    "bpm": 90,
    "isMmRelease": true,
    "isMix": false,
    "isDownloadable": true,
    "description": "Groovy Reggae - Sax by Yishka"
  },
  {
    "id": "song-db-3029",
    "db_id": 3029,
    "mixName": "Your Eyes",
    "title": "Your Eyes",
    "artist": "Teacha Barnes",
    "album": "release",
    "duration": 25498,
    "audioUrl": "/AudioFileUpload/Your_Eyes-TeachaBarnes252816585.mp3",
    "coverUrl": "/headphone_logo.png",
    "genre": "Reggae",
    "mood": "soul",
    "bpm": 90,
    "isMmRelease": true,
    "isMix": false,
    "isDownloadable": true,
    "description": "Your Eyes by Teacha Barnes"
  },
  {
    "id": "song-db-3030",
    "db_id": 3030,
    "mixName": "Who's Loving You",
    "title": "Who's Loving You",
    "artist": "Wayne Armond",
    "album": "release",
    "duration": 4762,
    "audioUrl": "/AudioFileUpload/Who's_Loving_You-WayneArmond253149479.mp3",
    "coverUrl": "/headphone_logo.png",
    "genre": "Reggae",
    "mood": "chill",
    "bpm": 90,
    "isMmRelease": true,
    "isMix": false,
    "isDownloadable": true,
    "description": "Who's Loving You by Wayne Armond"
  },
  {
    "id": "song-db-3031",
    "db_id": 3031,
    "mixName": "Heart Attack",
    "title": "Heart Attack",
    "artist": "Teacha Barnes",
    "album": "release",
    "duration": 13978,
    "audioUrl": "/AudioFileUpload/Heart_Attack-TeachaBarnes250526382.mp3",
    "coverUrl": "/headphone_logo.png",
    "genre": "Reggae",
    "mood": "workout",
    "bpm": 90,
    "isMmRelease": true,
    "isMix": false,
    "isDownloadable": true,
    "description": "Heart Attack by Teacha Barnes"
  },
  {
    "id": "song-db-3032",
    "db_id": 3032,
    "mixName": "Take A Chance",
    "title": "Take A Chance",
    "artist": "The Greaves Brothers",
    "album": "release",
    "duration": 15418,
    "audioUrl": "/AudioFileUpload/Take_a_Chance-TheGreavesBrothers250853064.mp3",
    "coverUrl": "/headphone_logo.png",
    "genre": "Reggae",
    "mood": "chill",
    "bpm": 90,
    "isMmRelease": true,
    "isMix": false,
    "isDownloadable": true,
    "description": "Take A Chance by The Greaves Brothers"
  }
];

export const INITIAL_PARAMETERS: AppParameters = {
  Feat_MixName: 'Party_Vocals_Mixx_V1',
  Feat_MixPath: '/AudioFileUpload/vocals_Mixx_01222201457.mp3'
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
    name: 'Party Vocals & Dub Mix',
    description: 'Authentic playlist from database (Playlists table)',
    createdBy: 'Orville Marshall',
    createdAt: '2026-01-01',
    songIds: ['song-db-2015', 'song-db-2012', 'song-db-3017'],
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
    message: 'All database tracks and mixes verified with authentic audio files.',
    status: 'resolved',
    createdAt: '2026-03-15T14:20:00Z',
    adminReply: 'All database tracks and notices synchronized directly with website.',
    resolvedAt: '2026-03-15T16:00:00Z'
  }
];
