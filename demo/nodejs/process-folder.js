const fs = require('fs');
const path = require('path');
const process = require('process');
const log = require('@vladmandic/pilogger');
const canvas = require('canvas');
// const tf = require('@tensorflow/tfjs-node-gpu'); // for nodejs, `tfjs-node` or `tfjs-node-gpu` should be loaded before using Human
const Human = require('../../dist/human.node-gpu.js'); // this is 'const Human = require('../dist/human.node-gpu.js').default;'

const config = { // just enable all and leave default settings
  debug: true,
  async: false,
  cacheSensitivity: 0,
  face: { enabled: true, detector: { maxDetected: 20 } },
  object: { enabled: true },
  gesture: { enabled: true },
  hand: { enabled: true },
  body: { enabled: true, modelPath: 'https://vladmandic.github.io/human-models/models/movenet-multipose.json' },
};

async function main() {
  log.header();

  globalThis.Canvas = canvas.Canvas; // patch global namespace with canvas library
  globalThis.ImageData = canvas.ImageData; // patch global namespace with canvas library

  const human = new Human.Human(config); // create instance of human
  log.info('Human:', human.version);
  const configErrors = await human.validate();
  if (configErrors.length > 0) log.error('Configuration errors:', configErrors);
  await human.load(); // pre-load models
  log.info('Loaded models:', Object.keys(human.models).filter((a) => human.models[a]));

  const inDir = process.argv[2];
  const outDir = process.argv[3];
  if (process.argv.length !== 4) {
    log.error('Parameters: <input-directory> <output-directory> missing');
    return;
  }
  if (!fs.existsSync(inDir) || !fs.statSync(inDir).isDirectory() || !fs.existsSync(outDir) || !fs.statSync(outDir).isDirectory()) {
    log.error('Invalid directory specified:', 'input:', fs.existsSync(inDir) ?? fs.statSync(inDir).isDirectory(), 'output:', fs.existsSync(outDir) ?? fs.statSync(outDir).isDirectory());
    return;
  }

  const dir = fs.readdirSync(inDir);
  const images = dir.filter((f) => fs.statSync(path.join(inDir, f)).isFile() && (f.toLocaleLowerCase().endsWith('.jpg') || f.toLocaleLowerCase().endsWith('.jpeg')));
  log.info(`Processing folder: ${inDir} entries:`, dir.length, 'images', images.length);
  for (const image of images) {
    const inFile = path.join(inDir, image);
    const buffer = fs.readFileSync(inFile);
    const tensor = human.tf.tidy(() => {
      const decode = human.tf.node.decodeImage(buffer, 3);
      const expand = human.tf.expandDims(decode, 0);
      const cast = human.tf.cast(expand, 'float32');
      return cast;
    });
    log.state('Loaded image:', inFile, tensor.shape);

    const result = await human.detect(tensor);
    human.tf.dispose(tensor);
    log.data(`Detected: ${image}:`, 'Face:', result.face.length, 'Body:', result.body.length, 'Hand:', result.hand.length, 'Objects:', result.object.length, 'Gestures:', result.gesture.length);

    const outputCanvas = new canvas.Canvas(tensor.shape[2], tensor.shape[1]); // create canvas
    const outputCtx = outputCanvas.getContext('2d');
    const inputImage = await canvas.loadImage(buffer); // load image using canvas library
    outputCtx.drawImage(inputImage, 0, 0); // draw input image onto canvas
    // @ts-ignore
    human.draw.all(outputCanvas, result); // use human build-in method to draw results as overlays on canvas
    const outFile = path.join(outDir, image);
    const outStream = fs.createWriteStream(outFile); // write canvas to new image file
    outStream.on('finish', () => log.state('Output image:', outFile, outputCanvas.width, outputCanvas.height));
    outStream.on('error', (err) => log.error('Output error:', outFile, err));
    const stream = outputCanvas.createJPEGStream({ quality: 0.5, progressive: true, chromaSubsampling: true });
    // @ts-ignore
    stream.pipe(outStream);
  }
}

main();
