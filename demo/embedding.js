import Human from '../dist/human.esm.js';

const userConfig = {
  backend: 'wasm',
  async: false,
  warmup: 'none',
  debug: true,
  videoOptimized: false,
  face: {
    enabled: true,
    detector: { rotation: true, return: true },
    mesh: { enabled: true },
    embedding: { enabled: true },
    iris: { enabled: false },
    age: { enabled: false },
    gender: { enabled: false },
    emotion: { enabled: false },
  },
  hand: { enabled: false },
  gesture: { enabled: false },
  body: { enabled: false },
  filter: {
    enabled: false,
  },
};

const human = new Human(userConfig); // new instance of human

const all = []; // array that will hold all detected faces
let db = []; // array that holds all known faces

function log(...msg) {
  const dt = new Date();
  const ts = `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}.${dt.getMilliseconds().toString().padStart(3, '0')}`;
  // eslint-disable-next-line no-console
  console.log(ts, ...msg);
}

async function analyze(face) {
  // if we have face image tensor, enhance it and display it
  if (face.tensor) {
    const enhanced = human.enhance(face);
    if (enhanced) {
      const c = document.getElementById('orig');
      const squeeze = enhanced.squeeze();
      human.tf.browser.toPixels(squeeze, c);
      enhanced.dispose();
      squeeze.dispose();
    }
  }

  // loop through all canvases that contain faces
  const canvases = document.getElementsByClassName('face');
  for (const canvas of canvases) {
    // calculate simmilarity from selected face to current one in the loop
    const simmilarity = human.simmilarity(face.embedding, all[canvas.tag.sample][canvas.tag.face].embedding, 2);
    // get best match
    const person = (simmilarity > 0.99) ? await human.match(face.embedding, db) : { name: '' };
    // draw the canvas and simmilarity score
    canvas.title = simmilarity;
    await human.tf.browser.toPixels(all[canvas.tag.sample][canvas.tag.face].tensor, canvas);
    const ctx = canvas.getContext('2d');
    ctx.font = 'small-caps 1rem "Lato"';
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillText(`${(100 * simmilarity).toFixed(1)}% ${person.name}`, 3, 23);
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillText(`${(100 * simmilarity).toFixed(1)}% ${person.name}`, 4, 24);
  }

  // sort all faces by simmilarity
  const sorted = document.getElementById('faces');
  [...sorted.children]
    .sort((a, b) => parseFloat(b.title) - parseFloat(a.title))
    .forEach((canvas) => sorted.appendChild(canvas));
}

function faces(index, res, fileName) {
  all[index] = res.face;
  for (const i in res.face) {
    // log(res.face[i]);
    all[index][i].fileName = fileName;
    const canvas = document.createElement('canvas');
    canvas.tag = { sample: index, face: i };
    canvas.width = 200;
    canvas.height = 200;
    canvas.className = 'face';
    // mouse click on any face canvas triggers analysis
    canvas.addEventListener('click', (evt) => {
      log('Select:', 'Image:', evt.target.tag.sample, 'Face:', evt.target.tag.face, all[evt.target.tag.sample][evt.target.tag.face]);
      analyze(all[evt.target.tag.sample][evt.target.tag.face]);
    });
    // if we actually got face image tensor, draw canvas with that face
    if (res.face[i].tensor) {
      human.tf.browser.toPixels(res.face[i].tensor, canvas);
      document.getElementById('faces').appendChild(canvas);
    }
  }
}

async function process(index, image) {
  return new Promise((resolve) => {
    const img = new Image(128, 128);
    img.onload = () => { // must wait until image is loaded
      human.detect(img).then((res) => {
        faces(index, res, image); // then wait until image is analyzed
        log('Add image:', index + 1, image, 'faces:', res.face.length);
        document.getElementById('images').appendChild(img); // and finally we can add it
        resolve(true);
      });
    };
    img.title = image;
    img.src = encodeURI(image);
  });
}

async function createDB() {
  log('Creating Faces DB...');
  for (const image of all) {
    for (const face of image) db.push({ name: 'unknown', source: face.fileName, embedding: face.embedding });
  }
  log(db);
}

async function main() {
  // pre-load human models
  await human.load();

  // download db with known faces
  let res = await fetch('/demo/faces.json');
  db = (res && res.ok) ? await res.json() : [];

  // enumerate all sample images in /assets
  res = await fetch('/assets');
  let dir = (res && res.ok) ? await res.json() : [];
  let images = dir.filter((img) => (img.endsWith('.jpg') && img.includes('sample')));

  // enumerate additional private test images in /private, not includded in git repository
  res = await fetch('/private');
  dir = (res && res.ok) ? await res.json() : [];
  images = images.concat(dir.filter((img) => (img.endsWith('.jpg'))));

  // download and analyze all images
  log('Enumerated:', images.length, 'images');
  for (let i = 0; i < images.length; i++) await process(i, images[i]);

  // print stats
  const num = all.reduce((prev, cur) => prev += cur.length, 0);
  log('Extracted faces:', num, 'from images:', all.length);
  log(human.tf.engine().memory());

  // if we didn't download db, generate it from current faces
  if (!db || db.length === 0) await createDB();
  else log('Loaded Faces DB:', db.length);

  log('Ready');
}

window.onload = main;
