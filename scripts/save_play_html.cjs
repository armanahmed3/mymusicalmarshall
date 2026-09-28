const https = require('https');
const fs = require('fs');

async function test() {
  const loginUrl = 'https://mymusicmarshall.com/User/Login';
  
  https.get(loginUrl, (res) => {
    let html = '';
    const cookies = res.headers['set-cookie'] || [];
    res.on('data', chunk => html += chunk);
    res.on('end', () => {
      const match = html.match(/name="__RequestVerificationToken" type="hidden" value="([^"]+)"/);
      const token = match ? match[1] : '';

      const postData = `Email=${encodeURIComponent('texaswebcoders@gmail.com')}&Password=${encodeURIComponent('ryan@RAYAN')}&RememberMe=true&__RequestVerificationToken=${encodeURIComponent(token)}`;
      
      const req = https.request('https://mymusicmarshall.com/User/Login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
          'Cookie': cookies.map(c => c.split(';')[0]).join('; ')
        }
      }, (postRes) => {
        const postCookies = postRes.headers['set-cookie'] || [];
        const allCookies = [...cookies, ...postCookies].map(c => c.split(';')[0]).join('; ');

        https.get('https://mymusicmarshall.com/Mix/PlayAudio/2006', {
          headers: { 'Cookie': allCookies }
        }, (playRes) => {
          let playHtml = '';
          playRes.on('data', c => playHtml += c);
          playRes.on('end', () => {
            fs.writeFileSync('scripts/play_2006.html', playHtml);
            console.log('Saved play_2006.html, size:', playHtml.length);
          });
        });

        https.get('https://mymusicmarshall.com/Mix/PlayAudio/3025', {
          headers: { 'Cookie': allCookies }
        }, (playRes) => {
          let playHtml = '';
          playRes.on('data', c => playHtml += c);
          playRes.on('end', () => {
            fs.writeFileSync('scripts/play_3025.html', playHtml);
            console.log('Saved play_3025.html, size:', playHtml.length);
          });
        });
      });

      req.write(postData);
      req.end();
    });
  });
}

test();
