import json, re

with open('src/data/initialSongs.ts', 'r', encoding='utf-8') as f:
    text = f.read()

m = re.search(r'export const INITIAL_SONGS: Song\[\] = (\[[\s\S]*?\]);', text)
songs = json.loads(m.group(1))

for s in songs:
    if s.get('isMmRelease'):
        dur = s.get('duration', 0)
        mins = dur // 60
        secs = dur % 60
        print(f"ID {s.get('db_id')}: '{s.get('title')}' -> duration={dur}s ({mins}:{secs:02d}) | audio={s.get('audioUrl')}")
