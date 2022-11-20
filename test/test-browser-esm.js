import { Human } from '../dist/human.esm.js';

let human;

const backends = ['wasm', 'humangl', 'webgl', 'webgpu'];

const start = performance.now();

function str(long, ...msg) {
  if (!Array.isArray(msg)) return msg;
  let line = '';
  for (const entry of msg) {
    if (typeof entry === 'object') line += ' ' + JSON.stringify(entry, null, long ? 2 : 0).replace(/"/g, '').replace(/,/g, ', ').replace(/:/g, ': ');
    else line += ' ' + entry;
  }
  return line + '\n';
}

let last = new Date();
async function log(...msgs) {
  const dt = new Date();
  const ts = `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}.${dt.getMilliseconds().toString().padStart(3, '0')}`;
  const elap = (dt - last).toString().padStart(5, '0');
  document.getElementById('log').innerHTML += ts + ' +' + elap + 'ms &nbsp' + str(false, ...msgs);
  document.documentElement.scrollTop = document.documentElement.scrollHeight;
  console.log(ts, elap, ...msgs); // eslint-disable-line no-console
  last = dt;
}

async function detailed(...msgs) {
  const dt = new Date();
  const ts = `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}.${dt.getMilliseconds().toString().padStart(3, '0')}`;
  const elap = (dt - last).toString().padStart(5, '0');
  document.getElementById('log').innerHTML += ts + ' +' + elap + 'ms &nbsp' + str(true, ...msgs);
  document.documentElement.scrollTop = document.documentElement.scrollHeight;
  console.log(ts, elap, ...msgs); // eslint-disable-line no-console
  last = dt;
}

async function image(url) {
  const el = document.createElement('img');
  el.id = 'image';
  const loaded = new Promise((resolve) => { el.onload = () => resolve(true); });
  el.src = url;
  await loaded;
  return el;
}

async function wait(time) {
  const waiting = new Promise((resolve) => { setTimeout(() => resolve(), time); });
  await waiting;
}

function draw(canvas = null) {
  const c = document.getElementById('canvas');
  const ctx = c.getContext('2d');
  if (canvas) ctx.drawImage(canvas, 0, 0, c.width, c.height);
  else ctx.clearRect(0, 0, c.width, c.height);
}

async function events(event) {
  document.getElementById('events').innerText = `${Math.round(performance.now() - start)}ms Event: ${event}`;
}

async function testDefault(title, testConfig = {}) {
  const t0 = human.now();
  let res;
  for (const model of Object.keys(human.models.models)) { // unload models
    if (human.models.models[model]) human.models.models[model] = null;
  }
  human.reset();
  res = human.validate(testConfig); // validate
  if (res && res.length > 0) log('  invalid configuration', res);
  log(`test ${title}/${human.tf.getBackend()}`);
  await human.load();
  log('  models', human.models.loaded());
  const ops = await human.models.validate();
  if (ops && ops.length > 0) log('  missing ops', ops);
  const img = await image('../../samples/in/ai-body.jpg');
  const input = await human.image(img, true); // process image
  draw(input.canvas);
  res = await human.warmup({ warmup: 'face' }); // warmup
  draw(res.canvas);
  const t1 = human.now();
  res = await human.detect(input.tensor, testConfig); // run detect
  const t2 = human.now();
  human.next(); // run interpolation
  const persons = res.persons; // run persons getter
  log('  summary', { persons: persons.length, face: res.face.length, body: res.body.length, hand: res.hand.length, object: res.object.length, gesture: res.gesture.length });
  human.tf.dispose(input.tensor);
  log(`  finished ${title}/${human.tf.getBackend()}`, { init: Math.round(t1 - t0), detect: Math.round(t2 - t1) });
  return res;
}

async function testMatch() {
  human.reset();
  await human.warmup({ warmup: 'face' });
  const img1 = await image('../../samples/in/ai-body.jpg');
  const input1 = await human.image(img1, true);
  const img2 = await image('../../samples/in/ai-face.jpg');
  const input2 = await human.image(img2, true);
  const res1 = await human.detect(input1.tensor);
  const res2 = await human.detect(input2.tensor);
  human.tf.dispose(input1.tensor, input2.tensor);
  const desc1 = res1?.face?.[0]?.embedding;
  const desc2 = res2?.face?.[0]?.embedding;
  const similarity = await human.match.similarity(desc1, desc2);
  const descArray = [];
  for (let i = 0; i < 100; i++) descArray.push(desc2);
  const match = await human.match.find(desc1, descArray);
  log(`test similarity/${human.tf.getBackend()}`, match, similarity);
}

async function testWorker() {
  log(`test webworker/${human.tf.getBackend()}`);
  const img = await image('../../samples/in/ai-body.jpg');
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const worker = new Worker('test-browser-worker.js');
  let res;
  const userConfig = {
    backend: human.tf.getBackend(),
    debug: true,
    face: { enabled: false },
    hand: { enabled: false },
    body: { enabled: true },
    object: { enabled: false },
  };
  return new Promise((resolve) => {
    worker.addEventListener('message', (msg) => {
      res = msg.data.result;
      log('  summary', { face: res.face.length, body: res.body.length, hand: res.hand.length, object: res.object.length, gesture: res.gesture.length });
      resolve();
    });
    // pass image data as arraybuffer to worker by reference to avoid copy
    worker.postMessage({ image: imageData.data.buffer, width: canvas.width, height: canvas.height, userConfig }, [imageData.data.buffer]);
  });
}

async function runBenchmark() {
  const img = await image('../../samples/in/ai-face.jpg');
  human.reset();
  const s0 = human.now();
  await human.load();
  await human.warmup();
  const s1 = human.now();
  for (const val of [0, 0.25, 0.5, 0.75, 10]) {
    human.performance = {};
    const t0 = performance.now();
    for (let i = 0; i < 10; i++) {
      const res = await human.detect(img, { cacheSensitivity: val, filter: { pixelate: 5 * i }, object: { enabled: true } }); // run detect with increased pixelization on each iteration
      draw(res.canvas);
    }
    const t1 = performance.now();
    log('  benchmark', { time: Math.round((t1 - t0) / 10), backend: human.tf.getBackend(), cacheSensitivity: val, performance: human.performance });
    await wait(1);
  }
  const s2 = human.now();
  log('  total', human.tf.getBackend(), { detect: Math.round(s2 - s1), init: Math.round(s1 - s0) });
  draw();
}

async function main() {
  log('human tests');
  human = new Human({ debug: true });
  await human.init();
  human.events.addEventListener('warmup', () => events('warmup'));
  human.events.addEventListener('image', () => events('image'));
  human.events.addEventListener('detect', () => events('detect'));
  const timer = setInterval(() => { document.getElementById('state').innerText = `State: ${human.state}`; }, 10);
  log('version', human.version);
  log('tfjs', human.tf.version.tfjs);

  const env = JSON.parse(JSON.stringify(human.env));
  env.kernels = human.env.kernels.length;
  detailed('environment', env);

  for (const backend of backends) {
    human.config.backend = backend;
    await human.init(); // init
    if (human.tf.getBackend() !== backend) {
      log('desired', backend, 'detected', human.tf.getBackend());
      continue; // wrong backend
    }
    await testDefault('default', { debug: true });
    await testDefault('sync', { debug: true, async: false });
    await testDefault('none', { debug: true, async: true, face: { enabled: false }, body: { enabled: false }, hand: { enabled: false }, gesture: { enabled: false }, segmentation: { enabled: false }, object: { enabled: false } });
    await testDefault('object', { debug: true, async: true, face: { enabled: false }, body: { enabled: false }, hand: { enabled: false }, gesture: { enabled: false }, segmentation: { enabled: false }, object: { enabled: true } });
    await testMatch();
    await testWorker();
    // TBD detectors only
    // TBD segmentation
    // TBD non-default models
  }
  log('tests complete');
  for (const backend of backends) {
    log('benchmark backend:', backend);
    human.config.backend = backend;
    await human.init();
    if (human.tf.getBackend() !== backend) continue; // wrong backend
    await runBenchmark();
  }
  log('benchmarks complete');
  clearInterval(timer);
}

main();
