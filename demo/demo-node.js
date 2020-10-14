const fs = require('fs');
const process = require('process');
const console = require('console');
const tf = require('@tensorflow/tfjs-node');
const human = require('..'); // this would be '@vladmandic/human'

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
  face: {
    enabled: false,
    detector: { modelPath: 'file://models/blazeface/model.json', inputSize: 128, maxFaces: 10, skipFrames: 5, minConfidence: 0.8, iouThreshold: 0.3, scoreThreshold: 0.75 },
    mesh: { enabled: true, modelPath: 'file://models/facemesh/model.json', inputSize: 192 },
    iris: { enabled: true, modelPath: 'file://models/iris/model.json', inputSize: 192 },
    age: { enabled: true, modelPath: 'file://models/ssrnet-age/imdb/model.json', inputSize: 64, skipFrames: 5 },
    gender: { enabled: true, modelPath: 'file://models/ssrnet-gender/imdb/model.json' },
  },
  body: { enabled: true, modelPath: 'file://models/posenet/model.json', inputResolution: 257, outputStride: 16, maxDetections: 5, scoreThreshold: 0.75, nmsRadius: 20 },
  hand: {
    enabled: false,
    inputSize: 256,
    skipFrames: 5,
    minConfidence: 0.8,
    iouThreshold: 0.3,
    scoreThreshold: 0.75,
    detector: { anchors: 'file://models/handdetect/anchors.json', modelPath: 'file://models/handdetect/model.json' },
    skeleton: { modelPath: 'file://models/handskeleton/model.json' },
  },
};

async function detect(input, output) {
  await tf.setBackend('tensorflow');
  await tf.ready();
  logger.info('TFJS Flags:', tf.env().features);
  logger.log('Loading:', input);
  const buffer = fs.readFileSync(input);
  const image = tf.node.decodeImage(buffer);
  logger.log('Processing:', image.shape);
  const result = await human.detect(image, config);
  logger.log(result);
  // Draw detected data and save processed image
  logger.log('Saving:', output);
}

async function main() {
  if (process.argv.length !== 4) logger.error('Parameters: <input image> <output image>');
  else if (!fs.existsSync(process.argv[2])) logger.error(`File not found: ${process.argv[2]}`);
  else detect(process.argv[2], process.argv[3]);
}

main();
