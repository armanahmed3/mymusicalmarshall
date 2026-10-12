import zipfile, os, json, shutil

print("Extracting audio_files.zip...")
z = zipfile.ZipFile('audio_files.zip')

os.makedirs('public/audio', exist_ok=True)
os.makedirs('public/AudioFileUpload', exist_ok=True)

# Extract files into public/audio and public/AudioFileUpload
for member in z.infolist():
    filename = member.filename.split('/')[-1]
    if not filename: continue
    data = z.read(member)
    
    # Save to public/audio
    target1 = os.path.join('public/audio', filename)
    with open(target1, 'wb') as f:
        f.write(data)
        
    # Save to public/AudioFileUpload
    target2 = os.path.join('public/AudioFileUpload', filename)
    with open(target2, 'wb') as f:
        f.write(data)
        
    # Handle Who's_Loving_You apostrophe variation
    if 'Who_s_Loving_You' in filename:
        alt_name = filename.replace('Who_s_Loving_You', "Who's_Loving_You")
        with open(os.path.join('public/audio', alt_name), 'wb') as f:
            f.write(data)
        with open(os.path.join('public/AudioFileUpload', alt_name), 'wb') as f:
            f.write(data)

print("Audio files extracted successfully.")
