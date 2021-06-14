/**
 * Human demo for NodeJS
 * Unsupported sample of using external utility fswebcam to capture screenshot from attached webcam in regular intervals and process it using Human
 *
 * Note that node-webcam is not part of Human dependencies and should be installed manually
 * Working version of fswebcam must be present on the system
*/

const util = require('util');
const log = require('@vladmandic/pilogger');
// eslint-disable-next-line node/no-missing-require
const nodeWebCam = require('node-webcam');
// for NodeJS, `tfjs-node` or `tfjs-node-gpu` should be loaded before using Human
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
const tf = require('@tensorflow/tfjs-node'); // or const tf = require('@tensorflow/tfjs-node-gpu');
// load specific version of Human library that matches TensorFlow mode
const Human = require('../../dist/human.node.js').default; // or const Human = require('../dist/human.node-gpu.js').default;

// options for node-webcam
const optionsCamera = {
  callbackReturn: 'buffer', // this means whatever `fswebcam` writes to disk, no additional processing so it's fastest
  saveShots: false, // don't save processed frame to disk, note that temp file is still created by fswebcam thus recommendation for tmpfs
};

// options for human
const optionsHuman = {
  backend: 'tensorflow',
  modelBasePath: 'file://models/',
};

const camera = nodeWebCam.create(optionsCamera);
const capture = util.promisify(camera.capture);
const human = new Human(optionsHuman);
const results = [];

const buffer2tensor = human.tf.tidy((buffer) => {
  const decode = human.tf.node.decodeImage(buffer, 3);
  let expand;
  if (decode.shape[2] === 4) { // input is in rgba format, need to convert to rgb
    const channels = human.tf.split(decode, 4, 2); // tf.split(tensor, 4, 2); // split rgba to channels
    const rgb = human.tf.stack([channels[0], channels[1], channels[2]], 2); // stack channels back to rgb and ignore alpha
    expand = human.tf.reshape(rgb, [1, decode.shape[0], decode.shape[1], 3]); // move extra dim from the end of tensor and use it as batch number instead
  } else {
    expand = human.tf.expandDims(decode, 0); // inpur ia rgb so use as-is
  }
  const cast = human.tf.cast(expand, 'float32');
  return cast;
});

async function process() {
  // trigger next frame every 5 sec
  // triggered here before actual capture and detection since we assume it will complete in less than 5sec
  // so it's as close as possible to real 5sec and not 5sec + detection time
  // if there is a chance of race scenario where detection takes longer than loop trigger, then trigger should be at the end of the function instead
  setTimeout(() => process(), 5000);

  const buffer = await capture(); // gets the (default) jpeg data from from webcam
  const tensor = buffer2tensor(buffer); // create tensor from image buffer
  const res = await human.detect(tensor); // run detection

  // do whatever here with the res
  // or just append it to results array that will contain all processed results over time
  results.push(res);

  // alternatively to triggering every 5sec sec, simply trigger next frame as fast as possible
  // setImmediate(() => process());
}

log.header();
process();
