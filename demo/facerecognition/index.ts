/**
 * Human demo for browsers
 * @default Human Library
 * @summary <https://github.com/vladmandic/human>
 * @author <https://github.com/vladmandic>
 * @copyright <https://github.com/vladmandic>
 * @license MIT
 */

import { Human } from '../../dist/human.esm.js'; // equivalent of @vladmandic/Human

const humanConfig = { // user configuration for human, used to fine-tune behavior
  modelBasePath: '../../models',
  filter: { equalization: true }, // lets run with histogram equilizer
  face: {
    enabled: true,
    detector: { rotation: true, return: true }, // return tensor is not really needed except to draw detected face
    description: { enabled: true },
    iris: { enabled: true }, // needed to determine gaze direction
    emotion: { enabled: false }, // not needed
    antispoof: { enabled: true }, // enable optional antispoof as well
  },
  body: { enabled: false },
  hand: { enabled: false },
  object: { enabled: false },
  gesture: { enabled: true },
};

const options = {
  minConfidence: 0.6, // overal face confidence for box, face, gender, real
  minSize: 224, // min input to face descriptor model before degradation
  maxTime: 10000, // max time before giving up
};

const human = new Human(humanConfig); // create instance of human with overrides from user configuration

human.env['perfadd'] = false; // is performance data showing instant or total values
human.draw.options.font = 'small-caps 18px "Lato"'; // set font used to draw labels when using draw methods
human.draw.options.lineHeight = 20;

const dom = { // grab instances of dom objects so we dont have to look them up later
  video: document.getElementById('video') as HTMLVideoElement,
  canvas: document.getElementById('canvas') as HTMLCanvasElement,
  log: document.getElementById('log') as HTMLPreElement,
  fps: document.getElementById('fps') as HTMLPreElement,
  status: document.getElementById('status') as HTMLPreElement,
};
const timestamp = { detect: 0, draw: 0 }; // holds information used to calculate performance and possible memory leaks
const fps = { detect: 0, draw: 0 }; // holds calculated fps information for both detect and screen refresh
let startTime = 0;

const log = (...msg) => { // helper method to output messages
  dom.log.innerText += msg.join(' ') + '\n';
  // eslint-disable-next-line no-console
  console.log(...msg);
};
const printFPS = (msg) => dom.fps.innerText = msg; // print status element
const printStatus = (msg) => dom.status.innerText = 'status: ' + JSON.stringify(msg).replace(/"|{|}/g, '').replace(/,/g, ' | '); // print status element

async function webCam() { // initialize webcam
  printFPS('starting webcam...');
  // @ts-ignore resizeMode is not yet defined in tslib
  const cameraOptions: MediaStreamConstraints = { audio: false, video: { facingMode: 'user', resizeMode: 'none', width: { ideal: document.body.clientWidth } } };
  const stream: MediaStream = await navigator.mediaDevices.getUserMedia(cameraOptions);
  const ready = new Promise((resolve) => { dom.video.onloadeddata = () => resolve(true); });
  dom.video.srcObject = stream;
  dom.video.play();
  await ready;
  dom.canvas.width = dom.video.videoWidth;
  dom.canvas.height = dom.video.videoHeight;
  const track: MediaStreamTrack = stream.getVideoTracks()[0];
  const capabilities: MediaTrackCapabilities | string = track.getCapabilities ? track.getCapabilities() : '';
  const settings: MediaTrackSettings | string = track.getSettings ? track.getSettings() : '';
  const constraints: MediaTrackConstraints | string = track.getConstraints ? track.getConstraints() : '';
  log('video:', dom.video.videoWidth, dom.video.videoHeight, track.label, { stream, track, settings, constraints, capabilities });
  dom.canvas.onclick = () => { // pause when clicked on screen and resume on next click
    if (dom.video.paused) dom.video.play();
    else dom.video.pause();
  };
}

async function detectionLoop() { // main detection loop
  if (!dom.video.paused) {
    await human.detect(dom.video); // actual detection; were not capturing output in a local variable as it can also be reached via human.result
    const now = human.now();
    fps.detect = 1000 / (now - timestamp.detect);
    timestamp.detect = now;
    requestAnimationFrame(detectionLoop); // start new frame immediately
  }
}

const ok = { // must meet all rules
  faceCount: false,
  faceConfidence: false,
  facingCenter: false,
  eyesOpen: false,
  blinkDetected: false,
  faceSize: false,
  antispoofCheck: false,
  livenessCheck: false,
  elapsedMs: 0,
};
const allOk = () => ok.faceCount && ok.faceSize && ok.blinkDetected && ok.facingCenter && ok.faceConfidence && ok.antispoofCheck;

async function validationLoop(): Promise<typeof human.result.face> { // main screen refresh loop
  const interpolated = await human.next(human.result); // smoothen result using last-known results
  await human.draw.canvas(dom.video, dom.canvas); // draw canvas to screen
  await human.draw.all(dom.canvas, interpolated); // draw labels, boxes, lines, etc.
  const now = human.now();
  fps.draw = 1000 / (now - timestamp.draw);
  timestamp.draw = now;
  printFPS(`fps: ${fps.detect.toFixed(1).padStart(5, ' ')} detect | ${fps.draw.toFixed(1).padStart(5, ' ')} draw`); // write status

  const gestures: string[] = Object.values(human.result.gesture).map((gesture) => gesture.gesture); // flatten all gestures
  ok.faceCount = human.result.face.length === 1; // must be exactly detected face
  ok.eyesOpen = ok.eyesOpen || !(gestures.includes('blink left eye') || gestures.includes('blink right eye')); // blink validation is only ok once both eyes are open
  ok.blinkDetected = ok.eyesOpen && ok.blinkDetected || gestures.includes('blink left eye') || gestures.includes('blink right eye'); // need to detect blink only once
  ok.facingCenter = gestures.includes('facing center') && gestures.includes('looking center'); // must face camera and look at camera
  ok.faceConfidence = (human.result.face[0].boxScore || 0) > options.minConfidence && (human.result.face[0].faceScore || 0) > options.minConfidence && (human.result.face[0].genderScore || 0) > options.minConfidence;
  ok.antispoofCheck = (human.result.face[0].real || 0) > options.minConfidence;
  ok.faceSize = human.result.face[0].box[2] >= options.minSize && human.result.face[0].box[3] >= options.minSize;

  printStatus(ok);

  if (allOk()) { // all criteria met
    dom.video.pause();
    return human.result.face;
  } else {
    human.tf.dispose(human.result.face[0].tensor); // results are not ok, so lets dispose tensor
  }
  if (ok.elapsedMs > options.maxTime) { // give up
    dom.video.pause();
    return human.result.face;
  } else { // run again
    ok.elapsedMs = Math.trunc(human.now() - startTime);
    return new Promise((resolve) => {
      setTimeout(async () => {
        const res = await validationLoop(); // run validation loop until conditions are met
        if (res) resolve(human.result.face); // recursive promise resolve
      }, 30); // use to slow down refresh from max refresh rate to target of 30 fps
    });
  }
}

async function detectFace(face) {
  // draw face and dispose face tensor immediatey afterwards
  dom.canvas.width = face.tensor.shape[2];
  dom.canvas.height = face.tensor.shape[1];
  dom.canvas.style.width = '';
  human.tf.browser.toPixels(face.tensor, dom.canvas);
  human.tf.dispose(face.tensor);

  // run detection using human.match and use face.embedding as input descriptor
  // tbd
}

async function main() { // main entry point
  log('human version:', human.version, '| tfjs version:', human.tf.version_core);
  printFPS('loading...');
  await human.load(); // preload all models
  printFPS('initializing...');
  await human.warmup(); // warmup function to initialize backend for future faster detection
  await webCam(); // start webcam
  await detectionLoop(); // start detection loop
  startTime = human.now();
  const face = await validationLoop(); // start validation loop
  if (!allOk()) log('did not find valid input', face);
  else {
    log('found valid face', face);
    await detectFace(face[0]);
  }
  dom.fps.style.display = 'none';
}

window.onload = main;
