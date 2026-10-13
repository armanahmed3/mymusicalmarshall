import json, re

with open('src/data/initialSongs.ts', 'r', encoding='utf-8') as f:
    text = f.read()

m = re.search(r'export const INITIAL_SONGS: Song\[\] = (\[[\s\S]*?\]);', text)
if m:
    data = json.loads(m.group(1))
    print(f'Total songs in INITIAL_SONGS: {len(data)}')
    mixes = [s for s in data if s.get('isMix')]
    releases = [s for s in data if s.get('isMmRelease')]
    print(f'isMix == True: {len(mixes)}')
    print(f'isMmRelease == True: {len(releases)}')
    for s in data:
        name = s.get('mixName') or 'NO_MIXNAME'
        print(f"{s['db_id']:5d} | {name:25s} | {s['title']:30s} | isMix: {s.get('isMix')}")
else:
    print('Pattern not matched')
