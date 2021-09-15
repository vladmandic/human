/**
 * Human demo for browsers
 *
 * @description Simple Human demo for browsers using WebCam or WebRTC
 *
 * @configuration
 * config={}: contains all model configuration used by human
 */

import Human from '../../dist/human.esm.js'; // equivalent of @vladmandic/human
import webRTC from '../helpers/webrtc.js'; // handle webrtc handshake and connects to webrtc stream

const config = { // use default values
  modelBasePath: '../../models',
};
const human = new Human(config);

const webrtc = {
  enabled: false, // use webrtc or use webcam if disabled
  server: 'http://human.local:8002',
  stream: 'reowhite',
};

// eslint-disable-next-line no-console
const log = (...msg) => console.log(...msg);

/** @type {HTMLVideoElement} */
// @ts-ignore
const video = document.getElementById('video') || document.createElement('video'); // used as input
/** @type {HTMLCanvasElement} */
// @ts-ignore
const canvas = document.getElementById('canvas') || document.createElement('canvas'); // used as output

async function webCam() {
  const constraints = { audio: false, video: { facingMode: 'user', resizeMode: 'none', width: { ideal: document.body.clientWidth } } }; // set preffered camera options
  const stream = await navigator.mediaDevices.getUserMedia(constraints); // get webcam stream that matches constraints
  const ready = new Promise((resolve) => { video.onloadeddata = () => resolve(true); }); // resolve when stream is ready
  video.srcObject = stream; // assign stream to video element
  video.play(); // start stream
  await ready; // wait until stream is ready
  canvas.width = video.videoWidth; // resize output canvas to match input
  canvas.height = video.videoHeight;
  log('video stream:', video.srcObject, 'track state:', video.srcObject.getVideoTracks()[0].readyState, 'stream state:', video.readyState);
}

// eslint-disable-next-line no-unused-vars
let result;
async function detectionLoop() {
  result = await human.detect(video); // updates result every time detection completes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  requestAnimationFrame(detectionLoop); // run in loop
}

// eslint-disable-next-line no-unused-vars
async function drawLoop() {
  const interpolated = await human.next(result); // interpolates results based on last known results
  await human.draw.canvas(video, canvas); // draw input video to output canvas
  await human.draw.all(canvas, interpolated); // draw results as overlay on output canvas
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  requestAnimationFrame(drawLoop); // run in loop
}

// eslint-disable-next-line no-unused-vars
async function singleLoop() {
  result = await human.detect(video); // updates result every time detection completes
  await human.draw.canvas(video, canvas); // draw input video to output canvas
  await human.draw.all(canvas, result); // draw results as overlay on output canvas
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  requestAnimationFrame(singleLoop); // run in loop
}

async function main() {
  await human.load(); // not required, pre-loads all models
  await human.warmup(); // not required, warms up all models
  if (webrtc.enabled) await webRTC(webrtc.server, webrtc.stream, video); // setup webrtc as input stream, uses helper implementation in
  else await webCam(); // setup webcam as input stream

  // preferred run in two loops, one for actual detection and one that draws interpolated results on screen so results appear much smoother
  await detectionLoop();
  await drawLoop();

  // alternative run in single loop where we run detection and then draw results
  // await singleLoop();
}

window.onload = main;
