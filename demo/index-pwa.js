/**
 * PWA Service Worker for Human main demo
 */

/// <reference lib="webworker" />

const skipCaching = false;

const cacheName = 'Human';
const cacheFiles = ['/favicon.ico', 'manifest.webmanifest']; // assets and models are cached on first access

let cacheModels = true; // *.bin; *.json
let cacheWASM = true; // *.wasm
let cacheOther = false; // *

let listening = false;
const stats = { hit: 0, miss: 0 };

const log = (...msg) => {
  const dt = new Date();
  const ts = `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}.${dt.getMilliseconds().toString().padStart(3, '0')}`;
  // eslint-disable-next-line no-console
  console.log(ts, 'pwa', ...msg);
};

async function updateCached(req) {
  fetch(req)
    .then((update) => {
      // update cache if request is ok
      if (update.ok) {
        caches
          .open(cacheName)
          .then((cache) => cache.put(req, update))
          .catch((err) => log('cache update error', err));
      }
      return true;
    })
    .catch((err) => {
      log('fetch error', err);
      return false;
    });
}

async function getCached(evt) {
  // just fetch
  if (skipCaching) return fetch(evt.request);

  // get from cache or fetch if not in cache
  let found = await caches.match(evt.request);
  if (found && found.ok) {
    stats.hit += 1;
  } else {
    stats.miss += 1;
    found = await fetch(evt.request);
  }

  // if still don't have it, return offline page
  if (!found || !found.ok) {
    found = await caches.match('offline.html');
  }

  // update cache in the background
  if (found && found.type === 'basic' && found.ok) {
    const uri = new URL(evt.request.url);
    if (uri.pathname.endsWith('.bin') || uri.pathname.endsWith('.json')) {
      if (cacheModels) updateCached(evt.request);
    } else if (uri.pathname.endsWith('.wasm')) {
      if (cacheWASM) updateCached(evt.request);
    } else if (cacheOther) {
      updateCached(evt.request);
    }
  }

  return found;
}

function cacheInit() {
  // eslint-disable-next-line promise/catch-or-return
  caches.open(cacheName)
    // eslint-disable-next-line promise/no-nesting
    .then((cache) => cache.addAll(cacheFiles)
      .then(
        () => log('cache refresh:', cacheFiles.length, 'files'),
        (err) => log('cache error', err),
      ));
}

if (!listening) {
  // get messages from main app to update configuration
  self.addEventListener('message', (evt) => {
    log('event message:', evt.data);
    switch (evt.data.key) {
      case 'cacheModels': cacheModels = evt.data.val; break;
      case 'cacheWASM': cacheWASM = evt.data.val; break;
      case 'cacheOther': cacheOther = evt.data.val; break;
      default:
    }
  });

  self.addEventListener('install', (evt) => {
    log('install');
    // @ts-ignore scope for self is ServiceWorkerGlobalScope not Window
    self.skipWaiting();
    evt.waitUntil(cacheInit);
  });

  self.addEventListener('activate', (evt) => {
    log('activate');
    // @ts-ignore scope for self is ServiceWorkerGlobalScope not Window
    evt.waitUntil(self.clients.claim());
  });

  self.addEventListener('fetch', (evt) => {
    const uri = new URL(evt.request.url);
    // if (uri.pathname === '/') { log('cache skip /', evt.request); return; } // skip root access requests
    if (evt.request.cache === 'only-if-cached' && evt.request.mode !== 'same-origin') return; // required due to chrome bug
    if (uri.origin !== location.origin) return; // skip non-local requests
    if (evt.request.method !== 'GET') return; // only cache get requests
    if (evt.request.url.includes('/api/')) return; // don't cache api requests, failures are handled at the time of call

    const response = getCached(evt);
    if (response) evt.respondWith(response);
    else log('fetch response missing');
  });

  // only trigger controllerchange once
  let refreshed = false;
  self.addEventListener('controllerchange', (evt) => {
    log(`PWA: ${evt.type}`);
    if (refreshed) return;
    refreshed = true;
    location.reload();
  });

  listening = true;
}
