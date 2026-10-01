const https = require('https');
const fs = require('fs');
const path = require('path');

const TRACKS_METADATA = [
  { id: '2006', name: 'What Will Be', artist: 'Stevie Malekuu', desc: 'What Will Be - Stevie Malekuu', length: 240, genre: 'Reggae / Soul', mood: 'chill', isMmRelease: true },
  { id: '2007', name: "Don't Trust Dem", artist: 'Stevie Malekuu', desc: "Don't Trust Dem - Stevie Malekuu", length: 270, genre: 'Roots Reggae', mood: 'workout', isMmRelease: true },
  { id: '2008', name: 'War A Gwaan', artist: 'Luciano', desc: 'War A Gwaan by Luciano', length: 240, genre: 'Conscious Reggae', mood: 'focus', isMmRelease: true },
  { id: '2010', name: 'Tennessee Whiskey', artist: 'Wayne Armond', desc: 'Tennessee Whiskey - Wayne Armond', length: 240, genre: 'Soul / Blues', mood: 'soul', isMmRelease: true },
  { id: '2011', name: 'Righteous People', artist: 'Wayne Armond', desc: 'Righteous People - Wayne Armond', length: 240, genre: 'Gospel Reggae', mood: 'chill', isMmRelease: true },
  { id: '2012', name: 'Wayne Armond Picks on Alton Ellis', artist: 'Wayne Armond', desc: 'Wayne Armond Picks on Alton Ellis', length: 2730, genre: 'Rocksteady / Classic', mood: 'focus', isMmRelease: true },
  { id: '3015', name: 'Afrobeat Medley', artist: '', desc: 'Afrobeat Meets R&B', length: 292, genre: 'Afrobeat', mood: 'workout', isMmRelease: true },
  { id: '3017', name: 'Positive Transfusion EP Juggling', artist: '', desc: 'Positive Transfusion EP Juggling', length: 1800, genre: 'Dancehall', mood: 'party', isMmRelease: true },
  { id: '3025', name: 'Kush', artist: 'Wayne Armond', desc: 'Kush by Wayne Armond', length: 220, genre: 'Roots Reggae', mood: 'chill', isMmRelease: true },
  { id: '3026', name: 'Chances Are', artist: 'Yishka', desc: 'Chances Are by Yishka', length: 285, genre: 'Smooth Reggae', mood: 'soul', isMmRelease: true },
  { id: '3027', name: 'Hello Africa', artist: 'Stevie Malekuu', desc: 'Hello Africa by Stevie Malekuu', length: 180, genre: 'Afro Reggae', mood: 'party', isMmRelease: true },
  { id: '3028', name: 'Groovy Reggae', artist: 'Yishka', desc: 'Groovy Reggae - Sax by Yishka', length: 180, genre: 'Instrumental / Sax', mood: 'chill', isMmRelease: true },
  { id: '3029', name: 'Your Eyes', artist: 'Teacha Barnes', desc: 'Your Eyes by Teacha Barnes', length: 253, genre: 'Lovers Rock', mood: 'soul', isMmRelease: true },
  { id: '3030', name: "Who's Loving You", artist: 'Wayne Armond', desc: "Who's Loving You by Wayne Armond", length: 172, genre: 'Soulful Reggae', mood: 'chill', isMmRelease: true },
  { id: '3031', name: 'Heart Attack', artist: 'Teacha Barnes', desc: 'Heart Attack by Teacha Barnes', length: 208, genre: 'Dancehall Reggae', mood: 'workout', isMmRelease: true },
  { id: '3032', name: 'Take A Chance', artist: 'The Greaves Brothers', desc: 'Take A Chance by The Greaves Brothers', length: 223, genre: 'Classic Reggae', mood: 'chill', isMmRelease: true }
];

function getCookieAndToken(callback) {
  https.get('https://mymusicmarshall.com/User/Login', (res) => {
    let html = '';
    const cookies = res.headers['set-cookie'] || [];
    res.on('data', chunk => html += chunk);
    res.on('end', () => {
      const match = html.match(/name="__RequestVerificationToken" type="hidden" value="([^"]+)"/);
      const token = match ? match[1] : '';
      callback(cookies, token);
    });
  });
}

function login(cookies, token, callback) {
  const postData = `Email=${encodeURIComponent('texaswebcoders@gmail.com')}&Password=${encodeURIComponent('ryan@RAYAN')}&RememberMe=true&__RequestVerificationToken=${encodeURIComponent(token)}`;
  const req = https.request('https://mymusicmarshall.com/User/Login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
      'Cookie': cookies.map(c => c.split(';')[0]).join('; ')
    }
  }, (res) => {
    const postCookies = res.headers['set-cookie'] || [];
    const allCookies = [...cookies, ...postCookies].map(c => c.split(';')[0]).join('; ');
    callback(allCookies);
  });
  req.write(postData);
  req.end();
}

function downloadFile(fileUrl, destPath, callback) {
  if (fs.existsSync(destPath) && fs.statSync(destPath).size > 10000) {
    console.log('✓ Already downloaded:', path.basename(destPath), '(' + (fs.statSync(destPath).size / 1024 / 1024).toFixed(2) + ' MB)');
    return callback(null);
  }
  console.log('Downloading:', fileUrl, '->', path.basename(destPath));
  const file = fs.createWriteStream(destPath);
  https.get(fileUrl, (response) => {
    if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
      return downloadFile(response.headers.location, destPath, callback);
    }
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('✓ Successfully downloaded:', path.basename(destPath), '(' + (fs.statSync(destPath).size / 1024 / 1024).toFixed(2) + ' MB)');
      callback(null);
    });
  }).on('error', (err) => {
    fs.unlink(destPath, () => {});
    callback(err);
  });
}

async function start() {
  getCookieAndToken((cookies, token) => {
    login(cookies, token, async (sessionCookie) => {
      console.log('Logged in to mymusicmarshall.com!');

      const finalSongs = [];
      const audioDir = path.join(__dirname, '..', 'public', 'audio');
      if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

      for (const track of TRACKS_METADATA) {
        await new Promise((resolve) => {
          https.get(`https://mymusicmarshall.com/Mix/PlayAudio/${track.id}`, { headers: { 'Cookie': sessionCookie } }, (res) => {
            let html = '';
            res.on('data', c => html += c);
            res.on('end', () => {
              const audioMatch = html.match(/\/AudioFileUpload\/([^"'\s>]+\.mp3)/i);
              if (audioMatch) {
                const audioRelativePath = audioMatch[0];
                const filename = audioMatch[1];
                const fullAudioUrl = `https://mymusicmarshall.com${audioRelativePath}`;
                const destFile = path.join(audioDir, filename);

                const songObj = {
                  id: `song-mm-${track.id}`,
                  title: track.name,
                  artist: track.artist,
                  album: 'Music Marshall Official Release',
                  duration: track.length,
                  audioUrl: `/audio/${filename}`,
                  coverUrl: '/mm_logo.jpg',
                  genre: track.genre,
                  mood: track.mood,
                  bpm: 92,
                  isMmRelease: true,
                  releaseId: track.id,
                  description: track.desc
                };
                finalSongs.push(songObj);

                downloadFile(fullAudioUrl, destFile, () => {
                  resolve();
                });
              } else {
                console.log('No audio file found for ID', track.id);
                resolve();
              }
            });
          });
        });
      }

      fs.writeFileSync(path.join(__dirname, 'all_mm_releases.json'), JSON.stringify(finalSongs, null, 2));
      console.log('COMPLETE! Processed', finalSongs.length, 'official MM releases.');
    });
  });
}

start();
