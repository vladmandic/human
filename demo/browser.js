import Human from '../dist/human.esm.js';
import draw from './draw.js';
import Menu from './menu.js';

const human = new Human();

// ui options
const ui = {
  baseColor: 'rgba(173, 216, 230, 0.3)', // this is 'lightblue', just with alpha channel
  baseBackground: 'rgba(50, 50, 50, 1)', // this is 'lightblue', just with alpha channel
  baseLabel: 'rgba(173, 216, 230, 0.9)',
  baseFontProto: 'small-caps {size} "Segoe UI"',
  baseLineWidth: 16,
  baseLineHeightProto: 2,
  columns: 2,
  busy: false,
  facing: true,
  useWorker: false,
  worker: 'worker.js',
  samples: ['../assets/sample6.jpg', '../assets/sample1.jpg', '../assets/sample4.jpg', '../assets/sample5.jpg', '../assets/sample3.jpg', '../assets/sample2.jpg'],
  drawBoxes: true,
  drawPoints: false,
  drawPolygons: true,
  fillPolygons: true,
  useDepth: true,
  console: true,
  maxFrames: 10,
};

// configuration overrides
const config = {
  backend: 'webgl',
  profile: false,
  deallocate: false,
  wasm: { path: '../assets' },
  filter: {
    enabled: true,
    width: 0,
    height: 0,
    brightness: 0,
    contrast: 0,
    sharpness: 0,
    blur: 0,
    saturation: 0,
    hue: 0,
    negative: false,
    sepia: false,
    vintage: false,
    kodachrome: false,
    technicolor: false,
    polaroid: false,
    pixelate: 0 },
  videoOptimized: true,
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
let menu;
let menuFX;
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
function drawResults(input, result, canvas) {
  // update fps
  fps.push(1000 / (performance.now() - timeStamp));
  if (fps.length > ui.maxFrames) fps.shift();
  menu.updateChart('FPS', fps);

  // eslint-disable-next-line no-use-before-define
  requestAnimationFrame(() => runHumanDetect(input, canvas)); // immediate loop

  // draw image from video
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = ui.baseBackground;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (result.canvas) ctx.drawImage(result.canvas, 0, 0, result.canvas.width, result.canvas.height, 0, 0, result.canvas.width, result.canvas.height);
  else ctx.drawImage(input, 0, 0, input.width, input.height, 0, 0, canvas.width, canvas.height);
  // draw all results
  draw.face(result.face, canvas, ui, human.facemesh.triangulation);
  draw.body(result.body, canvas, ui);
  draw.hand(result.hand, canvas, ui);
  // update log
  const engine = human.tf.engine();
  const memory = `${engine.state.numBytes.toLocaleString()} bytes ${engine.state.numDataBuffers.toLocaleString()} buffers ${engine.state.numTensors.toLocaleString()} tensors`;
  const gpu = engine.backendInstance ? `GPU: ${(engine.backendInstance.numBytesInGPU ? engine.backendInstance.numBytesInGPU : 0).toLocaleString()} bytes` : '';
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
  let msg = `Setting up camera: live: ${live} facing: ${ui.facing ? 'front' : 'back'}`;
  output.innerText += `\n${msg}`;
  log(msg);
  // setup webcam. note that navigator.mediaDevices requires that page is accessed via https
  if (!navigator.mediaDevices) {
    msg = 'Camera access not supported';
    output.innerText += `\n${msg}`;
    log(msg);
    return null;
  }
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: (ui.facing ? 'user' : 'environment'), width: window.innerWidth, height: window.innerHeight },
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
      canvas.width = video.width;
      canvas.height = video.height;
      if (live) video.play();
      ui.busy = false;
      // do once more because onresize events can be delayed or skipped
      if (video.width > window.innerWidth) await setupCamera();
      output.innerText += `\nCamera resolution: ${video.width} x ${video.height}`;
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
function runHumanDetect(input, canvas) {
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
      human.detect(input, config).then((result) => {
        if (result.error) log(result.error);
        else drawResults(input, result, canvas);
        if (config.profile) log('Profile data:', human.profile());
      });
    }
  }
}

// main processing function when input is image, can use direct invocation or web worker
async function processImage(input) {
  timeStamp = performance.now();
  return new Promise((resolve) => {
    const image = document.getElementById('image');
    image.onload = async () => {
      log('Processing image:', image.src);
      const canvas = document.getElementById('canvas');
      image.width = image.naturalWidth;
      image.height = image.naturalHeight;
      canvas.width = config.filter.width && config.filter.width > 0 ? config.filter.width : image.naturalWidth;
      canvas.height = config.filter.height && config.filter.height > 0 ? config.filter.height : image.naturalHeight;
      const result = await human.detect(image, config);
      drawResults(image, result, canvas);
      const thumb = document.createElement('canvas');
      thumb.width = window.innerWidth / (ui.columns + 0.1);
      thumb.height = canvas.height / (window.innerWidth / thumb.width);
      thumb.style.margin = '8px';
      thumb.style.boxShadow = '4px 4px 4px 0 dimgrey';
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
  if ((video.srcObject !== null) && !video.paused) {
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
  ui.baseFont = ui.baseFontProto.replace(/{size}/, `${1.2 * ui.columns}rem`);
  ui.baseLineHeight = ui.baseLineHeightProto * ui.columns;
  document.getElementById('canvas').style.display = 'none';
  document.getElementById('samples').style.display = 'block';
  log('Running detection of sample images');
  for (const sample of ui.samples) await processImage(sample);
}

function setupMenu() {
  menu = new Menu(document.body, '...', { top: '1rem', right: '1rem' });
  menu.addButton('Start Video', 'Pause Video', (evt) => detectVideo(evt));
  menu.addButton('Process Images', 'Process Images', () => detectSampleImages());

  menu.addHTML('<hr style="min-width: 200px; border-style: inset; border-color: dimgray">');
  menu.addList('Backend', ['cpu', 'webgl', 'wasm', 'webgpu'], config.backend, (val) => config.backend = val);
  menu.addBool('Enable Profiler', config, 'profile');
  menu.addBool('Memory Deallocator', config, 'deallocate');
  menu.addBool('Use Web Worker', ui, 'useWorker');
  menu.addHTML('<hr style="min-width: 200px; border-style: inset; border-color: dimgray">');
  menu.addLabel('Enabled Models');
  menu.addBool('Face Detect', config.face, 'enabled');
  menu.addBool('Face Mesh', config.face.mesh, 'enabled');
  menu.addBool('Face Iris', config.face.iris, 'enabled');
  menu.addBool('Face Age', config.face.age, 'enabled');
  menu.addBool('Face Gender', config.face.gender, 'enabled');
  menu.addBool('Face Emotion', config.face.emotion, 'enabled');
  menu.addBool('Body Pose', config.body, 'enabled');
  menu.addBool('Hand Pose', config.hand, 'enabled');

  menu.addHTML('<hr style="min-width: 200px; border-style: inset; border-color: dimgray">');
  menu.addLabel('Model Parameters');
  menu.addRange('Max Objects', config.face.detector, 'maxFaces', 0, 50, 1, (val) => {
    config.face.detector.maxFaces = parseInt(val);
    config.body.maxDetections = parseInt(val);
    config.hand.maxHands = parseInt(val);
  });
  menu.addRange('Skip Frames', config.face.detector, 'skipFrames', 0, 50, 1, (val) => {
    config.face.detector.skipFrames = parseInt(val);
    config.face.emotion.skipFrames = parseInt(val);
    config.face.age.skipFrames = parseInt(val);
    config.hand.skipFrames = parseInt(val);
  });
  menu.addRange('Min Confidence', config.face.detector, 'minConfidence', 0.0, 1.0, 0.05, (val) => {
    config.face.detector.minConfidence = parseFloat(val);
    config.face.emotion.minConfidence = parseFloat(val);
    config.hand.minConfidence = parseFloat(val);
  });
  menu.addRange('Score Threshold', config.face.detector, 'scoreThreshold', 0.1, 1.0, 0.05, (val) => {
    config.face.detector.scoreThreshold = parseFloat(val);
    config.hand.scoreThreshold = parseFloat(val);
    config.body.scoreThreshold = parseFloat(val);
  });
  menu.addRange('IOU Threshold', config.face.detector, 'iouThreshold', 0.1, 1.0, 0.05, (val) => {
    config.face.detector.iouThreshold = parseFloat(val);
    config.hand.iouThreshold = parseFloat(val);
  });

  menu.addHTML('<hr style="min-width: 200px; border-style: inset; border-color: dimgray">');
  menu.addChart('FPS', 'FPS');

  menuFX = new Menu(document.body, '...', { top: '1rem', right: '18rem' });
  menuFX.addLabel('UI Options');
  menuFX.addBool('Camera Front/Back', ui, 'facing', () => setupCamera());
  menuFX.addBool('Use 3D Depth', ui, 'useDepth');
  menuFX.addBool('Draw Boxes', ui, 'drawBoxes');
  menuFX.addBool('Draw Points', ui, 'drawPoints');
  menuFX.addBool('Draw Polygons', ui, 'drawPolygons');
  menuFX.addBool('Fill Polygons', ui, 'fillPolygons');
  menuFX.addHTML('<hr style="min-width: 200px; border-style: inset; border-color: dimgray">');
  menuFX.addLabel('Image Filters');
  menuFX.addBool('Enabled', config.filter, 'enabled');
  menuFX.addRange('Image width', config.filter, 'width', 100, 3840, 10, (val) => config.filter.width = parseInt(val));
  menuFX.addRange('Image height', config.filter, 'height', 100, 2160, 10, (val) => config.filter.height = parseInt(val));
  menuFX.addRange('Brightness', config.filter, 'brightness', -1.0, 1.0, 0.05, (val) => config.filter.brightness = parseFloat(val));
  menuFX.addRange('Contrast', config.filter, 'contrast', -1.0, 1.0, 0.05, (val) => config.filter.contrast = parseFloat(val));
  menuFX.addRange('Sharpness', config.filter, 'sharpness', 0, 1.0, 0.05, (val) => config.filter.sharpness = parseFloat(val));
  menuFX.addRange('Blur', config.filter, 'blur', 0, 20, 1, (val) => config.filter.blur = parseInt(val));
  menuFX.addRange('Saturation', config.filter, 'saturation', -1.0, 1.0, 0.05, (val) => config.filter.saturation = parseFloat(val));
  menuFX.addRange('Hue', config.filter, 'hue', 0, 360, 5, (val) => config.filter.hue = parseInt(val));
  menuFX.addRange('Pixelate', config.filter, 'pixelate', 0, 32, 1, (val) => config.filter.pixelate = parseInt(val));
  menuFX.addBool('Negative', config.filter, 'negative');
  menuFX.addBool('Sepia', config.filter, 'sepia');
  menuFX.addBool('Vintage', config.filter, 'vintage');
  menuFX.addBool('Kodachrome', config.filter, 'kodachrome');
  menuFX.addBool('Technicolor', config.filter, 'technicolor');
  menuFX.addBool('Polaroid', config.filter, 'polaroid');
}

async function main() {
  log('Human demo starting ...');
  setupMenu();
  const msg = `Human ready: version: ${human.version} TensorFlow/JS version: ${human.tf.version_core}`;
  document.getElementById('log').innerText += '\n' + msg;
  log(msg);
}

window.onload = main;
window.onresize = setupCamera;
