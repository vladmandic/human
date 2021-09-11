/**
 * Human demo for NodeJS
 */

const log = require('@vladmandic/pilogger');
const fs = require('fs');
const process = require('process');
const canvas = require('canvas');

// for NodeJS, `tfjs-node` or `tfjs-node-gpu` should be loaded before using Human
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
const tf = require('@tensorflow/tfjs-node'); // or const tf = require('@tensorflow/tfjs-node-gpu');

// load specific version of Human library that matches TensorFlow mode
const Human = require('../../dist/human.node.js').default; // or const Human = require('../dist/human.node-gpu.js').default;

let human = null;

const myConfig = {
  backend: 'tensorflow',
  modelBasePath: 'file://models/',
  debug: false,
  async: true,
  filter: { enabled: false },
  face: {
    enabled: true,
    detector: { enabled: true },
    mesh: { enabled: true },
    iris: { enabled: true },
    description: { enabled: true },
    emotion: { enabled: true },
  },
  hand: { enabled: true },
  body: { enabled: true },
  object: { enabled: true },
};

async function init() {
  // create instance of human
  human = new Human(myConfig);
  // wait until tf is ready
  await human.tf.ready();
  // pre-load models
  log.info('Human:', human.version);
  await human.load();
  const loaded = Object.keys(human.models).filter((a) => human.models[a]);
  log.info('Loaded:', loaded);
  log.info('Memory state:', human.tf.engine().memory());
}

async function detect(input, output) {
  // read input image from file or url into buffer
  let buffer;
  log.info('Loading image:', input);
  if (input.startsWith('http:') || input.startsWith('https:')) {
    const fetch = (await import('node-fetch')).default;
    const res = await fetch(input);
    if (res && res.ok) buffer = await res.buffer();
    else log.error('Invalid image URL:', input, res.status, res.statusText, res.headers.get('content-type'));
  } else {
    buffer = fs.readFileSync(input);
  }
  if (!buffer) return {};

  // decode image using tfjs-node so we don't need external depenencies
  /*
  const tensor = human.tf.tidy(() => {
    const decode = human.tf.node.decodeImage(buffer, 3);
    let expand;
    if (decode.shape[2] === 4) { // input is in rgba format, need to convert to rgb
      const channels = human.tf.split(decode, 4, 2); // split rgba to channels
      const rgb = human.tf.stack([channels[0], channels[1], channels[2]], 2); // stack channels back to rgb and ignore alpha
      expand = human.tf.reshape(rgb, [1, decode.shape[0], decode.shape[1], 3]); // move extra dim from the end of tensor and use it as batch number instead
    } else {
      expand = human.tf.expandDims(decode, 0);
    }
    const cast = human.tf.cast(expand, 'float32');
    return cast;
  });
  */

  // decode image using canvas library
  const inputImage = await canvas.loadImage(input);
  const inputCanvas = new canvas.Canvas(inputImage.width, inputImage.height, 'image');
  const inputCtx = inputCanvas.getContext('2d');
  inputCtx.drawImage(inputImage, 0, 0);
  const inputData = inputCtx.getImageData(0, 0, inputImage.width, inputImage.height);
  const tensor = human.tf.tidy(() => {
    const data = tf.tensor(Array.from(inputData.data), [inputImage.width, inputImage.height, 4]);
    const channels = human.tf.split(data, 4, 2); // split rgba to channels
    const rgb = human.tf.stack([channels[0], channels[1], channels[2]], 2); // stack channels back to rgb and ignore alpha
    const expand = human.tf.reshape(rgb, [1, data.shape[0], data.shape[1], 3]); // move extra dim from the end of tensor and use it as batch number instead
    const cast = human.tf.cast(expand, 'float32');
    return cast;
  });

  // image shape contains image dimensions and depth
  log.state('Processing:', tensor['shape']);

  // run actual detection
  let result;
  try {
    result = await human.detect(tensor, myConfig);
  } catch (err) {
    log.error('caught');
  }

  // dispose image tensor as we no longer need it
  human.tf.dispose(tensor);

  // print data to console
  if (result) {
    // invoke persons getter
    const persons = result.persons;
    log.data('Detected:');
    for (let i = 0; i < persons.length; i++) {
      const face = persons[i].face;
      const faceTxt = face ? `score:${face.score} age:${face.age} gender:${face.gender} iris:${face.iris}` : null;
      const body = persons[i].body;
      const bodyTxt = body ? `score:${body.score} keypoints:${body.keypoints?.length}` : null;
      log.data(`  #${i}: Face:${faceTxt} Body:${bodyTxt} LeftHand:${persons[i].hands.left ? 'yes' : 'no'} RightHand:${persons[i].hands.right ? 'yes' : 'no'} Gestures:${persons[i].gestures.length}`);
    }
  }

  // load and draw original image
  const outputCanvas = new canvas.Canvas(tensor.shape[2], tensor.shape[1], 'image'); // decoded tensor shape tells us width and height
  const ctx = outputCanvas.getContext('2d');
  const original = await canvas.loadImage(buffer); // we already have input as buffer, so lets reuse it
  ctx.drawImage(original, 0, 0, outputCanvas.width, outputCanvas.height); // draw original to new canvas

  // draw human results on canvas
  // human.setCanvas(outputCanvas); // tell human to use this canvas
  human.draw.all(outputCanvas, result); // human will draw results as overlays on canvas

  // write canvas to new image file
  const out = fs.createWriteStream(output);
  out.on('finish', () => log.state('Created output image:', output));
  out.on('error', (err) => log.error('Error creating image:', output, err));
  const stream = outputCanvas.createJPEGStream({ quality: 0.5, progressive: true, chromaSubsampling: true });
  stream.pipe(out);

  return result;
}

async function main() {
  log.header();
  log.info('Current folder:', process.env.PWD);
  await init();
  const input = process.argv[2];
  const output = process.argv[3];
  if (process.argv.length !== 4) {
    log.error('Parameters: <input-image> <output-image> missing');
  } else if (!fs.existsSync(input) && !input.startsWith('http')) {
    log.error(`File not found: ${process.argv[2]}`);
  } else {
    await detect(input, output);
  }
}

main();
