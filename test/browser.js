import { Human } from '../dist/human.esm.js';

const config = {
  async: true,
  warmup: 'none',
  debug: true,
  cacheSensitivity: 0,
  object: { enabled: true },
};

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

async function main() {
  log('human tests');
  let res;
  const human = new Human(config);
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

  detailed('config', human.config);
  await human.load();
  const models = Object.keys(human.models).map((model) => ({ name: model, loaded: (human.models[model] !== null) }));
  log('models', models);
  for (const backend of backends) {
    log();
    log('test start:', backend);
    human.config.backend = backend;
    await human.init();
    log('desired', backend, 'detected', human.tf.getBackend());
    if (human.tf.getBackend() !== backend) {
      continue;
    }
    log('memory', human.tf.memory());
    res = await human.validate();
    log('validate', res);
    res = await human.warmup({ warmup: 'face' });
    draw(res.canvas);
    log('warmup', 'face');
    let img = await image('../../samples/in/ai-body.jpg');
    const input = await human.image(img);
    log('input', input.tensor.shape);
    draw(res.canvas);
    res = await human.detect(input.tensor);
    log('detect');
    human.next();
    log('interpolate');
    const persons = res.persons;
    log('persons');
    log('summary', { persons: persons.length, face: res.face.length, body: res.body.length, hand: res.hand.length, object: res.object.length, gesture: res.gesture.length });
    log('performance', human.performance);
    human.tf.dispose(input.tensor);
    draw();

    img = await image('../../samples/in/ai-face.jpg');
    for (const val of [0, 0.25, 0.5, 0.75, 10]) {
      human.performance = {};
      const t0 = performance.now();
      for (let i = 0; i < 10; i++) {
        res = await human.detect(img, { cacheSensitivity: val, filter: { pixelate: 5 * i }, object: { enabled: false } });
        draw(res.canvas);
      }
      const t1 = performance.now();
      log('benchmark', { time: Math.round((t1 - t0) / 10), cacheSensitivity: val, performance: human.performance });
      await wait(10);
    }
    draw();

    log('memory', human.tf.memory());
  }
  clearInterval(timer);
  log();
  log('tests complete');
}

main();
