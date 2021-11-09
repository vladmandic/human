const tf = require('@tensorflow/tfjs'); // wasm backend requires tfjs to be loaded first
const wasm = require('@tensorflow/tfjs-backend-wasm'); // wasm backend does not get auto-loaded in nodejs
const { Canvas, Image } = require('canvas');
const Human = require('../dist/human.node-wasm.js');
const test = require('./test-main.js').test;

// @ts-ignore
Human.env.Canvas = Canvas; // requires monkey-patch as wasm does not have tf.browser namespace
// @ts-ignore
Human.env.Image = Image; // requires monkey-patch as wasm does not have tf.browser namespace

const config = {
  cacheSensitivity: 0,
  modelBasePath: 'https://vladmandic.github.io/human/models/',
  // modelBasePath: 'http://localhost:10030/models/',
  backend: 'wasm',
  wasmPath: 'node_modules/@tensorflow/tfjs-backend-wasm/dist/',
  // wasmPath: 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@3.9.0/dist/',
  debug: false,
  async: false,
  face: {
    enabled: true,
    detector: { rotation: false },
    mesh: { enabled: true },
    iris: { enabled: true },
    description: { enabled: true },
    emotion: { enabled: true },
    antispoof: { enabled: true },
    liveness: { enabled: true },
  },
  hand: { enabled: true, rotation: false },
  body: { enabled: true },
  object: { enabled: true },
  segmentation: { enabled: true },
  filter: { enabled: false },
};

async function main() {
  wasm.setWasmPaths(config.wasmPath);
  await tf.setBackend('wasm');
  await tf.ready();
  test(Human.Human, config);
}

main();
