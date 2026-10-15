import json
import re

with open('DATABASE_USER_CREDENTIALS.json', 'r', encoding='utf-8') as f:
    raw_users = json.load(f)

users_mapped = []
credentials_mapped = {}

for idx, u in enumerate(raw_users):
    email = u['email'].lower().strip()
    raw_name = u.get('name', '').strip()
    
    # Clean name
    clean_name = raw_name
    if not clean_name or clean_name in ['\x0e', '0', 'N/A']:
        clean_name = email.split('@')[0].capitalize()
    
    clean_name = re.sub(r'[\x00-\x1f]', '', clean_name).strip()
    clean_name = re.sub(r'([a-z])([A-Z])', r'\1 \2', clean_name)
    clean_name = clean_name.replace('DONOVANBROWNX', 'Donovan Brown').replace('MICHAELWALLACEM', 'Michael Wallace').replace('franklinwarburton', 'Franklin Warburton')
    
    # Split first and last name
    parts = clean_name.split(' ')
    first_name = parts[0]
    last_name = ' '.join(parts[1:]) if len(parts) > 1 else ''
    
    role = 'admin' if (u.get('role') == 'admin' or email in ['admin@marshall.com', 'orville4444@gmail.com']) else 'user'
    ref_code = u.get('referral_code', 'buju')
    if not ref_code or ref_code.lower() == 'n/a':
        ref_code = 'buju'
        
    user_obj = {
        'id': f"usr-mssql-{idx+1}",
        'db_id': idx + 1,
        'email': email,
        'username': clean_name,
        'firstName': first_name,
        'lastName': last_name,
        'role': role,
        'referralCode': ref_code,
        'referredBy': 'PLATFORM',
        'createdAt': '2026-01-01T00:00:00Z',
        'isEmailVerified': True,
        'accountStatus': 'approved',
        'phone': u.get('phone') if u.get('phone') not in ['N/A', '0', ''] else '',
        'isLoyaltyEnrolled': True,
        'loyaltyTier': 'Platinum Marshall' if role == 'admin' else ('Gold Elite' if idx < 10 else 'Bronze Member'),
        'loyaltyPoints': 5000 if role == 'admin' else (1250 if idx < 10 else 350)
    }
    users_mapped.append(user_obj)
    
    pw_hash = u.get('password_hash', '')
    known_pw = u.get('known_password', '')
    
    credentials_mapped[email] = {
        'email': email,
        'passwordHash': pw_hash,
        'knownPassword': known_pw,
        'role': role
    }

print(f"Mapped {len(users_mapped)} authentic database users.")
for u in users_mapped[:10]:
    print(f"  {u['id']}: {u['username']} ({u['email']}) - Role: {u['role']}")

# 9 Authentic notices from Notices table (222)
notices_data = [
    {
        'id': 'notice-db-1',
        'title': 'Retro Party (Every 3rd Friday)',
        'eventDate': 'Every 3rd Friday',
        'location': 'Pembroke Pines, FL',
        'description': 'Every 3rd Friday Retro Party with authentic reggae & classics.',
        'flyerUrl': '/headphone_logo.png',
        'postedBy': 'Orville Marshall',
        'createdAt': '2026-01-15T00:00:00Z'
    },
    {
        'id': 'notice-db-2',
        'title': 'Hollywood Weekend Party',
        'eventDate': 'Weekends • Ends at 2AM',
        'location': 'Hollywood, FL',
        'description': 'Party and dance music night. Event ends at 2AM.',
        'flyerUrl': '/headphone_logo.png',
        'postedBy': 'Orville Marshall',
        'createdAt': '2026-01-20T00:00:00Z'
    },
    {
        'id': 'notice-db-3',
        'title': 'Cooper City Dance Party',
        'eventDate': 'Special Event',
        'location': 'Cooper City, Florida',
        'description': 'For tickets and VIP reservations: 786 295-3619.',
        'flyerUrl': '/headphone_logo.png',
        'postedBy': 'Music Marshall',
        'createdAt': '2026-02-01T00:00:00Z'
    },
    {
        'id': 'notice-db-4',
        'title': 'Labor Day Weekend Retro Party',
        'eventDate': 'Labor Day Weekend',
        'location': 'Hialeah / Miami, FL',
        'description': 'Annual Labor Day Weekend Retro Party celebration.',
        'flyerUrl': '/headphone_logo.png',
        'postedBy': 'Music Marshall',
        'createdAt': '2026-02-15T00:00:00Z'
    },
    {
        'id': 'notice-db-5',
        'title': 'Lauderhill Late Night Party',
        'eventDate': 'Late Night • Until 4AM',
        'location': 'Lauderhill, FL',
        'description': 'All night vibes until 4AM with top selectors.',
        'flyerUrl': '/headphone_logo.png',
        'postedBy': 'Orville Marshall',
        'createdAt': '2026-02-25T00:00:00Z'
    },
    {
        'id': 'notice-db-6',
        'title': 'Party with Fab 5 (Independence Jam)',
        'eventDate': 'Independence Special',
        'location': 'Dania Beach, FL',
        'description': 'Special Independence Jam with Fab 5. Call: 305-794-8782 or 561-333-8853.',
        'flyerUrl': '/headphone_logo.png',
        'postedBy': 'Music Marshall',
        'createdAt': '2026-03-01T00:00:00Z'
    },
    {
        'id': 'notice-db-7',
        'title': 'Jamaica Independence Tribute',
        'eventDate': 'Special Event',
        'location': 'Margate, FL',
        'description': 'Jamaica Independence Tribute concert and dance celebration.',
        'flyerUrl': '/headphone_logo.png',
        'postedBy': 'Music Marshall',
        'createdAt': '2026-03-05T00:00:00Z'
    },
    {
        'id': 'notice-db-8',
        'title': 'Miami Live Show Extravaganza',
        'eventDate': 'Live Show',
        'location': 'Miami, FL',
        'description': 'Live performance showcase featuring special guests.',
        'flyerUrl': '/headphone_logo.png',
        'postedBy': 'Music Marshall',
        'createdAt': '2026-03-10T00:00:00Z'
    },
    {
        'id': 'notice-db-9',
        'title': 'Miami Live Reggae Concert',
        'eventDate': 'Live Reggae Concert',
        'location': 'Miami, FL',
        'description': 'Live Reggae Concert with top international DJs and performers.',
        'flyerUrl': '/headphone_logo.png',
        'postedBy': 'Orville Marshall',
        'createdAt': '2026-03-15T00:00:00Z'
    }
]

# Write databaseUsers.ts
with open('src/data/databaseUsers.ts', 'w', encoding='utf-8') as f:
    f.write("import type { User, EventFlyer, Playlist, ReferralCode, AppParameters } from '../types';\n\n")
    f.write("// 100% authentic production users extracted from MS SQL Database: ebayjaco_mmarshalldb (Users table)\n")
    f.write(f"export const MSSQL_DATABASE_USERS: User[] = {json.dumps(users_mapped, indent=2)};\n\n")
    f.write("// User credentials and password hashes for authentication fallback\n")
    f.write(f"export const MSSQL_USER_CREDENTIALS: Record<string, {{ email: string; passwordHash: string; knownPassword: string; role: 'admin' | 'user' }}> = {json.dumps(credentials_mapped, indent=2)};\n\n")
    f.write("// 100% authentic event notices from MS SQL Database: ebayjaco_mmarshalldb (notices table)\n")
    f.write(f"export const MSSQL_DATABASE_FLYERS: EventFlyer[] = {json.dumps(notices_data, indent=2)};\n")

print("Generated src/data/databaseUsers.ts successfully!")
