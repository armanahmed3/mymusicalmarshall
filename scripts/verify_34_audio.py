import json, os

with open('src/data/database_complete_dump.json') as f:
    data = json.load(f)

print(f"Checking {len(data['mixes'])} mixes audio paths...")
missing = []
for m in data['mixes']:
    raw_path = m['audioPath']
    fname = os.path.basename(raw_path)
    p1 = os.path.join('public', 'AudioFileUpload', fname)
    p2 = os.path.join('public', 'audio', fname)
    e1 = os.path.exists(p1) and os.path.getsize(p1) > 1000
    e2 = os.path.exists(p2) and os.path.getsize(p2) > 1000
    if not (e1 or e2):
        missing.append((m['db_id'], m['mixName'], fname))
    else:
        # Ensure it exists in BOTH directories so both /audio/... and /AudioFileUpload/... always work
        if not e1 and e2:
            import shutil
            shutil.copy2(p2, p1)
        elif not e2 and e1:
            import shutil
            shutil.copy2(p1, p2)

print(f"Total missing: {len(missing)}")
for item in missing:
    print("  MISSING:", item)
