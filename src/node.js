const console = require('console');
const tf = require('@tensorflow/tfjs-node');
const Human = require('..').default; // this resolves to project root which is '@vladmandic/human'

const logger = new console.Console({
  stdout: process.stdout,
  stderr: process.stderr,
  ignoreErrors: true,
  // groupIndentation: 2,
  inspectOptions: {
    showHidden: true,
    depth: 5,
    colors: true,
    showProxy: true,
    maxArrayLength: 1024,
    maxStringLength: 10240,
    breakLength: 300,
    compact: 64,
    sorted: false,
    getters: true,
  },
});

const config = {
  backend: 'tensorflow',
  console: false,
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

async function main() {
  await tf.ready();
  const human = new Human();
  logger.info('Human:', human.version);
  logger.info('Default Configuration', human.config);
  logger.info('TFJS Version:', tf.version_core, 'Backend:', tf.getBackend());
  logger.info('TFJS Flags:', tf.env().features);
  logger.info('Loading models:');
  await human.load(config);
  for (const model of Object.keys(human.models)) logger.info('  Loaded:', model);
  logger.info('Memory state:', human.tf.engine().memory());
  logger.info('Test Complete');
}

main();
