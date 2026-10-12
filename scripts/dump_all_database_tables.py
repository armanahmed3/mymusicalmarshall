import struct, json, os

with open('ebayjaco_mmarshalldb_2026-10-08_17-54-39', 'rb') as f:
    buf = f.read()

def decode_row(row_bytes):
    try:
        fixed_len = struct.unpack('<H', row_bytes[2:4])[0]
        fixed_data = row_bytes[4:fixed_len]
        
        col_count = struct.unpack('<H', row_bytes[fixed_len:fixed_len+2])[0]
        null_bytes_cnt = (col_count + 7) // 8
        
        var_offset = fixed_len + 2 + null_bytes_cnt
        if var_offset + 2 > len(row_bytes):
            return {"fixed": fixed_data, "var_cols": []}
            
        var_col_count = struct.unpack('<H', row_bytes[var_offset:var_offset+2])[0]
        col_end_offsets = []
        for i in range(var_col_count):
            off = struct.unpack('<H', row_bytes[var_offset+2+i*2 : var_offset+4+i*2])[0]
            col_end_offsets.append(off & 0x7FFF)
            
        var_data_start = var_offset + 2 + var_col_count * 2
        var_cols = []
        curr = var_data_start
        for end_off in col_end_offsets:
            val_bytes = row_bytes[curr:end_off]
            if len(val_bytes) >= 2 and val_bytes[1] == 0:
                try: val_str = val_bytes.decode('utf-16le')
                except: val_str = val_bytes.decode('latin1', errors='ignore')
            else:
                val_str = val_bytes.decode('latin1', errors='ignore')
            var_cols.append(val_str)
            curr = end_off
            
        return {
            "fixed": fixed_data,
            "col_count": col_count,
            "var_cols": var_cols
        }
    except Exception as e:
        return None

def extract_table(target_obj_id):
    rows = []
    for offset in range(512, len(buf) - 8192, 8192):
        header = buf[offset:offset+96]
        if header[0] == 1 and header[1] == 1:
            obj_id = struct.unpack('<I', header[24:28])[0]
            if obj_id == target_obj_id:
                slot_cnt = struct.unpack('<H', header[22:24])[0]
                for s in range(slot_cnt):
                    slot_pos = offset + 8192 - (s + 1) * 2
                    rec_off = struct.unpack('<H', buf[slot_pos:slot_pos+2])[0]
                    if rec_off == 0: continue
                    rec_bytes = buf[offset + rec_off : offset + 8192]
                    parsed = decode_row(rec_bytes)
                    if parsed:
                        rows.append(parsed)
    return rows

print("Extracting all tables...")

# 1. mixes (219)
mixes_raw = extract_table(219)
print(f"mixes: {len(mixes_raw)} rows")

# 2. notices (222)
notices_raw = extract_table(222)
print(f"notices: {len(notices_raw)} rows")
for idx, r in enumerate(notices_raw):
    print(f"  Notice {idx+1}: fixed={r['fixed'].hex()[:16]}, var={r['var_cols']}")

# 3. Parameters (225)
params_raw = extract_table(225)
print(f"Parameters: {len(params_raw)} rows")
for idx, r in enumerate(params_raw):
    print(f"  Param {idx+1}: fixed={r['fixed'].hex()[:16]}, var={r['var_cols']}")

# 4. Playlists (228)
playlists_raw = extract_table(228)
print(f"Playlists: {len(playlists_raw)} rows")
for idx, r in enumerate(playlists_raw):
    print(f"  Playlist {idx+1}: var={r['var_cols']}")

# 5. Referralcodes (229)
refs_raw = extract_table(229)
print(f"Referralcodes: {len(refs_raw)} rows")
for idx, r in enumerate(refs_raw):
    print(f"  Ref {idx+1}: var={r['var_cols']}")

# 6. Users (212 and 230)
users_212 = extract_table(212)
users_230 = extract_table(230)
print(f"Users (212): {len(users_212)} rows")
print(f"Users (230): {len(users_230)} rows")
