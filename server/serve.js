/**
  Micro http/http2 server with file monitoring and automatic app rebuild
  - can process concurrent http requests
  - monitors specified filed and folders for changes
  - triggers library and application rebuild
  - any build errors are immediately displayed and can be corrected without need for restart
  - passthrough data compression
*/

const fs = require('fs');
const zlib = require('zlib');
const http = require('http');
const http2 = require('http2');
const path = require('path');
const chokidar = require('chokidar');
const log = require('@vladmandic/pilogger');
const build = require('./build.js');

// app configuration
// you can provide your server key and certificate or use provided self-signed ones
// self-signed certificate generated using:
// openssl req -x509 -newkey rsa:4096 -nodes -keyout https.key -out https.crt -days 365 -subj "/C=US/ST=Florida/L=Miami/O=@vladmandic"
// client app does not work without secure server since browsers enforce https for webcam access
const options = {
  key: fs.readFileSync('server/https.key'),
  cert: fs.readFileSync('server/https.crt'),
  defaultFolder: 'demo',
  defaultFile: 'index.html',
  httpPort: 10030,
  httpsPort: 10031,
  insecureHTTPParser: false,
  minElapsed: 2,
  monitor: ['package.json', 'config.ts', 'demo/*.js', 'demo/*.html', 'src'],
};

// just some predefined mime types
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.wasm': 'application/wasm',
};

let last = Date.now();
async function buildAll(evt, msg) {
  const now = Date.now();
  if ((now - last) > options.minElapsed) build.build(evt, msg, true);
  else log.state('Build: merge event file', msg, evt);
  last = now;
}

// watch filesystem for any changes and notify build when needed
async function watch() {
  const watcher = chokidar.watch(options.monitor, {
    persistent: true,
    ignorePermissionErrors: false,
    alwaysStat: false,
    ignoreInitial: true,
    followSymlinks: true,
    usePolling: false,
    useFsEvents: false,
    atomic: true,
  });
  // single event handler for file add/change/delete
  watcher
    .on('add', (evt) => buildAll(evt, 'add'))
    .on('change', (evt) => buildAll(evt, 'modify'))
    .on('unlink', (evt) => buildAll(evt, 'remove'))
    .on('error', (err) => log.error(`Client watcher error: ${err}`))
    .on('ready', () => log.state('Monitoring:', options.monitor));
}

function handle(url) {
  url = url.split(/[?#]/)[0];
  const result = { ok: false, stat: {}, file: '' };
  const checkFile = (f) => {
    result.file = f;
    if (fs.existsSync(f)) {
      result.stat = fs.statSync(f);
      if (result.stat.isFile()) {
        result.ok = true;
        return true;
      }
    }
    return false;
  };
  const checkFolder = (f) => {
    result.file = f;
    if (fs.existsSync(f)) {
      result.stat = fs.statSync(f);
      if (result.stat.isDirectory()) {
        result.ok = true;
        return true;
      }
    }
    return false;
  };
  return new Promise((resolve) => {
    if (checkFile(path.join(process.cwd(), url))) resolve(result);
    else if (checkFile(path.join(process.cwd(), url, options.defaultFile))) resolve(result);
    else if (checkFile(path.join(process.cwd(), options.defaultFolder, url))) resolve(result);
    else if (checkFile(path.join(process.cwd(), options.defaultFolder, url, options.defaultFile))) resolve(result);
    else if (checkFolder(path.join(process.cwd(), url))) resolve(result);
    else if (checkFolder(path.join(process.cwd(), options.defaultFolder, url))) resolve(result);
    else resolve(result);
  });
}

// process http requests
async function httpRequest(req, res) {
  handle(decodeURI(req.url)).then((result) => {
    // get original ip of requestor, regardless if it's behind proxy or not
    const forwarded = (req.headers['forwarded'] || '').match(/for="\[(.*)\]:/);
    const ip = (Array.isArray(forwarded) ? forwarded[1] : null) || req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress;
    if (!result || !result.ok || !result.stat) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('Error 404: Not Found\n', 'utf-8');
      log.warn(`${req.method}/${req.httpVersion}`, res.statusCode, decodeURI(req.url), ip);
    } else {
      const input = encodeURIComponent(result.file).replace(/\*/g, '').replace(/\?/g, '').replace(/%2F/g, '/').replace(/%40/g, '@').replace(/%20/g, ' ');
      if (result?.stat?.isFile()) {
        const ext = String(path.extname(input)).toLowerCase();
        const contentType = mime[ext] || 'application/octet-stream';
        const accept = req.headers['accept-encoding'] ? req.headers['accept-encoding'].includes('br') : false; // does target accept brotli compressed data
        res.writeHead(200, {
          // 'Content-Length': result.stat.size, // not using as it's misleading for compressed streams
          'Content-Language': 'en',
          'Content-Type': contentType,
          'Content-Encoding': accept ? 'br' : '',
          'Last-Modified': result.stat.mtime,
          'Cache-Control': 'no-cache',
          'X-Content-Type-Options': 'nosniff',
          'Cross-Origin-Embedder-Policy': 'require-corp',
          'Cross-Origin-Opener-Policy': 'same-origin',
          'Content-Security-Policy': "media-src 'self' http: https: data:",
        });
        const compress = zlib.createBrotliCompress({ params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } }); // instance of brotli compression with level 5
        const stream = fs.createReadStream(input);
        if (!accept) stream.pipe(res); // don't compress data
        else stream.pipe(compress).pipe(res); // compress data

        /// alternative #2 read stream and send by chunk
        // const stream = fs.createReadStream(result.file);
        // stream.on('data', (chunk) => res.write(chunk));
        // stream.on('end', () => res.end());

        // alternative #3 read entire file and send it as blob
        // const data = fs.readFileSync(result.file);
        // res.write(data);
        log.data(`${req.method}/${req.httpVersion}`, res.statusCode, contentType, result.stat.size, req.url, ip);
      }
      if (result?.stat?.isDirectory()) {
        res.writeHead(200, { 'Content-Language': 'en', 'Content-Type': 'application/json; charset=utf-8', 'Last-Modified': result.stat.mtime, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
        let dir = fs.readdirSync(input);
        dir = dir.map((f) => path.join(decodeURI(req.url), f));
        res.end(JSON.stringify(dir), 'utf-8');
        log.data(`${req.method}/${req.httpVersion}`, res.statusCode, 'directory/json', result.stat.size, req.url, ip);
      }
    }
  });
}

// app main entry point
async function main() {
  log.header();
  await watch();
  process.chdir(path.join(__dirname, '..'));
  if (options.httpPort && options.httpPort > 0) {
    const server1 = http.createServer(options, httpRequest);
    server1.on('listening', () => log.state('HTTP server listening:', options.httpPort));
    server1.on('error', (err) => log.error('HTTP server:', err.message || err));
    server1.listen(options.httpPort);
  }
  if (options.httpsPort && options.httpsPort > 0) {
    const server2 = http2.createSecureServer(options, httpRequest);
    server2.on('listening', () => log.state('HTTP2 server listening:', options.httpsPort));
    server2.on('error', (err) => log.error('HTTP2 server:', err.message || err));
    server2.listen(options.httpsPort);
  }
  await build.build('all', 'startup', true);
}

main();
