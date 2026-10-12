import os, struct

def get_mp3_duration(file_path):
    # Try using mutagen if installed, else fallback to standard mp3 frame parser
    try:
        import mutagen.mp3
        audio = mutagen.mp3.MP3(file_path)
        return int(audio.info.length)
    except Exception:
        pass

    # Basic MP3 frame header parser
    bitrates_v1_l3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0]
    sample_rates_v1 = [44100, 48000, 32000, 0]
    
    try:
        with open(file_path, 'rb') as f:
            data = f.read(100000) # Read initial bytes to find MPEG sync
            idx = 0
            # skip ID3v2 if present
            if data[:3] == b'ID3':
                size = (data[6] << 21) | (data[7] << 14) | (data[8] << 7) | data[9]
                idx = size + 10
                f.seek(idx)
                data = f.read(100000)
                idx = 0
                
            for i in range(len(data) - 4):
                if data[i] == 0xFF and (data[i+1] & 0xE0) == 0xE0:
                    b1 = data[i+1]
                    b2 = data[i+2]
                    layer = (b1 >> 1) & 0x3
                    version = (b1 >> 3) & 0x3
                    if layer == 1 and version == 3: # Layer III, MPEG 1
                        br_idx = (b2 >> 4) & 0xF
                        sr_idx = (b2 >> 2) & 0x3
                        if br_idx > 0 and br_idx < 15 and sr_idx < 3:
                            bitrate = bitrates_v1_l3[br_idx] * 1000
                            file_size = os.path.getsize(file_path)
                            # approximate duration in seconds = (file_size * 8) / bitrate
                            return int((file_size * 8) / bitrate)
    except Exception as e:
        pass
    
    # Fallback based on typical 192kbps / 256kbps
    file_size = os.path.getsize(file_path)
    # usually 320kbps or 256kbps
    return int((file_size * 8) / (256 * 1000))

import json, re

with open('src/data/initialSongs.ts', 'r', encoding='utf-8') as f:
    text = f.read()

m = re.search(r'export const INITIAL_SONGS: Song\[\] = (\[[\s\S]*?\]);', text)
songs = json.loads(m.group(1))

for s in songs:
    rel = s['audioUrl'].lstrip('/')
    p = os.path.join('public', rel)
    if os.path.exists(p):
        dur = get_mp3_duration(p)
        mins = dur // 60
        secs = dur % 60
        print(f"[{'RELEASE' if s.get('isMmRelease') else 'MIX'}] '{s['title']}': cur={s['duration']}s -> real={dur}s ({mins}:{secs:02d})")

