/* global QuickSettings */

import human from '../dist/human.esm.js';
import draw from './draw.js';

// ui options
const ui = {
  baseColor: 'rgba(255, 200, 255, 0.3)',
  baseLabel: 'rgba(255, 200, 255, 0.9)',
  baseFontProto: 'small-caps {size} "Segoe UI"',
  baseLineWidth: 16,
  baseLineHeightProto: 2,
  columns: 3,
  busy: false,
  facing: 'user',
  useWorker: false,
  worker: 'worker.js',
  samples: ['../assets/sample1.jpg', '../assets/sample2.jpg', '../assets/sample3.jpg', '../assets/sample4.jpg', '../assets/sample5.jpg', '../assets/sample6.jpg'],
  drawBoxes: true,
  drawPoints: false,
  drawPolygons: true,
  fillPolygons: true,
  useDepth: true,
  console: true,
};

// configuration overrides
const config = {
  face: {
    enabled: true,
    detector: { maxFaces: 10, skipFrames: 10, minConfidence: 0.5, iouThreshold: 0.3, scoreThreshold: 0.7 },
    mesh: { enabled: true },
    iris: { enabled: true },
    age: { enabled: true, skipFrames: 10 },
    gender: { enabled: true },
    emotion: { enabled: true, minConfidence: 0.5, useGrayscale: true },
  },
  body: { enabled: true, maxDetections: 10, scoreThreshold: 0.7, nmsRadius: 20 },
  hand: { enabled: true, skipFrames: 10, minConfidence: 0.5, iouThreshold: 0.3, scoreThreshold: 0.7 },
};

// global variables
let settings;
let worker;
let timeStamp;
const fps = [];

// helper function: translates json to human readable string
function str(...msg) {
  if (!Array.isArray(msg)) return msg;
  let line = '';
  for (const entry of msg) {
    if (typeof entry === 'object') line += JSON.stringify(entry).replace(/{|}|"|\[|\]/g, '').replace(/,/g, ', ');
    else line += entry;
  }
  return line;
}

// helper function: wrapper around console output
const log = (...msg) => {
  // eslint-disable-next-line no-console
  if (ui.console) console.log(...msg);
};

// draws processed results and starts processing of a next frame
async function drawResults(input, result, canvas) {
  // update fps
  settings.setValue('FPS', Math.round(1000 / (performance.now() - timeStamp)));
  fps.push(1000 / (performance.now() - timeStamp));
  if (fps.length > 20) fps.shift();
  settings.setValue('FPS', Math.round(10 * fps.reduce((a, b) => a + b) / fps.length) / 10);

  // eslint-disable-next-line no-use-before-define
  requestAnimationFrame(() => runHumanDetect(input, canvas)); // immediate loop

  // draw image from video
  const ctx = canvas.getContext('2d');
  ctx.drawImage(input, 0, 0, input.width, input.height, 0, 0, canvas.width, canvas.height);
  // draw all results
  draw.face(result.face, canvas, ui, human.facemesh.triangulation);
  draw.body(result.body, canvas, ui);
  draw.hand(result.hand, canvas, ui);
  // update log
  const engine = await human.tf.engine();
  const memory = `${engine.state.numBytes.toLocaleString()} bytes ${engine.state.numDataBuffers.toLocaleString()} buffers ${engine.state.numTensors.toLocaleString()} tensors`;
  const gpu = engine.backendInstance ? `GPU: ${engine.backendInstance.numBytesInGPU.toLocaleString()} bytes` : '';
  document.getElementById('log').innerText = `
    TFJS Version: ${human.tf.version_core} | Backend: ${human.tf.getBackend()} | Memory: ${memory} ${gpu}
    Performance: ${str(result.performance)} | Object size: ${(str(result)).length.toLocaleString()} bytes
  `;
}

// setup webcam
async function setupCamera() {
  if (ui.busy) return null;
  ui.busy = true;
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const output = document.getElementById('log');
  const live = video.srcObject ? ((video.srcObject.getVideoTracks()[0].readyState === 'live') && (video.readyState > 2) && (!video.paused)) : false;
  log(`Setting up camera: live: ${live} facing: ${ui.facing}`);
  // setup webcam. note that navigator.mediaDevices requires that page is accessed via https
  if (!navigator.mediaDevices) {
    const msg = 'Camera access not supported';
    output.innerText += '\n' + msg;
    log(msg);
    return null;
  }
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: ui.facing, width: window.innerWidth, height: window.innerHeight },
    });
  } catch (err) {
    output.innerText += '\nCamera permission denied';
    log(err);
  }
  if (stream) video.srcObject = stream;
  else return null;
  return new Promise((resolve) => {
    video.onloadeddata = async () => {
      video.width = video.videoWidth;
      video.height = video.videoHeight;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      if (live) video.play();
      ui.busy = false;
      // do once more because onresize events can be delayed or skipped
      if (video.width !== window.innerWidth) await setupCamera();
      resolve(video);
    };
  });
}

// wrapper for worker.postmessage that creates worker if one does not exist
function webWorker(input, image, canvas) {
  if (!worker) {
    // create new webworker and add event handler only once
    log('Creating worker thread');
    worker = new Worker(ui.worker, { type: 'module' });
    // after receiving message from webworker, parse&draw results and send new frame for processing
    worker.addEventListener('message', (msg) => drawResults(input, msg.data, canvas));
  }
  // pass image data as arraybuffer to worker by reference to avoid copy
  worker.postMessage({ image: image.data.buffer, width: canvas.width, height: canvas.height, config }, [image.data.buffer]);
}

// main processing function when input is webcam, can use direct invocation or web worker
async function runHumanDetect(input, canvas) {
  timeStamp = performance.now();
  // perform detect if live video or not video at all
  if (input.srcObject) {
    // if video not ready, just redo
    const live = (input.srcObject.getVideoTracks()[0].readyState === 'live') && (input.readyState > 2) && (!input.paused);
    if (!live) {
      if (!input.paused) log(`Video not ready: state: ${input.srcObject.getVideoTracks()[0].readyState} stream state: ${input.readyState}`);
      setTimeout(() => runHumanDetect(input, canvas), 500);
      return;
    }
    if (ui.useWorker) {
      // get image data from video as we cannot send html objects to webworker
      const offscreen = new OffscreenCanvas(canvas.width, canvas.height);
      const ctx = offscreen.getContext('2d');
      ctx.drawImage(input, 0, 0, input.width, input.height, 0, 0, canvas.width, canvas.height);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      // perform detection in worker
      webWorker(input, data, canvas);
    } else {
      let result = {};
      try {
        // perform detection
        result = await human.detect(input, config);
      } catch (err) {
        log('Error during execution:', err.message);
      }
      if (result.error) log(result.error);
      else drawResults(input, result, canvas);
    }
  }
}

// main processing function when input is image, can use direct invocation or web worker
async function processImage(input) {
  const cfg = {
    backend: 'webgl',
    console: true,
    face: {
      enabled: true,
      detector: { maxFaces: 10, skipFrames: 0, minConfidence: 0.1, iouThreshold: 0.3, scoreThreshold: 0.3 },
      mesh: { enabled: true },
      iris: { enabled: true },
      age: { enabled: true, skipFrames: 0 },
      gender: { enabled: true },
      emotion: { enabled: true, minConfidence: 0.1, useGrayscale: true },
    },
    body: { enabled: true, maxDetections: 10, scoreThreshold: 0.7, nmsRadius: 20 },
    hand: { enabled: true, skipFrames: 0, minConfidence: 0.5, iouThreshold: 0.3, scoreThreshold: 0.5 },
  };
  return new Promise((resolve) => {
    const image = document.getElementById('image');
    image.onload = async () => {
      log('Processing image:', image.src);
      const canvas = document.getElementById('canvas');
      image.width = image.naturalWidth;
      image.height = image.naturalHeight;
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const result = await human.detect(image, cfg);
      await drawResults(image, result, canvas);
      const thumb = document.createElement('canvas');
      thumb.width = window.innerWidth / (ui.columns + 0.02);
      thumb.height = canvas.height / (window.innerWidth / thumb.width);
      const ctx = thumb.getContext('2d');
      ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, thumb.width, thumb.height);
      document.getElementById('samples').appendChild(thumb);
      image.src = '';
      resolve(true);
    };
    image.src = input;
  });
}

// just initialize everything and call main function
async function detectVideo() {
  document.getElementById('samples').style.display = 'none';
  document.getElementById('canvas').style.display = 'block';
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  ui.baseFont = ui.baseFontProto.replace(/{size}/, '1.2rem');
  ui.baseLineHeight = ui.baseLineHeightProto;
  if (!video.paused) {
    document.getElementById('log').innerText += '\nPaused ...';
    video.pause();
  } else {
    await setupCamera();
    document.getElementById('log').innerText += '\nStarting Human Library ...';
    video.play();
  }
  runHumanDetect(video, canvas);
}

// just initialize everything and call main function
async function detectSampleImages() {
  ui.baseFont = ui.baseFontProto.replace(/{size}/, `${ui.columns}rem`);
  ui.baseLineHeight = ui.baseLineHeightProto * ui.columns;
  document.getElementById('canvas').style.display = 'none';
  document.getElementById('samples').style.display = 'block';
  log('Running detection of sample images');
  for (const sample of ui.samples) await processImage(sample);
}

// setup settings panel
function setupUI() {
  settings = QuickSettings.create(10, 10, 'Settings', document.getElementById('main'));
  const style = document.createElement('style');
  style.innerHTML = `
    .qs_main { font: 1rem "Segoe UI"; }
    .qs_label { font: 0.8rem "Segoe UI"; }
    .qs_content { background: darkslategray; }
    .qs_container { background: transparent; color: white; margin: 6px; padding: 6px; }
    .qs_checkbox_label { top: 2px; }
    .qs_button { width: -webkit-fill-available; font: 1rem "Segoe UI"; cursor: pointer; }
  `;
  document.getElementsByTagName('head')[0].appendChild(style);
  settings.addButton('Play/Pause WebCam', () => detectVideo());
  settings.addButton('Process Images', () => detectSampleImages());
  settings.addDropDown('Backend', ['webgl', 'wasm', 'cpu'], async (val) => config.backend = val.value);
  settings.addHTML('title', 'Enabled Models'); settings.hideTitle('title');
  settings.addBoolean('Face Detect', config.face.enabled, (val) => config.face.enabled = val);
  settings.addBoolean('Face Mesh', config.face.mesh.enabled, (val) => config.face.mesh.enabled = val);
  settings.addBoolean('Face Iris', config.face.iris.enabled, (val) => config.face.iris.enabled = val);
  settings.addBoolean('Face Age', config.face.age.enabled, (val) => config.face.age.enabled = val);
  settings.addBoolean('Face Gender', config.face.gender.enabled, (val) => config.face.gender.enabled = val);
  settings.addBoolean('Face Emotion', config.face.emotion.enabled, (val) => config.face.emotion.enabled = val);
  settings.addBoolean('Body Pose', config.body.enabled, (val) => config.body.enabled = val);
  settings.addBoolean('Hand Pose', config.hand.enabled, (val) => config.hand.enabled = val);
  settings.addHTML('title', 'Model Parameters'); settings.hideTitle('title');
  settings.addRange('Max Objects', 1, 20, 5, 1, (val) => {
    config.face.detector.maxFaces = parseInt(val);
    config.body.maxDetections = parseInt(val);
  });
  settings.addRange('Skip Frames', 1, 20, config.face.detector.skipFrames, 1, (val) => {
    config.face.detector.skipFrames = parseInt(val);
    config.face.emotion.skipFrames = parseInt(val);
    config.face.age.skipFrames = parseInt(val);
    config.hand.skipFrames = parseInt(val);
  });
  settings.addRange('Min Confidence', 0.1, 1.0, config.face.detector.minConfidence, 0.05, (val) => {
    config.face.detector.minConfidence = parseFloat(val);
    config.face.emotion.minConfidence = parseFloat(val);
    config.hand.minConfidence = parseFloat(val);
  });
  settings.addRange('Score Threshold', 0.1, 1.0, config.face.detector.scoreThreshold, 0.05, (val) => {
    config.face.detector.scoreThreshold = parseFloat(val);
    config.hand.scoreThreshold = parseFloat(val);
    config.body.scoreThreshold = parseFloat(val);
  });
  settings.addRange('IOU Threshold', 0.1, 1.0, config.face.detector.iouThreshold, 0.05, (val) => {
    config.face.detector.iouThreshold = parseFloat(val);
    config.hand.iouThreshold = parseFloat(val);
  });
  settings.addHTML('title', 'UI Options'); settings.hideTitle('title');
  settings.addBoolean('Use Web Worker', ui.useWorker, (val) => ui.useWorker = val);
  settings.addBoolean('Camera Front/Back', true, (val) => {
    ui.facing = val ? 'user' : 'environment';
    setupCamera();
  });
  settings.addBoolean('Use 3D Depth', ui.useDepth, (val) => ui.useDepth = val);
  settings.addBoolean('Draw Boxes', ui.drawBoxes, (val) => ui.drawBoxes = val);
  settings.addBoolean('Draw Points', ui.drawPoints, (val) => ui.drawPoints = val);
  settings.addBoolean('Draw Polygons', ui.drawPolygons, (val) => ui.drawPolygons = val);
  settings.addBoolean('Fill Polygons', ui.fillPolygons, (val) => ui.fillPolygons = val);
  settings.addHTML('line1', '<hr>'); settings.hideTitle('line1');
  settings.addRange('FPS', 0, 100, 0, 1);
}

async function main() {
  log('Human demo starting ...');
  setupUI();
  const msg = `Human ready: version: ${human.version} TensorFlow/JS version: ${human.tf.version_core}`;
  document.getElementById('log').innerText += '\n' + msg;
  log(msg);
}

window.onload = main;
window.onresize = setupCamera;
