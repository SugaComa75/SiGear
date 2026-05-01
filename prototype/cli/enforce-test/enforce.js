#!/usr/bin/env node
const http = require('http');
const { URL } = require('url');

const endpoint = process.env.POLICY_ENDPOINT || 'http://localhost:4000/v1/enforce';

const payload = {
  identityId: 'user:1234',
  action: 'read_profile',
  purpose: 'social_connection',
  context: { reauthenticated: false }
};

function post(url, data) {
  const u = new URL(url);
  const lib = u.protocol === 'https:' ? require('https') : require('http');
  const req = lib.request(
    {
      hostname: u.hostname,
      port: u.port || (u.protocol === 'https:' ? 443 : 80),
      path: u.pathname + (u.search || ''),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        console.log('HTTP', res.statusCode);
        try {
          console.log(JSON.stringify(JSON.parse(body), null, 2));
          process.exit(0);
        } catch (e) {
          console.error('Non-JSON response:', body);
          process.exit(2);
        }
      });
    }
  );
  req.on('error', (e) => {
    console.error('Request error', e.message);
    process.exit(3);
  });
  req.write(JSON.stringify(data));
  req.end();
}

post(endpoint, payload);
