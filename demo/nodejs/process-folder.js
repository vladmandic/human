/**
 * Human demo for NodeJS
 *
 * Takes input and output folder names parameters and processes all images
 * found in input folder and creates annotated images in output folder
 *
 * Requires [canvas](https://www.npmjs.com/package/canvas) to provide Canvas functionality in NodeJS environment
 */

const fs = require('fs');
const path = require('path');
const process = require('process');
const log = require('@vladmandic/pilogger'); // eslint-disable-line node/no-unpublished-require
const canvas = require('canvas'); // eslint-disable-line node/no-unpublished-require
// for nodejs, `tfjs-node` or `tfjs-node-gpu` should be loaded before using Human
const tf = require('@tensorflow/tfjs-node-gpu'); // eslint-disable-line node/no-unpublished-require
const Human = require('../../dist/human.node-gpu.js'); // this is 'const Human = require('../dist/human.node-gpu.js').default;'

const config = { // just enable all and leave default settings
  modelBasePath: 'file://models',
  debug: true,
  softwareKernels: true, // slower but enhanced precision since face rotation can work in software mode in nodejs environments
  cacheSensitivity: 0.01,
  face: { enabled: true, detector: { maxDetected: 100, minConfidence: 0.1 } },
  object: { enabled: true, maxDetected: 100, minConfidence: 0.1 },
  gesture: { enabled: true },
  hand: { enabled: true, maxDetected: 100, minConfidence: 0.2 },
  body: { enabled: true, maxDetected: 100, minConfidence: 0.1, modelPath: 'https://vladmandic.github.io/human-models/models/movenet-multipose.json' },
};

const poolSize = 4;

const human = new Human.Human(config); // create instance of human

async function saveFile(shape, buffer, result, outFile) {
  return new Promise(async (resolve, reject) => { // eslint-disable-line no-async-promise-executor
    const outputCanvas = new canvas.Canvas(shape[2], shape[1]); // create canvas
    const outputCtx = outputCanvas.getContext('2d');
    const inputImage = await canvas.loadImage(buffer); // load image using canvas library
    outputCtx.drawImage(inputImage, 0, 0); // draw input image onto canvas
    human.draw.all(outputCanvas, result); // use human build-in method to draw results as overlays on canvas
    const outStream = fs.createWriteStream(outFile); // write canvas to new image file
    outStream.on('finish', () => {
      log.data('Output image:', outFile, outputCanvas.width, outputCanvas.height);
      resolve();
    });
    outStream.on('error', (err) => {
      log.error('Output error:', outFile, err);
      reject();
    });
    const stream = outputCanvas.createJPEGStream({ quality: 0.5, progressive: true, chromaSubsampling: true });
    stream.pipe(outStream);
  });
}

async function processFile(image, inFile, outFile) {
  const buffer = fs.readFileSync(inFile);
  const tensor = tf.tidy(() => {
    const decode = tf.node.decodeImage(buffer, 3);
    const expand = tf.expandDims(decode, 0);
    const cast = tf.cast(expand, 'float32');
    return cast;
  });
  log.state('Loaded image:', inFile, tensor.shape);

  const result = await human.detect(tensor);
  human.tf.dispose(tensor);
  log.data(`Detected: ${image}:`, 'Face:', result.face.length, 'Body:', result.body.length, 'Hand:', result.hand.length, 'Objects:', result.object.length, 'Gestures:', result.gesture.length);

  if (outFile) await saveFile(tensor.shape, buffer, result, outFile);
}

async function main() {
  log.header();

  globalThis.Canvas = canvas.Canvas; // patch global namespace with canvas library
  globalThis.ImageData = canvas.ImageData; // patch global namespace with canvas library

  log.info('Human:', human.version, 'TF:', tf.version_core);
  process.noDeprecation = true;
  const configErrors = await human.validate();
  if (configErrors.length > 0) log.error('Configuration errors:', configErrors);
  await human.load(); // pre-load models
  log.info('Loaded models:', human.models.loaded());

  const inDir = process.argv[2];
  const outDir = process.argv[3];
  if (!inDir) {
    log.error('Parameters: <input-directory> missing');
    return;
  }
  if (inDir && (!fs.existsSync(inDir) || !fs.statSync(inDir).isDirectory())) {
    log.error('Invalid input directory:', fs.existsSync(inDir) ?? fs.statSync(inDir).isDirectory());
    return;
  }
  if (!outDir) {
    log.info('Parameters: <output-directory> missing, images will not be saved');
  }
  if (outDir && (!fs.existsSync(outDir) || !fs.statSync(outDir).isDirectory())) {
    log.error('Invalid output directory:', fs.existsSync(outDir) ?? fs.statSync(outDir).isDirectory());
    return;
  }

  const dir = fs.readdirSync(inDir);
  const images = dir.filter((f) => fs.statSync(path.join(inDir, f)).isFile() && (f.toLocaleLowerCase().endsWith('.jpg') || f.toLocaleLowerCase().endsWith('.jpeg')));
  log.info(`Processing folder: ${inDir} entries:`, dir.length, 'images', images.length);
  const t0 = performance.now();
  const promises = [];
  for (let i = 0; i < images.length; i++) {
    const inFile = path.join(inDir, images[i]);
    const outFile = outDir ? path.join(outDir, images[i]) : null;
    promises.push(processFile(images[i], inFile, outFile));
    if (i % poolSize === 0) await Promise.all(promises);
  }
  await Promise.all(promises);
  const t1 = performance.now();
  log.info(`Processed ${images.length} images in ${Math.round(t1 - t0)} ms`);
}

main();
