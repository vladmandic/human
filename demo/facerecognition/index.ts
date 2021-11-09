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
    antispoof: { enabled: true }, // enable optional antispoof module
    liveness: { enabled: true }, // enable optional liveness module
  },
  body: { enabled: false },
  hand: { enabled: false },
  object: { enabled: false },
  gesture: { enabled: true },
};

const options = {
  faceDB: '../facematch/faces.json',
  minConfidence: 0.6, // overal face confidence for box, face, gender, real
  minSize: 224, // min input to face descriptor model before degradation
  maxTime: 10000, // max time before giving up
  blinkMin: 10, // minimum duration of a valid blink
  blinkMax: 800, // maximum duration of a valid blink
};

const ok = { // must meet all rules
  faceCount: false,
  faceConfidence: false,
  facingCenter: false,
  blinkDetected: false,
  faceSize: false,
  antispoofCheck: false,
  livenessCheck: false,
  elapsedMs: 0, // total time while waiting for valid face
};
const allOk = () => ok.faceCount && ok.faceSize && ok.blinkDetected && ok.facingCenter && ok.faceConfidence && ok.antispoofCheck && ok.livenessCheck;

const blink = { // internal timers for blink start/end/duration
  start: 0,
  end: 0,
  time: 0,
};

let db: Array<{ name: string, source: string, embedding: number[] }> = []; // holds loaded face descriptor database
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
  log('video:', dom.video.videoWidth, dom.video.videoHeight, stream.getVideoTracks()[0].label);
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

async function validationLoop(): Promise<typeof human.result.face> { // main screen refresh loop
  const interpolated = await human.next(human.result); // smoothen result using last-known results
  await human.draw.canvas(dom.video, dom.canvas); // draw canvas to screen
  await human.draw.all(dom.canvas, interpolated); // draw labels, boxes, lines, etc.
  const now = human.now();
  fps.draw = 1000 / (now - timestamp.draw);
  timestamp.draw = now;
  printFPS(`fps: ${fps.detect.toFixed(1).padStart(5, ' ')} detect | ${fps.draw.toFixed(1).padStart(5, ' ')} draw`); // write status

  ok.faceCount = human.result.face.length === 1; // must be exactly detected face
  if (ok.faceCount) { // skip the rest if no face
    const gestures: string[] = Object.values(human.result.gesture).map((gesture) => gesture.gesture); // flatten all gestures
    if (gestures.includes('blink left eye') || gestures.includes('blink right eye')) blink.start = human.now(); // blink starts when eyes get closed
    if (blink.start > 0 && !gestures.includes('blink left eye') && !gestures.includes('blink right eye')) blink.end = human.now(); // if blink started how long until eyes are back open
    ok.blinkDetected = ok.blinkDetected || (blink.end - blink.start > options.blinkMin && blink.end - blink.start < options.blinkMax);
    if (ok.blinkDetected && blink.time === 0) blink.time = Math.trunc(blink.end - blink.start);
    ok.facingCenter = gestures.includes('facing center') && gestures.includes('looking center'); // must face camera and look at camera
    ok.faceConfidence = (human.result.face[0].boxScore || 0) > options.minConfidence && (human.result.face[0].faceScore || 0) > options.minConfidence && (human.result.face[0].genderScore || 0) > options.minConfidence;
    ok.antispoofCheck = (human.result.face[0].real || 0) > options.minConfidence;
    ok.livenessCheck = (human.result.face[0].live || 0) > options.minConfidence;
    ok.faceSize = human.result.face[0].box[2] >= options.minSize && human.result.face[0].box[3] >= options.minSize;
  }

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

  const arr = db.map((rec) => rec.embedding);
  const res = await human.match(face.embedding, arr);
  log(`found best match: ${db[res.index].name} similarity: ${Math.round(1000 * res.similarity) / 10}% source: ${db[res.index].source}`);
}

async function loadFaceDB() {
  const res = await fetch(options.faceDB);
  db = (res && res.ok) ? await res.json() : [];
  log('loaded face db:', options.faceDB, 'records:', db.length);
}

async function main() { // main entry point
  log('human version:', human.version, '| tfjs version:', human.tf.version_core);
  printFPS('loading...');
  await loadFaceDB();
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
