const fetch = require('node-fetch'); // You might need to install this or use built-in fetch if node version supports it. 
// Since I don't know if node-fetch is installed, I'll use http module or just try built-in fetch (Node 18+)
// Let's assume Node 18+ or use http.

const http = require('http');

const data = JSON.stringify({
    login: 'admin@admin.com',
    senha: '123'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);

    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        console.log('BODY:', body);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
