/**
 * Human simple demo for NodeJS
 */

const childProcess = require('child_process'); // eslint-disable-line camelcase
const log = require('@vladmandic/pilogger'); // eslint-disable-line node/no-unpublished-require
const canvas = require('canvas'); // eslint-disable-line node/no-unpublished-require

const config = {
  cacheSensitivity: 0.01,
  wasmPlatformFetch: true,
  modelBasePath: 'https://vladmandic.github.io/human-models/models/',
};
const count = 10;

async function loadImage(input) {
  const inputImage = await canvas.loadImage(input);
  const inputCanvas = new canvas.Canvas(inputImage.width, inputImage.height);
  const inputCtx = inputCanvas.getContext('2d');
  inputCtx.drawImage(inputImage, 0, 0);
  const imageData = inputCtx.getImageData(0, 0, inputCanvas.width, inputCanvas.height);
  process.send({ input, resolution: [inputImage.width, inputImage.height] });
  return imageData;
}

async function runHuman(module, backend) {
  if (backend === 'wasm') require('@tensorflow/tfjs-backend-wasm'); // eslint-disable-line node/no-unpublished-require, global-require
  const Human = require('../../dist/' + module); // eslint-disable-line global-require, import/no-dynamic-require
  config.backend = backend;
  const human = new Human.Human(config);
  human.env.Canvas = canvas.Canvas;
  human.env.Image = canvas.Image;
  human.env.ImageData = canvas.ImageData;
  process.send({ human: human.version, module });
  await human.init();
  process.send({ desired: human.config.backend, wasm: human.env.wasm, tfjs: human.tf.version.tfjs, tensorflow: human.env.tensorflow });
  const imageData = await loadImage('samples/in/ai-body.jpg');
  const t0 = human.now();
  await human.load();
  const t1 = human.now();
  await human.warmup();
  const t2 = human.now();
  for (let i = 0; i < count; i++) await human.detect(imageData);
  const t3 = human.now();
  process.send({ backend: human.tf.getBackend(), load: Math.round(t1 - t0), warmup: Math.round(t2 - t1), detect: Math.round(t3 - t2), count, memory: human.tf.memory().numBytes });
}

async function executeWorker(args) {
  return new Promise((resolve) => {
    const worker = childProcess.fork(process.argv[1], args);
    worker.on('message', (msg) => log.data(msg));
    worker.on('exit', () => resolve(true));
  });
}

async function main() {
  if (process.argv[2]) {
    await runHuman(process.argv[2], process.argv[3]);
  } else {
    await executeWorker(['human.node.js', 'tensorflow']);
    await executeWorker(['human.node-gpu.js', 'tensorflow']);
    await executeWorker(['human.node-wasm.js', 'wasm']);
  }
}

main();
