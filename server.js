// Local Static HTTP Server for SDE-Mastery 40 Study Portal & Quiz App
// Zero external npm dependencies - uses native Node.js http, fs, and path modules.

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const DEFAULT_PORT = 5000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

function getSafeFilePath(requestedUrl) {
  const parsed = url.parse(requestedUrl);
  let pathname = decodeURIComponent(parsed.pathname || '/');

  // Default root to app/index.html
  if (pathname === '/' || pathname === '/index.html') {
    return path.join(ROOT_DIR, 'app', 'index.html');
  }

  // Prevent directory traversal
  const normalized = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '').replace(/^[\\\/]+/, '');

  // 1. Try directly in ROOT_DIR (e.g. phase-1-days-01-to-10/..., README.md)
  const rootTarget = path.join(ROOT_DIR, normalized);
  if (fs.existsSync(rootTarget) && fs.statSync(rootTarget).isFile()) {
    return rootTarget;
  }

  // 2. Try in ROOT_DIR/app/ (e.g. data.js, app.js, styles.css, dsa-problems.js)
  const appTarget = path.join(ROOT_DIR, 'app', normalized);
  if (fs.existsSync(appTarget) && fs.statSync(appTarget).isFile()) {
    return appTarget;
  }

  // 3. Check if target is a directory containing index.html
  if (fs.existsSync(rootTarget) && fs.statSync(rootTarget).isDirectory()) {
    const idx = path.join(rootTarget, 'index.html');
    if (fs.existsSync(idx)) return idx;
  }

  // Security check: must reside inside ROOT_DIR
  if (!rootTarget.startsWith(ROOT_DIR)) {
    return null;
  }

  return rootTarget;
}

const server = http.createServer((req, res) => {
  // CORS and Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
    return;
  }

  const filePath = getSafeFilePath(req.url);
  if (!filePath) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Access Denied');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`404 Not Found: ${req.url}`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    if (req.method === 'HEAD') {
      res.end();
      return;
    }

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
    readStream.on('error', (streamErr) => {
      console.error('Stream error:', streamErr);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    });
  });
});

function startServer(port) {
  server.listen(port, () => {
    console.log(`\n==========================================================`);
    console.log(`  🚀 SDE-Mastery 40 Study Portal & Quiz App is Running!`);
    console.log(`  🌐 URL: http://localhost:${port}`);
    console.log(`  📁 Workspace: ${ROOT_DIR}`);
    console.log(`  Press Ctrl + C to stop the server.`);
    console.log(`==========================================================\n`);
  });

  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      console.warn(`Port ${port} is in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', e);
    }
  });
}

startServer(DEFAULT_PORT);
