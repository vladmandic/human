/* global QuickSettings */

import human from '../dist/human.esm.js';

const ui = {
  baseColor: 'rgba(255, 200, 255, 0.3)',
  baseFont: 'small-caps 1.2rem "Segoe UI"',
  baseLineWidth: 16,
};

const config = {
  face: {
    enabled: true,
    detector: { maxFaces: 10, skipFrames: 5, minConfidence: 0.8, iouThreshold: 0.3, scoreThreshold: 0.75 },
    mesh: { enabled: true },
    iris: { enabled: true },
    age: { enabled: true, skipFrames: 5 },
    gender: { enabled: true },
  },
  body: { enabled: true, maxDetections: 5, scoreThreshold: 0.75, nmsRadius: 20 },
  hand: { enabled: true, skipFrames: 5, minConfidence: 0.8, iouThreshold: 0.3, scoreThreshold: 0.75 },
};
let settings;

async function drawFace(result, canvas) {
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = ui.baseColor;
  ctx.strokeStyle = ui.baseColor;
  ctx.font = ui.baseFont;
  for (const face of result) {
    ctx.lineWidth = ui.baseLineWidth;
    ctx.beginPath();
    if (settings.getValue('Draw Boxes')) {
      ctx.rect(face.box[0], face.box[1], face.box[2], face.box[3]);
    }
    ctx.fillText(`face ${face.gender || ''} ${face.age || ''} ${face.iris ? 'iris: ' + face.iris : ''}`, face.box[0] + 2, face.box[1] + 22, face.box[2]);
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
      ctx.rect(hand.box[0], hand.box[1], hand.box[2], hand.box[3]);
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

async function runHumanDetect(input, canvas) {
  const log = document.getElementById('log');
  const live = input.srcObject ? ((input.srcObject.getVideoTracks()[0].readyState === 'live') && (input.readyState > 2) && (!input.paused)) : false;
  // perform detect if live video or not video at all
  if (live || !(input instanceof HTMLVideoElement)) {
    // perform detection
    const t0 = performance.now();
    let result;
    try {
      result = await human.detect(input, config);
    } catch (err) {
      log.innerText = err.message;
    }
    if (!result) return;
    const t1 = performance.now();
    // update fps
    settings.setValue('FPS', Math.round(1000 / (t1 - t0)));
    // draw image from video
    const ctx = canvas.getContext('2d');
    ctx.drawImage(input, 0, 0, input.width, input.height, 0, 0, canvas.width, canvas.height);
    // draw all results
    drawFace(result.face, canvas);
    drawBody(result.body, canvas);
    drawHand(result.hand, canvas);
    // update log
    const engine = await human.tf.engine();
    log.innerText = `
      TFJS Version: ${human.tf.version_core} Memory: ${engine.state.numBytes.toLocaleString()} bytes ${engine.state.numDataBuffers.toLocaleString()} buffers ${engine.state.numTensors.toLocaleString()} tensors
      GPU Memory: used ${engine.backendInstance.numBytesInGPU.toLocaleString()} bytes free ${Math.floor(1024 * 1024 * engine.backendInstance.numMBBeforeWarning).toLocaleString()} bytes
      Result Object Size: Face: ${(JSON.stringify(result.face)).length.toLocaleString()} bytes Body: ${(JSON.stringify(result.body)).length.toLocaleString()} bytes Hand: ${(JSON.stringify(result.hand)).length.toLocaleString()} bytes
    `;
    // rinse & repeate
    // if (input.readyState) setTimeout(() => runHumanDetect(), 1000); // slow loop for debugging purposes
    if (input.readyState) requestAnimationFrame(() => runHumanDetect(input, canvas)); // immediate loop
  }
}

function setupGUI() {
  // add all variables to ui control panel
  settings = QuickSettings.create(10, 10, 'Settings', document.getElementById('main'));
  settings.addRange('FPS', 0, 100, 0, 1);
  settings.addBoolean('Pause', false, (val) => {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    if (val) video.pause();
    else video.play();
    runHumanDetect(video, canvas);
  });
  settings.addHTML('line1', '<hr>'); settings.hideTitle('line1');
  settings.addBoolean('Draw Boxes', false);
  settings.addBoolean('Draw Points', true);
  settings.addBoolean('Draw Polygons', true);
  settings.addBoolean('Fill Polygons', true);
  settings.bindText('baseColor', ui.baseColor, config);
  settings.bindText('baseFont', ui.baseFont, config);
  settings.bindRange('baseLineWidth', 1, 100, ui.baseLineWidth, 1, config);
  settings.addHTML('line2', '<hr>'); settings.hideTitle('line2');
  settings.addBoolean('Face Detect', config.face.enabled, (val) => config.face.enabled = val);
  settings.addBoolean('Face Mesh', config.face.mesh.enabled, (val) => config.face.mesh.enabled = val);
  settings.addBoolean('Face Iris', config.face.iris.enabled, (val) => config.face.iris.enabled = val);
  settings.addBoolean('Face Age', config.face.age.enabled, (val) => config.face.age.enabled = val);
  settings.addBoolean('Face Gender', config.face.gender.enabled, (val) => config.face.gender.enabled = val);
  settings.addBoolean('Body Pose', config.body.enabled, (val) => config.body.enabled = val);
  settings.addBoolean('Hand Pose', config.hand.enabled, (val) => config.hand.enabled = val);
  settings.addHTML('line3', '<hr>'); settings.hideTitle('line3');
  settings.addRange('Max Objects', 1, 20, 5, 1, (val) => {
    config.face.detector.maxFaces = parseInt(val);
    config.body.maxDetections = parseInt(val);
  });
  settings.addRange('Skip Frames', 1, 20, config.face.detector.skipFrames, 1, (val) => {
    config.face.detector.skipFrames = parseInt(val);
    config.face.age.skipFrames = parseInt(val);
    config.hand.skipFrames = parseInt(val);
  });
  settings.addRange('Min Confidence', 0.1, 1.0, config.face.detector.minConfidence, 0.05, (val) => {
    config.face.detector.minConfidence = parseFloat(val);
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
  // initialize tensorflow
  await human.tf.setBackend('webgl');
  await human.tf.ready();
  // setup ui control panel
  await setupGUI();
  // setup webcam
  const video = await setupCamera();
  // or setup image
  // const image = await setupImage();
  // setup output canvas from input object, select video or image
  const canvas = await setupCanvas(video);
  // run actual detection. if input is video, it will run in a loop else it will run only once
  runHumanDetect(video, canvas);
}

window.onload = main;
window.onresize = main;
