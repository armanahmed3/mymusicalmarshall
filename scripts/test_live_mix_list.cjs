const https = require('https');

https.get('https://mymusicmarshall.com/User/Login', (res) => {
  let html = '';
  const cookies = res.headers['set-cookie'] || [];
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    const match = html.match(/name="__RequestVerificationToken" type="hidden" value="([^"]+)"/);
    const token = match ? match[1] : '';
    const postData = 'Email=' + encodeURIComponent('texaswebcoders@gmail.com') + '&Password=' + encodeURIComponent('ryan@RAYAN') + '&RememberMe=true&__RequestVerificationToken=' + encodeURIComponent(token);
    const req = https.request('https://mymusicmarshall.com/User/Login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'Cookie': cookies.map(c => c.split(';')[0]).join('; ')
      }
    }, (loginRes) => {
      const allCookies = [...cookies, ...(loginRes.headers['set-cookie'] || [])].map(c => c.split(';')[0]).join('; ');
      https.get('https://mymusicmarshall.com/Mix/List', { headers: { 'Cookie': allCookies } }, (listRes) => {
        let listHtml = '';
        listRes.on('data', c => listHtml += c);
        listRes.on('end', () => {
          console.log('List status:', listRes.statusCode);
          console.log('List length:', listHtml.length);
          const links = listHtml.match(/\/Mix\/PlayAudio\/\d+/g);
          console.log('PlayAudio links found in Mix/List:', links);
          if (listHtml.includes('Object moved')) {
            console.log('Redirect location:', listRes.headers.location);
          }
        });
      });
    });
    req.write(postData);
    req.end();
  });
});
