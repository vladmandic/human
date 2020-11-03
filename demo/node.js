const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const process = require('process');
const console = require('console');
const Human = require('..').default; // this resolves to project root which is '@vladmandic/human'

const logger = new console.Console({
  stdout: process.stdout,
  stderr: process.stderr,
  ignoreErrors: true,
  groupIndentation: 2,
  inspectOptions: {
    showHidden: true,
    depth: 5,
    colors: true,
    showProxy: true,
    maxArrayLength: 1024,
    maxStringLength: 10240,
    breakLength: 200,
    compact: 64,
    sorted: false,
    getters: true,
  },
});

const config = {
  backend: 'tensorflow',
  console: true,
  videoOptimized: false,
  face: {
    detector: { modelPath: 'file://models/blazeface-back.json' },
    mesh: { modelPath: 'file://models/facemesh.json' },
    iris: { modelPath: 'file://models/iris.json' },
    age: { modelPath: 'file://models/ssrnet-age-imdb.json' },
    gender: { modelPath: 'file://models/ssrnet-gender-imdb.json' },
    emotion: { modelPath: 'file://models/emotion.json' },
  },
  body: { modelPath: 'file://models/posenet.json' },
  hand: {
    detector: { modelPath: 'file://models/handdetect.json' },
    skeleton: { modelPath: 'file://models/handskeleton.json' },
  },
};

async function detect(input, output) {
  await tf.setBackend('tensorflow');
  await tf.ready();
  logger.info('TFJS Flags:', tf.env().features);
  logger.log('Loading:', input);
  const buffer = fs.readFileSync(input);
  const decoded = tf.node.decodeImage(buffer);
  const casted = decoded.toFloat();
  const image = casted.expandDims(0);
  decoded.dispose();
  casted.dispose();
  logger.log('Processing:', image.shape);
  const human = new Human();
  const result = await human.detect(image, config);
  image.dispose();
  logger.log(result);
  // Draw detected data and save processed image
  logger.log('TODO Saving:', output);
}

async function main() {
  if (process.argv.length !== 4) logger.error('Parameters: <input image> <output image>');
  else if (!fs.existsSync(process.argv[2])) logger.error(`File not found: ${process.argv[2]}`);
  else detect(process.argv[2], process.argv[3]);
}

main();
