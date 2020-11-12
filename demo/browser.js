import Human from '../dist/human.esm.js';
import draw from './draw.js';
import Menu from './menu.js';

const userConfig = {}; // add any user configuration overrides

const human = new Human(userConfig);

// ui options
const ui = {
  baseColor: 'rgba(173, 216, 230, 0.3)', // 'lightblue' with light alpha channel
  baseBackground: 'rgba(50, 50, 50, 1)', // 'grey'
  baseLabel: 'rgba(173, 216, 230, 0.9)', // 'lightblue' with dark alpha channel
  baseFontProto: 'small-caps {size} "Segoe UI"',
  baseLineWidth: 12,
  baseLineHeightProto: 2,
  crop: true,
  columns: 2,
  busy: false,
  facing: true,
  useWorker: false,
  worker: 'demo/worker.js',
  samples: ['../assets/sample6.jpg', '../assets/sample1.jpg', '../assets/sample4.jpg', '../assets/sample5.jpg', '../assets/sample3.jpg', '../assets/sample2.jpg'],
  drawBoxes: true,
  drawPoints: false,
  drawPolygons: true,
  fillPolygons: false,
  useDepth: true,
  console: true,
  maxFPSframes: 10,
  modelsPreload: true,
  modelsWarmup: true,
  menuWidth: 0,
  menuHeight: 0,
  camera: {},
  fps: [],
  buffered: false,
  bufferedFPSTarget: 24,
  drawThread: null,
  framesDraw: 0,
  framesDetect: 0,
};

// global variables
let menu;
let menuFX;
let worker;
let lastDetectedResult = {};

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

const status = (msg) => {
  // eslint-disable-next-line no-console
  document.getElementById('status').innerText = msg;
};

// draws processed results and starts processing of a next frame
async function drawResults(input) {
  const result = lastDetectedResult;
  const canvas = document.getElementById('canvas');

  // update fps data
  // const elapsed = performance.now() - timeStamp;
  ui.fps.push(1000 / result.performance.total);
  if (ui.fps.length > ui.maxFPSframes) ui.fps.shift();

  // enable for continous performance monitoring
  // console.log(result.performance);

  // draw fps chart
  await menu.updateChart('FPS', ui.fps);

  // get updated canvas
  result.canvas = await human.image(input, userConfig);

  // draw image from video
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = ui.baseBackground;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (result.canvas) {
    if (result.canvas.width !== canvas.width) canvas.width = result.canvas.width;
    if (result.canvas.height !== canvas.height) canvas.height = result.canvas.height;
    ctx.drawImage(result.canvas, 0, 0, result.canvas.width, result.canvas.height, 0, 0, result.canvas.width, result.canvas.height);
  } else {
    ctx.drawImage(input, 0, 0, input.width, input.height, 0, 0, canvas.width, canvas.height);
  }
  // draw all results
  await draw.face(result.face, canvas, ui, human.facemesh.triangulation);
  await draw.body(result.body, canvas, ui);
  await draw.hand(result.hand, canvas, ui);
  await draw.gesture(result.gesture, canvas, ui);
  // update log
  const engine = human.tf.engine();
  const gpu = engine.backendInstance ? `gpu: ${(engine.backendInstance.numBytesInGPU ? engine.backendInstance.numBytesInGPU : 0).toLocaleString()} bytes` : '';
  const memory = `system: ${engine.state.numBytes.toLocaleString()} bytes ${gpu} | tensors: ${engine.state.numTensors.toLocaleString()}`;
  const processing = result.canvas ? `processing: ${result.canvas.width} x ${result.canvas.height}` : '';
  const avg = Math.trunc(10 * ui.fps.reduce((a, b) => a + b) / ui.fps.length) / 10;
  const warning = (ui.fps.length > 5) && (avg < 5) ? '<font color="lightcoral">warning: your performance is low: try switching to higher performance backend, lowering resolution or disabling some models</font>' : '';
  document.getElementById('log').innerHTML = `
    video: ${ui.camera.name} | facing: ${ui.camera.facing} | resolution: ${ui.camera.width} x ${ui.camera.height} ${processing}<br>
    backend: ${human.tf.getBackend()} | ${memory}<br>
    performance: ${str(result.performance)} FPS:${avg}<br>
    ${warning}
  `;

  ui.framesDraw++;
  ui.lastFrame = performance.now();
  // if buffered, immediate loop but limit frame rate although it's going to run slower as JS is singlethreaded
  if (ui.buffered && !ui.drawThread) ui.drawThread = setInterval(() => drawResults(input, canvas), 1000 / ui.bufferedFPSTarget);
  // stop buffering
  if (!ui.buffered && ui.drawThread) {
    clearTimeout(ui.drawThread);
    ui.drawThread = null;
  }
}

// setup webcam
async function setupCamera() {
  if (ui.busy) return null;
  ui.busy = true;
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const output = document.getElementById('log');
  const live = video.srcObject ? ((video.srcObject.getVideoTracks()[0].readyState === 'live') && (video.readyState > 2) && (!video.paused)) : false;
  let msg = '';
  status('setting up camera');
  // setup webcam. note that navigator.mediaDevices requires that page is accessed via https
  if (!navigator.mediaDevices) {
    msg = 'camera access not supported';
    output.innerText += `\n${msg}`;
    log(msg);
    status(msg);
    return null;
  }
  let stream;
  const constraints = {
    audio: false,
    video: {
      facingMode: ui.facing ? 'user' : 'environment',
      resizeMode: ui.crop ? 'crop-and-scale' : 'none',
      width: { ideal: window.innerWidth },
      height: { ideal: window.innerHeight },
    },
  };
  try {
    // if (window.innerWidth > window.innerHeight) constraints.video.width = { ideal: window.innerWidth };
    // else constraints.video.height = { ideal: window.innerHeight };
    stream = await navigator.mediaDevices.getUserMedia(constraints);
  } catch (err) {
    if (err.name === 'PermissionDeniedError') msg = 'camera permission denied';
    else if (err.name === 'SourceUnavailableError') msg = 'camera not available';
    else msg = 'camera error';
    output.innerText += `\n${msg}`;
    status(msg);
    log(err);
  }
  if (stream) video.srcObject = stream;
  else return null;
  const track = stream.getVideoTracks()[0];
  const settings = track.getSettings();
  // log('camera constraints:', constraints, 'window:', { width: window.innerWidth, height: window.innerHeight }, 'settings:', settings, 'track:', track);
  ui.camera = { name: track.label?.toLowerCase(), width: settings.width, height: settings.height, facing: settings.facingMode === 'user' ? 'front' : 'back' };
  return new Promise((resolve) => {
    video.onloadeddata = async () => {
      video.width = video.videoWidth;
      video.height = video.videoHeight;
      canvas.width = video.width;
      canvas.height = video.height;
      canvas.style.width = canvas.width > canvas.height ? '100vw' : '';
      canvas.style.height = canvas.width > canvas.height ? '' : '100vh';
      ui.menuWidth.input.setAttribute('value', video.width);
      ui.menuHeight.input.setAttribute('value', video.height);
      // silly font resizing for paint-on-canvas since viewport can be zoomed
      const size = 14 + (6 * canvas.width / window.innerWidth);
      ui.baseFont = ui.baseFontProto.replace(/{size}/, `${size}px`);
      if (live) video.play();
      ui.busy = false;
      // do once more because onresize events can be delayed or skipped
      // if (video.width > window.innerWidth) await setupCamera();
      status('');
      resolve(video);
    };
  });
}

// wrapper for worker.postmessage that creates worker if one does not exist
function webWorker(input, image, canvas) {
  if (!worker) {
    // create new webworker and add event handler only once
    log('creating worker thread');
    worker = new Worker(ui.worker, { type: 'module' });
    worker.warned = false;
    // after receiving message from webworker, parse&draw results and send new frame for processing
    worker.addEventListener('message', (msg) => {
      if (!worker.warned) {
        log('warning: cannot transfer canvas from worked thread');
        log('warning: image will not show filter effects');
        worker.warned = true;
      }
      lastDetectedResult = msg.data.result;
      ui.framesDetect++;
      if (!ui.drawThread) drawResults(input);
      // eslint-disable-next-line no-use-before-define
      requestAnimationFrame(() => runHumanDetect(input, canvas));
    });
  }
  // pass image data as arraybuffer to worker by reference to avoid copy
  worker.postMessage({ image: image.data.buffer, width: canvas.width, height: canvas.height }, [image.data.buffer]);
}

// main processing function when input is webcam, can use direct invocation or web worker
function runHumanDetect(input, canvas) {
  // if live video
  const live = input.srcObject && (input.srcObject.getVideoTracks()[0].readyState === 'live') && (input.readyState > 2) && (!input.paused);
  if (!live && input.srcObject) {
    // stop ui refresh
    if (ui.drawThread) clearTimeout(ui.drawThread);
    ui.drawThread = null;
    // if we want to continue and camera not ready, retry in 0.5sec, else just give up
    if (input.paused) log('camera paused');
    else if ((input.srcObject.getVideoTracks()[0].readyState === 'live') && (input.readyState <= 2)) setTimeout(() => runHumanDetect(input, canvas), 500);
    else log(`camera not ready: track state: ${input.srcObject?.getVideoTracks()[0].readyState} stream state: ${input.readyState}`);
    clearTimeout(ui.drawThread);
    ui.drawThread = null;
    log('frame statistics: drawn:', ui.framesDraw, 'detected:', ui.framesDetect);
    return;
  }
  status('');
  if (ui.useWorker) {
    // get image data from video as we cannot send html objects to webworker
    const offscreen = new OffscreenCanvas(canvas.width, canvas.height);
    const ctx = offscreen.getContext('2d');
    ctx.drawImage(input, 0, 0, input.width, input.height, 0, 0, canvas.width, canvas.height);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // perform detection in worker
    webWorker(input, data, canvas, userConfig);
  } else {
    human.detect(input, userConfig).then((result) => {
      if (result.error) log(result.error);
      else {
        lastDetectedResult = result;
        if (!ui.drawThread) drawResults(input);
        ui.framesDetect++;
        requestAnimationFrame(() => runHumanDetect(input, canvas));
      }
    });
  }
}

// main processing function when input is image, can use direct invocation or web worker
async function processImage(input) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = async () => {
      log('Processing image:', image.src);
      const canvas = document.getElementById('canvas');
      image.width = image.naturalWidth;
      image.height = image.naturalHeight;
      canvas.width = human.config.filter.width && human.config.filter.width > 0 ? human.config.filter.width : image.naturalWidth;
      canvas.height = human.config.filter.height && human.config.filter.height > 0 ? human.config.filter.height : image.naturalHeight;
      const result = await human.detect(image, userConfig);
      drawResults(image, result, canvas);
      const thumb = document.createElement('canvas');
      thumb.className = 'thumbnail';
      thumb.width = window.innerWidth / (ui.columns + 0.1);
      thumb.height = canvas.height / (window.innerWidth / thumb.width);
      const ctx = thumb.getContext('2d');
      ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, thumb.width, thumb.height);
      document.getElementById('samples-container').appendChild(thumb);
      image.src = '';
      resolve(true);
    };
    image.src = input;
  });
}

// just initialize everything and call main function
async function detectVideo() {
  human.config.videoOptimized = true;
  document.getElementById('samples-container').style.display = 'none';
  document.getElementById('canvas').style.display = 'block';
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  ui.baseLineHeight = ui.baseLineHeightProto;
  if ((video.srcObject !== null) && !video.paused) {
    document.getElementById('play').style.display = 'block';
    status('paused');
    video.pause();
  } else {
    await setupCamera();
    document.getElementById('play').style.display = 'none';
    status('');
    video.play();
  }
  runHumanDetect(video, canvas);
}

// just initialize everything and call main function
async function detectSampleImages() {
  document.getElementById('play').style.display = 'none';
  human.config.videoOptimized = false;
  const size = 12 + Math.trunc(12 * ui.columns * window.innerWidth / document.body.clientWidth);
  ui.baseFont = ui.baseFontProto.replace(/{size}/, `${size}px`);
  ui.baseLineHeight = ui.baseLineHeightProto * ui.columns;
  document.getElementById('canvas').style.display = 'none';
  document.getElementById('samples-container').style.display = 'block';
  log('Running detection of sample images');
  status('processing images');
  document.getElementById('samples-container').innerHTML = '';
  for (const sample of ui.samples) await processImage(sample);
  status('');
}

function setupMenu() {
  menu = new Menu(document.body, '', { top: '1rem', right: '1rem' });
  const btn = menu.addButton('start video', 'pause video', () => detectVideo());
  menu.addButton('process images', 'process images', () => detectSampleImages());
  document.getElementById('play').addEventListener('click', () => btn.click());

  menu.addHTML('<hr style="min-width: 200px; border-style: inset; border-color: dimgray">');
  menu.addList('backend', ['cpu', 'webgl', 'wasm'], human.config.backend, (val) => human.config.backend = val);
  menu.addBool('async operations', human.config, 'async', (val) => human.config.async = val);
  menu.addBool('enable profiler', human.config, 'profile', (val) => human.config.profile = val);
  menu.addBool('memory shield', human.config, 'deallocate', (val) => human.config.deallocate = val);
  menu.addBool('use web worker', ui, 'useWorker');
  menu.addHTML('<hr style="min-width: 200px; border-style: inset; border-color: dimgray">');
  menu.addLabel('enabled models');
  menu.addBool('face detect', human.config.face, 'enabled');
  menu.addBool('face mesh', human.config.face.mesh, 'enabled');
  menu.addBool('face iris', human.config.face.iris, 'enabled');
  menu.addBool('face age', human.config.face.age, 'enabled');
  menu.addBool('face gender', human.config.face.gender, 'enabled');
  menu.addBool('face emotion', human.config.face.emotion, 'enabled');
  menu.addBool('body pose', human.config.body, 'enabled');
  menu.addBool('hand pose', human.config.hand, 'enabled');
  menu.addBool('gesture analysis', human.config.gesture, 'enabled');

  menu.addHTML('<hr style="min-width: 200px; border-style: inset; border-color: dimgray">');
  menu.addLabel('model parameters');
  menu.addRange('max objects', human.config.face.detector, 'maxFaces', 1, 50, 1, (val) => {
    human.config.face.detector.maxFaces = parseInt(val);
    human.config.body.maxDetections = parseInt(val);
    human.config.hand.maxHands = parseInt(val);
  });
  menu.addRange('skip frames', human.config.face.detector, 'skipFrames', 0, 50, 1, (val) => {
    human.config.face.detector.skipFrames = parseInt(val);
    human.config.face.emotion.skipFrames = parseInt(val);
    human.config.face.age.skipFrames = parseInt(val);
    human.config.hand.skipFrames = parseInt(val);
  });
  menu.addRange('min confidence', human.config.face.detector, 'minConfidence', 0.0, 1.0, 0.05, (val) => {
    human.config.face.detector.minConfidence = parseFloat(val);
    human.config.face.gender.minConfidence = parseFloat(val);
    human.config.face.emotion.minConfidence = parseFloat(val);
    human.config.hand.minConfidence = parseFloat(val);
  });
  menu.addRange('score threshold', human.config.face.detector, 'scoreThreshold', 0.1, 1.0, 0.05, (val) => {
    human.config.face.detector.scoreThreshold = parseFloat(val);
    human.config.hand.scoreThreshold = parseFloat(val);
    human.config.body.scoreThreshold = parseFloat(val);
  });
  menu.addRange('overlap', human.config.face.detector, 'iouThreshold', 0.1, 1.0, 0.05, (val) => {
    human.config.face.detector.iouThreshold = parseFloat(val);
    human.config.hand.iouThreshold = parseFloat(val);
  });

  menu.addHTML('<hr style="min-width: 200px; border-style: inset; border-color: dimgray">');
  menu.addChart('FPS', 'FPS');

  menuFX = new Menu(document.body, '', { top: '1rem', right: '18rem' });
  menuFX.addLabel('ui options');
  menuFX.addBool('buffered output', ui, 'buffered', (val) => ui.buffered = val);
  menuFX.addBool('crop & scale', ui, 'crop', () => setupCamera());
  menuFX.addBool('camera front/back', ui, 'facing', () => setupCamera());
  menuFX.addBool('use 3D depth', ui, 'useDepth');
  menuFX.addBool('draw boxes', ui, 'drawBoxes');
  menuFX.addBool('draw polygons', ui, 'drawPolygons');
  menuFX.addBool('Fill Polygons', ui, 'fillPolygons');
  menuFX.addBool('draw points', ui, 'drawPoints');
  menuFX.addHTML('<hr style="min-width: 200px; border-style: inset; border-color: dimgray">');
  menuFX.addLabel('image processing');
  menuFX.addBool('enabled', human.config.filter, 'enabled');
  ui.menuWidth = menuFX.addRange('image width', human.config.filter, 'width', 0, 3840, 10, (val) => human.config.filter.width = parseInt(val));
  ui.menuHeight = menuFX.addRange('image height', human.config.filter, 'height', 0, 2160, 10, (val) => human.config.filter.height = parseInt(val));
  menuFX.addRange('brightness', human.config.filter, 'brightness', -1.0, 1.0, 0.05, (val) => human.config.filter.brightness = parseFloat(val));
  menuFX.addRange('contrast', human.config.filter, 'contrast', -1.0, 1.0, 0.05, (val) => human.config.filter.contrast = parseFloat(val));
  menuFX.addRange('sharpness', human.config.filter, 'sharpness', 0, 1.0, 0.05, (val) => human.config.filter.sharpness = parseFloat(val));
  menuFX.addRange('blur', human.config.filter, 'blur', 0, 20, 1, (val) => human.config.filter.blur = parseInt(val));
  menuFX.addRange('saturation', human.config.filter, 'saturation', -1.0, 1.0, 0.05, (val) => human.config.filter.saturation = parseFloat(val));
  menuFX.addRange('hue', human.config.filter, 'hue', 0, 360, 5, (val) => human.config.filter.hue = parseInt(val));
  menuFX.addRange('pixelate', human.config.filter, 'pixelate', 0, 32, 1, (val) => human.config.filter.pixelate = parseInt(val));
  menuFX.addBool('negative', human.config.filter, 'negative');
  menuFX.addBool('sepia', human.config.filter, 'sepia');
  menuFX.addBool('vintage', human.config.filter, 'vintage');
  menuFX.addBool('kodachrome', human.config.filter, 'kodachrome');
  menuFX.addBool('technicolor', human.config.filter, 'technicolor');
  menuFX.addBool('polaroid', human.config.filter, 'polaroid');
}

async function main() {
  log('Human: demo starting ...');
  setupMenu();
  document.getElementById('log').innerText = `Human: version ${human.version} TensorFlow/JS: version ${human.tf.version_core}`;
  // human.tf.ENV.set('WEBGL_FORCE_F16_TEXTURES', true);
  // this is not required, just pre-loads all models
  if (ui.modelsPreload) {
    status('loading');
    await human.load(userConfig);
  }
  // this is not required, just pre-warms all models for faster initial inference
  if (ui.modelsWarmup) {
    status('initializing');
    await human.warmup(userConfig);
  }
  status('human: ready');
  document.getElementById('loader').style.display = 'none';
  document.getElementById('play').style.display = 'block';
}

window.onload = main;
window.onresize = setupCamera;
