// @ts-nocheck

const fs = require('fs');
// eslint-disable-next-line import/no-extraneous-dependencies, node/no-unpublished-require
const log = require('@vladmandic/pilogger');

// workers actual import tfjs and faceapi modules
// eslint-disable-next-line import/no-extraneous-dependencies, node/no-unpublished-require
const tf = require('@tensorflow/tfjs-node');
const Human = require('../dist/human.node.js').default; // or const Human = require('../dist/human.node-gpu.js').default;

let human = null;

const myConfig = {
  backend: 'tensorflow',
  modelBasePath: 'file://models/',
  debug: false,
  videoOptimized: false,
  async: true,
  face: {
    enabled: true,
    detector: { enabled: true, rotation: false },
    mesh: { enabled: true },
    iris: { enabled: false },
    description: { enabled: true },
    emotion: { enabled: true },
  },
  hand: {
    enabled: false,
  },
  // body: { modelPath: 'efficientpose.json', enabled: true },
  // body: { modelPath: 'blazepose.json', enabled: true },
  body: { enabled: false },
  object: { enabled: false },
};

// read image from a file and create tensor to be used by faceapi
// this way we don't need any monkey patches
// you can add any pre-proocessing here such as resizing, etc.
async function image(img) {
  const buffer = fs.readFileSync(img);
  const tensor = tf.tidy(() => tf.node.decodeImage(buffer).toFloat().expandDims());
  return tensor;
}

// actual faceapi detection
async function detect(img) {
  const tensor = await image(img);
  const result = await human.detect(tensor);
  process.send({ image: img, detected: result }); // send results back to main
  process.send({ ready: true }); // send signal back to main that this worker is now idle and ready for next image
  tensor.dispose();
}

async function main() {
  // on worker start first initialize message handler so we don't miss any messages
  process.on('message', (msg) => {
    if (msg.exit) process.exit(); // if main told worker to exit
    if (msg.test) process.send({ test: true });
    if (msg.image) detect(msg.image); // if main told worker to process image
    log.data('Worker received message:', process.pid, msg); // generic log
  });

  // wait until tf is ready
  await tf.ready();
  // create instance of human
  human = new Human(myConfig);
  // pre-load models
  log.state('Worker: PID:', process.pid, `TensorFlow/JS ${human.tf.version_core} Human ${human.version} Backend: ${human.tf.getBackend()}`);
  await human.load();

  // now we're ready, so send message back to main that it knows it can use this worker
  process.send({ ready: true });
}

main();
