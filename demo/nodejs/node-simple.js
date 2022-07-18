const fs = require('fs');
const process = require('process');

// eslint-disable-next-line import/no-extraneous-dependencies, no-unused-vars, @typescript-eslint/no-unused-vars
const tf = require('@tensorflow/tfjs-node'); // in nodejs environments tfjs-node is required to be loaded before human
// const human = require('@vladmandic/human'); // use this when human is installed as module (majority of use cases)
const Human = require('../../dist/human.node.js'); // use this when using human in dev mode

const humanConfig = {
  // add any custom config here
};

async function detect(inputFile) {
  const human = new Human.Human(humanConfig); // create instance of human using default configuration
  await human.load(); // optional as models would be loaded on-demand first time they are required
  await human.warmup(); // optional as model warmup is performed on-demand first time its executed
  const buffer = fs.readFileSync(inputFile); // read file data into buffer
  const tensor = human.tf.node.decodeImage(buffer); // decode jpg data
  // eslint-disable-next-line no-console
  console.log('loaded input file:', inputFile, 'resolution:', tensor.shape);
  const result = await human.detect(tensor); // run detection; will initialize backend and on-demand load models
  // eslint-disable-next-line no-console
  console.log(result);
}

if (process.argv.length === 3) detect(process.argv[2]); // if input file is provided as cmdline parameter use it
else detect('samples/in/ai-body.jpg'); // else use built-in test inputfile
