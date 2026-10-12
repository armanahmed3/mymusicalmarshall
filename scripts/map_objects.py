import struct, re

with open('ebayjaco_mmarshalldb_2026-10-08_17-54-39', 'rb') as f:
    buf = f.read()

# Pages are 8192 bytes, offset by 512 bytes (0x200)
pages_by_obj = {}
for offset in range(512, len(buf) - 8192, 8192):
    header = buf[offset:offset+96]
    m_headerVersion = header[0]
    m_type = header[1]
    if m_headerVersion == 1 and m_type == 1: # DATA page
        slot_cnt = struct.unpack('<H', header[22:24])[0]
        obj_id = struct.unpack('<I', header[24:28])[0]
        if obj_id not in pages_by_obj:
            pages_by_obj[obj_id] = []
        pages_by_obj[obj_id].append((offset, slot_cnt))

print(f"Unique object IDs with data pages: {len(pages_by_obj)}")
for obj_id, plist in sorted(pages_by_obj.items()):
    total_slots = sum(p[1] for p in plist)
    # let's peek at the first page strings
    first_off = plist[0][0]
    page_data = buf[first_off+96:first_off+8192]
    # find latin1 and utf16 strings
    lat_strs = [s for s in re.findall(r'[A-Za-z0-9_ -]{4,}', page_data.decode('latin1', errors='ignore')) if not s.isdigit()]
    u16_strs = []
    for m in re.finditer(rb'((?:[\x20-\x7e]\x00){3,})', page_data):
        try:
            s = m.group(1).decode('utf-16le').strip()
            if s and not s.isdigit(): u16_strs.append(s)
        except: pass
    
    print(f"\nOBJ_ID: {obj_id} (pages: {len(plist)}, total_slots: {total_slots})")
    print(f"   LAT Sample: {lat_strs[:8]}")
    print(f"   U16 Sample: {u16_strs[:8]}")
