import os, json, re
from bs4 import BeautifulSoup
from dump_all_database_tables import extract_table
from compute_mp3_durations import get_mp3_duration

# Read MusicMarshall_Complete_Database.html to get all fields from mixes table
with open('MusicMarshall_Complete_Database.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

table = soup.find('table')
rows = table.find_all('tr')[1:]

# Extract raw database mixes table
mixes_raw = extract_table(219)
raw_dict = {}
for r in mixes_raw:
    import struct
    fixed = r['fixed']
    mix_id = struct.unpack('<I', fixed[0:4])[0]
    cols = r['var_cols']
    raw_dict[mix_id] = {
        'name': cols[0].strip() if len(cols) > 0 else '',
        'desc': cols[1].strip() if len(cols) > 1 else '',
        'status': cols[2].strip() if len(cols) > 2 else '',
        'audio': cols[3].strip() if len(cols) > 3 else '',
        'cat': cols[4].strip() if len(cols) > 4 else '',
        'genre': cols[5].strip() if len(cols) > 5 else ''
    }

print(f"Loaded {len(raw_dict)} raw mixes from binary db.")

# Database HTML table rows
db_html_data = {}
for r in rows:
    cols = [td.get_text(strip=True) for td in r.find_all('td')]
    m_id = int(cols[0])
    db_html_data[m_id] = {
        'mixId': m_id,
        'mixName': cols[1],
        'desc_with_singer': cols[2],
        'raw_db_desc': cols[3],
        'clean_title': cols[4],
        'category': cols[5],
        'genre': cols[6],
        'duration_str': cols[7],
        'audioPath': cols[-1].replace('🎧 ', '').strip()
    }

print(f"Loaded {len(db_html_data)} rows from HTML table.")

# Continuous mixes IDs:
continuous_mix_ids = {1, 2, 4, 5, 6, 7, 8, 1002, 1003, 1005, 1006, 1007, 1008, 2002, 2014, 2015, 3024}
# Release IDs:
release_ids = {2006, 2007, 2008, 2010, 2011, 2012, 3015, 3017, 3025, 3026, 3027, 3028, 3029, 3030, 3031, 3032}

# Singer extraction for artist field
def get_artist(desc_with_singer, title):
    if 'by ' in desc_with_singer:
        return desc_with_singer.split('by ')[-1].strip()
    if ' - ' in desc_with_singer:
        return desc_with_singer.split(' - ')[-1].strip()
    return 'Music Marshall'

final_songs = []
for m_id, h in sorted(db_html_data.items(), key=lambda x: x[0]):
    if m_id == 3023:
        # Exclude test song
        continue
    
    fname = os.path.basename(h['audioPath'])
    audio_url = f"/AudioFileUpload/{fname}"
    
    # Check audio file
    p1 = os.path.join('public', 'AudioFileUpload', fname)
    p2 = os.path.join('public', 'audio', fname)
    duration_secs = 240
    if os.path.exists(p1):
        duration_secs = get_mp3_duration(p1)
    elif os.path.exists(p2):
        duration_secs = get_mp3_duration(p2)
        
    is_mix = (m_id in continuous_mix_ids)
    is_release = (m_id in release_ids)
    
    # Clean artist
    artist = get_artist(h['desc_with_singer'], h['clean_title'])
    if not artist or artist == 'Music Marshall':
        if is_mix:
            artist = 'Music Marshall'
            
    final_songs.append({
        "id": f"song-db-{m_id}",
        "db_id": m_id,
        "mixName": h['mixName'],
        "title": h['clean_title'],
        "artist": artist,
        "album": h['category'],
        "duration": duration_secs,
        "audioUrl": audio_url,
        "coverUrl": "/headphone_logo.png",
        "genre": h['genre'],
        "mood": "chill",
        "bpm": 90,
        "isMmRelease": is_release,
        "isMix": is_mix,
        "isDownloadable": True,
        "description": h['desc_with_singer']
    })

print(f"Built {len(final_songs)} final verified songs:")
for s in final_songs:
    print(f"  {s['db_id']:4d} | mixName: {s['mixName']:25s} | desc: {s['description'][:40]:40s} | isMix: {s['isMix']} | isMmRelease: {s['isMmRelease']}")

# Write to a JSON file for inspection
with open('scripts/final_33_songs.json', 'w', encoding='utf-8') as f:
    json.dump(final_songs, f, indent=2)

print("Saved to scripts/final_33_songs.json")
