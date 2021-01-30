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
  face: {
    detector: { modelPath: 'file://models/blazeface-back.json' },
    mesh: { modelPath: 'file://models/facemesh.json' },
    iris: { modelPath: 'file://models/iris.json' },
    age: { modelPath: 'file://models/age-ssrnet-imdb.json' },
    gender: { modelPath: 'file://models/gender-ssrnet-imdb.json' },
    emotion: { modelPath: 'file://models/emotion-large.json' },
  },
  body: { modelPath: 'file://models/posenet.json' },
  hand: {
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
  await human.load();
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
  log.warn('Face model is disabled in NodeJS due to missing required TFJS functions');
  log.state('Processing:', image.shape);
  // must disable face model when runing in tfjs-node as it's missing required ops
  // see <https://github.com/tensorflow/tfjs/issues/4066>
  myConfig.face.enabled = false;
  // run actual detection
  const result = await human.detect(image, myConfig);
  // dispose image tensor as we no longer need it
  image.dispose();
  // print data to console
  log.data(result);
}

async function test() {
  log.state('Processing embedded warmup image');
  log.warn('Face model is disabled in NodeJS due to missing required TFJS functions');
  myConfig.face.enabled = false;
  myConfig.warmup = 'full';
  const result = await human.warmup(myConfig);
  log.data(result);
}

async function main() {
  log.info('NodeJS:', process.version);
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
