const console = require('console');
const tf = require('@tensorflow/tfjs-node');
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
    detector: { modelPath: 'file://models/blazeface/back/model.json' },
    mesh: { modelPath: 'file://models/facemesh/model.json' },
    iris: { modelPath: 'file://models/iris/model.json' },
    age: { modelPath: 'file://models/ssrnet-age/imdb/model.json' },
    gender: { modelPath: 'file://models/ssrnet-gender/imdb/model.json' },
    emotion: { modelPath: 'file://models/emotion/model.json' },
  },
  body: { modelPath: 'file://models/posenet/model.json' },
  hand: {
    detector: { modelPath: 'file://models/handdetect/model.json' },
    skeleton: { modelPath: 'file://models/handskeleton/model.json' },
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
