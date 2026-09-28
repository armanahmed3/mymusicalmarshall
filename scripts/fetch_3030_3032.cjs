const https = require('https');
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

getCookieAndToken((cookies, token) => {
  login(cookies, token, (sessionCookie) => {
    [3030, 3032].forEach(id => {
      https.get(`https://mymusicmarshall.com/Mix/PlayAudio/${id}`, { headers: { 'Cookie': sessionCookie } }, (res) => {
        let html = '';
        res.on('data', c => html += c);
        res.on('end', () => {
          const match = html.match(/<audio[^>]*src=([^\s>]+)/i);
          console.log(`ID ${id}:`, match ? match[1] : 'No match');
          if (match) {
            let rawSrc = match[1].replace(/["']/g, '');
            // Decode html entities like &#39; -> '
            let decodedSrc = rawSrc.replace(/&#39;/g, "'");
            let encodedUrl = 'https://mymusicmarshall.com' + rawSrc.replace(/&#39;/g, '%27');
            let cleanFilename = path.basename(decodedSrc).replace(/[']/g, '_');
            let dest = path.join(__dirname, '..', 'public', 'audio', cleanFilename);
            console.log('Downloading from:', encodedUrl, 'to', dest);

            const file = fs.createWriteStream(dest);
            https.get(encodedUrl, (resp) => {
              resp.pipe(file);
              file.on('finish', () => {
                file.close();
                console.log('Downloaded', cleanFilename, fs.statSync(dest).size, 'bytes');
              });
            });
          }
        });
      });
    });
  });
});
