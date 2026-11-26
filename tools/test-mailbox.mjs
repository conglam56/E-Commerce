// Local development and E2E only. The Compose files publish this service on loopback.
import http from 'node:http';
import { randomUUID } from 'node:crypto';

const messages = [];
http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method === 'GET' && req.url === '/') return res.end(JSON.stringify(messages));
  if (req.method !== 'POST' || req.url !== '/emails') {
    res.writeHead(404).end();
    return;
  }
  try {
    let body = '';
    for await (const chunk of req) {
      body += chunk;
      if (body.length > 16384) { res.writeHead(413).end(); return; }
    }
    const { to, subject, text } = JSON.parse(body);
    messages.unshift({ to, subject, text });
    if (messages.length > 100) messages.pop();
    res.end(JSON.stringify({ id: randomUUID() }));
  } catch (err) {
    res.writeHead(400).end(JSON.stringify({ error: 'Invalid mail request' }));
  }
}).listen(8025, '0.0.0.0');
