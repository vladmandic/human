/**
 * Human demo for NodeJS using Canvas library
 */

const fs = require('fs');
const process = require('process');
const log = require('@vladmandic/pilogger');
const canvas = require('canvas');

// eslint-disable-next-line import/no-extraneous-dependencies, no-unused-vars, @typescript-eslint/no-unused-vars
const tf = require('@tensorflow/tfjs-node'); // in nodejs environments tfjs-node is required to be loaded before human
// const human = require('@vladmandic/human'); // use this when human is installed as module (majority of use cases)
const Human = require('../../dist/human.node.js'); // use this when using human in dev mode

const config = { // just enable all and leave default settings
  debug: false,
  face: { enabled: true }, // includes mesh, iris, emotion, descriptor
  hand: { enabled: true, maxDetected: 2, minConfidence: 0.5, detector: { modelPath: 'handtrack.json' } }, // use alternative hand model
  body: { enabled: true },
  object: { enabled: true },
  gestures: { enabled: true },
};

async function main() {
  log.header();

  globalThis.Canvas = canvas.Canvas; // patch global namespace with canvas library
  globalThis.ImageData = canvas.ImageData; // patch global namespace with canvas library
  // human.env.Canvas = canvas.Canvas; // alternatively monkey-patch human to use external canvas library
  // human.env.ImageData = canvas.ImageData; // alternatively monkey-patch human to use external canvas library

  // init
  const human = new Human.Human(config); // create instance of human
  log.info('Human:', human.version);

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
    const inputCtx = inputCanvas.getContext('2d');
    inputCtx.drawImage(inputImage, 0, 0); // draw input image onto canvas
    const imageData = inputCtx.getImageData(0, 0, inputCanvas.width, inputCanvas.height);

    // run detection
    const result = await human.detect(imageData);
    // run segmentation
    // const seg = await human.segmentation(inputCanvas);
    // log.data('Segmentation:', { data: seg.data.length, alpha: typeof seg.alpha, canvas: typeof seg.canvas });

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
    const outputCanvas = new canvas.Canvas(inputImage.width, inputImage.height); // create canvas
    const outputCtx = outputCanvas.getContext('2d');
    outputCtx.drawImage(result.canvas || inputImage, 0, 0); // draw input image onto canvas
    // @ts-ignore canvas is not checked for typedefs
    human.draw.all(outputCanvas, result); // use human build-in method to draw results as overlays on canvas
    const outFile = fs.createWriteStream(output); // write canvas to new image file
    outFile.on('finish', () => log.state('Output image:', output, outputCanvas.width, outputCanvas.height));
    outFile.on('error', (err) => log.error('Output error:', output, err));
    const stream = outputCanvas.createJPEGStream({ quality: 0.5, progressive: true, chromaSubsampling: true });
    stream.pipe(outFile);
  }
}

main();
