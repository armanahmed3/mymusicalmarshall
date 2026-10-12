import sys, os, struct
sys.path.insert(0, 'scripts')
from dump_all_database_tables import extract_table

raw_mixes = extract_table(219)
print(f"Total Database Rows: {len(raw_mixes)}")
for i, r in enumerate(raw_mixes):
    fixed = r['fixed']
    mix_id = struct.unpack('<I', fixed[0:4])[0]
    mix_len_val = struct.unpack('<H', fixed[4:6])[0] / 100.0 if len(fixed) >= 6 else 0.0
    cols = r['var_cols']
    name = cols[0].strip() if len(cols) > 0 else ''
    desc = cols[1].strip() if len(cols) > 1 else ''
    status = cols[2].strip() if len(cols) > 2 else ''
    audio = cols[3].strip() if len(cols) > 3 else ''
    cat = cols[4].strip() if len(cols) > 4 else ''
    genre = cols[5].strip() if len(cols) > 5 else ''
    print(f"{i+1:2d}. ID: {mix_id:<4} | Name: {name:<26} | Category: {cat:<18} | Genre: {genre:<12} | Description: \"{desc}\"")
