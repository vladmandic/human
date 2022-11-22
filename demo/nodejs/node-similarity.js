/**
 * Human Person Similarity test for NodeJS
 */

const fs = require('fs');
const process = require('process');

const log = require('@vladmandic/pilogger'); // eslint-disable-line node/no-unpublished-require
// in nodejs environments tfjs-node is required to be loaded before human
const tf = require('@tensorflow/tfjs-node'); // eslint-disable-line node/no-unpublished-require
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
  log.info('Human:', human.version, 'TF:', tf.version_core);
  await human.load();
  log.info('Loaded:', human.models.loaded());
  log.info('Memory state:', human.tf.engine().memory());
}

async function detect(input) {
  if (!fs.existsSync(input)) {
    throw new Error('Cannot load image:', input);
  }
  const buffer = fs.readFileSync(input);
  const tensor = human.tf.node.decodeImage(buffer, 3);
  log.state('Loaded image:', input, tensor.shape);
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
    return;
  }
  await init();
  const res1 = await detect(process.argv[2]);
  const res2 = await detect(process.argv[3]);
  if (!res1 || !res1.face || res1.face.length === 0 || !res2 || !res2.face || res2.face.length === 0) {
    throw new Error('Could not detect face descriptors');
  }
  const similarity = human.match.similarity(res1.face[0].embedding, res2.face[0].embedding, { order: 2 });
  log.data('Similarity: ', similarity);
}

main();
