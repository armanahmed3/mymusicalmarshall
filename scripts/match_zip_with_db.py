import zipfile, struct
from dump_all_database_tables import decode_row

with open('ebayjaco_mmarshalldb_2026-10-08_17-54-39', 'rb') as f:
    buf = f.read()

db_mixes = {}
for offset in range(512, len(buf) - 8192, 8192):
    header = buf[offset:offset+96]
    if header[0] == 1 and header[1] == 1:
        obj_id = struct.unpack('<I', header[24:28])[0]
        if obj_id == 219:
            slot_cnt = struct.unpack('<H', header[22:24])[0]
            for s in range(slot_cnt):
                slot_pos = offset + 8192 - (s + 1) * 2
                rec_off = struct.unpack('<H', buf[slot_pos:slot_pos+2])[0]
                if rec_off == 0: continue
                rec_bytes = buf[offset + rec_off : offset + 8192]
                parsed = decode_row(rec_bytes)
                if parsed:
                    mix_id = struct.unpack('<I', parsed['fixed'][:4])[0]
                    cols = parsed['var_cols']
                    db_mixes[mix_id] = cols

z = zipfile.ZipFile('audio_files.zip')
zip_files = [f.filename for f in z.infolist()]

print(f'Total DB mixes: {len(db_mixes)}')
print(f'Total Zip files: {len(zip_files)}')

matched = []
unmatched_zip = list(zip_files)

for mix_id, cols in sorted(db_mixes.items()):
    db_path = cols[3] if len(cols) > 3 else ''
    db_file = db_path.split('/')[-1]
    # find in zip
    found = None
    for zf in zip_files:
        z_base = zf.split('/')[-1]
        if (z_base.lower() == db_file.lower() or 
            z_base.replace('_', '').lower() == db_file.replace('_', '').lower() or 
            z_base.replace('-', '').lower() == db_file.replace('-', '').lower() or
            z_base.replace("'", '_').lower() == db_file.replace("'", '_').lower() or
            db_file.replace("'", '_').lower() == z_base.lower()):
            found = zf
            break
    if found:
        matched.append((mix_id, cols[0], cols[1], cols[4], cols[5], found, db_path))
        if found in unmatched_zip:
            unmatched_zip.remove(found)
    else:
        print(f'DB mix NOT in zip: ID {mix_id}: {cols[0]} -> {db_path}')

print('\n' + '='*50)
print(f'MATCHED FROM DATABASE ({len(matched)} songs):')
for m in matched:
    print(f'ID {m[0]}: mixName="{m[1]}", title/desc="{m[2]}", category="{m[3]}", genre="{m[4]}" -> zip: {m[5]}, db: {m[6]}')

print('\nUnmatched zip files:', unmatched_zip)
