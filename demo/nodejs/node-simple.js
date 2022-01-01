const fs = require('fs');

// eslint-disable-next-line import/no-extraneous-dependencies, no-unused-vars, @typescript-eslint/no-unused-vars
const tf = require('@tensorflow/tfjs-node'); // in nodejs environments tfjs-node is required to be loaded before human
// const faceapi = require('@vladmandic/face-api'); // use this when human is installed as module (majority of use cases)
const Human = require('../../dist/human.node.js'); // use this when using human in dev mode

async function main(inputFile) {
  const human = new Human.Human(); // create instance of human using default configuration
  await human.load(); // optional as models would be loaded on-demand first time they are required
  await human.warmup(); // optional as model warmup is performed on-demand first time its executed
  const buffer = fs.readFileSync(inputFile); // read file data into buffer
  const tensor = human.tf.node.decodeImage(buffer); // decode jpg data
  const result = await human.detect(tensor); // run detection; will initialize backend and on-demand load models
  // eslint-disable-next-line no-console
  console.log(result);
}

main('samples/in/ai-body.jpg');
