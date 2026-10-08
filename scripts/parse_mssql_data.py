import re, json

with open('ebayjaco_mmarshalldb_2026-10-08_17-54-39', 'rb') as f:
    buf = f.read()

text8 = buf.decode('latin1', errors='ignore')

pattern = re.compile(r'([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.(?:com|org|net|edu|gov|co|io|uk))([A-Za-z0-9\s]*)', re.IGNORECASE)
users = []

for m in pattern.finditer(text8):
    email = m.group(1).lower().strip()
    raw_name = m.group(2).strip()
    
    chunk = buf[m.start():m.start()+400]
    buju_idx = chunk.find(b'buju')
    
    status = 'approved'
    role = 'user'
    if buju_idx != -1:
        sr_text = chunk[buju_idx:buju_idx+40].decode('latin1', errors='ignore')
        if 'admin' in sr_text:
            role = 'admin'
        if 'inactive' in sr_text:
            status = 'deactivated'
        elif 'pending' in sr_text:
            status = 'pending_approval'

    clean_name = re.sub(r'[a-z0-9]$', '', raw_name) if len(raw_name) > 3 else raw_name
    clean_name = re.sub(r'([a-z])([A-Z])', r'\1 \2', clean_name).strip()
    if not clean_name:
        clean_name = email.split('@')[0]
        
    users.append({
        'id': f'usr-mssql-{len(users)+1}',
        'email': email,
        'username': clean_name,
        'role': role,
        'referralCode': 'buju',
        'referredBy': 'PLATFORM',
        'createdAt': '2026-01-01',
        'isEmailVerified': True,
        'accountStatus': status,
        'isLoyaltyEnrolled': True,
        'loyaltyTier': 'Bronze Member' if role == 'user' else 'Platinum Marshall',
        'loyaltyPoints': 250 if role == 'user' else 2500
    })

seen = set()
unique_users = []
for u in users:
    if u['email'] not in seen and not u['email'].startswith('schema') and not u['email'].startswith('xml') and '@' in u['email']:
        seen.add(u['email'])
        unique_users.append(u)

with open('src/data/databaseUsers.json', 'w') as out:
    json.dump(unique_users, out, indent=2)

print('Total clean MS SQL users exported:', len(unique_users))
for u in unique_users[:10]:
    print(u['role'], '|', u['username'], '|', u['email'], '|', u['accountStatus'])
