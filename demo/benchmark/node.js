// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
const tf = require('@tensorflow/tfjs-node-gpu');
const log = require('@vladmandic/pilogger');
const canvasJS = require('canvas');
const Human = require('../../dist/human.node-gpu.js').default;

const input = './samples/in/group-1.jpg';
const loop = 20;

const myConfig = {
  backend: 'tensorflow',
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
    emotion: { enabled: true },
    antispoof: { enabled: true },
    liveness: { enabled: true },
  },
  hand: { enabled: true },
  body: { enabled: true },
  object: { enabled: true },
};

async function getImage(human) {
  const img = await canvasJS.loadImage(input);
  const canvas = canvasJS.createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, img.width, img.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const tensor = human.tf.tensor(Array.from(imageData.data), [canvas.height, canvas.width, 4], 'int32'); // create rgba image tensor from flat array
  log.info('Image:', input, tensor.shape);
  return tensor;
}

async function main() {
  log.header();
  const human = new Human(myConfig);
  await human.tf.ready();
  log.info('Human:', human.version);
  await human.load();
  const loaded = Object.keys(human.models).filter((a) => human.models[a]);
  log.info('Loaded:', loaded);
  log.info('Memory state:', human.tf.engine().memory());
  const tensor = await getImage(human);
  log.state('Processing:', tensor['shape']);
  const t0 = human.now();
  await human.detect(tensor, myConfig);
  const t1 = human.now();
  log.state('Backend:', human.tf.getBackend());
  log.data('Warmup:', Math.round(t1 - t0));
  for (let i = 0; i < loop; i++) await human.detect(tensor, myConfig);
  const t2 = human.now();
  log.data('Average:', Math.round((t2 - t1) / loop));
}

main();
