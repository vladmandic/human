/**
 * Human demo for NodeJS
 *
 * Used by node-multiprocess.js as an on-demand started worker process
 * Receives messages from parent process and sends results
 */

const fs = require('fs');
const log = require('@vladmandic/pilogger');

// workers actual import tfjs and human modules
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
const tf = require('@tensorflow/tfjs-node');
const Human = require('../../dist/human.node.js').default; // or const Human = require('../dist/human.node-gpu.js').default;

let human = null;

const myConfig = {
  // backend: 'tensorflow',
  modelBasePath: 'file://models/',
  debug: false,
  async: true,
  face: {
    enabled: true,
    detector: { enabled: true, rotation: false },
    mesh: { enabled: true },
    iris: { enabled: true },
    description: { enabled: true },
    emotion: { enabled: true },
  },
  hand: {
    enabled: true,
  },
  // body: { modelPath: 'blazepose.json', enabled: true },
  body: { enabled: true },
  object: { enabled: true },
};

// read image from a file and create tensor to be used by human
// this way we don't need any monkey patches
// you can add any pre-proocessing here such as resizing, etc.
async function image(img) {
  const buffer = fs.readFileSync(img);
  const tensor = human.tf.tidy(() => human.tf.node.decodeImage(buffer).toFloat().expandDims());
  return tensor;
}

// actual human detection
async function detect(img) {
  const tensor = await image(img);
  const result = await human.detect(tensor);
  if (process.send) { // check if ipc exists
    process.send({ image: img, detected: result }); // send results back to main
    process.send({ ready: true }); // send signal back to main that this worker is now idle and ready for next image
  }
  tf.dispose(tensor);
}

async function main() {
  process.on('unhandledRejection', (err) => {
    // @ts-ignore // no idea if exception message is compelte
    log.error(err?.message || err || 'no error message');
  });

  // on worker start first initialize message handler so we don't miss any messages
  process.on('message', (msg) => {
    // @ts-ignore
    if (msg.exit && process.exit) process.exit(); // if main told worker to exit
    // @ts-ignore
    if (msg.test && process.send) process.send({ test: true });
    // @ts-ignore
    if (msg.image) detect(msg.image); // if main told worker to process image
    log.data('Worker received message:', process.pid, msg); // generic log
  });

  // create instance of human
  human = new Human(myConfig);
  // wait until tf is ready
  await human.tf.ready();
  // pre-load models
  log.state('Worker: PID:', process.pid, `TensorFlow/JS ${human.tf.version['tfjs-core']} Human ${human.version} Backend: ${human.tf.getBackend()}`);
  await human.load();

  // now we're ready, so send message back to main that it knows it can use this worker
  if (process.send) process.send({ ready: true });
}

main();
