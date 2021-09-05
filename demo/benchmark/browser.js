// import * as tf from '../../assets/tf.es2017.js';
// import '../../assets/tf-backend-webgpu.es2017.js';
import Human from '../../dist/human.esm.js';

const loop = 20;

// eslint-disable-next-line no-console
const log = (...msg) => console.log(...msg);

const myConfig = {
  backend: 'humangl',
  modelBasePath: 'https://vladmandic.github.io/human/models',
  wasmPath: 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@3.9.0/dist/',
  debug: true,
  async: true,
  cacheSensitivity: 0,
  filter: { enabled: false },
  face: {
    enabled: true,
    detector: { enabled: true, rotation: false },
    mesh: { enabled: true },
    iris: { enabled: true },
    description: { enabled: true },
    emotion: { enabled: false },
  },
  hand: { enabled: true, rotation: false },
  body: { enabled: true },
  object: { enabled: false },
};

async function main() {
  const human = new Human(myConfig);
  await human.tf.ready();
  log('Human:', human.version);
  await human.load();
  const loaded = Object.keys(human.models).filter((a) => human.models[a]);
  log('Loaded:', loaded);
  log('Memory state:', human.tf.engine().memory());
  const element = document.getElementById('image');
  const processed = await human.image(element);
  const t0 = performance.now();
  await human.detect(processed.tensor, myConfig);
  const t1 = performance.now();
  log('Backend:', human.tf.getBackend());
  log('Warmup:', Math.round(t1 - t0));
  for (let i = 0; i < loop; i++) await human.detect(processed.tensor, myConfig);
  const t2 = performance.now();
  log('Average:', Math.round((t2 - t1) / loop));
}

main();
