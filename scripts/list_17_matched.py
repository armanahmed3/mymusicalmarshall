from bs4 import BeautifulSoup
import os, zipfile

with open('MusicMarshall_Complete_Database.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

table = soup.find('table')
rows = table.find_all('tr')[1:]

db_songs = {}
for r in rows:
    cols = [td.get_text(strip=True) for td in r.find_all('td')]
    m_id = int(cols[0])
    db_songs[m_id] = {
        'mixId': m_id,
        'mixName': cols[1],
        'desc': cols[2],
        'rawDesc': cols[3],
        'cleanTitle': cols[4],
        'cat': cols[5],
        'genre': cols[6],
        'duration_str': cols[7],
        'mixLength': cols[8] if len(cols) > 8 else '',
        'audioPath': cols[-1].replace('🎧 ', '').strip()
    }

with zipfile.ZipFile('audio_files.zip', 'r') as z:
    zip_basenames = [os.path.basename(info.filename) for info in z.infolist()]

matched_tracks = []
for z_name in zip_basenames:
    for m_id, d in db_songs.items():
        if os.path.basename(d['audioPath']).lower() == z_name.lower():
            matched_tracks.append(d)
            break

print(f'Matched {len(matched_tracks)} tracks from audio_files.zip:')
for m in sorted(matched_tracks, key=lambda x: x['mixId']):
    print(f"{m['mixId']:4d} | mixName: {m['mixName']:25s} | cat: {m['cat']:18s} | dur: {m['duration_str']:18s} | desc: {m['desc']}")
