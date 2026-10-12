import json, re

with open('src/data/initialSongs.ts', 'r', encoding='utf-8') as f:
    text = f.read()

m = re.search(r'export const INITIAL_SONGS: Song\[\] = (\[[\s\S]*?\]);', text)
songs = json.loads(m.group(1))

print(f"Total songs currently: {len(songs)}")
for i, s in enumerate(songs):
    print(f"{i+1:2d}. db_id={s.get('db_id')} | title='{s.get('title')}' | genre='{s.get('genre')}' | audioUrl='{s.get('audioUrl')}' | isRelease={s.get('isMmRelease')}")
