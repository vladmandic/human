/**
 * Human demo for browsers
 *
 * @description Main demo app that exposes all Human functionality
 *
 * @params Optional URL parameters:
 * image=<imagePath:string>: perform detection on specific image and finish
 * worker=<true|false>: use WebWorkers
 * backend=<webgl|wasm|cpu>: use specific TF backend for operations
 * preload=<true|false>: pre-load all configured models
 * warmup=<true|false>: warmup all configured models
 *
 * @example <https://wyse:10031/?backend=wasm&worker=true&image="/assets/sample-me.jpg">
 *
 * @configuration
 * userConfig={}: contains all model configuration used by human
 * drawOptions={}: contains all draw variables used by human.draw
 * ui={}: contains all variables exposed in the UI
 */

// test url <https://human.local/?worker=false&async=false&bench=false&draw=true&warmup=full&backend=humangl>

// @ts-nocheck // typescript checks disabled as this is pure javascript

import Human from '../dist/human.esm.js'; // equivalent of @vladmandic/human
import Menu from './helpers/menu.js';
import GLBench from './helpers/gl-bench.js';
import webRTC from './helpers/webrtc.js';
import jsonView from './helpers/jsonview.js';

let human;

let userConfig = {
  // face: { enabled: false },
  // body: { enabled: false },
  // hand: { enabled: false },
  /*
  warmup: 'none',
  backend: 'humangl',
  debug: true,
  wasmPath: 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@3.9.0/dist/',
  async: false,
  cacheSensitivity: 0.75,
  filter: { enabled: false, flip: false },
  face: { enabled: false,
    detector: { return: false, rotation: true },
    mesh: { enabled: false },
    iris: { enabled: false },
    description: { enabled: false },
    emotion: { enabled: false },
  },
  object: { enabled: false },
  gesture: { enabled: true },
  hand: { enabled: true, maxDetected: 1, minConfidence: 0.5, detector: { modelPath: 'handtrack.json' } },
  body: { enabled: false },
  // body: { enabled: true, modelPath: 'movenet-multipose.json' },
  segmentation: { enabled: false },
  */
  face: { iris: { enabled: false }, emotion: { enabled: false } },
  hand: { enabled: false },
  body: { enabled: false },
  gesture: { enabled: false },
};

const drawOptions = {
  bufferedOutput: true, // makes draw functions interpolate results between each detection for smoother movement
  drawBoxes: true,
  drawGaze: true,
  drawLabels: true,
  drawGestures: true,
  drawPolygons: true,
  drawPoints: false,
  fillPolygons: false,
  useCurves: false,
  useDepth: true,
};

// ui options
const ui = {
  // configurable items
  console: true, // log messages to browser console
  crop: false, // video mode crop to size or leave full frame
  facing: true, // camera facing front or back
  baseBackground: 'rgba(50, 50, 50, 1)', // 'grey'
  columns: 2, // when processing sample images create this many columns
  useWorker: true, // use web workers for processing
  worker: 'index-worker.js',
  maxFPSframes: 10, // keep fps history for how many frames
  modelsPreload: false, // preload human models on startup
  modelsWarmup: false, // warmup human models on startup
  buffered: true, // should output be buffered between frames
  interpolated: true, // should output be interpolated for smoothness between frames
  iconSize: '48px', // ui icon sizes
  autoPlay: false, // start webcam & detection on load

  // internal variables
  exceptionHandler: true, // should capture all unhandled exceptions
  busy: false, // internal camera busy flag
  menuWidth: 0, // internal
  menuHeight: 0, // internal
  camera: {}, // internal, holds details of webcam details
  detectFPS: [], // internal, holds fps values for detection performance
  drawFPS: [], // internal, holds fps values for draw performance
  drawWarmup: false, // debug only, should warmup image processing be displayed on startup
  drawThread: null, // internl, perform draw operations in a separate thread
  detectThread: null, // internl, perform detect operations in a separate thread
  hintsThread: null, // internal, draw random hints
  framesDraw: 0, // internal, statistics on frames drawn
  framesDetect: 0, // internal, statistics on frames detected
  bench: true, // show gl fps benchmark window
  results: false, // show results tree
  lastFrame: 0, // time of last frame processing
  viewportSet: false, // internal, has custom viewport been set
  background: null, // holds instance of segmentation background image
  transferCanvas: null, // canvas used to transfer data to and from worker

  // webrtc
  useWebRTC: false, // use webrtc as camera source instead of local webcam
  webRTCServer: 'http://localhost:8002',
  webRTCStream: 'reowhite',

  // sample images
  compare: '../samples/ai-face.jpg', // base image for face compare
  samples: [],
};

const pwa = {
  enabled: true,
  cacheName: 'Human',
  scriptFile: 'index-pwa.js',
  cacheModels: true,
  cacheWASM: true,
  cacheOther: false,
};

// hints
const hints = [
  'for optimal performance disable unused modules',
  'with modern gpu best backend is webgl otherwise select wasm backend',
  'you can process images by dragging and dropping them in browser window',
  'video input can be webcam or any other video source',
  'check out other demos such as face-matching and face-3d',
  'you can edit input image or video on-the-fly using filters',
  'library status messages are logged in browser console',
];

// global variables
const menu = {};
let worker;
let bench;
let lastDetectedResult = {};

// helper function: async pause
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
const delay = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

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
function log(...msg) {
  const dt = new Date();
  const ts = `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}.${dt.getMilliseconds().toString().padStart(3, '0')}`;
  // eslint-disable-next-line no-console
  if (ui.console) console.log(ts, ...msg);
}

let prevStatus = '';
function status(msg) {
  const div = document.getElementById('status');
  if (div && msg && msg !== prevStatus && msg.length > 0) {
    log('status', msg);
    document.getElementById('play').style.display = 'none';
    document.getElementById('loader').style.display = 'block';
    div.innerText = msg;
    prevStatus = msg;
  } else {
    const video = document.getElementById('video');
    const playing = (video.srcObject !== null) && !video.paused;
    document.getElementById('play').style.display = playing ? 'none' : 'block';
    document.getElementById('loader').style.display = 'none';
    div.innerText = '';
  }
}

async function videoPlay(videoElement = document.getElementById('video')) {
  document.getElementById('btnStartText').innerHTML = 'pause video';
  await videoElement.play();
  // status();
}

async function videoPause() {
  document.getElementById('btnStartText').innerHTML = 'start video';
  await document.getElementById('video').pause();
  status('paused');
  document.getElementById('play').style.display = 'block';
  document.getElementById('loader').style.display = 'none';
}

const compare = { enabled: false, original: null };
async function calcSimmilarity(result) {
  document.getElementById('compare-container').onclick = () => {
    log('resetting face compare baseline:');
    compare.original = null;
  };
  document.getElementById('compare-container').style.display = compare.enabled ? 'block' : 'none';
  if (!compare.enabled) {
    compare.original = null;
    return;
  }
  if (!result || !result.face || !result.face[0] || !result.face[0].embedding) return;
  if (!(result.face.length > 0) || (result.face[0].embedding.length <= 64)) return;
  if (!compare.original) {
    compare.original = result;
    log('setting face compare baseline:', result.face[0]);
    if (result.face[0].tensor) {
      const enhanced = human.enhance(result.face[0]);
      if (enhanced) {
        const c = document.getElementById('orig');
        const squeeze = human.tf.squeeze(enhanced);
        const norm = human.tf.div(squeeze, 255);
        human.tf.browser.toPixels(norm, c);
        human.tf.dispose(enhanced);
        human.tf.dispose(squeeze);
        human.tf.dispose(norm);
      }
    } else {
      document.getElementById('compare-canvas').getContext('2d').drawImage(compare.original.canvas, 0, 0, 200, 200);
    }
  }
  const similarity = human.similarity(compare.original.face[0].embedding, result.face[0].embedding);
  document.getElementById('similarity').innerText = `similarity: ${Math.trunc(1000 * similarity) / 10}%`;
}

const isLive = (input) => {
  const isCamera = input.srcObject?.getVideoTracks()[0] && input.srcObject?.getVideoTracks()[0].enabled;
  const isVideoLive = input.readyState > 2;
  const isCameraLive = input.srcObject?.getVideoTracks()[0].readyState === 'live';
  let live = isCamera ? isCameraLive : isVideoLive;
  live = live && !input.paused;
  return live;
};

// draws processed results and starts processing of a next frame
let lastDraw = 0;
async function drawResults(input) {
  // await delay(25);
  const result = lastDetectedResult;
  const canvas = document.getElementById('canvas');

  // update draw fps data
  ui.drawFPS.push(1000 / (human.now() - lastDraw));
  if (ui.drawFPS.length > ui.maxFPSframes) ui.drawFPS.shift();
  lastDraw = human.now();

  // draw fps chart
  await menu.process.updateChart('FPS', ui.detectFPS);

  document.getElementById('segmentation-container').style.display = userConfig.segmentation.enabled ? 'block' : 'none';
  if (userConfig.segmentation.enabled && ui.buffered) { // refresh segmentation if using buffered output
    const seg = await human.segmentation(input, ui.background);
    if (seg.alpha) {
      const canvasSegMask = document.getElementById('segmentation-mask');
      const ctxSegMask = canvasSegMask.getContext('2d');
      ctxSegMask.clearRect(0, 0, canvasSegMask.width, canvasSegMask.height); // need to clear as seg.alpha is alpha based canvas so it adds
      ctxSegMask.drawImage(seg.alpha, 0, 0, seg.alpha.width, seg.alpha.height, 0, 0, canvasSegMask.width, canvasSegMask.height);
      const canvasSegCanvas = document.getElementById('segmentation-canvas');
      const ctxSegCanvas = canvasSegCanvas.getContext('2d');
      ctxSegCanvas.clearRect(0, 0, canvasSegCanvas.width, canvasSegCanvas.height); // need to clear as seg.alpha is alpha based canvas so it adds
      ctxSegCanvas.drawImage(seg.canvas, 0, 0, seg.alpha.width, seg.alpha.height, 0, 0, canvasSegCanvas.width, canvasSegCanvas.height);
    }
    // result.canvas = seg.alpha;
  } else if (!result.canvas || ui.buffered) { // refresh with input if using buffered output or if missing canvas
    const image = await human.image(input, false);
    result.canvas = image.canvas;
    human.tf.dispose(image.tensor);
  }

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

  // draw all results using interpolated results
  let interpolated;
  if (ui.interpolated) interpolated = human.next(result);
  else interpolated = result;
  human.draw.all(canvas, interpolated, drawOptions);

  // show tree with results
  if (ui.results) {
    const div = document.getElementById('results');
    div.innerHTML = '';
    jsonView(result, div, 'Results', ['canvas', 'timestamp']);
  }

  /* alternatively use individual functions
  human.draw.face(canvas, result.face);
  human.draw.body(canvas, result.body);
  human.draw.hand(canvas, result.hand);
  human.draw.object(canvas, result.object);
  human.draw.gesture(canvas, result.gesture);
  */
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const person = result.persons; // explicitly invoke person getter
  await calcSimmilarity(result);

  // update log
  const engine = human.tf.engine();
  const processing = result.canvas ? `processing: ${result.canvas.width} x ${result.canvas.height}` : '';
  const avgDetect = ui.detectFPS.length > 0 ? Math.trunc(10 * ui.detectFPS.reduce((a, b) => a + b, 0) / ui.detectFPS.length) / 10 : 0;
  const avgDraw = ui.drawFPS.length > 0 ? Math.trunc(10 * ui.drawFPS.reduce((a, b) => a + b, 0) / ui.drawFPS.length) / 10 : 0;
  const warning = (ui.detectFPS.length > 5) && (avgDetect < 2) ? '<font color="lightcoral">warning: your performance is low: try switching to higher performance backend, lowering resolution or disabling some models</font>' : '';
  const fps = avgDetect > 0 ? `FPS process:${avgDetect} refresh:${avgDraw}` : '';
  const backend = result.backend || human.tf.getBackend();
  const gpu = engine.backendInstance ? `gpu: ${(engine.backendInstance.numBytesInGPU ? engine.backendInstance.numBytesInGPU : 0).toLocaleString()} bytes` : '';
  const memory = result.tensors ? `tensors: ${result.tensors.toLocaleString()} in worker` : `system: ${engine.state.numBytes.toLocaleString()} bytes ${gpu} | tensors: ${engine.state.numTensors.toLocaleString()}`;
  document.getElementById('log').innerHTML = `
    video: ${ui.camera.name} | facing: ${ui.camera.facing} | screen: ${window.innerWidth} x ${window.innerHeight} camera: ${ui.camera.width} x ${ui.camera.height} ${processing}<br>
    backend: ${backend} | ${memory}<br>
    performance: ${str(interpolated.performance)}ms ${fps}<br>
    ${warning}<br>
  `;
  ui.framesDraw++;
  ui.lastFrame = human.now();
  if (ui.buffered) {
    if (isLive(input)) {
      // ui.drawThread = requestAnimationFrame(() => drawResults(input));
      ui.drawThread = setTimeout(() => drawResults(input), 25);
    } else {
      cancelAnimationFrame(ui.drawThread);
      videoPause();
      ui.drawThread = null;
    }
  } else {
    if (ui.drawThread) {
      log('stopping buffered refresh');
      cancelAnimationFrame(ui.drawThread);
      ui.drawThread = null;
    }
  }
}

// setup webcam
let initialCameraAccess = true;
async function setupCamera() {
  if (ui.busy) return null;
  ui.busy = true;
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const output = document.getElementById('log');
  if (ui.useWebRTC) {
    status('setting up webrtc connection');
    try {
      video.onloadeddata = () => ui.camera = { name: ui.webRTCStream, width: video.videoWidth, height: video.videoHeight, facing: 'default' };
      await webRTC(ui.webRTCServer, ui.webRTCStream, video);
    } catch (err) {
      log(err);
    } finally {
      // status();
    }
    return '';
  }
  const live = video.srcObject ? ((video.srcObject.getVideoTracks()[0].readyState === 'live') && (video.readyState > 2) && (!video.paused)) : false;
  let msg = '';
  status('setting up camera');
  // setup webcam. note that navigator.mediaDevices requires that page is accessed via https
  if (!navigator.mediaDevices) {
    msg = 'camera access not supported';
    output.innerText += `\n${msg}`;
    log(msg);
    status(msg);
    ui.busy = false;
    return msg;
  }
  let stream;
  const constraints = {
    audio: false,
    video: {
      facingMode: ui.facing ? 'user' : 'environment',
      resizeMode: ui.crop ? 'crop-and-scale' : 'none',
      width: { ideal: document.body.clientWidth },
      // height: { ideal: document.body.clientHeight }, // not set as we're using aspectRation to get height instead
      aspectRatio: document.body.clientWidth / document.body.clientHeight,
      // deviceId: 'xxxx' // if you have multiple webcams, specify one to use explicitly
    },
  };
  // enumerate devices for diag purposes
  const devices = await navigator.mediaDevices.enumerateDevices();
  if (initialCameraAccess) log('enumerated input devices:', devices);
  // to select specific camera add deviceid from enumerated devices to camera constraints
  // constraints.video.deviceId = '6794499e046cf4aebf41cfeb7d1ef48a17bd65f72bafb55f3c0b06405d3d487b';
  if (initialCameraAccess) log('camera constraints', constraints);
  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
  } catch (err) {
    if (err.name === 'PermissionDeniedError' || err.name === 'NotAllowedError') msg = 'camera permission denied';
    else if (err.name === 'SourceUnavailableError') msg = 'camera not available';
    else msg = `camera error: ${err.message || err}`;
    output.innerText += `\n${msg}`;
    status(msg);
    log('camera error:', err);
    ui.busy = false;
    return msg;
  }
  const tracks = stream.getVideoTracks();
  if (tracks && tracks.length >= 1) {
    if (initialCameraAccess) log('enumerated viable tracks:', tracks);
  } else {
    ui.busy = false;
    return 'no camera track';
  }
  const track = stream.getVideoTracks()[0];
  const settings = track.getSettings();
  if (initialCameraAccess) log('selected video source:', track, settings);
  ui.camera = { name: track.label.toLowerCase(), width: settings.width, height: settings.height, facing: settings.facingMode === 'user' ? 'front' : 'back' };
  initialCameraAccess = false;

  if (!stream) return 'camera stream empty';

  const ready = new Promise((resolve) => { (video.onloadeddata = () => resolve(true)); });
  video.srcObject = stream;
  await ready;
  if (settings.width > settings.height) canvas.style.width = '100vw';
  else canvas.style.height = '100vh';
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ui.menuWidth.input.setAttribute('value', video.videoWidth);
  ui.menuHeight.input.setAttribute('value', video.videoHeight);
  if (live || ui.autoPlay) await videoPlay();
  // eslint-disable-next-line no-use-before-define
  if ((live || ui.autoPlay) && !ui.detectThread) runHumanDetect(video, canvas);
  return 'camera stream ready';
}

function initPerfMonitor() {
  if (!bench) {
    const gl = null;
    // cosnt gl = human.tf.engine().backend.gpgpu.gl;
    // if (!gl) log('bench cannot get tensorflow webgl context');
    bench = new GLBench(gl, {
      trackGPU: false, // this is really slow
      chartHz: 20,
      chartLen: 20,
    });
    bench.begin();
  }
}

// wrapper for worker.postmessage that creates worker if one does not exist
function webWorker(input, image, canvas, timestamp) {
  if (!worker) {
    // create new webworker and add event handler only once
    log('creating worker thread');
    // load Human using IIFE script as Chome Mobile does not support Modules as Workers
    // worker = new Worker(ui.worker, { type: 'module' });
    worker = new Worker(ui.worker);
    // after receiving message from webworker, parse&draw results and send new frame for processing
    worker.addEventListener('message', (msg) => {
      status();
      if (msg.data.result.performance && msg.data.result.performance.total) ui.detectFPS.push(1000 / msg.data.result.performance.total);
      if (ui.detectFPS.length > ui.maxFPSframes) ui.detectFPS.shift();
      if (ui.bench) {
        if (!bench) initPerfMonitor();
        bench.nextFrame(timestamp);
      }
      if (document.getElementById('gl-bench')) document.getElementById('gl-bench').style.display = ui.bench ? 'block' : 'none';
      lastDetectedResult = msg.data.result;

      if (msg.data.image) { // we dont really need canvas since we draw from video
        /*
        if (!lastDetectedResult.canvas || lastDetectedResult.canvas.width !== msg.data.width || lastDetectedResult.canvas.height !== msg.data.height) {
          lastDetectedResult.canvas = (typeof OffscreenCanvas !== 'undefined') ? new OffscreenCanvas(msg.data.width, msg.data.height) : document.createElement('canvas');
          lastDetectedResult.canvas.width = msg.data.width;
          lastDetectedResult.canvas.height = msg.data.height;
        }
        const ctx = lastDetectedResult.canvas.getContext('2d');
        const imageData = new ImageData(new Uint8ClampedArray(msg.data.image), msg.data.width, msg.data.height);
        ctx.putImageData(imageData, 0, 0);
        */
      }

      ui.framesDetect++;
      if (!ui.drawThread) drawResults(input);
      if (isLive(input)) {
        // eslint-disable-next-line no-use-before-define
        ui.detectThread = requestAnimationFrame((now) => runHumanDetect(input, canvas, now));
      }
    });
  }
  // pass image data as arraybuffer to worker by reference to avoid copy
  worker.postMessage({ image: image.data.buffer, width: canvas.width, height: canvas.height, userConfig }, [image.data.buffer]);
}

// main processing function when input is webcam, can use direct invocation or web worker
function runHumanDetect(input, canvas, timestamp) {
  // if live video
  if (!isLive(input)) {
    // stop ui refresh
    // if (ui.drawThread) cancelAnimationFrame(ui.drawThread);
    if (ui.detectThread) cancelAnimationFrame(ui.detectThread);
    if (input.paused) log('video paused');
    // if we want to continue and camera not ready, retry in 0.5sec, else just give up
    // else if (cameraLive && (input.readyState <= 2)) setTimeout(() => runHumanDetect(input, canvas), 500);
    else log(`video not ready: track state: ${input.srcObject ? input.srcObject.getVideoTracks()[0].readyState : 'unknown'} stream state: ${input.readyState}`);
    log('frame statistics: process:', ui.framesDetect, 'refresh:', ui.framesDraw);
    log('memory', human.tf.engine().memory());
    return;
  }
  if (ui.hintsThread) clearInterval(ui.hintsThread);
  if (ui.useWorker && human.env.offscreen) {
    // get image data from video as we cannot send html objects to webworker
    if (!ui.transferCanvas || ui.transferCanvas.width !== canvas.width || ui.transferCanvas.height || canvas.height) {
      ui.transferCanvas = document.createElement('canvas');
      ui.transferCanvas.width = canvas.width;
      ui.transferCanvas.height = canvas.height;
    }
    const ctx = ui.transferCanvas.getContext('2d');
    ctx.drawImage(input, 0, 0, canvas.width, canvas.height);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // perform detection in worker
    webWorker(input, data, canvas, timestamp);
  } else {
    human.detect(input, userConfig).then((result) => {
      status();
      /*
      setTimeout(async () => { // simulate gl context lost 2sec after initial detection
        const ext = human.gl && human.gl.gl ? human.gl.gl.getExtension('WEBGL_lose_context') : {};
        if (ext && ext.loseContext) {
          log('simulate context lost:', human.env.webgl, human.gl, ext);
          human.gl.gl.getExtension('WEBGL_lose_context').loseContext();
          await videoPause();
          status('Exception: WebGL');
        }
      }, 2000);
      */
      if (result.performance && result.performance.total) ui.detectFPS.push(1000 / result.performance.total);
      if (ui.detectFPS.length > ui.maxFPSframes) ui.detectFPS.shift();
      if (ui.bench) {
        if (!bench) initPerfMonitor();
        bench.nextFrame(timestamp);
      }
      if (document.getElementById('gl-bench')) document.getElementById('gl-bench').style.display = ui.bench ? 'block' : 'none';
      if (result.error) {
        log(result.error);
        document.getElementById('log').innerText += `\nHuman error: ${result.error}`;
      } else {
        lastDetectedResult = result;
        if (!ui.drawThread) drawResults(input);
        ui.framesDetect++;
        ui.detectThread = requestAnimationFrame((now) => runHumanDetect(input, canvas, now));
      }
    });
  }
}

// main processing function when input is image, can use direct invocation or web worker
async function processImage(input, title) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onerror = async () => status('image loading error');
    image.onload = async () => {
      if (ui.hintsThread) clearInterval(ui.hintsThread);
      ui.interpolated = false; // stop interpolating results if input is image
      ui.buffered = false; // stop buffering result if input is image
      status(`processing image: ${title}`);
      const canvas = document.getElementById('canvas');
      image.width = image.naturalWidth;
      image.height = image.naturalHeight;
      canvas.width = userConfig.filter.width && userConfig.filter.width > 0 ? userConfig.filter.width : image.naturalWidth;
      canvas.height = userConfig.filter.height && userConfig.filter.height > 0 ? userConfig.filter.height : image.naturalHeight;
      const origCacheSensitiry = userConfig.cacheSensitivity;
      userConfig.cacheSensitivity = 0;
      const result = await human.detect(image, userConfig);
      userConfig.cacheSensitivity = origCacheSensitiry;
      lastDetectedResult = result;
      await drawResults(image);
      const thumb = document.createElement('canvas');
      thumb.className = 'thumbnail';
      thumb.width = ui.columns > 1 ? window.innerWidth / (ui.columns + 0.1) : window.innerWidth - 14;
      thumb.height = thumb.width * canvas.height / canvas.width;
      if (result.face && result.face.length > 0) {
        thumb.title = result.face.map((a, i) => `#${i} face: ${Math.trunc(100 * a.faceScore)}% box: ${Math.trunc(100 * a.boxScore)}% age: ${Math.trunc(a.age)} gender: ${Math.trunc(100 * a.genderScore)}% ${a.gender}`).join(' | ');
      } else {
        thumb.title = 'no face detected';
      }
      thumb.addEventListener('click', (evt) => {
        const stdWidth = ui.columns > 1 ? window.innerWidth / (ui.columns + 0.1) : window.innerWidth - 14;
        // zoom in/out on click
        if (evt.target.style.width === `${stdWidth}px`) {
          evt.target.style.width = '';
          evt.target.style.height = `${document.getElementById('log').offsetTop - document.getElementById('media').offsetTop}px`;
        } else {
          evt.target.style.width = `${stdWidth}px`;
          evt.target.style.height = '';
        }
        // copy to clipboard on click
        if (typeof ClipboardItem !== 'undefined' && navigator.clipboard) {
          evt.target.toBlob((blob) => {
            // eslint-disable-next-line no-undef
            const item = new ClipboardItem({ 'image/png': blob });
            navigator.clipboard.write([item]);
            log('copied image to clipboard');
          });
        }
      });
      const ctx = thumb.getContext('2d');
      ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, thumb.width, thumb.height);
      const prev = document.getElementsByClassName('thumbnail');
      if (prev && prev.length > 0) document.getElementById('samples-container').insertBefore(thumb, prev[0]);
      else document.getElementById('samples-container').appendChild(thumb);
      document.getElementById('samples-container').style.display = 'block';

      // finish up
      status();
      document.getElementById('play').style.display = 'none';
      document.getElementById('loader').style.display = 'none';
      if (ui.detectThread) cancelAnimationFrame(ui.detectThread);
      if (ui.drawThread) cancelAnimationFrame(ui.drawThread);
      log('processed image:', title);
      resolve(true);
    };
    image.src = input;
  });
}

async function processVideo(input, title) {
  status(`processing video: ${title}`);
  // const video = document.getElementById('video-file') || document.createElement('video');
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  // video.id = 'video-file';
  // video.controls = true;
  // video.loop = true;
  // video.style.display = 'none';
  // document.body.appendChild(video);
  video.addEventListener('error', () => status(`video loading error: ${video.error.message}`));
  video.addEventListener('canplay', async () => {
    for (const m of Object.values(menu)) m.hide();
    document.getElementById('samples-container').style.display = 'none';
    canvas.style.display = 'block';
    await videoPlay();
    if (!ui.detectThread) runHumanDetect(video, canvas);
  });
  video.srcObject = null;
  video.src = input;
}

// just initialize everything and call main function
async function detectVideo() {
  document.getElementById('samples-container').style.display = 'none';
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  canvas.style.display = 'block';
  cancelAnimationFrame(ui.detectThread);
  if ((video.srcObject !== null) && !video.paused) {
    await videoPause();
    // if (ui.drawThread) cancelAnimationFrame(ui.drawThread);
  } else {
    const cameraError = await setupCamera();
    if (!cameraError) {
      status('starting detection');
      for (const m of Object.values(menu)) m.hide();
      await videoPlay();
      runHumanDetect(video, canvas);
    } else {
      status(cameraError);
    }
  }
}

// just initialize everything and call main function
async function detectSampleImages() {
  document.getElementById('play').style.display = 'none';
  document.getElementById('canvas').style.display = 'none';
  document.getElementById('samples-container').style.display = 'block';
  log('running detection of sample images');
  status('processing images');
  document.getElementById('samples-container').innerHTML = '';
  for (const m of Object.values(menu)) m.hide();
  for (const image of ui.samples) await processImage(image, image);
}

function setupMenu() {
  const x = [`${document.getElementById('btnDisplay').offsetLeft}px`, `${document.getElementById('btnImage').offsetLeft}px`, `${document.getElementById('btnProcess').offsetLeft}px`, `${document.getElementById('btnModel').offsetLeft}px`];

  const top = `${document.getElementById('menubar').clientHeight}px`;

  menu.display = new Menu(document.body, '', { top, left: x[0] });
  menu.display.addBool('results tree', ui, 'results', (val) => {
    ui.results = val;
    document.getElementById('results').style.display = ui.results ? 'block' : 'none';
  });
  menu.display.addBool('perf monitor', ui, 'bench', (val) => ui.bench = val);
  menu.display.addBool('buffer output', ui, 'buffered', (val) => ui.buffered = val);
  menu.display.addBool('crop & scale', ui, 'crop', (val) => {
    ui.crop = val;
    setupCamera();
  });
  menu.display.addBool('camera facing', ui, 'facing', (val) => {
    ui.facing = val;
    setupCamera();
  });
  menu.display.addHTML('<hr style="border-style: inset; border-color: dimgray">');
  menu.display.addBool('use depth', drawOptions, 'useDepth');
  menu.display.addBool('use curves', drawOptions, 'useCurves');
  menu.display.addBool('print labels', drawOptions, 'drawLabels');
  menu.display.addBool('draw points', drawOptions, 'drawPoints');
  menu.display.addBool('draw boxes', drawOptions, 'drawBoxes');
  menu.display.addBool('draw polygons', drawOptions, 'drawPolygons');
  menu.display.addBool('fill polygons', drawOptions, 'fillPolygons');

  menu.image = new Menu(document.body, '', { top, left: x[1] });
  menu.image.addBool('enabled', userConfig.filter, 'enabled', (val) => userConfig.filter.enabled = val);
  menu.image.addBool('histogram equalization', userConfig.filter, 'equalization', (val) => userConfig.filter.equalization = val);
  ui.menuWidth = menu.image.addRange('image width', userConfig.filter, 'width', 0, 3840, 10, (val) => userConfig.filter.width = parseInt(val));
  ui.menuHeight = menu.image.addRange('image height', userConfig.filter, 'height', 0, 2160, 10, (val) => userConfig.filter.height = parseInt(val));
  menu.image.addHTML('<hr style="border-style: inset; border-color: dimgray">');
  menu.image.addRange('brightness', userConfig.filter, 'brightness', -1.0, 1.0, 0.05, (val) => userConfig.filter.brightness = parseFloat(val));
  menu.image.addRange('contrast', userConfig.filter, 'contrast', -1.0, 1.0, 0.05, (val) => userConfig.filter.contrast = parseFloat(val));
  menu.image.addRange('sharpness', userConfig.filter, 'sharpness', 0, 1.0, 0.05, (val) => userConfig.filter.sharpness = parseFloat(val));
  menu.image.addRange('blur', userConfig.filter, 'blur', 0, 20, 1, (val) => userConfig.filter.blur = parseInt(val));
  menu.image.addRange('saturation', userConfig.filter, 'saturation', -1.0, 1.0, 0.05, (val) => userConfig.filter.saturation = parseFloat(val));
  menu.image.addRange('hue', userConfig.filter, 'hue', 0, 360, 5, (val) => userConfig.filter.hue = parseInt(val));
  menu.image.addRange('pixelate', userConfig.filter, 'pixelate', 0, 32, 1, (val) => userConfig.filter.pixelate = parseInt(val));
  menu.image.addHTML('<hr style="border-style: inset; border-color: dimgray">');
  menu.image.addBool('negative', userConfig.filter, 'negative', (val) => userConfig.filter.negative = val);
  menu.image.addBool('sepia', userConfig.filter, 'sepia', (val) => userConfig.filter.sepia = val);
  menu.image.addBool('vintage', userConfig.filter, 'vintage', (val) => userConfig.filter.vintage = val);
  menu.image.addBool('kodachrome', userConfig.filter, 'kodachrome', (val) => userConfig.filter.kodachrome = val);
  menu.image.addBool('technicolor', userConfig.filter, 'technicolor', (val) => userConfig.filter.technicolor = val);
  menu.image.addBool('polaroid', userConfig.filter, 'polaroid', (val) => userConfig.filter.polaroid = val);
  menu.image.addHTML('<input type="file" id="file-input" class="input-file"></input> &nbsp input');
  menu.image.addHTML('<input type="file" id="file-background" class="input-file"></input> &nbsp background');

  menu.process = new Menu(document.body, '', { top, left: x[2] });
  menu.process.addList('backend', ['cpu', 'webgl', 'wasm', 'humangl'], userConfig.backend, (val) => userConfig.backend = val);
  menu.process.addBool('async operations', userConfig, 'async', (val) => userConfig.async = val);
  menu.process.addBool('use web worker', ui, 'useWorker');
  menu.process.addHTML('<hr style="border-style: inset; border-color: dimgray">');
  menu.process.addLabel('model parameters');
  menu.process.addRange('max objects', userConfig.face.detector, 'maxDetected', 1, 50, 1, (val) => {
    userConfig.face.detector.maxDetected = parseInt(val);
    userConfig.body.maxDetected = parseInt(val);
    userConfig.hand.maxDetected = parseInt(val);
  });
  menu.process.addRange('skip frames', userConfig.face.detector, 'skipFrames', 0, 50, 1, (val) => {
    userConfig.face.detector.skipFrames = parseInt(val);
    userConfig.face.emotion.skipFrames = parseInt(val);
    userConfig.hand.skipFrames = parseInt(val);
  });
  menu.process.addRange('min confidence', userConfig.face.detector, 'minConfidence', 0.0, 1.0, 0.05, (val) => {
    userConfig.face.detector.minConfidence = parseFloat(val);
    userConfig.face.emotion.minConfidence = parseFloat(val);
    userConfig.hand.minConfidence = parseFloat(val);
  });
  menu.process.addRange('overlap', userConfig.face.detector, 'iouThreshold', 0.1, 1.0, 0.05, (val) => {
    userConfig.face.detector.iouThreshold = parseFloat(val);
    userConfig.hand.iouThreshold = parseFloat(val);
  });
  menu.process.addBool('rotation detection', userConfig.face.detector, 'rotation', (val) => {
    userConfig.face.detector.rotation = val;
    userConfig.hand.rotation = val;
  });
  menu.process.addHTML('<hr style="border-style: inset; border-color: dimgray">');
  // menu.process.addButton('process sample images', 'process images', () => detectSampleImages());
  // menu.process.addHTML('<hr style="border-style: inset; border-color: dimgray">');
  menu.process.addChart('FPS', 'FPS');

  menu.models = new Menu(document.body, '', { top, left: x[3] });
  menu.models.addBool('face detect', userConfig.face, 'enabled', (val) => userConfig.face.enabled = val);
  menu.models.addBool('face mesh', userConfig.face.mesh, 'enabled', (val) => userConfig.face.mesh.enabled = val);
  menu.models.addBool('face iris', userConfig.face.iris, 'enabled', (val) => userConfig.face.iris.enabled = val);
  menu.models.addBool('face description', userConfig.face.description, 'enabled', (val) => userConfig.face.description.enabled = val);
  menu.models.addBool('face emotion', userConfig.face.emotion, 'enabled', (val) => userConfig.face.emotion.enabled = val);
  menu.models.addHTML('<hr style="border-style: inset; border-color: dimgray">');
  menu.models.addBool('body pose', userConfig.body, 'enabled', (val) => userConfig.body.enabled = val);
  menu.models.addBool('hand pose', userConfig.hand, 'enabled', (val) => userConfig.hand.enabled = val);
  menu.models.addHTML('<hr style="border-style: inset; border-color: dimgray">');
  menu.models.addBool('gestures', userConfig.gesture, 'enabled', (val) => userConfig.gesture.enabled = val);
  menu.models.addHTML('<hr style="border-style: inset; border-color: dimgray">');
  menu.models.addBool('body segmentation', userConfig.segmentation, 'enabled', (val) => userConfig.segmentation.enabled = val);
  menu.models.addHTML('<hr style="border-style: inset; border-color: dimgray">');
  menu.models.addBool('object detection', userConfig.object, 'enabled', (val) => userConfig.object.enabled = val);
  menu.models.addHTML('<hr style="border-style: inset; border-color: dimgray">');
  menu.models.addBool('face compare', compare, 'enabled', (val) => {
    compare.enabled = val;
    compare.original = null;
  });

  for (const m of Object.values(menu)) m.hide();

  document.getElementById('btnDisplay').addEventListener('click', (evt) => menu.display.toggle(evt));
  document.getElementById('btnImage').addEventListener('click', (evt) => menu.image.toggle(evt));
  document.getElementById('btnProcess').addEventListener('click', (evt) => menu.process.toggle(evt));
  document.getElementById('btnModel').addEventListener('click', (evt) => menu.models.toggle(evt));
  document.getElementById('btnStart').addEventListener('click', () => detectVideo());
  document.getElementById('play').addEventListener('click', () => detectVideo());
}

async function resize() {
  window.onresize = null;
  // best setting for mobile, ignored for desktop
  // can set dynamic value such as Math.min(1, Math.round(100 * window.innerWidth / 960) / 100);
  const viewportScale = 0.7;
  if (!ui.viewportSet) {
    const viewport = document.querySelector('meta[name=viewport]');
    viewport.setAttribute('content', `width=device-width, shrink-to-fit=yes, minimum-scale=0.2, maximum-scale=2.0, user-scalable=yes, initial-scale=${viewportScale}`);
    ui.viewportSet = true;
  }
  const x = [`${document.getElementById('btnDisplay').offsetLeft}px`, `${document.getElementById('btnImage').offsetLeft}px`, `${document.getElementById('btnProcess').offsetLeft}px`, `${document.getElementById('btnModel').offsetLeft}px`];

  const top = `${document.getElementById('menubar').clientHeight - 3}px`;

  menu.display.menu.style.top = top;
  menu.image.menu.style.top = top;
  menu.process.menu.style.top = top;
  menu.models.menu.style.top = top;
  menu.display.menu.style.left = x[0];
  menu.image.menu.style.left = x[1];
  menu.process.menu.style.left = x[2];
  menu.models.menu.style.left = x[3];

  const fontSize = Math.trunc(10 * (1 - viewportScale)) + 14;
  document.documentElement.style.fontSize = `${fontSize}px`;
  human.draw.options.font = `small-caps ${fontSize}px "Segoe UI"`;
  human.draw.options.lineHeight = fontSize + 2;

  await setupCamera();
  window.onresize = resize;
}

async function drawWarmup(res) {
  const canvas = document.getElementById('canvas');
  canvas.width = res.canvas.width;
  canvas.height = res.canvas.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(res.canvas, 0, 0, res.canvas.width, res.canvas.height, 0, 0, canvas.width, canvas.height);
  await human.draw.all(canvas, res, drawOptions);
}

async function processDataURL(f, action) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (action === 'process') {
        if (e.target.result.startsWith('data:image')) await processImage(e.target.result, f.name);
        if (e.target.result.startsWith('data:video')) await processVideo(e.target.result, f.name);
        document.getElementById('canvas').style.display = 'none';
      }
      if (action === 'background') {
        const image = new Image();
        image.onerror = async () => status('image loading error');
        image.onload = async () => {
          ui.background = image;
          if (document.getElementById('canvas').style.display === 'block') { // replace canvas used for video
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            const seg = await human.segmentation(canvas, ui.background, userConfig);
            if (seg.canvas) ctx.drawImage(seg.canvas, 0, 0);
          } else {
            const canvases = document.getElementById('samples-container').children; // replace loaded images
            for (const canvas of canvases) {
              const ctx = canvas.getContext('2d');
              const seg = await human.segmentation(canvas, ui.background, userConfig);
              if (seg.canvas) ctx.drawImage(seg.canvas, 0, 0);
            }
          }
        };
        image.src = e.target.result;
      }
      resolve(true);
    };
    reader.readAsDataURL(f);
  });
}

async function runSegmentation() {
  document.getElementById('file-background').onchange = async (evt) => {
    userConfig.segmentation.enabled = true;
    evt.preventDefault();
    if (evt.target.files.length < 2) ui.columns = 1;
    for (const f of evt.target.files) await processDataURL(f, 'background');
  };
}

async function dragAndDrop() {
  document.body.addEventListener('dragenter', (evt) => evt.preventDefault());
  document.body.addEventListener('dragleave', (evt) => evt.preventDefault());
  document.body.addEventListener('dragover', (evt) => evt.preventDefault());
  document.body.addEventListener('drop', async (evt) => {
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
    if (evt.dataTransfer.files.length < 2) ui.columns = 1;
    for (const f of evt.dataTransfer.files) await processDataURL(f, 'process');
  });
  document.getElementById('file-input').onchange = async (evt) => {
    evt.preventDefault();
    if (evt.target.files.length < 2) ui.columns = 1;
    for (const f of evt.target.files) await processDataURL(f, 'process');
  };
}

async function drawHints() {
  const hint = document.getElementById('hint');
  ui.hintsThread = setInterval(() => {
    const rnd = Math.trunc(Math.random() * hints.length);
    hint.innerText = 'hint: ' + hints[rnd];
    hint.style.opacity = 1;
    setTimeout(() => {
      hint.style.opacity = 0;
    }, 4500);
  }, 5000);
}

async function pwaRegister() {
  if (!pwa.enabled) return;
  if ('serviceWorker' in navigator) {
    try {
      let found;
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const reg of regs) {
        log('pwa found:', reg.scope);
        if (reg.scope.startsWith(location.origin)) found = reg;
      }
      if (!found) {
        const reg = await navigator.serviceWorker.register(pwa.scriptFile, { scope: location.pathname });
        found = reg;
        log('pwa registered:', reg.scope);
      }
    } catch (err) {
      if (err.name === 'SecurityError') log('pwa: ssl certificate is untrusted');
      else log('pwa error:', err);
    }
    if (navigator.serviceWorker.controller) {
      // update pwa configuration as it doesn't have access to it
      navigator.serviceWorker.controller.postMessage({ key: 'cacheModels', val: pwa.cacheModels });
      navigator.serviceWorker.controller.postMessage({ key: 'cacheWASM', val: pwa.cacheWASM });
      navigator.serviceWorker.controller.postMessage({ key: 'cacheOther', val: pwa.cacheOther });

      log('pwa ctive:', navigator.serviceWorker.controller.scriptURL);
      const cache = await caches.open(pwa.cacheName);
      if (cache) {
        const content = await cache.matchAll();
        log('pwa cache:', content.length, 'files');
      }
    }
  } else {
    log('pwa inactive');
  }
}

async function main() {
  if (ui.exceptionHandler) {
    window.addEventListener('unhandledrejection', (evt) => {
      if (ui.detectThread) cancelAnimationFrame(ui.detectThread);
      if (ui.drawThread) cancelAnimationFrame(ui.drawThread);
      const msg = evt.reason.message || evt.reason || evt;
      // eslint-disable-next-line no-console
      console.error(msg);
      document.getElementById('log').innerHTML = msg;
      status(`exception: ${msg}`);
      evt.preventDefault();
    });
  }

  log('demo starting ...');

  document.documentElement.style.setProperty('--icon-size', ui.iconSize);

  drawHints();

  // sanity check for webworker compatibility
  if (typeof Worker === 'undefined' || typeof OffscreenCanvas === 'undefined') {
    ui.useWorker = false;
    log('webworker functionality is disabled due to missing browser functionality');
  }

  // register PWA ServiceWorker
  await pwaRegister();

  // parse url search params
  const params = new URLSearchParams(location.search);
  log('url options:', params.toString());
  if (params.has('worker')) {
    ui.useWorker = JSON.parse(params.get('worker'));
    log('overriding worker:', ui.useWorker);
  }
  if (params.has('backend')) {
    userConfig.backend = params.get('backend'); // string
    log('overriding backend:', userConfig.backend);
  }
  if (params.has('preload')) {
    ui.modelsPreload = JSON.parse(params.get('preload'));
    log('overriding preload:', ui.modelsPreload);
  }
  if (params.has('warmup')) {
    ui.modelsWarmup = params.get('warmup'); // string
    log('overriding warmup:', ui.modelsWarmup);
  }
  if (params.has('bench')) {
    ui.bench = JSON.parse(params.get('bench'));
    log('overriding bench:', ui.bench);
  }
  if (params.has('play')) {
    ui.autoPlay = true;
    log('overriding autoplay:', true);
  }
  if (params.has('draw')) {
    ui.drawWarmup = JSON.parse(params.get('draw'));
    log('overriding drawWarmup:', ui.drawWarmup);
  }
  if (params.has('async')) {
    userConfig.async = JSON.parse(params.get('async'));
    log('overriding async:', userConfig.async);
  }

  // create instance of human
  human = new Human(userConfig);
  // human.env.perfadd = true;

  log('human version:', human.version);
  // we've merged human defaults with user config and now lets store it back so it can be accessed by methods such as menu
  userConfig = human.config;
  if (typeof tf !== 'undefined') {
    // eslint-disable-next-line no-undef
    log('TensorFlow external version:', tf.version);
    // eslint-disable-next-line no-undef
    human.tf = tf; // use externally loaded version of tfjs
  }
  log('tfjs version:', human.tf.version.tfjs);

  // setup main menu
  await setupMenu();
  await resize();
  document.getElementById('log').innerText = `Human: version ${human.version}`;

  // preload models
  if (ui.modelsPreload && !ui.useWorker) {
    status('loading');
    await human.load(userConfig); // this is not required, just pre-loads all models
    const loaded = Object.keys(human.models).filter((a) => human.models[a]);
    log('demo loaded models:', loaded);
  } else {
    await human.init();
  }

  // warmup models
  if (ui.modelsWarmup && !ui.useWorker) {
    status('initializing');
    if (!userConfig.warmup || userConfig.warmup === 'none') userConfig.warmup = 'full';
    const res = await human.warmup(userConfig); // this is not required, just pre-warms all models for faster initial inference
    if (res && res.canvas && ui.drawWarmup) await drawWarmup(res);
  }

  // ready
  status('human: ready');
  document.getElementById('loader').style.display = 'none';
  document.getElementById('play').style.display = 'block';
  document.getElementById('results').style.display = 'none';

  // init drag & drop
  await dragAndDrop();

  // init segmentation
  await runSegmentation();

  if (params.has('image')) {
    try {
      const image = JSON.parse(params.get('image'));
      log('overriding image:', image);
      ui.samples = [image];
      ui.columns = 1;
    } catch {
      status('cannot parse input image');
      log('cannot parse input image', params.get('image'));
      ui.samples = [];
    }
    if (ui.samples.length > 0) await detectSampleImages();
  }

  if (params.has('images')) {
    log('overriding images list:', JSON.parse(params.get('images')));
    await detectSampleImages();
  }

  if (human.config.debug) log('environment:', human.env);
  if (human.config.backend === 'humangl' && human.config.debug) log('backend:', human.gl);
}

window.onload = main;
