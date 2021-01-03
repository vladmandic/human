#!/usr/bin/env -S node --trace-warnings

/*
  micro http2 server with file monitoring and automatic app rebuild
  - can process concurrent http requests
  - monitors specified filed and folders for changes
  - triggers library and application rebuild
  - any build errors are immediately displayed and can be corrected without need for restart
  - passthrough data compression
*/

const process = require('process');
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
  root: '..',
  default: 'demo/index.html',
  httpPort: 10030,
  httpsPort: 10031,
  monitor: ['package.json', 'config.js', 'demo', 'src'],
};

// just some predefined mime types
const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.wasm': 'application/wasm',
};

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
    .on('add', (evt) => build.build(evt, 'add'))
    .on('change', (evt) => build.build(evt, 'modify'))
    .on('unlink', (evt) => build.build(evt, 'remove'))
    .on('error', (err) => log.error(`Client watcher error: ${err}`))
    .on('ready', () => log.state('Monitoring:', options.monitor));
}

// get file content for a valid url request
function handle(url) {
  return new Promise((resolve) => {
    let obj = { ok: false };
    obj.file = url;
    if (!fs.existsSync(obj.file)) resolve(null);
    obj.stat = fs.statSync(obj.file);
    if (obj.stat.isFile()) obj.ok = true;
    if (!obj.ok && obj.stat.isDirectory()) {
      obj.file = path.join(obj.file, options.default);
      // @ts-ignore
      obj = handle(obj.file);
    }
    resolve(obj);
  });
}

// process http requests
async function httpRequest(req, res) {
  handle(path.join(__dirname, options.root, req.url)).then((result) => {
    // get original ip of requestor, regardless if it's behind proxy or not
    const forwarded = (req.headers['forwarded'] || '').match(/for="\[(.*)\]:/);
    const ip = (Array.isArray(forwarded) ? forwarded[1] : null) || req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress;
    if (!result || !result.ok) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('Error 404: Not Found\n', 'utf-8');
      log.warn(`${req.method}/${req.httpVersion}`, res.statusCode, req.url, ip);
    } else {
      const ext = String(path.extname(result.file)).toLowerCase();
      const contentType = mime[ext] || 'application/octet-stream';
      const accept = req.headers['accept-encoding'] ? req.headers['accept-encoding'].includes('br') : false; // does target accept brotli compressed data
      res.writeHead(200, {
        // 'Content-Length': result.stat.size, // not using as it's misleading for compressed streams
        'Content-Language': 'en', 'Content-Type': contentType, 'Content-Encoding': accept ? 'br' : '', 'Last-Modified': result.stat.mtime, 'Cache-Control': 'no-cache', 'X-Powered-By': `NodeJS/${process.version}`,
      });
      const compress = zlib.createBrotliCompress({ params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } }); // instance of brotli compression with level 5
      const stream = fs.createReadStream(result.file);
      if (!accept) stream.pipe(res); // don't compress data
      else stream.pipe(compress).pipe(res); // compress data

      // alternative methods of sending data
      /// 2. read stream and send by chunk
      // const stream = fs.createReadStream(result.file);
      // stream.on('data', (chunk) => res.write(chunk));
      // stream.on('end', () => res.end());

      // 3. read entire file and send it as blob
      // const data = fs.readFileSync(result.file);
      // res.write(data);
      log.data(`${req.method}/${req.httpVersion}`, res.statusCode, contentType, result.stat.size, req.url, ip);
    }
  });
}

// app main entry point
async function main() {
  log.header();
  await watch();
  // @ts-ignore
  const server1 = http.createServer(options, httpRequest);
  server1.on('listening', () => log.state('HTTP server listening:', options.httpPort));
  server1.listen(options.httpPort);
  const server2 = http2.createSecureServer(options, httpRequest);
  server2.on('listening', () => log.state('HTTP2 server listening:', options.httpsPort));
  server2.listen(options.httpsPort);
  await build.build('all', 'startup');
}

main();
