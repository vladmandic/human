/**
 * Human demo for browsers
 * @description Simple Human demo for browsers using WebCam
 */

import Human from '../../dist/human.custom.esm.js'; // equivalent of @vladmandic/human

const config = {
  modelBasePath: '../../models',
  backend: 'humangl',
};

const human = new Human(config);
let result;

const video = document.getElementById('video') as HTMLVideoElement;
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const fps = { detect: 0, draw: 0, element: document.getElementById('status') };

// eslint-disable-next-line no-console
const log = (...msg) => console.log(...msg);
const status = (msg) => { if (fps.element) fps.element.innerText = msg; };

async function webCam() {
  status('starting webcam...');
  const options = { audio: false, video: { facingMode: 'user', resizeMode: 'none', width: { ideal: document.body.clientWidth } } };
  const stream: MediaStream = await navigator.mediaDevices.getUserMedia(options);
  const ready = new Promise((resolve) => { video.onloadeddata = () => resolve(true); });
  video.srcObject = stream;
  video.play();
  await ready;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const track: MediaStreamTrack = stream.getVideoTracks()[0];
  const capabilities: MediaTrackCapabilities = track.getCapabilities();
  const settings: MediaTrackSettings = track.getSettings();
  const constraints: MediaTrackConstraints = track.getConstraints();
  log('video:', video.videoWidth, video.videoHeight, { stream, track, settings, constraints, capabilities });
  canvas.onclick = () => {
    if (video.paused) video.play();
    else video.pause();
  };
}

async function detectionLoop() {
  const t0 = human.now();
  if (!video.paused) result = await human.detect(video);
  const t1 = human.now();
  fps.detect = 1000 / (t1 - t0);
  requestAnimationFrame(detectionLoop);
}

async function drawLoop() {
  const t0 = human.now();
  if (!video.paused) {
    const interpolated = await human.next(result);
    await human.draw.canvas(video, canvas);
    await human.draw.all(canvas, interpolated);
  }
  const t1 = human.now();
  fps.draw = 1000 / (t1 - t0);
  status(video.paused ? 'paused' : `fps: ${fps.detect.toFixed(1).padStart(5, ' ')} detect / ${fps.draw.toFixed(1).padStart(5, ' ')} draw`);
  requestAnimationFrame(drawLoop);
}

async function main() {
  status('loading...');
  await human.load();
  status('initializing...');
  await human.warmup();
  await webCam();
  await detectionLoop();
  await drawLoop();
}

window.onload = main;
