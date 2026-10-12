const https = require('https');
const fs = require('fs');

function getCookieAndToken(cb) {
  https.get('https://mymusicmarshall.com/User/Login', (res) => {
    let html = '';
    const cookies = res.headers['set-cookie'] || [];
    res.on('data', c => html += c);
    res.on('end', () => {
      const match = html.match(/name="__RequestVerificationToken" type="hidden" value="([^"]+)"/);
      cb(cookies, match ? match[1] : '');
    });
  });
}

function login(cookies, token, cb) {
  const postData = 'Email=' + encodeURIComponent('texaswebcoders@gmail.com') + '&Password=' + encodeURIComponent('ryan@RAYAN') + '&RememberMe=true&__RequestVerificationToken=' + encodeURIComponent(token);
  const req = https.request('https://mymusicmarshall.com/User/Login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
      'Cookie': cookies.map(c => c.split(';')[0]).join('; ')
    }
  }, (res) => {
    const postCookies = res.headers['set-cookie'] || [];
    cb([...cookies, ...postCookies].map(c => c.split(';')[0]).join('; '));
  });
  req.write(postData);
  req.end();
}

getCookieAndToken((cookies, token) => {
  login(cookies, token, (authCookie) => {
    https.get('https://mymusicmarshall.com/Mix/List', { headers: { 'Cookie': authCookie } }, (res) => {
      let html = '';
      res.on('data', c => html += c);
      res.on('end', () => {
        fs.writeFileSync('scripts/live_mix_list.html', html);
        console.log('Saved live_mix_list.html, length:', html.length);
      });
    });
  });
});
