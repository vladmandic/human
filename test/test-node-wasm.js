const tf = require('@tensorflow/tfjs/dist/tf.node.js'); // wasm backend requires tfjs to be loaded first
const wasm = require('@tensorflow/tfjs-backend-wasm/dist/tf-backend-wasm.node.js'); // wasm backend does not get auto-loaded in nodejs
const Human = require('../dist/human.node-wasm.js').default;
const test = require('./test-main.js').test;

const config = {
  modelBasePath: 'http://localhost:10030/models/',
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
  object: { enabled: true },
  segmentation: { enabled: true },
  filter: { enabled: false },
};

// @ts-ignore // in nodejs+wasm must set explicitly before using human
wasm.setWasmPaths(config.wasmPath); tf.setBackend('wasm');

test(Human, config);
