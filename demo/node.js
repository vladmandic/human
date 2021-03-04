const log = require('@vladmandic/pilogger');
const fs = require('fs');
const process = require('process');
// for Node, `tfjs-node` or `tfjs-node-gpu` should be loaded before using Human
const tf = require('@tensorflow/tfjs-node'); // or const tf = require('@tensorflow/tfjs-node-gpu');
// load specific version of Human library that matches TensorFlow mode
const Human = require('../dist/human.node.js').default; // or const Human = require('../dist/human.node-gpu.js').default;

let human = null;

const myConfig = {
  backend: 'tensorflow',
  console: true,
  videoOptimized: false,
  async: false,
  face: {
    enabled: true,
    detector: { modelPath: 'file://models/faceboxes.json', enabled: true, minConfidence: 0.5 },
    // detector: { modelPath: 'file://models/blazeface-back.json', enabled: false }, // cannot use blazeface in nodejs due to missing required kernel function in tfjs-node
    mesh: { modelPath: 'file://models/facemesh.json', enabled: false }, // depends on blazeface detector
    iris: { modelPath: 'file://models/iris.json', enabled: true },
    age: { modelPath: 'file://models/age-ssrnet-imdb.json', enabled: true },
    gender: { modelPath: 'file://models/gender.json', enabled: true },
    emotion: { modelPath: 'file://models/emotion.json', enabled: true },
  },
  // body: { modelPath: 'file://models/blazepose.json', modelType: 'blazepose', inputSize: 256, enabled: true },
  body: { modelPath: 'file://models/posenet.json', modelType: 'posenet', inputSize: 257, enabled: true },
  hand: {
    enabled: true,
    detector: { modelPath: 'file://models/handdetect.json' },
    skeleton: { modelPath: 'file://models/handskeleton.json' },
  },
};

async function init() {
  // wait until tf is ready
  await tf.ready();
  // create instance of human
  human = new Human(myConfig);
  // pre-load models
  log.info('Human:', human.version);
  log.info('Active Configuration', human.config);
  log.info('TFJS Version:', human.tf.version_core, 'Backend:', tf.getBackend());
  log.info('TFJS Flags:', human.tf.env().features);
  await human.load();
  const loaded = Object.keys(human.models).filter((a) => human.models[a]);
  log.info('Loaded:', loaded);
  log.info('Memory state:', human.tf.engine().memory());
}

async function detect(input) {
  // read input image file and create tensor to be used for processing
  const buffer = fs.readFileSync(input);
  const decoded = human.tf.node.decodeImage(buffer);
  const casted = decoded.toFloat();
  const image = casted.expandDims(0);
  decoded.dispose();
  casted.dispose();
  // image shape contains image dimensions and depth
  log.state('Processing:', image.shape);
  // run actual detection
  const result = await human.detect(image, myConfig);
  // dispose image tensor as we no longer need it
  image.dispose();
  // print data to console
  log.data(result);
}

async function test() {
  // test with embedded face image
  log.state('Processing embedded warmup image: face');
  myConfig.warmup = 'face';
  const resultFace = await human.warmup(myConfig);
  log.data('Face: ', resultFace.face);

  // test with embedded full body image
  log.state('Processing embedded warmup image: full');
  myConfig.warmup = 'full';
  const resultFull = await human.warmup(myConfig);
  log.data('Body:', resultFull.body);
  log.data('Hand:', resultFull.hand);
  log.data('Gesture:', resultFull.gesture);
}

async function main() {
  log.info('NodeJS:', process.version);
  log.info('Current folder:', process.env.PWD);
  await init();
  if (process.argv.length !== 3) {
    log.warn('Parameters: <input image> missing');
    await test();
  } else if (!fs.existsSync(process.argv[2])) {
    log.error(`File not found: ${process.argv[2]}`);
  } else {
    await detect(process.argv[2]);
  }
}

main();
