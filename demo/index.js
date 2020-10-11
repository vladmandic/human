/* global tf, ScatterGL, dat */

import human from '../dist/human.esm.js';

const state = {
  backend: 'webgl',
  triangulateMesh: true,
  renderPointcloud: true,
  stop: false,
  videoSize: 700,
};
const options = {
};

let ctx;
let videoWidth;
let videoHeight;
let video;
let canvas;
let scatterGLHasInitialized = false;
let scatterGL;

async function renderPrediction() {
  const predictions = await human.detect(video);
  ctx.drawImage(video, 0, 0, videoWidth, videoHeight, 0, 0, canvas.width, canvas.height);
  const div = document.getElementById('faces');
  div.innerHTML = '';
  for (const prediction of predictions) {
    div.appendChild(prediction.canvas);
    ctx.beginPath();
    ctx.rect(prediction.box[0], prediction.box[1], prediction.box[2], prediction.box[3]);
    ctx.font = 'small-caps 1rem "Segoe UI"';
    ctx.fillText(`${prediction.gender} ${prediction.age}`, prediction.box[0] + 2, prediction.box[1] + 16, prediction.box[2]);
    ctx.stroke();
    if (state.triangulateMesh) {
      for (let i = 0; i < human.triangulation.length / 3; i++) {
        const points = [human.triangulation[i * 3], human.triangulation[i * 3 + 1], human.triangulation[i * 3 + 2]].map((index) => prediction.mesh[index]);
        const region = new Path2D();
        region.moveTo(points[0][0], points[0][1]);
        for (let j = 1; i < points.length; j++) region.lineTo(points[j][0], points[j][1]);
        region.closePath();
        ctx.stroke(region);
      }
    } else {
      for (let i = 0; i < prediction.mesh.length; i++) {
        const x = prediction.mesh[i][0];
        const y = prediction.mesh[i][1];
        ctx.beginPath();
        ctx.arc(x, y, 1 /* radius */, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
    if (state.renderPointcloud && scatterGL != null) {
      const pointsData = predictions.map((pred) => pred.mesh.map((point) => ([-point[0], -point[1], -point[2]])));
      let flattenedPointsData = [];
      for (let i = 0; i < pointsData.length; i++) {
        flattenedPointsData = flattenedPointsData.concat(pointsData[i]);
      }
      const dataset = new ScatterGL.Dataset(flattenedPointsData);
      if (!scatterGLHasInitialized) scatterGL.render(dataset);
      else scatterGL.updateDataset(dataset);
      scatterGLHasInitialized = true;
    }
  }
  if (!state.stop) requestAnimationFrame(renderPrediction);
}

function setupDatGui() {
  const gui = new dat.GUI();
  gui.add(state, 'stop').onChange(() => { renderPrediction(); });
  gui.add(state, 'backend', ['webgl', 'cpu']).onChange((backend) => { tf.setBackend(backend); });
  gui.add(options, 'maxFaces', 1, 100, 1).onChange(() => { human.load(options); });
  gui.add(options, 'detectionConfidence', 0, 1, 0.05).onChange(() => { human.load(options); });
  gui.add(options, 'iouThreshold', 0, 1, 0.05).onChange(() => { human.load(options); });
  gui.add(options, 'scoreThreshold', 0, 1, 0.05).onChange(() => { human.load(options); });
  gui.add(state, 'triangulateMesh');
  gui.add(state, 'renderPointcloud').onChange((render) => { document.querySelector('#scatter-gl-container').style.display = render ? 'inline-block' : 'none'; });
}

async function setupCamera() {
  video = document.getElementById('video');
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { facingMode: 'user', width: state.videoSize, height: state.videoSize },
  });
  video.srcObject = stream;
  return new Promise((resolve) => {
    video.onloadedmetadata = () => resolve(video);
  });
}

async function main() {
  await tf.setBackend(state.backend);
  setupDatGui();
  await setupCamera();
  video.play();
  videoWidth = video.videoWidth;
  videoHeight = video.videoHeight;
  video.width = videoWidth;
  video.height = videoHeight;
  canvas = document.getElementById('output');
  canvas.width = videoWidth;
  canvas.height = videoHeight;
  const canvasContainer = document.querySelector('.canvas-wrapper');
  canvasContainer.style = `width: ${videoWidth}px; height: ${videoHeight}px`;
  ctx = canvas.getContext('2d');
  // ctx.translate(canvas.width, 0);
  // ctx.scale(-1, 1);
  ctx.fillStyle = '#32EEDB';
  ctx.strokeStyle = '#32EEDB';
  ctx.lineWidth = 0.5;
  human.load(options);
  renderPrediction();
  if (state.renderPointcloud) {
    document.querySelector('#scatter-gl-container').style = `width: ${state.videoSize}px; height: ${state.videoSize}px;`;
    scatterGL = new ScatterGL(document.querySelector('#scatter-gl-container'), { rotateOnStart: false, selectEnabled: false });
  }
}

main();
