/**
 * Human demo for browsers
 * @default Human Library
 * @summary <https://github.com/vladmandic/human>
 * @author <https://github.com/vladmandic>
 * @copyright <https://github.com/vladmandic>
 * @license MIT
 */

import Human from '../../dist/human.custom.esm.js'; // equivalent of @vladmandic/human

const config = {
  modelBasePath: '../../models',
  backend: 'humangl',
  async: true,
};

const human = new Human(config);
let result;

const dom = {
  video: document.getElementById('video') as HTMLVideoElement,
  canvas: document.getElementById('canvas') as HTMLCanvasElement,
  log: document.getElementById('log') as HTMLPreElement,
  fps: document.getElementById('status') as HTMLPreElement,
  perf: document.getElementById('performance') as HTMLDivElement,
};

const fps = { detect: 0, draw: 0 };

const log = (...msg) => {
  dom.log.innerText += msg.join(' ') + '\n';
  // eslint-disable-next-line no-console
  console.log(...msg);
};
const status = (msg) => {
  dom.fps.innerText = msg;
};
const perf = (msg) => {
  dom.perf.innerText = 'performance: ' + JSON.stringify(msg).replace(/"|{|}/g, '').replace(/,/g, ' | ');
};

async function webCam() {
  status('starting webcam...');
  const options = { audio: false, video: { facingMode: 'user', resizeMode: 'none', width: { ideal: document.body.clientWidth } } };
  const stream: MediaStream = await navigator.mediaDevices.getUserMedia(options);
  const ready = new Promise((resolve) => { dom.video.onloadeddata = () => resolve(true); });
  dom.video.srcObject = stream;
  dom.video.play();
  await ready;
  dom.canvas.width = dom.video.videoWidth;
  dom.canvas.height = dom.video.videoHeight;
  const track: MediaStreamTrack = stream.getVideoTracks()[0];
  const capabilities: MediaTrackCapabilities = track.getCapabilities();
  const settings: MediaTrackSettings = track.getSettings();
  const constraints: MediaTrackConstraints = track.getConstraints();
  log('video:', dom.video.videoWidth, dom.video.videoHeight, track.label, { stream, track, settings, constraints, capabilities });
  dom.canvas.onclick = () => {
    if (dom.video.paused) dom.video.play();
    else dom.video.pause();
  };
}

async function detectionLoop() {
  const t0 = human.now();
  if (!dom.video.paused) {
    result = await human.detect(dom.video);
  }
  const t1 = human.now();
  fps.detect = 1000 / (t1 - t0);
  requestAnimationFrame(detectionLoop);
}

async function drawLoop() {
  const t0 = human.now();
  if (!dom.video.paused) {
    const interpolated = await human.next(result);
    await human.draw.canvas(dom.video, dom.canvas);
    await human.draw.all(dom.canvas, interpolated);
    perf(interpolated.performance);
  }
  const t1 = human.now();
  fps.draw = 1000 / (t1 - t0);
  status(dom.video.paused ? 'paused' : `fps: ${fps.detect.toFixed(1).padStart(5, ' ')} detect / ${fps.draw.toFixed(1).padStart(5, ' ')} draw`);
  requestAnimationFrame(drawLoop);
}

async function main() {
  log('human version:', human.version, 'tfjs:', human.tf.version_core);
  log('platform:', human.env.platform, 'agent:', human.env.agent);
  human.env.perfadd = true;
  status('loading...');
  await human.load();
  status('initializing...');
  log('backend:', human.tf.getBackend(), 'available:', human.env.backends);
  await human.warmup();
  await webCam();
  await detectionLoop();
  await drawLoop();
}

window.onload = main;
