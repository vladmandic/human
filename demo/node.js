const log = require('@vladmandic/pilogger');
const fs = require('fs');
const process = require('process');
const fetch = require('node-fetch').default;

// for NodeJS, `tfjs-node` or `tfjs-node-gpu` should be loaded before using Human
const tf = require('@tensorflow/tfjs-node'); // or const tf = require('@tensorflow/tfjs-node-gpu');

// load specific version of Human library that matches TensorFlow mode
const Human = require('../dist/human.node.js').default; // or const Human = require('../dist/human.node-gpu.js').default;

let human = null;

const myConfig = {
  backend: 'tensorflow',
  modelBasePath: 'file://models/',
  debug: true,
  videoOptimized: false,
  async: false,
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
  // body: { modelPath: 'efficientpose.json', enabled: true },
  // body: { modelPath: 'blazepose.json', enabled: true },
  body: { enabled: true },
  object: { enabled: true },
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
  let buffer;
  log.info('Loading image:', input);
  if (input.startsWith('http')) {
    const res = await fetch(input);
    const mime = res.headers.get('content-type');
    if (res && res.ok) buffer = await res.buffer();
    else log.error('Invalid image URL:', input, res.status, res.statusText, mime);
  } else {
    buffer = fs.readFileSync(input);
  }

  // decode image using tfjs-node so we don't need external depenencies
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
  log.data('Results:');
  for (let i = 0; i < result.face.length; i++) {
    const face = result.face[i];
    const emotion = face.emotion.reduce((prev, curr) => (prev.score > curr.score ? prev : curr));
    log.data(`  Face: #${i} boxConfidence:${face.boxConfidence} faceConfidence:${face.boxConfidence} age:${face.age} genderConfidence:${face.genderConfidence} gender:${face.gender} emotionScore:${emotion.score} emotion:${emotion.emotion} iris:${face.iris}`);
  }
  for (let i = 0; i < result.body.length; i++) {
    const body = result.body[i];
    log.data(`  Body: #${i} score:${body.score}`);
  }
  for (let i = 0; i < result.hand.length; i++) {
    const hand = result.hand[i];
    log.data(`  Hand: #${i} confidence:${hand.confidence}`);
  }
  for (let i = 0; i < result.gesture.length; i++) {
    const [key, val] = Object.entries(result.gesture[i]);
    log.data(`  Gesture: ${key[0]}#${key[1]} gesture:${val[1]}`);
  }
  for (let i = 0; i < result.object.length; i++) {
    const object = result.object[i];
    log.data(`  Object: #${i} score:${object.score} label:${object.label}`);
  }
  result.face.length = 0;
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
  } else if (!fs.existsSync(process.argv[2]) && !process.argv[2].startsWith('http')) {
    log.error(`File not found: ${process.argv[2]}`);
  } else {
    await detect(process.argv[2]);
  }
}

main();
