/**
 * Human Person Similarity test for NodeJS
 */

const log = require('@vladmandic/pilogger');
const fs = require('fs');
const process = require('process');

// eslint-disable-next-line import/no-extraneous-dependencies, no-unused-vars, @typescript-eslint/no-unused-vars
const tf = require('@tensorflow/tfjs-node'); // in nodejs environments tfjs-node is required to be loaded before human
// const human = require('@vladmandic/human'); // use this when human is installed as module (majority of use cases)
const Human = require('../../dist/human.node.js'); // use this when using human in dev mode

let human = null;

const myConfig = {
  modelBasePath: 'file://models/',
  debug: true,
  face: { emotion: { enabled: false } },
  body: { enabled: false },
  hand: { enabled: false },
  gesture: { enabled: false },
};

async function init() {
  human = new Human.Human(myConfig);
  await human.tf.ready();
  log.info('Human:', human.version);
  await human.load();
  const loaded = Object.keys(human.models).filter((a) => human.models[a]);
  log.info('Loaded:', loaded);
  log.info('Memory state:', human.tf.engine().memory());
}

async function detect(input) {
  if (!fs.existsSync(input)) {
    log.error('Cannot load image:', input);
    process.exit(1);
  }
  const buffer = fs.readFileSync(input);
  const tensor = human.tf.node.decodeImage(buffer, 3);
  log.state('Loaded image:', input, tensor['shape']);
  const result = await human.detect(tensor, myConfig);
  human.tf.dispose(tensor);
  log.state('Detected faces:', result.face.length);
  return result;
}

async function main() {
  log.configure({ inspect: { breakLength: 265 } });
  log.header();
  if (process.argv.length !== 4) {
    log.error('Parameters: <first image> <second image> missing');
    process.exit(1);
  }
  await init();
  const res1 = await detect(process.argv[2]);
  const res2 = await detect(process.argv[3]);
  if (!res1 || !res1.face || res1.face.length === 0 || !res2 || !res2.face || res2.face.length === 0) {
    log.error('Could not detect face descriptors');
    process.exit(1);
  }
  const similarity = human.similarity(res1.face[0].embedding, res2.face[0].embedding, { order: 2 });
  log.data('Similarity: ', similarity);
}

main();
