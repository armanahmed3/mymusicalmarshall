const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

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

function fetchPage(url, cookie, callback) {
  https.get(url, { headers: { 'Cookie': cookie } }, (res) => {
    let html = '';
    res.on('data', c => html += c);
    res.on('end', () => callback(html));
  });
}

function downloadFile(fileUrl, destPath, callback) {
  if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
    console.log('Already downloaded:', path.basename(destPath));
    return callback(null);
  }
  const file = fs.createWriteStream(destPath);
  https.get(fileUrl, (response) => {
    if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
      return downloadFile(response.headers.location, destPath, callback);
    }
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Downloaded:', path.basename(destPath), fs.statSync(destPath).size, 'bytes');
      callback(null);
    });
  }).on('error', (err) => {
    fs.unlink(destPath, () => {});
    callback(err);
  });
}

async function run() {
  getCookieAndToken((cookies, token) => {
    login(cookies, token, async (sessionCookie) => {
      console.log('Logged in successfully!');

      // Fetch ListReleases page
      fetchPage('https://mymusicmarshall.com/Mix/ListReleases', sessionCookie, async (releasesHtml) => {
        fs.writeFileSync('scripts/list_releases.html', releasesHtml);

        // Find all PlayAudio links
        const playAudioRegex = /\/Mix\/PlayAudio\/(\d+)/g;
        const ids = new Set();
        let m;
        while ((m = playAudioRegex.exec(releasesHtml)) !== null) {
          ids.add(m[1]);
        }
        console.log('Found PlayAudio IDs in releases:', Array.from(ids));

        // Also check Mix/List
        fetchPage('https://mymusicmarshall.com/Mix/List', sessionCookie, async (listHtml) => {
          fs.writeFileSync('scripts/list_mix.html', listHtml);
          while ((m = playAudioRegex.exec(listHtml)) !== null) {
            ids.add(m[1]);
          }

          console.log('Total unique IDs across portal:', Array.from(ids));

          const allTracks = [];
          const idList = Array.from(ids);

          for (const id of idList) {
            await new Promise((resolve) => {
              fetchPage(`https://mymusicmarshall.com/Mix/PlayAudio/${id}`, sessionCookie, async (playHtml) => {
                const srcMatch = playHtml.match(/src=([^\s>]+)/i) || playHtml.match(/src="([^"]+)"/i);
                let audioSrc = '';
                if (srcMatch) {
                  audioSrc = srcMatch[1].replace(/["']/g, '');
                }

                // Match title / h2 / text
                const h2Match = playHtml.match(/<h2[^>]*>(.*?)<\/h2>/i);
                console.log(`ID ${id} -> audioSrc: ${audioSrc}`);

                if (audioSrc && audioSrc.endsWith('.mp3')) {
                  const fullAudioUrl = audioSrc.startsWith('http') ? audioSrc : `https://mymusicmarshall.com${audioSrc.startsWith('/') ? '' : '/'}${audioSrc}`;
                  const filename = path.basename(audioSrc);
                  const destPath = path.join(__dirname, '..', 'public', 'audio', filename);

                  allTracks.push({
                    id: `mm-${id}`,
                    releaseId: id,
                    audioSrc: `/audio/${filename}`,
                    fullRemoteUrl: fullAudioUrl,
                    filename: filename
                  });

                  downloadFile(fullAudioUrl, destPath, () => {
                    resolve();
                  });
                } else {
                  resolve();
                }
              });
            });
          }

          fs.writeFileSync('scripts/tracks_found.json', JSON.stringify(allTracks, null, 2));
          console.log('Finished processing all tracks! Found:', allTracks.length);
        });
      });
    });
  });
}

run();
