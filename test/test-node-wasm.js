const tf = require('@tensorflow/tfjs'); // wasm backend requires tfjs to be loaded first
const wasm = require('@tensorflow/tfjs-backend-wasm'); // wasm backend does not get auto-loaded in nodejs
const { Canvas, Image } = require('canvas');
const Human = require('../dist/human.node-wasm.js');
const test = require('./test-main.js').test;

// @ts-ignore
Human.env.Canvas = Canvas;
// @ts-ignore
Human.env.Image = Image;

const config = {
  // modelBasePath: 'http://localhost:10030/models/',
  modelBasePath: 'https://vladmandic.github.io/human/models/',
  backend: 'wasm',
  wasmPath: 'node_modules/@tensorflow/tfjs-backend-wasm/dist/',
  // wasmPath: 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@3.9.0/dist/',
  debug: false,
  async: false,
  face: {
    enabled: true,
    detector: { enabled: true, rotation: false },
    mesh: { enabled: true },
    iris: { enabled: true },
    description: { enabled: true },
    emotion: { enabled: true },
  },
  hand: { enabled: true, rotation: false },
  body: { enabled: true },
  object: { enabled: false },
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
