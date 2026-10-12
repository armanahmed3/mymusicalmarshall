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

const ALL_IDS = [
  1, 2, 4, 5, 6, 7, 8, 1002, 1003, 1005, 1006, 1007, 1008, 
  2002, 2006, 2007, 2008, 2010, 2011, 2012, 2014, 2015, 
  3015, 3017, 3024, 3025, 3026, 3027, 3028, 3029, 3030, 3031, 3032
];

getCookieAndToken((cookies, token) => {
  login(cookies, token, async (authCookie) => {
    console.log('Logged in successfully!');
    const results = {};
    for (const id of ALL_IDS) {
      await new Promise(resolve => {
        https.get(`https://mymusicmarshall.com/Mix/PlayAudio/${id}`, { headers: { 'Cookie': authCookie } }, (res) => {
          let html = '';
          res.on('data', c => html += c);
          res.on('end', () => {
            const m = html.match(/<audio[^>]*src=([^\s>]+)/i);
            const src = m ? m[1].replace(/["']/g, '') : 'NONE';
            results[id] = src;
            console.log(`ID ${id}: ${src}`);
            resolve();
          });
        });
      });
    }
    fs.writeFileSync('scripts/play_audio_src_map.json', JSON.stringify(results, null, 2));
    console.log('Saved play_audio_src_map.json');
  });
});
