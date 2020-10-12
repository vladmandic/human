/* eslint-disable no-return-assign */
/* global tf, human, QuickSettings */

let paused = false;
let video;
let canvas;
let ctx;

const config = {
  face: {
    enabled: true,
    detector: { maxFaces: 10, skipFrames: 5, minConfidence: 0.8, iouThreshold: 0.3, scoreThreshold: 0.75 },
    mesh: { enabled: true },
    iris: { enabled: true },
    age: { enabled: false, skipFrames: 5 },
    gender: { enabled: false },
  },
  body: { enabled: false, maxDetections: 5, scoreThreshold: 0.75, nmsRadius: 20 },
  hand: { enabled: false, skipFrames: 5, minConfidence: 0.8, iouThreshold: 0.3, scoreThreshold: 0.75 },
};

async function drawFace(faces) {
  for (const face of faces) {
    ctx.drawImage(video, 0, 0, video.width, video.height, 0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.rect(face.box[0], face.box[1], face.box[2], face.box[3]);
    ctx.fillText(`face ${face.gender || ''} ${face.age || ''} ${face.iris ? 'iris: ' + face.iris : ''}`, face.box[0] + 2, face.box[1] + 16, face.box[2]);
    ctx.stroke();
    if (face.mesh) {
      for (const point of face.mesh) {
        ctx.fillStyle = `rgba(${127.5 + (2 * point[2])}, ${127.5 - (2 * point[2])}, 255, 0.5)`;
        ctx.beginPath();
        ctx.arc(point[0], point[1], 1 /* radius */, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }
}

async function drawBody(people) {
  //
}

async function drawHand(hands) {
  //
}

async function runHumanDetect() {
  const result = await human.detect(video, config);
  drawFace(result.face);
  drawBody(result.body);
  drawHand(result.hand);
  if (!paused) requestAnimationFrame(runHumanDetect);
}

function setupGUI() {
  const settings = QuickSettings.create(10, 10, 'Settings', document.getElementById('main'));
  settings.addBoolean('Pause', paused, (val) => { paused = val; runHumanDetect(); });
  settings.addBoolean('Face Detect', config.face.enabled, (val) => config.face.enabled = val);
  settings.addBoolean('Face Mesh', config.face.mesh.enabled, (val) => config.face.mesh.enabled = val);
  settings.addBoolean('Face Iris', config.face.iris.enabled, (val) => config.face.iris.enabled = val);
  settings.addBoolean('Face Age', config.face.age.enabled, (val) => config.face.age.enabled = val);
  settings.addBoolean('Face Gender', config.face.gender.enabled, (val) => config.face.gender.enabled = val);
  settings.addBoolean('Body Pose', config.body.enabled, (val) => config.body.enabled = val);
  settings.addBoolean('Hand Pose', config.hand.enabled, (val) => config.hand.enabled = val);
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

async function setupCanvas() {
  canvas = document.getElementById('canvas');
  canvas.width = video.width;
  canvas.height = video.height;
  ctx = canvas.getContext('2d');
  ctx.fillStyle = 'lightblue';
  ctx.strokeStyle = 'lightblue';
  ctx.lineWidth = 1;
  ctx.font = 'small-caps 1rem "Segoe UI"';
}

async function setupCamera() {
  video = document.getElementById('video');
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { facingMode: 'user', width: window.innerWidth, height: window.innerHeight },
  });
  video.srcObject = stream;
  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
      video.width = video.videoWidth;
      video.height = video.videoHeight;
      video.play();
    };
  });
}

async function main() {
  await tf.setBackend('webgl');
  await tf.ready();
  await setupGUI();
  await setupCamera();
  await setupCanvas();
  runHumanDetect();
}

window.onload = main;
