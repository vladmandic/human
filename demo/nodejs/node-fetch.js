/**
 * Human demo for NodeJS using http fetch to get image file
 *
 * Requires [node-fetch](https://www.npmjs.com/package/node-fetch) to provide `fetch` functionality in NodeJS environment
 */
const fs = require('fs');
const log = require('@vladmandic/pilogger'); // eslint-disable-line node/no-unpublished-require

// in nodejs environments tfjs-node is required to be loaded before human
const tf = require('@tensorflow/tfjs-node'); // eslint-disable-line node/no-unpublished-require
// const human = require('@vladmandic/human'); // use this when human is installed as module (majority of use cases)
const Human = require('../../dist/human.node.js'); // use this when using human in dev mode

const humanConfig = {
  modelBasePath: 'https://vladmandic.github.io/human/models/',
};

async function main(inputFile) {
  global.fetch = (await import('node-fetch')).default; // eslint-disable-line node/no-unpublished-import, import/no-unresolved, node/no-missing-import, node/no-extraneous-import
  const human = new Human.Human(humanConfig); // create instance of human using default configuration
  log.info('Human:', human.version, 'TF:', tf.version_core);
  await human.load(); // optional as models would be loaded on-demand first time they are required
  await human.warmup(); // optional as model warmup is performed on-demand first time its executed
  const buffer = fs.readFileSync(inputFile); // read file data into buffer
  const tensor = human.tf.node.decodeImage(buffer); // decode jpg data
  const result = await human.detect(tensor); // run detection; will initialize backend and on-demand load models
  log.data(result.gesture);
}

main('samples/in/ai-body.jpg');
