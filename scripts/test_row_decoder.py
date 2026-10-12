import struct, json

with open('ebayjaco_mmarshalldb_2026-10-08_17-54-39', 'rb') as f:
    buf = f.read()

# Let's write a pure SQL Server row decoder
def decode_row(row_bytes):
    status_a = row_bytes[0]
    status_b = row_bytes[1]
    fixed_len = struct.unpack('<H', row_bytes[2:4])[0]
    fixed_data = row_bytes[4:fixed_len]
    
    col_count = struct.unpack('<H', row_bytes[fixed_len:fixed_len+2])[0]
    null_bytes_cnt = (col_count + 7) // 8
    null_bitmap = row_bytes[fixed_len+2 : fixed_len+2+null_bytes_cnt]
    
    var_offset = fixed_len + 2 + null_bytes_cnt
    if var_offset + 2 > len(row_bytes):
        return {"fixed": fixed_data, "var_cols": []}
        
    var_col_count = struct.unpack('<H', row_bytes[var_offset:var_offset+2])[0]
    col_end_offsets = []
    for i in range(var_col_count):
        off = struct.unpack('<H', row_bytes[var_offset+2+i*2 : var_offset+4+i*2])[0]
        # bit 15 might be set if complex column, mask it
        col_end_offsets.append(off & 0x7FFF)
        
    var_data_start = var_offset + 2 + var_col_count * 2
    var_cols = []
    curr = var_data_start
    for end_off in col_end_offsets:
        val_bytes = row_bytes[curr:end_off]
        # try utf-16le then latin1
        val_str = ""
        # Check if utf-16le
        if len(val_bytes) >= 2 and val_bytes[1] == 0:
            try: val_str = val_bytes.decode('utf-16le')
            except: val_str = val_bytes.decode('latin1', errors='ignore')
        else:
            val_str = val_bytes.decode('latin1', errors='ignore')
        var_cols.append(val_str)
        curr = end_off
        
    return {
        "fixed_len": fixed_len,
        "col_count": col_count,
        "var_col_count": var_col_count,
        "var_cols": var_cols
    }

# Test on OBJ_ID 219 (mixes)
for offset in range(512, len(buf) - 8192, 8192):
    header = buf[offset:offset+96]
    if header[0] == 1 and header[1] == 1:
        obj_id = struct.unpack('<I', header[24:28])[0]
        if obj_id == 219:
            slot_cnt = struct.unpack('<H', header[22:24])[0]
            print(f"OBJ 219 slot_cnt: {slot_cnt}")
            for s in range(slot_cnt):
                slot_pos = offset + 8192 - (s + 1) * 2
                rec_off = struct.unpack('<H', buf[slot_pos:slot_pos+2])[0]
                rec_bytes = buf[offset + rec_off : offset + 8192]
                parsed = decode_row(rec_bytes)
                print(f"Row {s+1}: var_cols ({len(parsed['var_cols'])} cols) = {parsed['var_cols']}")
