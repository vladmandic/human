/**
 * Human demo for browsers
 *
 * @description Experimental Demo app for Human using WebGPU
 *
 */
// @ts-nocheck // typescript checks disabled as this is pure javascript

import '../../node_modules/@tensorflow/tfjs-core/dist/tf-core.es2017.js';
import '../../assets/tf-backend-webgpu.es2017.js';
import Human from '../../dist/human.esm.js';

let human;
let canvas;
let video;
let result;

const myConfig = {
  backend: 'webgl',
  async: true,
  warmup: 'none',
  modelBasePath: '../../models',
  cacheSensitivity: 0,
  filter: {
    enabled: true,
    flip: false,
  },
  face: { enabled: true,
    detector: { return: false, rotation: false },
    mesh: { enabled: true },
    iris: { enabled: false },
    description: { enabled: true },
    emotion: { enabled: false },
  },
  object: { enabled: false },
  gesture: { enabled: true },
  hand: { enabled: true, rotation: false },
  body: { enabled: true },
  segmentation: { enabled: false },
};

let time = 0;

function log(...msg) {
  const dt = new Date();
  const ts = `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}.${dt.getMilliseconds().toString().padStart(3, '0')}`;
  // eslint-disable-next-line no-console
  console.log(ts, ...msg);
}

async function drawResults() {
  const interpolated = human.next(result);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  await human.draw.all(canvas, interpolated);
  document.getElementById('log').innerText = `Human: version ${human.version} | ${Math.trunc(time)} ms | FPS: ${Math.trunc(10000 / time) / 10}`;
  requestAnimationFrame(drawResults);
}

async function runDetection() {
  const t0 = performance.now();
  result = await human.detect(video);
  time = performance.now() - t0;
  requestAnimationFrame(runDetection);
}

async function setupCamera() {
  video = document.getElementById('video');
  canvas = document.getElementById('canvas');
  const output = document.getElementById('log');
  let stream;
  const constraints = {
    audio: false,
    video: {
      facingMode: 'user',
      resizeMode: 'crop-and-scale',
      width: { ideal: document.body.clientWidth },
      // height: { ideal: document.body.clientHeight }, // not set as we're using aspectRation to get height instead
      aspectRatio: document.body.clientWidth / document.body.clientHeight,
    },
  };
  // enumerate devices for diag purposes
  navigator.mediaDevices.enumerateDevices().then((devices) => log('enumerated input devices:', devices));
  log('camera constraints', constraints);
  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
  } catch (err) {
    output.innerText += `\n${err.name}: ${err.message}`;
    status(err.name);
    log('camera error:', err);
  }
  const tracks = stream.getVideoTracks();
  log('enumerated viable tracks:', tracks);
  const track = stream.getVideoTracks()[0];
  const settings = track.getSettings();
  log('selected video source:', track, settings);
  const promise = !stream || new Promise((resolve) => {
    video.onloadeddata = () => {
      if (settings.width > settings.height) canvas.style.width = '100vw';
      else canvas.style.height = '100vh';
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      video.play();
      resolve();
    };
  });
  // attach input to video element
  if (stream) video.srcObject = stream;
  return promise;
}

async function main() {
  human = new Human(myConfig);
  document.getElementById('log').innerText = `Human: version ${human.version}`;
  await setupCamera();
  runDetection();
  drawResults();
}

window.onload = main;
