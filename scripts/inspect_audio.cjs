const https = require('https');

async function test() {
  const loginUrl = 'https://mymusicmarshall.com/User/Login';
  
  // 1. GET login page to get cookies and token
  https.get(loginUrl, (res) => {
    let html = '';
    const cookies = res.headers['set-cookie'] || [];
    res.on('data', chunk => html += chunk);
    res.on('end', () => {
      const match = html.match(/name="__RequestVerificationToken" type="hidden" value="([^"]+)"/);
      const token = match ? match[1] : '';
      console.log('Got token:', token ? 'yes' : 'no', 'Cookies:', cookies.length);

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
        console.log('Post status:', postRes.statusCode, 'redirect:', postRes.headers.location);

        // Fetch PlayAudio/2006 and PlayAudio/3025
        [2006, 2007, 3025, 3026, 3027, 3028, 3029, 3030].forEach(id => {
          https.get(`https://mymusicmarshall.com/Mix/PlayAudio/${id}`, {
            headers: { 'Cookie': allCookies }
          }, (playRes) => {
            let playHtml = '';
            playRes.on('data', c => playHtml += c);
            playRes.on('end', () => {
              const audioMatch = playHtml.match(/<audio[^>]*src="([^"]+)"/i) || playHtml.match(/<source[^>]*src="([^"]+)"/i) || playHtml.match(/https?:\/\/[^"'\s]+\.mp3/i) || playHtml.match(/\/uploads\/[^"'\s]+/i);
              console.log(`ID ${id}:`, audioMatch ? audioMatch[0] : 'no audio tag found, length: ' + playHtml.length);
              if (!audioMatch && id === 2006) {
                // print snippet
                console.log('Snippet 2006:', playHtml.slice(0, 500));
              }
            });
          });
        });
      });

      req.write(postData);
      req.end();
    });
  });
}

test();
