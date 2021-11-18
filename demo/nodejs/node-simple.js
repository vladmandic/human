const fs = require('fs');
const Human = require('../../dist/human.node.js').default; // this is same as `@vladmandic/human` but using relative paths

async function main(inputFile) {
  const human = new Human(); // create instance of human using default configuration
  const buffer = fs.readFileSync(inputFile); // read file data into buffer
  const tensor = human.tf.node.decodeImage(buffer); // decode jpg data
  const result = await human.detect(tensor); // run detection; will initialize backend and on-demand load models
  // eslint-disable-next-line no-console
  console.log(result);
}

main('samples/in/ai-body.jpg');
