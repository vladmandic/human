/* global Human */

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
  log(`test ${title}/${human.tf.getBackend()}`, human.config);
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

async function main() {
  log('human tests');
  human = new Human.Human({ debug: true });
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
  }
  log('tests complete');
  clearInterval(timer);
}

main();
