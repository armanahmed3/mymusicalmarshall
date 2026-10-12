import json, re, os

with open('src/data/initialSongs.ts', 'r', encoding='utf-8') as f:
    text = f.read()

m = re.search(r'export const INITIAL_SONGS: Song\[\] = (\[[\s\S]*?\]);', text)
songs = json.loads(m.group(1))

missing = []
seen_urls = set()
duplicates = []

for s in songs:
    if s.get('db_id') == 3023:
        continue # Test song
    
    url = s['audioUrl']
    if url in seen_urls:
        duplicates.append((s['title'], url))
    seen_urls.add(url)
    
    rel = url.lstrip('/')
    p1 = os.path.join('public', rel)
    p2 = os.path.join('public', 'audio', os.path.basename(rel))
    if os.path.exists(p1):
        sz = os.path.getsize(p1)
        print(f"OK [1]: '{s['title']}' -> {rel} ({sz // 1024} KB)")
    elif os.path.exists(p2):
        sz = os.path.getsize(p2)
        print(f"OK [2]: '{s['title']}' -> audio/{os.path.basename(rel)} ({sz // 1024} KB)")
    else:
        missing.append((s['title'], url))

print("-" * 50)
print(f"Total verified songs: {len(seen_urls)}")
print(f"Duplicates: {duplicates}")
print(f"Missing files: {missing}")
