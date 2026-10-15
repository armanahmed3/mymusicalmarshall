import json, re

with open('src/data/initialSongs.ts', 'r', encoding='utf-8') as f:
    text = f.read()

m = re.search(r'export const INITIAL_SONGS: Song\[\] = (\[[\s\S]*?\]);', text)
songs = json.loads(m.group(1))

mixes = [s for s in songs if s['isMix']]
print(f"Mixes count: {len(mixes)}")

print(f"{'#':2} | {'mixName':24} | {'title':24} | {'description':35} | {'genre':10} | {'duration'}")
print("-" * 115)
for i, m in enumerate(mixes):
    print(f"{i+1:2d} | {m['mixName']:24} | {m['title']:24} | {m['description']:35} | {m['genre']:10} | {m['duration']}")
