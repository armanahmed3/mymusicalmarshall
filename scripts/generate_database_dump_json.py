import struct, json

with open('ebayjaco_mmarshalldb_2026-10-08_17-54-39', 'rb') as f:
    buf = f.read()

import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from dump_all_database_tables import extract_table

# 1. mixes
mixes_raw = extract_table(219)
all_mixes = []
for r in mixes_raw:
    fixed = r['fixed']
    mix_id = struct.unpack('<I', fixed[0:4])[0]
    mix_len_val = struct.unpack('<H', fixed[4:6])[0] / 100.0 if len(fixed) >= 6 else 0.0
    cols = r['var_cols']
    name = cols[0] if len(cols) > 0 else ''
    desc = cols[1] if len(cols) > 1 else ''
    status = cols[2] if len(cols) > 2 else ''
    audio = cols[3] if len(cols) > 3 else ''
    cat = cols[4] if len(cols) > 4 else ''
    genre = cols[5] if len(cols) > 5 else ''
    all_mixes.append({
        'db_id': mix_id,
        'mixName': name,
        'mixDesc': desc,
        'mixCategory': cat,
        'genre': genre,
        'mixLength': mix_len_val,
        'audioPath': audio,
        'status': status
    })

# 2. notices
notices_raw = extract_table(222)
all_notices = []
for r in notices_raw:
    fixed = r['fixed']
    n_id = struct.unpack('<I', fixed[0:4])[0]
    cols = r['var_cols']
    img = cols[0] if len(cols) > 0 else ''
    status = cols[1] if len(cols) > 1 else ''
    location = cols[2] if len(cols) > 2 else ''
    title = cols[3] if len(cols) > 3 else ''
    details = cols[4] if len(cols) > 4 else ''
    all_notices.append({
        'db_id': n_id,
        'title': title.strip(),
        'location': location.strip(),
        'details': details.strip(),
        'image': img.strip(),
        'status': status.strip()
    })

# 3. Parameters
params_raw = extract_table(225)
all_params = []
for r in params_raw:
    cols = r['var_cols']
    notice_text = cols[0] if len(cols) > 0 else ''
    feat_mix = cols[1] if len(cols) > 1 else ''
    feat_genre = cols[2] if len(cols) > 2 else ''
    all_params.append({
        'announcementNotice': notice_text.strip(),
        'featuredMix': feat_mix.strip(),
        'genre': feat_genre.strip()
    })

# 4. Referralcodes
refs_raw = extract_table(229)
all_refs = [r['var_cols'][0].strip() for r in refs_raw if r['var_cols']]

# 5. Playlists
playlists_raw = extract_table(228)
all_playlists = [r['var_cols'][0].strip() for r in playlists_raw if r['var_cols']]

# 6. Users
users_212 = extract_table(212)
users_230 = extract_table(230)
all_users = []
for u_list in [users_212, users_230]:
    for r in u_list:
        cols = r['var_cols']
        # Examine columns
        all_users.append(cols)

print(f"Extracted summary:")
print(f"  Mixes count: {len(all_mixes)}")
print(f"  Notices count: {len(all_notices)}")
print(f"  Parameters: {all_params}")
print(f"  Referral codes: {all_refs}")
print(f"  Playlists: {all_playlists}")
print(f"  Users count: {len(all_users)}")

# Save to complete JSON artifact
db_data = {
    'mixes': all_mixes,
    'notices': all_notices,
    'parameters': all_params,
    'referralCodes': all_refs,
    'playlists': all_playlists
}

with open('src/data/database_complete_dump.json', 'w') as f:
    json.dump(db_data, f, indent=2)

print("Saved to src/data/database_complete_dump.json")
