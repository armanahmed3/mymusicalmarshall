import hashlib, os, json

with open('scripts/final_33_songs.json') as f:
    songs = json.load(f)

mixes = [s for s in songs if s['isMix']]

hashes = {}
for m in mixes:
    p = os.path.join('public', m['audioUrl'].lstrip('/'))
    if os.path.exists(p):
        with open(p, 'rb') as af:
            h = hashlib.md5(af.read()).hexdigest()
        sz = os.path.getsize(p)
        if h in hashes:
            print(f"DUPLICATE AUDIO: '{m['mixName']}' (ID {m['db_id']}) and '{hashes[h]['mixName']}' (ID {hashes[h]['db_id']}) have IDENTICAL file size {sz} bytes and MD5 {h}!")
        else:
            hashes[h] = m
