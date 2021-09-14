/**
 * Human demo for NodeJS using Canvas library
 */

const fs = require('fs');
const process = require('process');
const log = require('@vladmandic/pilogger');
const canvas = require('canvas');
require('@tensorflow/tfjs-node'); // for nodejs, `tfjs-node` or `tfjs-node-gpu` should be loaded before using Human
const Human = require('../../dist/human.node.js'); // this is 'const Human = require('../dist/human.node-gpu.js').default;'

const config = { // just enable all and leave default settings
  debug: false,
  face: { enabled: true }, // includes mesh, iris, emotion, descriptor
  hand: { enabled: true },
  body: { enabled: true },
  object: { enabled: true },
  gestures: { enabled: true },
};

async function main() {
  log.header();

  // init
  const human = new Human.Human(config); // create instance of human
  log.info('Human:', human.version);
  // @ts-ignore
  human.env.Canvas = canvas.Canvas; // monkey-patch human to use external canvas library
  await human.load(); // pre-load models
  log.info('Loaded models:', Object.keys(human.models).filter((a) => human.models[a]));
  log.info('Memory state:', human.tf.engine().memory());

  // parse cmdline
  const input = process.argv[2];
  const output = process.argv[3];
  if (process.argv.length !== 4) log.error('Parameters: <input-image> <output-image> missing');
  else if (!fs.existsSync(input) && !input.startsWith('http')) log.error(`File not found: ${process.argv[2]}`);
  else {
    // everything seems ok
    const inputImage = await canvas.loadImage(input); // load image using canvas library
    log.info('Loaded image', input, inputImage.width, inputImage.height);
    const inputCanvas = new canvas.Canvas(inputImage.width, inputImage.height); // create canvas
    const ctx = inputCanvas.getContext('2d');
    ctx.drawImage(inputImage, 0, 0); // draw input image onto canvas

    // run detection
    const result = await human.detect(inputCanvas);

    // print results summary
    const persons = result.persons; // invoke persons getter, only used to print summary on console
    for (let i = 0; i < persons.length; i++) {
      const face = persons[i].face;
      const faceTxt = face ? `score:${face.score} age:${face.age} gender:${face.gender} iris:${face.iris}` : null;
      const body = persons[i].body;
      const bodyTxt = body ? `score:${body.score} keypoints:${body.keypoints?.length}` : null;
      log.data(`Detected: #${i}: Face:${faceTxt} Body:${bodyTxt} LeftHand:${persons[i].hands.left ? 'yes' : 'no'} RightHand:${persons[i].hands.right ? 'yes' : 'no'} Gestures:${persons[i].gestures.length}`);
    }

    // draw detected results onto canvas and save it to a file
    human.draw.all(inputCanvas, result); // use human build-in method to draw results as overlays on canvas
    const outFile = fs.createWriteStream(output); // write canvas to new image file
    outFile.on('finish', () => log.state('Output image:', output, inputCanvas.width, inputCanvas.height));
    outFile.on('error', (err) => log.error('Output error:', output, err));
    const stream = inputCanvas.createJPEGStream({ quality: 0.5, progressive: true, chromaSubsampling: true });
    stream.pipe(outFile);
  }
}

main();
