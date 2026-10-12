import re

id_to_name = {
    1: 'Disco_MixV01_Branded', 2: 'Classic Vintage_V01', 4: 'Rocksteady Love Pt 1',
    5: 'Old_Bounce_V01', 6: 'Bad_Soul_V01', 7: 'Disco_90s_V01', 8: 'Dwalli_Salsa_SexyLady',
    1002: 'Bandelero Mix', 1003: 'LR_Smooth_Singles_V01', 1005: 'soca_blend_V01',
    1006: 'loversrock_RV01', 1007: 'Dancehall_90s_V02', 1008: 'Culture_V01',
    2002: 'Luciano_Dub_Mix', 2006: 'What Will Be', 2007: "Don't Trust Dem",
    2008: 'War A Gwaan', 2010: 'Tennessee Whiskey', 2011: 'Righteous People',
    2012: 'Wayne_Alton', 2014: 'Party Mix Part 1', 2015: 'Party_Vocals_Mixx_V1',
    3015: 'Afrobeat Medley', 3017: 'Positive Transfusion EP', 3023: 'Test',
    3024: 'Easy_Flow_Mix', 3025: 'Kush', 3026: 'Chances Are', 3027: 'Hello Africa',
    3028: 'Groovy Reggae', 3029: 'Your Eyes', 3030: "Who's Loving You",
    3031: 'Heart Attack', 3032: 'Take A Chance'
}

with open('src/data/initialSongs.ts', 'r', encoding='utf-8') as f:
    content = f.read()

for mid, name in id_to_name.items():
    pat = rf'("db_id":\s*{mid},)'
    rep = f'\\1\n    "mixName": "{name}",'
    if f'"mixName": "{name}"' not in content:
        content = re.sub(pat, rep, content)

with open('src/data/initialSongs.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated initialSongs.ts with mixNames!')
