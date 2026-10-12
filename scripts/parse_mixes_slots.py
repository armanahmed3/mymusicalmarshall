import struct, re, json

with open('ebayjaco_mmarshalldb_2026-10-08_17-54-39', 'rb') as f:
    buf = f.read()

def parse_page_records(page_offset):
    header = buf[page_offset:page_offset+96]
    slot_cnt = struct.unpack('<H', header[22:24])[0]
    obj_id = struct.unpack('<I', header[24:28])[0]
    
    records = []
    # slot array is at the end of the page: from 8192-2 down to 8192 - slot_cnt*2
    for slot_idx in range(slot_cnt):
        slot_pos = page_offset + 8192 - (slot_idx + 1) * 2
        rec_offset = struct.unpack('<H', buf[slot_pos:slot_pos+2])[0]
        if rec_offset == 0: continue
        rec_start = page_offset + rec_offset
        # determine record end: next slot or page end
        rec_data = buf[rec_start:min(page_offset+8192, rec_start+1000)]
        records.append((rec_start, rec_data))
    return obj_id, slot_cnt, records

# Parse OBJ_ID 219 (mixes)
for offset in range(512, len(buf) - 8192, 8192):
    header = buf[offset:offset+96]
    if header[0] == 1 and header[1] == 1:
        obj_id = struct.unpack('<I', header[24:28])[0]
        if obj_id == 219:
            _, slot_cnt, records = parse_page_records(offset)
            print(f"OBJ 219 (mixes): offset={offset}, slots={slot_cnt}, records={len(records)}")
            for idx, (rec_start, rec_data) in enumerate(records):
                # Extract all strings in rec_data
                # Latin-1 strings
                lat_matches = re.findall(r'[A-Za-z0-9_\- ,.:\'\/\(\)\?\!\&]{2,}', rec_data.decode('latin1', errors='ignore'))
                # UTF-16LE strings
                u16_matches = []
                for m in re.finditer(rb'((?:[\x20-\x7e]\x00){2,})', rec_data):
                    try:
                        s = m.group(1).decode('utf-16le').strip()
                        if s: u16_matches.append(s)
                    except: pass
                print(f"--- Rec #{idx+1} at {rec_start} ---")
                print("  LAT:", [s.strip() for s in lat_matches if s.strip()])
                print("  U16:", u16_matches)
