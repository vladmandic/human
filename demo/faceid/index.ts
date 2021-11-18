/**
 * Human demo for browsers
 * @default Human Library
 * @summary <https://github.com/vladmandic/human>
 * @author <https://github.com/vladmandic>
 * @copyright <https://github.com/vladmandic>
 * @license MIT
 */

import { Human, TensorLike, FaceResult } from '../../dist/human.esm.js'; // equivalent of @vladmandic/Human
import * as indexDb from './indexdb'; // methods to deal with indexdb

const humanConfig = { // user configuration for human, used to fine-tune behavior
  modelBasePath: '../../models',
  filter: { equalization: true }, // lets run with histogram equilizer
  face: {
    enabled: true,
    detector: { rotation: true, return: true, cropFactor: 1.6, mask: false }, // return tensor is used to get detected face image
    description: { enabled: true }, // default model for face descriptor extraction is faceres
    mobilefacenet: { enabled: false, modelPath: 'https://vladmandic.github.io/human-models/models/mobilefacenet.json' }, // alternative model
    iris: { enabled: true }, // needed to determine gaze direction
    emotion: { enabled: false }, // not needed
    antispoof: { enabled: true }, // enable optional antispoof module
    liveness: { enabled: true }, // enable optional liveness module
  },
  body: { enabled: false },
  hand: { enabled: false },
  object: { enabled: false },
  gesture: { enabled: true }, // parses face and iris gestures
};

// const matchOptions = { order: 2, multiplier: 1000, min: 0.0, max: 1.0 }; // for embedding model
const matchOptions = { order: 2, multiplier: 25, min: 0.2, max: 0.8 }; // for faceres model

const options = {
  minConfidence: 0.6, // overal face confidence for box, face, gender, real, live
  minSize: 224, // min input to face descriptor model before degradation
  maxTime: 10000, // max time before giving up
  blinkMin: 10, // minimum duration of a valid blink
  blinkMax: 800, // maximum duration of a valid blink
  threshold: 0.5, // minimum similarity
  mask: humanConfig.face.detector.mask,
  rotation: humanConfig.face.detector.rotation,
  cropFactor: humanConfig.face.detector.cropFactor,
  ...matchOptions,
};

const ok = { // must meet all rules
  faceCount: false,
  faceConfidence: false,
  facingCenter: false,
  lookingCenter: false,
  blinkDetected: false,
  faceSize: false,
  antispoofCheck: false,
  livenessCheck: false,
  elapsedMs: 0, // total time while waiting for valid face
};
const allOk = () => ok.faceCount && ok.faceSize && ok.blinkDetected && ok.facingCenter && ok.lookingCenter && ok.faceConfidence && ok.antispoofCheck && ok.livenessCheck;
const current: { face: FaceResult | null, record: indexDb.FaceRecord | null } = { face: null, record: null }; // current face record and matched database record

const blink = { // internal timers for blink start/end/duration
  start: 0,
  end: 0,
  time: 0,
};

// let db: Array<{ name: string, source: string, embedding: number[] }> = []; // holds loaded face descriptor database
const human = new Human(humanConfig); // create instance of human with overrides from user configuration

human.env['perfadd'] = false; // is performance data showing instant or total values
human.draw.options.font = 'small-caps 18px "Lato"'; // set font used to draw labels when using draw methods
human.draw.options.lineHeight = 20;

const dom = { // grab instances of dom objects so we dont have to look them up later
  video: document.getElementById('video') as HTMLVideoElement,
  canvas: document.getElementById('canvas') as HTMLCanvasElement,
  log: document.getElementById('log') as HTMLPreElement,
  fps: document.getElementById('fps') as HTMLPreElement,
  match: document.getElementById('match') as HTMLDivElement,
  name: document.getElementById('name') as HTMLInputElement,
  save: document.getElementById('save') as HTMLSpanElement,
  delete: document.getElementById('delete') as HTMLSpanElement,
  retry: document.getElementById('retry') as HTMLDivElement,
  source: document.getElementById('source') as HTMLCanvasElement,
  ok: document.getElementById('ok') as HTMLDivElement,
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
  if (human.env.initial) log('video:', dom.video.videoWidth, dom.video.videoHeight, '|', stream.getVideoTracks()[0].label);
  dom.canvas.onclick = () => { // pause when clicked on screen and resume on next click
    if (dom.video.paused) dom.video.play();
    else dom.video.pause();
  };
}

async function detectionLoop() { // main detection loop
  if (!dom.video.paused) {
    if (current.face && current.face.tensor) human.tf.dispose(current.face.tensor); // dispose previous tensor
    await human.detect(dom.video); // actual detection; were not capturing output in a local variable as it can also be reached via human.result
    const now = human.now();
    fps.detect = 1000 / (now - timestamp.detect);
    timestamp.detect = now;
    requestAnimationFrame(detectionLoop); // start new frame immediately
  }
}

async function validationLoop(): Promise<FaceResult> { // main screen refresh loop
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
    ok.blinkDetected = ok.blinkDetected || (Math.abs(blink.end - blink.start) > options.blinkMin && Math.abs(blink.end - blink.start) < options.blinkMax);
    if (ok.blinkDetected && blink.time === 0) blink.time = Math.trunc(blink.end - blink.start);
    ok.facingCenter = gestures.includes('facing center');
    ok.lookingCenter = gestures.includes('looking center'); // must face camera and look at camera
    ok.faceConfidence = (human.result.face[0].boxScore || 0) > options.minConfidence && (human.result.face[0].faceScore || 0) > options.minConfidence && (human.result.face[0].genderScore || 0) > options.minConfidence;
    ok.antispoofCheck = (human.result.face[0].real || 0) > options.minConfidence;
    ok.livenessCheck = (human.result.face[0].live || 0) > options.minConfidence;
    ok.faceSize = human.result.face[0].box[2] >= options.minSize && human.result.face[0].box[3] >= options.minSize;
  }
  let y = 32;
  for (const [key, val] of Object.entries(ok)) {
    let el = document.getElementById(`ok-${key}`);
    if (!el) {
      el = document.createElement('div');
      el.innerText = key;
      el.className = 'ok';
      el.style.top = `${y}px`;
      dom.ok.appendChild(el);
    }
    if (typeof val === 'boolean') el.style.backgroundColor = val ? 'lightgreen' : 'lightcoral';
    else el.innerText = `${key}:${val}`;
    y += 28;
  }
  if (allOk()) { // all criteria met
    dom.video.pause();
    return human.result.face[0];
  }
  if (ok.elapsedMs > options.maxTime) { // give up
    dom.video.pause();
    return human.result.face[0];
  } else { // run again
    ok.elapsedMs = Math.trunc(human.now() - startTime);
    return new Promise((resolve) => {
      setTimeout(async () => {
        const res = await validationLoop(); // run validation loop until conditions are met
        if (res) resolve(human.result.face[0]); // recursive promise resolve
      }, 30); // use to slow down refresh from max refresh rate to target of 30 fps
    });
  }
}

async function saveRecords() {
  if (dom.name.value.length > 0) {
    const image = dom.canvas.getContext('2d')?.getImageData(0, 0, dom.canvas.width, dom.canvas.height) as ImageData;
    const rec = { id: 0, name: dom.name.value, descriptor: current.face?.embedding as number[], image };
    await indexDb.save(rec);
    log('saved face record:', rec.name);
  } else {
    log('invalid name');
  }
}

async function deleteRecord() {
  if (current.record && current.record.id > 0) {
    await indexDb.remove(current.record);
  }
}

async function detectFace() {
  dom.canvas.getContext('2d')?.clearRect(0, 0, options.minSize, options.minSize);
  if (!current.face || !current.face.tensor || !current.face.embedding) return false;
  // eslint-disable-next-line no-console
  console.log('face record:', current.face);
  human.tf.browser.toPixels(current.face.tensor as unknown as TensorLike, dom.canvas);
  if (await indexDb.count() === 0) {
    log('face database is empty');
    document.body.style.background = 'black';
    dom.delete.style.display = 'none';
    return false;
  }
  const db = await indexDb.load();
  const descriptors = db.map((rec) => rec.descriptor);
  const res = await human.match(current.face.embedding, descriptors, matchOptions);
  current.record = db[res.index] || null;
  if (current.record) {
    log(`best match: ${current.record.name} | id: ${current.record.id} | similarity: ${Math.round(1000 * res.similarity) / 10}%`);
    dom.name.value = current.record.name;
    dom.source.style.display = '';
    dom.source.getContext('2d')?.putImageData(current.record.image, 0, 0);
  }
  document.body.style.background = res.similarity > options.threshold ? 'darkgreen' : 'maroon';
  return res.similarity > options.threshold;
}

async function main() { // main entry point
  ok.faceCount = false;
  ok.faceConfidence = false;
  ok.facingCenter = false;
  ok.blinkDetected = false;
  ok.faceSize = false;
  ok.antispoofCheck = false;
  ok.livenessCheck = false;
  ok.elapsedMs = 0;
  dom.match.style.display = 'none';
  dom.retry.style.display = 'none';
  dom.source.style.display = 'none';
  document.body.style.background = 'black';
  await webCam();
  await detectionLoop(); // start detection loop
  startTime = human.now();
  current.face = await validationLoop(); // start validation loop
  dom.canvas.width = current.face?.tensor?.shape[1] || options.minSize;
  dom.canvas.height = current.face?.tensor?.shape[0] || options.minSize;
  dom.source.width = dom.canvas.width;
  dom.source.height = dom.canvas.height;
  dom.canvas.style.width = '';
  dom.match.style.display = 'flex';
  dom.save.style.display = 'flex';
  dom.delete.style.display = 'flex';
  dom.retry.style.display = 'block';
  if (!allOk()) { // is all criteria met?
    log('did not find valid face');
    return false;
  } else {
    return detectFace();
  }
}

async function init() {
  log('human version:', human.version, '| tfjs version:', human.tf.version['tfjs-core']);
  log('options:', JSON.stringify(options).replace(/{|}|"|\[|\]/g, '').replace(/,/g, ' '));
  printFPS('loading...');
  log('known face records:', await indexDb.count());
  await webCam(); // start webcam
  await human.load(); // preload all models
  printFPS('initializing...');
  dom.retry.addEventListener('click', main);
  dom.save.addEventListener('click', saveRecords);
  dom.delete.addEventListener('click', deleteRecord);
  await human.warmup(); // warmup function to initialize backend for future faster detection
  await main();
}

window.onload = init;
