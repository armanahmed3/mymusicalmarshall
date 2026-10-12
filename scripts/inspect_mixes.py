import json
import re

with open('src/data/initialSongs.ts', 'r', encoding='utf-8') as f:
    text = f.read()

m = re.search(r'export const INITIAL_SONGS: Song\[\] = (\[[\s\S]*?\]);', text)
if m:
    songs = json.loads(m.group(1))
    for s in songs:
        print(f"ID {s.get('db_id', '?')}: Title='{s.get('title')}' | Desc='{s.get('description')}' | Artist='{s.get('artist')}' | Category='{s.get('album')}' | isRelease={s.get('isMmRelease')}")
