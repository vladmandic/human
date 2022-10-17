const log = require('@vladmandic/pilogger');
const tf = require('@tensorflow/tfjs-core'); // wasm backend requires tfjs to be loaded first
require('@tensorflow/tfjs-converter');
const wasm = require('@tensorflow/tfjs-backend-wasm'); // wasm backend does not get auto-loaded in nodejs
const { Canvas, Image } = require('canvas'); // eslint-disable-line node/no-extraneous-require, node/no-missing-require
const H = require('../dist/human.node-wasm.js');
const test = require('./test-node-main.js');

H.env.Canvas = Canvas; // requires monkey-patch as wasm does not have tf.browser namespace
H.env.Image = Image; // requires monkey-patch as wasm does not have tf.browser namespace

const config = {
  cacheSensitivity: 0,
  modelBasePath: 'https://vladmandic.github.io/human-models/models/',
  backend: 'wasm',
  // wasmPath: 'node_modules/@tensorflow/tfjs-backend-wasm/dist/',
  wasmPath: `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tf.version_core}/dist/`,
  debug: false,
  async: false,
  softwareKernels: true,
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
  segmentation: { enabled: false },
  filter: { enabled: false },
};

async function main() {
  wasm.setWasmPaths(config.wasmPath, true);
  const ok = await tf.setBackend('wasm');
  if (!ok) {
    test.log('error', 'failed: setwasmpath', config.wasmPath);
    return;
  }
  await tf.ready();
  H.env.updateBackend();
  log.info(H.env.wasm, config.wasmPath);
  test.test(H.Human, config);
}

if (require.main === module) main();
