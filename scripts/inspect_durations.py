import openpyxl

wb = openpyxl.load_workbook('MusicMarshall_Complete_Database.xlsx')
ws = wb['dbo.mixes']
for i, row in enumerate(ws.iter_rows(values_only=True)):
    if i == 0:
        continue
    mix_id, mix_name, proper_desc, raw_desc, cat, genre, dur, mix_len, status, audio_path = row
    print(f"ID: {mix_id:4} | Name: {mix_name:24} | Length: {mix_len} | Dur: {dur} | Path: {audio_path}")
