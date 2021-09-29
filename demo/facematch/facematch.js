// @ts-nocheck // typescript checks disabled as this is pure javascript

/**
 * Human demo for browsers
 *
 * Demo for face descriptor analysis and face simmilarity analysis
 */

import Human from '../../dist/human.esm.js';

const userConfig = {
  backend: 'wasm',
  async: false,
  warmup: 'none',
  cacheSimilarity: 0,
  debug: true,
  modelBasePath: '../../models/',
  // wasmPath: 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@3.9.0/dist/',
  face: {
    enabled: true,
    detector: { rotation: true, return: true, maxDetected: 20 },
    mesh: { enabled: true },
    embedding: { enabled: false },
    iris: { enabled: false },
    emotion: { enabled: true },
    description: { enabled: true },
  },
  hand: { enabled: false },
  gesture: { enabled: false },
  body: { enabled: false },
  filter: { enabled: true },
  segmentation: { enabled: false },
};

const human = new Human(userConfig); // new instance of human

const all = []; // array that will hold all detected faces
let db = []; // array that holds all known faces

const minScore = 0.4;

function log(...msg) {
  const dt = new Date();
  const ts = `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}.${dt.getMilliseconds().toString().padStart(3, '0')}`;
  // eslint-disable-next-line no-console
  console.log(ts, ...msg);
}

async function loadFaceMatchDB() {
  // download db with known faces
  try {
    let res = await fetch('/demo/facematch/faces.json');
    if (!res || !res.ok) res = await fetch('/human/demo/facematch/faces.json');
    db = (res && res.ok) ? await res.json() : [];
    log('Loaded Faces DB:', db);
  } catch (err) {
    log('Could not load faces database', err);
  }
}

async function SelectFaceCanvas(face) {
  // if we have face image tensor, enhance it and display it
  let embedding;
  if (face.tensor) {
    const enhanced = human.enhance(face);
    if (enhanced) {
      const c = document.getElementById('orig');
      const squeeze = human.tf.squeeze(enhanced);
      const normalize = human.tf.div(squeeze, 255);
      await human.tf.browser.toPixels(normalize, c);
      human.tf.dispose(enhanced);
      human.tf.dispose(squeeze);
      human.tf.dispose(normalize);
      const ctx = c.getContext('2d');
      ctx.font = 'small-caps 0.4rem "Lato"';
      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    }
    const person = await human.match(face.embedding, db);
    log('Match:', person);
    document.getElementById('desc').innerHTML = `
      ${face.fileName}<br>
      Match: ${Math.round(1000 * person.similarity) / 10}% ${person.name}
    `;
    embedding = face.embedding.map((a) => parseFloat(a.toFixed(4)));
    navigator.clipboard.writeText(`{"name":"unknown", "source":"${face.fileName}", "embedding":[${embedding}]},`);
  }

  // loop through all canvases that contain faces
  const canvases = document.getElementsByClassName('face');
  let time = 0;
  for (const canvas of canvases) {
    // calculate similarity from selected face to current one in the loop
    const current = all[canvas.tag.sample][canvas.tag.face];
    const similarity = human.similarity(face.embedding, current.embedding, 3);
    // get best match
    // draw the canvas
    canvas.title = similarity;
    await human.tf.browser.toPixels(current.tensor, canvas);
    const ctx = canvas.getContext('2d');
    ctx.font = 'small-caps 1rem "Lato"';
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillText(`${(100 * similarity).toFixed(1)}%`, 3, 23);
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillText(`${(100 * similarity).toFixed(1)}%`, 4, 24);
    ctx.font = 'small-caps 0.8rem "Lato"';
    ctx.fillText(`${current.age}y ${(100 * (current.genderScore || 0)).toFixed(1)}% ${current.gender}`, 4, canvas.height - 6);
    // identify person
    ctx.font = 'small-caps 1rem "Lato"';
    const start = performance.now();
    const person = await human.match(current.embedding, db);
    time += (performance.now() - start);
    if (person.similarity && person.similarity > minScore) ctx.fillText(`DB: ${(100 * person.similarity).toFixed(1)}% ${person.name}`, 4, canvas.height - 30);
  }

  log('Analyzed:', 'Face:', canvases.length, 'DB:', db.length, 'Time:', time);
  // sort all faces by similarity
  const sorted = document.getElementById('faces');
  [...sorted.children]
    .sort((a, b) => parseFloat(b.title) - parseFloat(a.title))
    .forEach((canvas) => sorted.appendChild(canvas));
}

async function AddFaceCanvas(index, res, fileName) {
  all[index] = res.face;
  let ok = false;
  for (const i in res.face) {
    if (res.face[i].mesh.length === 0) continue;
    ok = true;
    all[index][i].fileName = fileName;
    const canvas = document.createElement('canvas');
    canvas.tag = { sample: index, face: i, source: fileName };
    canvas.width = 200;
    canvas.height = 200;
    canvas.className = 'face';
    // mouse click on any face canvas triggers analysis
    canvas.addEventListener('click', (evt) => {
      log('Select:', 'Image:', evt.target.tag.sample, 'Face:', evt.target.tag.face, 'Source:', evt.target.tag.source, all[evt.target.tag.sample][evt.target.tag.face]);
      SelectFaceCanvas(all[evt.target.tag.sample][evt.target.tag.face]);
    });
    // if we actually got face image tensor, draw canvas with that face
    if (res.face[i].tensor) {
      await human.tf.browser.toPixels(res.face[i].tensor, canvas);
      document.getElementById('faces').appendChild(canvas);
      const ctx = canvas.getContext('2d');
      ctx.font = 'small-caps 0.8rem "Lato"';
      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      ctx.fillText(`${res.face[i].age}y ${(100 * (res.face[i].genderScore || 0)).toFixed(1)}% ${res.face[i].gender}`, 4, canvas.height - 6);
      const person = await human.match(res.face[i].embedding, db);
      ctx.font = 'small-caps 1rem "Lato"';
      if (person.similarity && person.similarity > minScore) ctx.fillText(`${(100 * person.similarity).toFixed(1)}% ${person.name}`, 4, canvas.height - 30);
    }
  }
  return ok;
}

async function AddImageElement(index, image) {
  return new Promise((resolve) => {
    const img = new Image(128, 128);
    img.onload = () => { // must wait until image is loaded
      human.detect(img, userConfig).then(async (res) => {
        const ok = await AddFaceCanvas(index, res, image); // then wait until image is analyzed
        // log('Add image:', index + 1, image, 'faces:', res.face.length);
        if (ok) document.getElementById('images').appendChild(img); // and finally we can add it
        resolve(true);
      });
    };
    img.onerror = () => {
      log('Add image error:', index + 1, image);
      resolve(false);
    };
    img.title = image;
    img.src = encodeURI(image);
  });
}

async function createFaceMatchDB() {
  log('Creating Faces DB...');
  for (const image of all) {
    for (const face of image) db.push({ name: 'unknown', source: face.fileName, embedding: face.embedding });
  }
  log(db);
}

async function main() {
  // pre-load human models
  await human.load();

  let images = [];
  let dir = [];
  // load face descriptor database
  await loadFaceMatchDB();

  // enumerate all sample images in /assets
  const res = await fetch('/samples/in');
  dir = (res && res.ok) ? await res.json() : [];
  images = images.concat(dir.filter((img) => (img.endsWith('.jpg') && img.includes('sample'))));

  // could not dynamically enumerate images so using static list
  if (images.length === 0) {
    images = [
      'ai-body.jpg', 'ai-upper.jpg',
      'person-carolina.jpg', 'person-celeste.jpg', 'person-leila1.jpg', 'person-leila2.jpg', 'person-lexi.jpg', 'person-linda.jpg', 'person-nicole.jpg', 'person-tasia.jpg',
      'person-tetiana.jpg', 'person-vlado1.jpg', 'person-vlado5.jpg', 'person-vlado.jpg', 'person-christina.jpg', 'person-lauren.jpg',
      'group-1.jpg', 'group-2.jpg', 'group-3.jpg', 'group-4.jpg', 'group-5.jpg', 'group-6.jpg', 'group-7.jpg',
      'daz3d-brianna.jpg', 'daz3d-chiyo.jpg', 'daz3d-cody.jpg', 'daz3d-drew-01.jpg', 'daz3d-drew-02.jpg', 'daz3d-ella-01.jpg', 'daz3d-ella-02.jpg', 'daz3d-gillian.jpg',
      'daz3d-hye-01.jpg', 'daz3d-hye-02.jpg', 'daz3d-kaia.jpg', 'daz3d-karen.jpg', 'daz3d-kiaria-01.jpg', 'daz3d-kiaria-02.jpg', 'daz3d-lilah-01.jpg', 'daz3d-lilah-02.jpg',
      'daz3d-lilah-03.jpg', 'daz3d-lila.jpg', 'daz3d-lindsey.jpg', 'daz3d-megah.jpg', 'daz3d-selina-01.jpg', 'daz3d-selina-02.jpg', 'daz3d-snow.jpg',
      'daz3d-sunshine.jpg', 'daz3d-taia.jpg', 'daz3d-tuesday-01.jpg', 'daz3d-tuesday-02.jpg', 'daz3d-tuesday-03.jpg', 'daz3d-zoe.jpg', 'daz3d-ginnifer.jpg',
      'daz3d-_emotions01.jpg', 'daz3d-_emotions02.jpg', 'daz3d-_emotions03.jpg', 'daz3d-_emotions04.jpg', 'daz3d-_emotions05.jpg',
    ];
    // add prefix for gitpages
    images = images.map((a) => `/human/samples/in/${a}`);
    log('Adding static image list:', images);
  } else {
    log('Disoovered images:', images);
  }

  // download and analyze all images
  for (let i = 0; i < images.length; i++) await AddImageElement(i, images[i]);

  // print stats
  const num = all.reduce((prev, cur) => prev += cur.length, 0);
  log('Extracted faces:', num, 'from images:', all.length);
  log(human.tf.engine().memory());

  // if we didn't download db, generate it from current faces
  if (!db || db.length === 0) await createFaceMatchDB();

  log('Ready');
}

window.onload = main;
