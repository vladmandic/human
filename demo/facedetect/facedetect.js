/**
 * Human demo for browsers
 *
 * Demo for face detection
 */

/** @type {Human} */
import { Human } from '../../dist/human.esm.js';
import { showLoader, hideLoader } from './loader.js';

const humanConfig = { // user configuration for human, used to fine-tune behavior
  debug: true,
  modelBasePath: 'https://vladmandic.github.io/human-models/models/',
  filter: { enabled: true, equalization: false, flip: false },
  face: {
    enabled: true,
    detector: { rotation: true, maxDetected: 100, minConfidence: 0.2, return: true },
    iris: { enabled: true },
    description: { enabled: true },
    emotion: { enabled: true },
    antispoof: { enabled: true },
    liveness: { enabled: true },
  },
  body: { enabled: false },
  hand: { enabled: false },
  object: { enabled: false },
  gesture: { enabled: false },
  segmentation: { enabled: false },
};

const human = new Human(humanConfig); // new instance of human

async function addFaces(imgEl) {
  showLoader('human: busy');
  const faceEl = document.getElementById('faces');
  faceEl.innerHTML = '';
  const res = await human.detect(imgEl);
  for (const face of res.face) {
    const canvas = document.createElement('canvas');
    const emotion = face.emotion?.map((e) => `${Math.round(100 * e.score)}% ${e.emotion}`) || [];
    canvas.title = `
      source: ${imgEl.src.substring(0, 64)}
      score: ${Math.round(100 * face.boxScore)}% detection ${Math.round(100 * face.faceScore)}% analysis
      age: ${face.age} years
      gender: ${face.gender} score ${Math.round(100 * face.genderScore)}%
      emotion: ${emotion.join(' | ')}
      check: ${Math.round(100 * face.real)}% real ${Math.round(100 * face.live)}% live
    `.replace(/  /g, ' ');
    canvas.onclick = (e) => {
      e.preventDefault();
      document.getElementById('description').innerHTML = canvas.title;
    };
    human.tf.browser.toPixels(face.tensor, canvas);
    human.tf.dispose(face.tensor);
    faceEl?.appendChild(canvas);
  }
  hideLoader();
}

function addImage(imageUri) {
  const imgEl = new Image(256, 256);
  imgEl.onload = () => {
    const images = document.getElementById('images');
    images.appendChild(imgEl); // add image if loaded ok
    images.scroll(images?.offsetWidth, 0);
  };
  imgEl.onerror = () => console.error('addImage', { imageUri }); // eslint-disable-line no-console
  imgEl.onclick = () => addFaces(imgEl);
  imgEl.title = imageUri.substring(0, 64);
  imgEl.src = encodeURI(imageUri);
}

async function initDragAndDrop() {
  const reader = new FileReader();
  reader.onload = async (e) => {
    if (e.target.result.startsWith('data:image')) await addImage(e.target.result);
  };
  document.body.addEventListener('dragenter', (evt) => evt.preventDefault());
  document.body.addEventListener('dragleave', (evt) => evt.preventDefault());
  document.body.addEventListener('dragover', (evt) => evt.preventDefault());
  document.body.addEventListener('drop', async (evt) => {
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
    for (const f of evt.dataTransfer.files) reader.readAsDataURL(f);
  });
  document.body.onclick = (e) => {
    if (e.target.localName !== 'canvas') document.getElementById('description').innerHTML = '';
  };
}

async function main() {
  showLoader('loading models');
  await human.load();
  showLoader('compiling models');
  await human.warmup();
  showLoader('loading images');
  const images = ['group-1.jpg', 'group-2.jpg', 'group-3.jpg', 'group-4.jpg', 'group-5.jpg', 'group-6.jpg', 'group-7.jpg', 'solvay1927.jpg', 'stock-group-1.jpg', 'stock-group-2.jpg'];
  const imageUris = images.map((a) => `../../samples/in/${a}`);
  for (let i = 0; i < imageUris.length; i++) addImage(imageUris[i]);
  initDragAndDrop();
  hideLoader();
}

window.onload = main;
