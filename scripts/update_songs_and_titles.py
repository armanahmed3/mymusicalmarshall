import json, re, os

def clean(t):
    return re.sub(r'\s+', ' ', re.sub(r'[_-]+', ' ', t or '')).strip()

with open('src/data/initialSongs.ts', 'r', encoding='utf-8') as f:
    content = f.read()

m = re.search(r'export const INITIAL_SONGS: Song\[\] = (\[[\s\S]*?\]);', content)
songs = json.loads(m.group(1))
print(f'Initial songs loaded: {len(songs)}')

# Clean all song titles (remove _ and -)
for s in songs:
    old_title = s['title']
    new_title = clean(old_title)
    if old_title != new_title:
        print(f"  Title cleaned [{s['db_id']}]: '{old_title}' -> '{new_title}'")
    s['title'] = new_title

# Check if song 3023 is present
has_3023 = any(s.get('db_id') == 3023 for s in songs)
if not has_3023:
    print("Adding verified DB song 3023 (Buju Banton Test)...")
    songs.append({
        "id": "song-db-3023",
        "db_id": 3023,
        "mixName": "Test",
        "title": "Buju Banton Test",
        "artist": "Buju Banton",
        "album": "Single",
        "duration": 214,
        "durationFormatted": "3:34",
        "mixLength": "3.57",
        "audioPath": "/AudioFileUpload/BUJU243133596.mp3",
        "audioUrl": "/AudioFileUpload/BUJU243133596.mp3",
        "coverUrl": "/headphone_logo.png",
        "genre": "Reggae",
        "mood": "chill",
        "bpm": 90,
        "isMmRelease": True,
        "isMix": False,
        "isDownloadable": True,
        "description": "Test by Buju Banton"
    })

# Sort songs by db_id to keep clean order
songs.sort(key=lambda x: x['db_id'])

# Verify all songs have existing files in public/AudioFileUpload
missing = []
for s in songs:
    rel = s['audioUrl'].lstrip('/')
    p = os.path.join('public', rel)
    if not os.path.exists(p):
        missing.append((s['db_id'], s['title'], s['audioUrl']))
    else:
        sz = os.path.getsize(p)
        print(f"  Verified DB track {s['db_id']:4d}: '{s['title']}' -> {s['audioUrl']} ({sz // 1024} KB)")

print(f"\nTotal verified tracks: {len(songs)}")
print(f"Missing: {missing}")
assert len(missing) == 0, f"Some tracks are missing: {missing}"

# Format updated JSON
updated_songs_json = json.dumps(songs, indent=2)

# Add cleanSongTitle helper to initialSongs.ts
helper_code = '''
/**
 * Utility to clean song titles for front site display (removes underscores and dashes)
 */
export function cleanSongTitle(title?: string): string {
  if (!title) return '';
  return title
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
'''

new_content = content[:m.start(1)] + updated_songs_json + content[m.end(1):]
if 'export function cleanSongTitle' not in new_content:
    new_content = helper_code + '\n' + new_content

with open('src/data/initialSongs.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("\nSuccessfully updated src/data/initialSongs.ts!")
