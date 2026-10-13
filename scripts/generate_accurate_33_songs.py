import openpyxl, os, json
from compute_mp3_durations import get_mp3_duration

wb = openpyxl.load_workbook('MusicMarshall_Complete_Database.xlsx')
ws = wb['dbo.mixes']

continuous_mix_ids = {1, 2, 4, 5, 6, 7, 8, 1002, 1003, 1005, 1006, 1007, 1008, 2002, 2014, 2015, 3024}
release_ids = {2006, 2007, 2008, 2010, 2011, 2012, 3015, 3017, 3025, 3026, 3027, 3028, 3029, 3030, 3031, 3032}

# Singer mapping from backup database and verified releases
singer_map = {
    2006: "Stevie Malekuu",
    2007: "Stevie Malekuu",
    2008: "Luciano",
    2010: "Wayne Armond",
    2011: "Wayne Armond",
    2012: "Wayne Armond & Alton Ellis",
    3015: "Music Marshall",
    3017: "Music Marshall",
    3025: "Wayne Armond",
    3026: "Yishka",
    3027: "Stevie Malekuu",
    3028: "Yishka",
    3029: "Teacha Barnes",
    3030: "Wayne Armond",
    3031: "Teacha Barnes",
    3032: "The Greaves Brothers",
    2002: "Luciano"
}

# Clean titles for releases and mixes
title_map = {
    1: "Disco Mix Vol 01",
    2: "Classic Vintage R&B",
    4: "Rocksteady Love Pt 1",
    5: "Old Bounce Reggae",
    6: "Retro Soul Vol 1",
    7: "Disco around the 90s",
    8: "Reggae & Dancehall Rhythm Mix",
    1002: "Bandelero Mix",
    1003: "Smooth Lovers Rock Singles",
    1005: "Soca Dancehall Blend",
    1006: "Loversrock Rhythm Mix",
    1007: "90s Dancehall Party Mix",
    1008: "Culture Mix Vol I",
    2002: "Luciano MM Mix",
    2006: "What Will Be",
    2007: "Don't Trust Dem",
    2008: "War A Gwaan",
    2010: "Tennessee Whiskey",
    2011: "Righteous People",
    2012: "Wayne Armond Picks on Alton Ellis",
    2014: "Party Mix Part 1",
    2015: "Party Vocals Mixx V1",
    3015: "Afrobeat Medley",
    3017: "Positive Transfusion EP",
    3024: "Easy Flow Mix",
    3025: "Kush",
    3026: "Chances Are",
    3027: "Hello Africa",
    3028: "Groovy Reggae",
    3029: "Your Eyes",
    3030: "Who's Loving You",
    3031: "Heart Attack",
    3032: "Take A Chance"
}

all_songs = []

for i, row in enumerate(ws.iter_rows(values_only=True)):
    if i == 0: continue
    m_id, mix_name, proper_desc, raw_desc, cat, genre, dur, mix_len, status, audio_path = row
    if m_id == 3023: continue # Skip test
    
    disk_path = os.path.join('public', audio_path.lstrip('/'))
    dur_secs = get_mp3_duration(disk_path)
    
    is_mix = (m_id in continuous_mix_ids)
    is_release = (m_id in release_ids)
    
    # Artist assignment
    artist = singer_map.get(m_id, "Music Marshall")
    
    # Title assignment
    clean_title = title_map.get(m_id, mix_name.replace('_', ' '))
    
    # Description assignment: make sure it has the proper singer/DJ format and is NEVER the same as title
    if is_release:
        if m_id in singer_map and singer_map[m_id] != "Music Marshall":
            desc = f"{clean_title} by {singer_map[m_id]}"
        else:
            desc = f"{clean_title} by Music Marshall"
    elif is_mix:
        if m_id == 2002:
            desc = "Luciano MM Mix by Luciano"
        else:
            desc_base = raw_desc if raw_desc else clean_title
            if "by " in desc_base:
                desc = desc_base
            else:
                desc = f"{desc_base} by Music Marshall"

    song_obj = {
        "id": f"song-db-{m_id}",
        "db_id": m_id,
        "mixName": mix_name,
        "title": clean_title,
        "artist": artist,
        "album": cat or ("Continuous Mix" if is_mix else "Release"),
        "duration": dur_secs,
        "audioUrl": audio_path,
        "coverUrl": "/headphone_logo.png",
        "genre": genre,
        "mood": "party" if "party" in clean_title.lower() or "soca" in genre.lower() else "chill",
        "bpm": 90,
        "isMmRelease": is_release,
        "isMix": is_mix,
        "isDownloadable": True,
        "description": desc
    }
    all_songs.append(song_obj)

print(f"Generated {len(all_songs)} songs total.")
print(f"Mixes: {len([s for s in all_songs if s['isMix']])}")
print(f"Releases: {len([s for s in all_songs if s['isMmRelease']])}")

# Check duplicates
ids = [s['id'] for s in all_songs]
assert len(ids) == len(set(ids)), "Duplicate IDs found!"
paths = [s['audioUrl'] for s in all_songs]
assert len(paths) == len(set(paths)), "Duplicate AudioUrls found!"

with open('scripts/final_33_songs.json', 'w', encoding='utf-8') as f:
    json.dump(all_songs, f, indent=2)

print("Saved to scripts/final_33_songs.json successfully!")
