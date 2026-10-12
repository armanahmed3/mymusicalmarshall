import re, json

with open('ebayjaco_mmarshalldb_2026-10-08_17-54-39', 'rb') as f:
    buf = f.read()

def clean_u16(chunk):
    res = []
    for i in range(0, len(chunk)-1, 2):
        b1, b2 = chunk[i], chunk[i+1]
        if b2 == 0 and 32 <= b1 <= 126:
            res.append(chr(b1))
        else:
            res.append(' ')
    return ''.join(res)

def clean_lat(chunk):
    return ''.join(chr(b) if 32 <= b <= 126 else ' ' for b in chunk)

# Let's search all occurrences of 'parameter', 'notice', 'genre', 'mix', 'user'
for term in ['parameter', 'notice', 'genre', 'setting', 'playlist']:
    needle = term.encode('utf-16le')
    pos = 0
    print(f"\n=================== {term.upper()} (UTF-16LE) ===================")
    found = 0
    while True:
        pos = buf.find(needle, pos)
        if pos == -1 or found >= 6: break
        found += 1
        chunk = buf[max(0, pos-120):min(len(buf), pos+300)]
        u16 = clean_u16(chunk)
        lat = clean_lat(chunk)
        # Collapse multiple spaces
        u16 = ' '.join(u16.split())
        lat = ' '.join(lat.split())
        print(f"[{pos}]")
        print(f"  U16: {u16}")
        print(f"  LAT: {lat}")
        pos += len(needle)
