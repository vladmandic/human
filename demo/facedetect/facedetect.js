/**
 * Human demo for browsers
 *
 * Demo for face detection
 */

/** @type {Human} */
import { Human } from '../../dist/human.esm.js';

let loader;

const humanConfig = { // user configuration for human, used to fine-tune behavior
  cacheSensitivity: 0,
  debug: true,
  modelBasePath: 'https://vladmandic.github.io/human-models/models/',
  filter: { enabled: true, equalization: false, flip: false },
  face: {
    enabled: true,
    detector: { rotation: false, maxDetected: 100, minConfidence: 0.2, return: true, square: false },
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

export const showLoader = (msg) => { loader.setAttribute('msg', msg); loader.style.display = 'block'; };
export const hideLoader = () => loader.style.display = 'none';

class ComponentLoader extends HTMLElement { // watch for attributes
  message = document.createElement('div');

  static get observedAttributes() { return ['msg']; }

  attributeChangedCallback(_name, _prevVal, currVal) {
    this.message.innerHTML = currVal;
  }

  connectedCallback() { // triggered on insert
    this.attachShadow({ mode: 'open' });
    const css = document.createElement('style');
    css.innerHTML = `
      .loader-container { top: 450px; justify-content: center; position: fixed; width: 100%; }
      .loader-message { font-size: 1.5rem; padding: 1rem; }
      .loader { width: 300px; height: 300px; border: 3px solid transparent; border-radius: 50%; border-top: 4px solid #f15e41; animation: spin 4s linear infinite; position: relative; }
      .loader::before, .loader::after { content: ""; position: absolute; top: 6px; bottom: 6px; left: 6px; right: 6px; border-radius: 50%; border: 4px solid transparent; }
      .loader::before { border-top-color: #bad375; animation: 3s spin linear infinite; }
      .loader::after { border-top-color: #26a9e0; animation: spin 1.5s linear infinite; }
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    `;
    const container = document.createElement('div');
    container.id = 'loader-container';
    container.className = 'loader-container';
    loader = document.createElement('div');
    loader.id = 'loader';
    loader.className = 'loader';
    this.message.id = 'loader-message';
    this.message.className = 'loader-message';
    this.message.innerHTML = '';
    container.appendChild(this.message);
    container.appendChild(loader);
    this.shadowRoot?.append(css, container);
    loader = this; // eslint-disable-line @typescript-eslint/no-this-alias
  }
}

customElements.define('component-loader', ComponentLoader);

function addFace(face, source) {
  const deg = (rad) => Math.round((rad || 0) * 180 / Math.PI);
  const canvas = document.createElement('canvas');
  const emotion = face.emotion?.map((e) => `${Math.round(100 * e.score)}% ${e.emotion}`) || [];
  const rotation = `pitch ${deg(face.rotation?.angle.pitch)}° | roll ${deg(face.rotation?.angle.roll)}°  | yaw ${deg(face.rotation?.angle.yaw)}°`;
  const gaze = `direction ${deg(face.rotation?.gaze.bearing)}° strength ${Math.round(100 * (face.rotation.gaze.strength || 0))}%`;
  canvas.title = `
    source: ${source}
    score: ${Math.round(100 * face.boxScore)}% detection ${Math.round(100 * face.faceScore)}% analysis
    age: ${face.age} years | gender: ${face.gender} score ${Math.round(100 * face.genderScore)}%
    emotion: ${emotion.join(' | ')}
    head rotation: ${rotation}
    eyes gaze: ${gaze}
    camera distance: ${face.distance}m | ${Math.round(100 * face.distance / 2.54)}in
    check: ${Math.round(100 * face.real)}% real ${Math.round(100 * face.live)}% live
  `.replace(/  /g, ' ');
  canvas.onclick = (e) => {
    e.preventDefault();
    document.getElementById('description').innerHTML = canvas.title;
  };
  human.draw.tensor(face.tensor, canvas);
  human.tf.dispose(face.tensor);
  return canvas;
}

async function addFaces(imgEl) {
  showLoader('human: busy');
  const faceEl = document.getElementById('faces');
  faceEl.innerHTML = '';
  const res = await human.detect(imgEl);
  console.log(res); // eslint-disable-line no-console
  document.getElementById('description').innerHTML = `detected ${res.face.length} faces`;
  for (const face of res.face) {
    const canvas = addFace(face, imgEl.src.substring(0, 64));
    faceEl.appendChild(canvas);
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
  const images = ['group-1.jpg', 'group-2.jpg', 'group-3.jpg', 'group-4.jpg', 'group-5.jpg', 'group-6.jpg', 'group-7.jpg', 'solvay1927.jpg', 'stock-group-1.jpg', 'stock-group-2.jpg', 'stock-models-6.jpg', 'stock-models-7.jpg'];
  const imageUris = images.map((a) => `../../samples/in/${a}`);
  for (let i = 0; i < imageUris.length; i++) addImage(imageUris[i]);
  initDragAndDrop();
  hideLoader();
}

window.onload = main;
