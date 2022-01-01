/**
 * Human demo for NodeJS
 * Unsupported sample of using external utility fswebcam to capture screenshot from attached webcam in regular intervals and process it using Human
 *
 * Note that node-webcam is not part of Human dependencies and should be installed manually
 * Working version of fswebcam must be present on the system
*/

let initial = true; // remember if this is the first run to print additional details
const log = require('@vladmandic/pilogger');
// @ts-ignore node-webcam is not installed by default
// eslint-disable-next-line node/no-missing-require
const nodeWebCam = require('node-webcam');

// eslint-disable-next-line import/no-extraneous-dependencies, no-unused-vars, @typescript-eslint/no-unused-vars
const tf = require('@tensorflow/tfjs-node'); // in nodejs environments tfjs-node is required to be loaded before human
// const faceapi = require('@vladmandic/face-api'); // use this when human is installed as module (majority of use cases)
const Human = require('../../dist/human.node.js'); // use this when using human in dev mode

// options for node-webcam
const tempFile = 'webcam-snap'; // node-webcam requires writting snapshot to a file, recommended to use tmpfs to avoid excessive disk writes
const optionsCamera = {
  callbackReturn: 'buffer', // this means whatever `fswebcam` writes to disk, no additional processing so it's fastest
  saveShots: false, // don't save processed frame to disk, note that temp file is still created by fswebcam thus recommendation for tmpfs
};
const camera = nodeWebCam.create(optionsCamera);

// options for human
const optionsHuman = {
  modelBasePath: 'file://models/',
};
const human = new Human.Human(optionsHuman);

function buffer2tensor(buffer) {
  return human.tf.tidy(() => {
    if (!buffer) return null;
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
}

async function detect() {
  // trigger next frame every 5 sec
  // triggered here before actual capture and detection since we assume it will complete in less than 5sec
  // so it's as close as possible to real 5sec and not 5sec + detection time
  // if there is a chance of race scenario where detection takes longer than loop trigger, then trigger should be at the end of the function instead
  setTimeout(() => detect(), 5000);

  camera.capture(tempFile, (err, data) => { // gets the (default) jpeg data from from webcam
    if (err) {
      log.error('error capturing webcam:', err);
    } else {
      const tensor = buffer2tensor(data); // create tensor from image buffer
      if (initial) log.data('input tensor:', tensor.shape);
      // eslint-disable-next-line promise/no-promise-in-callback
      human.detect(tensor).then((result) => {
        if (result && result.face && result.face.length > 0) {
          for (let i = 0; i < result.face.length; i++) {
            const face = result.face[i];
            const emotion = face.emotion?.reduce((prev, curr) => (prev.score > curr.score ? prev : curr));
            log.data(`detected face: #${i} boxScore:${face.boxScore} faceScore:${face.faceScore} age:${face.age} genderScore:${face.genderScore} gender:${face.gender} emotionScore:${emotion?.score} emotion:${emotion?.emotion} iris:${face.iris}`);
          }
        } else {
          log.data('  Face: N/A');
        }
      });
    }
    initial = false;
  });
  // alternatively to triggering every 5sec sec, simply trigger next frame as fast as possible
  // setImmediate(() => process());
}

async function main() {
  camera.list((list) => {
    log.data('detected camera:', list);
  });
  await human.load();
  detect();
}

log.header();
main();
