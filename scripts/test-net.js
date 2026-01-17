#!/usr/bin/env node
const https = require('https');

const options = {
    hostname: 'overpass-api.de',
    path: '/api/interpreter',
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'TestBot/1.0' }
};

const query = `[out:json][timeout:25];way["waterway"="river"](43.0,76.0,43.1,76.1);out geom;`;

console.log('Starting request...');

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('BODY length:', data.length);
        console.log('First 100 chars:', data.substring(0, 100));
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(`data=${encodeURIComponent(query)}`);
req.end();
console.log('Request sent.');
