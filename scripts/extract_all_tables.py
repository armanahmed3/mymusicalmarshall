import re, json

with open('ebayjaco_mmarshalldb_2026-10-08_17-54-39', 'rb') as f:
    buf = f.read()

# Let's inspect column names for each table
# In SQL Server, syscolumns / sys.columns stores column names as nvarchar or sysname
tables = ['coupons', 'downloads', 'mixes', 'notices', 'Parameters', 'Playlists', 'Referralcodes', 'Users']

print("--- Searching for column definitions ---")
# Let's search for column clusters
for t in tables:
    t_16 = t.encode('utf-16le')
    idx = 0
    while True:
        idx = buf.find(t_16, idx)
        if idx == -1: break
        # read chunk around idx
        chunk = buf[idx:idx+800]
        # find utf-16 strings
        u16_words = []
        for m in re.finditer(rb'((?:[\x20-\x7e]\x00){2,})', chunk):
            s = m.group(1).decode('utf-16le', errors='ignore').strip()
            if s and len(s) > 1:
                u16_words.append(s)
        # find latin1 strings
        lat_words = re.findall(r'[A-Za-z0-9_]{3,}', chunk.decode('latin1', errors='ignore'))
        # print
        # print(f"Table '{t}' at {idx}: U16={u16_words[:10]} | LAT={lat_words[:10]}")
        idx += len(t_16)

print("Columns scan done.")
