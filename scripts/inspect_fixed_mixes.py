import struct

with open('ebayjaco_mmarshalldb_2026-10-08_17-54-39', 'rb') as f:
    buf = f.read()

offset = None
for off in range(512, len(buf) - 8192, 8192):
    header = buf[off:off+96]
    if header[0] == 1 and header[1] == 1:
        if struct.unpack('<I', header[24:28])[0] == 219:
            offset = off
            break

slot_cnt = struct.unpack('<H', buf[offset+22:offset+24])[0]
for s in range(slot_cnt):
    slot_pos = offset + 8192 - (s + 1) * 2
    rec_off = struct.unpack('<H', buf[slot_pos:slot_pos+2])[0]
    rec_bytes = buf[offset + rec_off : offset + 8192]
    fixed_len = struct.unpack('<H', rec_bytes[2:4])[0]
    fixed_bytes = rec_bytes[4:fixed_len]
    # Check mixId, mixLength
    # int at 0, float at 4 or double at 4?
    mix_id = struct.unpack('<I', fixed_bytes[0:4])[0]
    # let's try unpacking next fields
    rest = fixed_bytes[4:]
    flt_vals = []
    for j in range(0, len(rest)-3, 4):
        flt_vals.append((struct.unpack('<i', rest[j:j+4])[0], struct.unpack('<f', rest[j:j+4])[0]))
    # also try double (8 bytes)
    dbl_vals = []
    for j in range(0, len(rest)-7, 8):
        dbl_vals.append(struct.unpack('<d', rest[j:j+8])[0])
        
    print(f"Mix #{s+1}: ID={mix_id}, fixed_len={fixed_len}, hex={fixed_bytes.hex()}, dbl={dbl_vals}, flt={flt_vals}")
