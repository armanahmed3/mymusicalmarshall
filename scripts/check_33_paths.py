import os

paths = [
    '/AudioFileUpload/Disco_MixV01_Branded1194021647.mp3',
    '/AudioFileUpload/ClassicVintage_V01.mp3',
    '/AudioFileUpload/RocksteadyLovePt1.mp3',
    '/AudioFileUpload/Old_Bounce_V01.mp3',
    '/AudioFileUpload/Bad_Soul_V01.mp3',
    '/AudioFileUpload/Disco_90s_V01192748095.mp3',
    '/AudioFileUpload/Dwalli_Salsa_SexyLady190910023.mp3',
    '/AudioFileUpload/BandeleroMix192124723.mp3',
    '/AudioFileUpload/LoversRock_Smooth_V01190150535.mp3',
    '/AudioFileUpload/Soca_Blend_V01192137629.mp3',
    '/AudioFileUpload/LoversRock_RV01192758459.mp3',
    '/AudioFileUpload/Dancehall_90s_V02190942052.mp3',
    '/AudioFileUpload/Culture_V01191203580.mp3',
    '/AudioFileUpload/Luciano_MM01X222931331.mp3',
    '/AudioFileUpload/WhatWillBe222604854.mp3',
    '/AudioFileUpload/Dont_Trust_Them220406320.mp3',
    '/AudioFileUpload/War_A_Gwaan220459279.mp3',
    '/AudioFileUpload/TENNESSEE_WHISKEY220827858.mp3',
    '/AudioFileUpload/Righteous_People223901125.mp3',
    '/AudioFileUpload/Wayne_Alton_Full_Mixx220453461.mp3',
    '/AudioFileUpload/Party_Mix_Pt1222950815.mp3',
    '/AudioFileUpload/vocals_Mixx_01222201457.mp3',
    '/AudioFileUpload/Afrobeat_Medley221610074.mp3',
    '/AudioFileUpload/Positive_Transfusion_Juggling_v2222755873.mp3',
    '/AudioFileUpload/Easy_Flow_23v1241026820.mp3',
    '/AudioFileUpload/Kush-WayneArmond255935568.mp3',
    '/AudioFileUpload/CHANCES_ARE-Yishka251130187.mp3',
    '/AudioFileUpload/Hello_Africa-StevieMalekuu252025093.mp3',
    '/AudioFileUpload/Groovy_Reggae_Sax-Yishka252426431.mp3',
    '/AudioFileUpload/Your_Eyes-TeachaBarnes252816585.mp3',
    "/AudioFileUpload/Who's_Loving_You-WayneArmond253149479.mp3",
    '/AudioFileUpload/Heart_Attack-TeachaBarnes250526382.mp3',
    '/AudioFileUpload/Take_a_Chance-TheGreavesBrothers250853064.mp3'
]

print(f'Checking {len(paths)} paths in public/...')
missing = []
for p in paths:
    rel = p.lstrip('/')
    loc1 = os.path.join('public', rel)
    loc2 = os.path.join('public', 'audio', os.path.basename(rel))
    if os.path.exists(loc1):
        pass
    elif os.path.exists(loc2):
        pass
    else:
        missing.append(p)

print('Missing count:', len(missing))
if missing:
    print('Missing files:', missing)
else:
    print('ALL 33 AUDIO PATHS FROM DATABASE ARE PRESENT IN PUBLIC FOLDER!')
