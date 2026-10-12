import os, re, json

def extract_all():
    db_path = 'ebayjaco_mmarshalldb_2026-10-08_17-54-39'
    with open(db_path, 'rb') as f:
        buf = f.read()
    
    print(f"Total buffer size: {len(buf):,} bytes")
    
    # 1. Find all table names from sysschobjs (SQL Server sys objects)
    # They are UTF-16LE, preceded by length or standard pattern
    # Let's search for table names like Users, Mixes, Mix, NoticeBoard, Parameters, Genres, etc.
    words = []
    for m in re.finditer(rb'([A-Za-z0-9_]{3,35}\x00){1,}', buf):
        try:
            s = m.group(0).decode('utf-16le', errors='ignore').strip('\x00')
            if len(s) > 3 and s.isalnum() and not s.isdigit():
                words.append(s)
        except:
            pass
            
    print(f"Candidate schema words count: {len(words)}")
    
    # Find table names specifically
    interesting_tables = ['User', 'Users', 'Mix', 'Mixes', 'Notice', 'NoticeBoard', 'Parameter', 'Parameters', 'Genre', 'Genres', 'Track', 'Tracks', 'Release', 'Releases']
    found_tables = set()
    for w in words:
        for t in interesting_tables:
            if w.lower() == t.lower():
                found_tables.add(w)
    print("Found tables:", found_tables)

    # Let's search for all data rows for:
    # A) Mix / Mixes
    # B) Users
    # C) Parameters
    # D) NoticeBoard
    # E) Genres

if __name__ == '__main__':
    extract_all()
