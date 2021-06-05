const Human = require('../dist/human.node-wasm.js').default;
const test = require('./test-main.js').test;

const config = {
  modelBasePath: 'http://localhost:10030/models/',
  backend: 'wasm',
  wasmPath: 'node_modules/@tensorflow/tfjs-backend-wasm/dist/',
  // wasmPath: 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@3.6.0/dist/',
  debug: false,
  async: false,
  face: {
    enabled: true,
    detector: { enabled: true, rotation: true },
    mesh: { enabled: true },
    iris: { enabled: true },
    description: { enabled: true },
    emotion: { enabled: true },
  },
  hand: { enabled: true },
  body: { enabled: true },
  object: { enabled: false },
  segmentation: { enabled: true },
  filter: { enabled: false },
};

test(Human, config);
