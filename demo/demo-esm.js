/* global QuickSettings */

import human from '../dist/human.esm.js';

const ui = {
  baseColor: 'rgba(255, 200, 255, 0.3)',
  baseLabel: 'rgba(255, 200, 255, 0.8)',
  baseFont: 'small-caps 1.2rem "Segoe UI"',
  baseLineWidth: 16,
};

const config = {
  backend: 'webgl',
  console: true,
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
let settings;
let worker;
let timeStamp;

function str(...msg) {
  if (!Array.isArray(msg)) return msg;
  let line = '';
  for (const entry of msg) {
    if (typeof entry === 'object') line += JSON.stringify(entry).replace(/{|}|"|\[|\]/g, '').replace(/,/g, ', ');
    else line += entry;
  }
  return line;
}

const log = (...msg) => {
  // eslint-disable-next-line no-console
  if (config.console) console.log(...msg);
};

async function drawFace(result, canvas) {
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = ui.baseColor;
  ctx.font = ui.baseFont;
  for (const face of result) {
    ctx.fillStyle = ui.baseColor;
    ctx.lineWidth = ui.baseLineWidth;
    ctx.beginPath();
    if (settings.getValue('Draw Boxes')) {
      ctx.rect(face.box[0], face.box[1], face.box[2], face.box[3]);
    }
    const labelAgeGender = `${face.gender || ''} ${face.age || ''}`;
    const labelIris = face.iris ? `iris: ${face.iris}` : '';
    const labelEmotion = face.emotion && face.emotion[0] ? `emotion: ${Math.trunc(100 * face.emotion[0].score)}% ${face.emotion[0].emotion}` : '';
    ctx.fillStyle = ui.baseLabel;
    ctx.fillText(`face ${labelAgeGender} ${labelIris} ${labelEmotion}`, face.box[0] + 2, face.box[1] + 22, face.box[2]);
    ctx.stroke();
    ctx.lineWidth = 1;
    if (face.mesh) {
      if (settings.getValue('Draw Points')) {
        for (const point of face.mesh) {
          ctx.fillStyle = `rgba(${127.5 + (2 * point[2])}, ${127.5 - (2 * point[2])}, 255, 0.5)`;
          ctx.beginPath();
          ctx.arc(point[0], point[1], 2, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
      if (settings.getValue('Draw Polygons')) {
        for (let i = 0; i < human.facemesh.triangulation.length / 3; i++) {
          const points = [
            human.facemesh.triangulation[i * 3 + 0],
            human.facemesh.triangulation[i * 3 + 1],
            human.facemesh.triangulation[i * 3 + 2],
          ].map((index) => face.mesh[index]);
          const path = new Path2D();
          path.moveTo(points[0][0], points[0][1]);
          for (const point of points) {
            path.lineTo(point[0], point[1]);
          }
          path.closePath();
          ctx.strokeStyle = `rgba(${127.5 + (2 * points[0][2])}, ${127.5 - (2 * points[0][2])}, 255, 0.3)`;
          ctx.stroke(path);
          if (settings.getValue('Fill Polygons')) {
            ctx.fillStyle = `rgba(${127.5 + (2 * points[0][2])}, ${127.5 - (2 * points[0][2])}, 255, 0.3)`;
            ctx.fill(path);
          }
        }
      }
    }
  }
}

async function drawBody(result, canvas) {
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = ui.baseColor;
  ctx.strokeStyle = ui.baseColor;
  ctx.font = ui.baseFont;
  ctx.lineWidth = ui.baseLineWidth;
  for (const pose of result) {
    if (settings.getValue('Draw Points')) {
      for (const point of pose.keypoints) {
        ctx.beginPath();
        ctx.arc(point.position.x, point.position.y, 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
    if (settings.getValue('Draw Polygons')) {
      const path = new Path2D();
      let part;
      // torso
      part = pose.keypoints.find((a) => a.part === 'leftShoulder');
      path.moveTo(part.position.x, part.position.y);
      part = pose.keypoints.find((a) => a.part === 'rightShoulder');
      path.lineTo(part.position.x, part.position.y);
      part = pose.keypoints.find((a) => a.part === 'rightHip');
      path.lineTo(part.position.x, part.position.y);
      part = pose.keypoints.find((a) => a.part === 'leftHip');
      path.lineTo(part.position.x, part.position.y);
      part = pose.keypoints.find((a) => a.part === 'leftShoulder');
      path.lineTo(part.position.x, part.position.y);
      // legs
      part = pose.keypoints.find((a) => a.part === 'leftHip');
      path.moveTo(part.position.x, part.position.y);
      part = pose.keypoints.find((a) => a.part === 'leftKnee');
      path.lineTo(part.position.x, part.position.y);
      part = pose.keypoints.find((a) => a.part === 'leftAnkle');
      path.lineTo(part.position.x, part.position.y);
      part = pose.keypoints.find((a) => a.part === 'rightHip');
      path.moveTo(part.position.x, part.position.y);
      part = pose.keypoints.find((a) => a.part === 'rightKnee');
      path.lineTo(part.position.x, part.position.y);
      part = pose.keypoints.find((a) => a.part === 'rightAnkle');
      path.lineTo(part.position.x, part.position.y);
      // arms
      part = pose.keypoints.find((a) => a.part === 'leftShoulder');
      path.moveTo(part.position.x, part.position.y);
      part = pose.keypoints.find((a) => a.part === 'leftElbow');
      path.lineTo(part.position.x, part.position.y);
      part = pose.keypoints.find((a) => a.part === 'leftWrist');
      path.lineTo(part.position.x, part.position.y);
      // arms
      part = pose.keypoints.find((a) => a.part === 'rightShoulder');
      path.moveTo(part.position.x, part.position.y);
      part = pose.keypoints.find((a) => a.part === 'rightElbow');
      path.lineTo(part.position.x, part.position.y);
      part = pose.keypoints.find((a) => a.part === 'rightWrist');
      path.lineTo(part.position.x, part.position.y);
      // draw all
      ctx.stroke(path);
    }
  }
}

async function drawHand(result, canvas) {
  const ctx = canvas.getContext('2d');
  ctx.font = ui.baseFont;
  ctx.lineWidth = ui.baseLineWidth;
  window.result = result;
  for (const hand of result) {
    if (settings.getValue('Draw Boxes')) {
      ctx.lineWidth = ui.baseLineWidth;
      ctx.beginPath();
      ctx.fillStyle = ui.baseColor;
      ctx.rect(hand.box[0], hand.box[1], hand.box[2], hand.box[3]);
      ctx.fillStyle = ui.baseLabel;
      ctx.fillText('hand', hand.box[0] + 2, hand.box[1] + 22, hand.box[2]);
      ctx.stroke();
    }
    if (settings.getValue('Draw Points')) {
      for (const point of hand.landmarks) {
        ctx.fillStyle = `rgba(${127.5 + (2 * point[2])}, ${127.5 - (2 * point[2])}, 255, 0.5)`;
        ctx.beginPath();
        ctx.arc(point[0], point[1], 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
    if (settings.getValue('Draw Polygons')) {
      const addPart = (part) => {
        for (let i = 1; i < part.length; i++) {
          ctx.lineWidth = ui.baseLineWidth;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${127.5 + (2 * part[i][2])}, ${127.5 - (2 * part[i][2])}, 255, 0.5)`;
          ctx.moveTo(part[i - 1][0], part[i - 1][1]);
          ctx.lineTo(part[i][0], part[i][1]);
          ctx.stroke();
        }
      };
      addPart(hand.annotations.indexFinger);
      addPart(hand.annotations.middleFinger);
      addPart(hand.annotations.ringFinger);
      addPart(hand.annotations.pinky);
      addPart(hand.annotations.thumb);
      addPart(hand.annotations.palmBase);
    }
  }
}

async function drawResults(input, result, canvas) {
  // update fps
  settings.setValue('FPS', Math.round(1000 / (performance.now() - timeStamp)));
  // draw image from video
  const ctx = canvas.getContext('2d');
  ctx.drawImage(input, 0, 0, input.width, input.height, 0, 0, canvas.width, canvas.height);
  // draw all results
  drawFace(result.face, canvas);
  drawBody(result.body, canvas);
  drawHand(result.hand, canvas);
  // update log
  const engine = await human.tf.engine();
  const memory = `${engine.state.numBytes.toLocaleString()} bytes ${engine.state.numDataBuffers.toLocaleString()} buffers ${engine.state.numTensors.toLocaleString()} tensors`;
  const gpu = engine.backendInstance.numBytesInGPU ? `GPU: ${engine.backendInstance.numBytesInGPU.toLocaleString()} bytes` : '';
  document.getElementById('log').innerText = `
    TFJS Version: ${human.tf.version_core} | Backend: ${human.tf.getBackend()} | Memory: ${memory} ${gpu}
    Performance: ${str(result.performance)} | Object size: ${(str(result)).length.toLocaleString()} bytes
  `;
}

async function webWorker(input, image, canvas) {
  if (!worker) {
    log('Creating worker thread');
    // create new webworker
    worker = new Worker('demo-esm-webworker.js', { type: 'module' });
    // after receiving message from webworker, parse&draw results and send new frame for processing
    worker.addEventListener('message', async (msg) => {
      await drawResults(input, msg.data, canvas);
      // eslint-disable-next-line no-use-before-define
      requestAnimationFrame(() => runHumanDetect(input, canvas)); // immediate loop
    });
  }
  // const offscreen = image.transferControlToOffscreen();
  worker.postMessage({ image, config });
}

async function runHumanDetect(input, canvas) {
  const live = input.srcObject ? ((input.srcObject.getVideoTracks()[0].readyState === 'live') && (input.readyState > 2) && (!input.paused)) : false;
  timeStamp = performance.now();
  // perform detect if live video or not video at all
  if (live || !(input instanceof HTMLVideoElement)) {
    if (settings.getValue('Use Web Worker')) {
      // get image data from video as we cannot send html objects to webworker
      const offscreen = new OffscreenCanvas(canvas.width, canvas.height);
      const ctx = offscreen.getContext('2d');
      ctx.drawImage(input, 0, 0, input.width, input.height, 0, 0, canvas.width, canvas.height);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      // perform detection
      await webWorker(input, data, canvas);
    } else {
      let result = {};
      try {
        result = await human.detect(input, config);
      } catch (err) {
        log('Error during execution:', err.message);
      }
      await drawResults(input, result, canvas);
      if (input.readyState) requestAnimationFrame(() => runHumanDetect(input, canvas)); // immediate loop
    }
  }
}

function setupUI() {
  // add all variables to ui control panel
  settings = QuickSettings.create(10, 10, 'Settings', document.getElementById('main'));
  const style = document.createElement('style');
  // style.type = 'text/css';
  style.innerHTML = `
    .qs_main { font: 1rem "Segoe UI"; }
    .qs_label { font: 0.8rem "Segoe UI"; }
    .qs_title_bar { display: none; }
    .qs_content { background: darkslategray; }
    .qs_container { background: transparent; color: white; margin: 6px; padding: 6px; }
    .qs_checkbox_label { top: 2px; }
    .qs_button { width: -webkit-fill-available; font: 1rem "Segoe UI"; cursor: pointer; }
  `;
  document.getElementsByTagName('head')[0].appendChild(style);
  settings.addButton('Play/Pause', () => {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    if (!video.paused) {
      document.getElementById('log').innerText = 'Paused ...';
      video.pause();
    } else {
      document.getElementById('log').innerText = 'Starting Human Library ...';
      video.play();
    }
    runHumanDetect(video, canvas);
  });
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
  settings.addBoolean('Use Web Worker', false);
  settings.addBoolean('Draw Boxes', true);
  settings.addBoolean('Draw Points', true);
  settings.addBoolean('Draw Polygons', true);
  settings.addBoolean('Fill Polygons', true);
  settings.addHTML('line1', '<hr>'); settings.hideTitle('line1');
  settings.addRange('FPS', 0, 100, 0, 1);
}

async function setupCanvas(input) {
  // setup canvas object to same size as input as camera resolution may change
  const canvas = document.getElementById('canvas');
  canvas.width = input.width;
  canvas.height = input.height;
  return canvas;
}

// eslint-disable-next-line no-unused-vars
async function setupCamera() {
  log('Setting up camera');
  // setup webcam. note that navigator.mediaDevices requires that page is accessed via https
  const video = document.getElementById('video');
  if (!navigator.mediaDevices) {
    document.getElementById('log').innerText = 'Video not supported';
    return null;
  }
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { facingMode: 'user', width: window.innerWidth, height: window.innerHeight },
  });
  video.srcObject = stream;
  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      video.width = video.videoWidth;
      video.height = video.videoHeight;
      video.play();
      video.pause();
      resolve(video);
    };
  });
}

// eslint-disable-next-line no-unused-vars
async function setupImage() {
  const image = document.getElementById('image');
  image.width = window.innerWidth;
  image.height = window.innerHeight;
  return new Promise((resolve) => {
    image.onload = () => resolve(image);
    image.src = 'sample.jpg';
  });
}

async function main() {
  log('Human starting ...');

  // setup ui control panel
  await setupUI();
  // setup webcam
  const input = await setupCamera();
  // or setup image
  // const input = await setupImage();
  // setup output canvas from input object
  await setupCanvas(input);

  const msg = `Human ready: version: ${human.version} TensorFlow/JS version: ${human.tf.version_core}`;
  document.getElementById('log').innerText = msg;
  log(msg);

  // run actual detection. if input is video, it will run in a loop else it will run only once
  // runHumanDetect(video, canvas);
}

window.onload = main;
window.onresize = main;
