import openpyxl

wb = openpyxl.load_workbook('MusicMarshall_Complete_Database.xlsx')
ws = wb['dbo.mixes']

for row in list(ws.iter_rows(values_only=True))[1:]:
    m_id, name, desc, raw_desc, cat, genre, dur, mix_len, status, audio = row
    if cat != 'release' and m_id != 3023:
        print(f"ID {m_id:4d} | mixName: {name:24s} | mixDesc: {raw_desc:40s} | cat: {cat}")
