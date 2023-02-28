/**
 * Human simple demo for NodeJS
 */

const fs = require('fs');
const process = require('process');

// in nodejs environments tfjs-node is required to be loaded before human
const tf = require('@tensorflow/tfjs-node'); // eslint-disable-line node/no-unpublished-require
// const human = require('@vladmandic/human'); // use this when human is installed as module (majority of use cases)
const Human = require('../../dist/human.node.js'); // use this when using human in dev mode

const humanConfig = {
  // add any custom config here
  debug: true,
  body: { enabled: false },
};

async function detect(inputFile) {
  const human = new Human.Human(humanConfig); // create instance of human using default configuration
  console.log('Human:', human.version, 'TF:', tf.version_core); // eslint-disable-line no-console
  await human.load(); // optional as models would be loaded on-demand first time they are required
  await human.warmup(); // optional as model warmup is performed on-demand first time its executed
  const buffer = fs.readFileSync(inputFile); // read file data into buffer
  const tensor = human.tf.node.decodeImage(buffer); // decode jpg data
  console.log('loaded input file:', inputFile, 'resolution:', tensor.shape); // eslint-disable-line no-console
  const result = await human.detect(tensor); // run detection; will initialize backend and on-demand load models
  console.log(result); // eslint-disable-line no-console
}

if (process.argv.length === 3) detect(process.argv[2]); // if input file is provided as cmdline parameter use it
else detect('samples/in/ai-body.jpg'); // else use built-in test inputfile
