const fs = require('fs');
const http = require('http');
const path = require('path');
const Database = require('better-sqlite3');
const { createDiagramApiHandler } = require('../server/diagram-api');

const root = path.join(__dirname, '..');
const isDevelopment = process.argv.includes('--development');
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 9013);
const databasePath = process.env.DIAGRAM_DB_PATH || path.join(root, 'data', 'diagrams.sqlite');

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a valid TCP port number.');
}

fs.mkdirSync(path.dirname(databasePath), { recursive: true });
const database = new Database(databasePath);
database.pragma('journal_mode = WAL');
database.pragma('busy_timeout = 5000');
database.exec(`
  CREATE TABLE IF NOT EXISTS diagrams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    xml TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    revision INTEGER NOT NULL DEFAULT 1
  )
`);

const apiHandler = createDiagramApiHandler(database);
let parcelBundler;
let parcelMiddleware;

if (isDevelopment) {
  const Bundler = require('parcel-bundler');
  parcelBundler = new Bundler(path.join(root, 'app', 'index.html'), {
    cacheDir: path.join(root, '.cache'),
    hmr: true,
    outDir: path.join(root, '.parcel-api-dev'),
    publicUrl: '/',
    watch: true
  });
  parcelMiddleware = parcelBundler.middleware();
}

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.eot': 'application/vnd.ms-fontobject',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.wasm': 'application/wasm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function serveBuild(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end();
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch (error) {
    response.writeHead(400);
    response.end('Invalid URL.');
    return;
  }

  const buildDirectory = path.join(root, 'build');
  const requestedFile = path.resolve(buildDirectory, `.${pathname}`);
  if (!requestedFile.startsWith(`${buildDirectory}${path.sep}`) && requestedFile !== buildDirectory) {
    response.writeHead(403);
    response.end('Forbidden.');
    return;
  }

  const filePath = path.extname(requestedFile)
    ? requestedFile
    : path.join(buildDirectory, 'index.html');
  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      response.writeHead(404);
      response.end('Not found.');
      return;
    }
    response.writeHead(200, {
      'Content-Length': stats.size,
      'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream'
    });
    if (request.method === 'HEAD') {
      response.end();
      return;
    }
    fs.createReadStream(filePath).pipe(response);
  });
}

const server = http.createServer((request, response) => {
  if (apiHandler(request, response)) {
    return;
  }
  if (isDevelopment) {
    parcelMiddleware(request, response);
    return;
  }
  serveBuild(request, response);
});

server.listen(port, host, () => {
  console.info(`Loosechain is listening on http://${host}:${port}`);
  console.info(`Diagram database: ${databasePath}`);
});

let shuttingDown = false;
async function shutdown() {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  server.close(() => {
    database.close();
  });
  if (parcelBundler) {
    await parcelBundler.stop();
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
