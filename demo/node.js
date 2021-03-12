const log = require('@vladmandic/pilogger');
const fs = require('fs');
const process = require('process');

// for NodeJS, `tfjs-node` or `tfjs-node-gpu` should be loaded before using Human
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
    detector: { modelPath: 'file://models/blazeface-back.json', enabled: true, rotation: false },
    mesh: { modelPath: 'file://models/facemesh.json', enabled: true },
    iris: { modelPath: 'file://models/iris.json', enabled: true },
    age: { modelPath: 'file://models/age.json', enabled: true },
    gender: { modelPath: 'file://models/gender.json', enabled: true },
    emotion: { modelPath: 'file://models/emotion.json', enabled: true },
    embedding: { modelPath: 'file://models/mobileface.json', enabled: true },
  },
  // body: { modelPath: 'file://models/blazepose.json', enabled: true },
  body: { modelPath: 'file://models/posenet.json', enabled: true },
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
  // no need to print results as they are printed to console during detection from within the library due to human.config.debug set
  // dispose image tensor as we no longer need it
  image.dispose();
  // print data to console
  return result;
}

async function test() {
  // test with embedded full body image
  let result;

  log.state('Processing embedded warmup image: face');
  myConfig.warmup = 'face';
  result = await human.warmup(myConfig);

  log.state('Processing embedded warmup image: full');
  myConfig.warmup = 'full';
  result = await human.warmup(myConfig);
  // no need to print results as they are printed to console during detection from within the library due to human.config.debug set
  return result;
}

async function main() {
  log.header();
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
