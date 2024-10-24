/**
 * Human demo for browsers
 *
 * Demo for face descriptor analysis and face similarity analysis
 */

/** @type {Human} */
import { Human } from '../../dist/human.esm.js';

const userConfig = {
  backend: 'humangl',
  async: true,
  warmup: 'none',
  cacheSensitivity: 0.01,
  debug: true,
  modelBasePath: '../../models/',
  deallocate: true,
  filter: {
    enabled: true,
    equalization: true,
    width: 0,
  },
  face: {
    enabled: true,
    detector: { return: true, rotation: true, maxDetected: 50, iouThreshold: 0.01, minConfidence: 0.2 },
    mesh: { enabled: true },
    iris: { enabled: false },
    emotion: { enabled: true },
    description: { enabled: true },
  },
  hand: { enabled: false },
  gesture: { enabled: false },
  body: { enabled: false },
  segmentation: { enabled: false },
};

const human = new Human(userConfig); // new instance of human

const all = []; // array that will hold all detected faces
let db = []; // array that holds all known faces

const minScore = 0.4;

function log(...msg) {
  const dt = new Date();
  const ts = `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}.${dt.getMilliseconds().toString().padStart(3, '0')}`;
  console.log(ts, ...msg); // eslint-disable-line no-console
}

function title(msg) {
  document.getElementById('title').innerHTML = msg;
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

async function selectFaceCanvas(face) {
  // if we have face image tensor, enhance it and display it
  let embedding;
  document.getElementById('orig').style.filter = 'blur(16px)';
  if (face.tensor) {
    title('Sorting Faces by Similarity');
    const c = document.getElementById('orig');
    await human.draw.tensor(face.tensor, c);
    const arr = db.map((rec) => rec.embedding);
    const res = await human.match.find(face.embedding, arr);
    log('Match:', db[res.index].name);
    const emotion = face.emotion[0] ? `${Math.round(100 * face.emotion[0].score)}% ${face.emotion[0].emotion}` : 'N/A';
    document.getElementById('desc').innerHTML = `
      source: ${face.fileName}<br>
      match: ${Math.round(1000 * res.similarity) / 10}% ${db[res.index].name}<br>
      score: ${Math.round(100 * face.boxScore)}% detection ${Math.round(100 * face.faceScore)}% analysis<br>
      age: ${face.age} years<br>
      gender: ${Math.round(100 * face.genderScore)}% ${face.gender}<br>
      emotion: ${emotion}<br>
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
    const similarity = human.match.similarity(face.embedding, current.embedding);
    canvas.tag.similarity = similarity;
    // get best match
    // draw the canvas
    await human.draw.tensor(current.tensor, canvas);
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
    const start = human.now();
    const arr = db.map((rec) => rec.embedding);
    const res = await human.match.find(current.embedding, arr);
    time += (human.now() - start);
    if (res.similarity > minScore) ctx.fillText(`DB: ${(100 * res.similarity).toFixed(1)}% ${db[res.index].name}`, 4, canvas.height - 30);
  }

  log('Analyzed:', 'Face:', canvases.length, 'DB:', db.length, 'Time:', time);
  // sort all faces by similarity
  const sorted = document.getElementById('faces');
  [...sorted.children]
    .sort((a, b) => parseFloat(b.tag.similarity) - parseFloat(a.tag.similarity))
    .forEach((canvas) => sorted.appendChild(canvas));
  document.getElementById('orig').style.filter = 'blur(0)';
  title('Selected Face');
}

async function addFaceCanvas(index, res, fileName) {
  all[index] = res.face;
  for (const i in res.face) {
    if (!res.face[i].tensor) continue; // did not get valid results
    if ((res.face[i].faceScore || 0) < human.config.face.detector.minConfidence) continue; // face analysis score too low
    all[index][i].fileName = fileName;
    const canvas = document.createElement('canvas');
    canvas.tag = { sample: index, face: i, source: fileName };
    canvas.width = 200;
    canvas.height = 200;
    canvas.className = 'face';
    const emotion = res.face[i].emotion[0] ? `${Math.round(100 * res.face[i].emotion[0].score)}% ${res.face[i].emotion[0].emotion}` : 'N/A';
    canvas.title = `
      source: ${res.face[i].fileName}
      score: ${Math.round(100 * res.face[i].boxScore)}% detection ${Math.round(100 * res.face[i].faceScore)}% analysis
      age: ${res.face[i].age} years
      gender: ${Math.round(100 * res.face[i].genderScore)}% ${res.face[i].gender}
      emotion: ${emotion}
    `.replace(/  /g, ' ');
    await human.draw.tensor(res.face[i].tensor, canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.font = 'small-caps 0.8rem "Lato"';
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillText(`${res.face[i].age}y ${(100 * (res.face[i].genderScore || 0)).toFixed(1)}% ${res.face[i].gender}`, 4, canvas.height - 6);
    const arr = db.map((rec) => rec.embedding);
    const result = human.match.find(res.face[i].embedding, arr);
    ctx.font = 'small-caps 1rem "Lato"';
    if (result.similarity && res.similarity > minScore) ctx.fillText(`${(100 * result.similarity).toFixed(1)}% ${db[result.index].name}`, 4, canvas.height - 30);
    document.getElementById('faces').appendChild(canvas);
    canvas.addEventListener('click', (evt) => {
      log('Select:', 'Image:', evt.target.tag.sample, 'Face:', evt.target.tag.face, 'Source:', evt.target.tag.source, all[evt.target.tag.sample][evt.target.tag.face]);
      selectFaceCanvas(all[evt.target.tag.sample][evt.target.tag.face]);
    });
  }
}

async function addImageElement(index, image, length) {
  const faces = all.reduce((prev, curr) => prev += curr.length, 0);
  title(`Analyzing Input Images<br> ${Math.round(100 * index / length)}% [${index} / ${length}]<br>Found ${faces} Faces`);
  return new Promise((resolve) => {
    const img = new Image(128, 128);
    img.onload = () => { // must wait until image is loaded
      document.getElementById('images').appendChild(img); // and finally we can add it
      human.detect(img, userConfig)
        .then((res) => { // eslint-disable-line promise/always-return
          addFaceCanvas(index, res, image); // then wait until image is analyzed
          resolve(true);
        })
        .catch(() => log('human detect error'));
    };
    img.onerror = () => {
      log('Add image error:', index + 1, image);
      resolve(false);
    };
    img.title = image;
    img.src = encodeURI(image);
  });
}

function createFaceMatchDB() {
  log('Creating Faces DB...');
  for (const image of all) {
    for (const face of image) db.push({ name: 'unknown', source: face.fileName, embedding: face.embedding });
  }
  log(db);
}

async function main() {
  // pre-load human models
  await human.load();

  title('Loading Face Match Database');
  let images = [];
  let dir = [];
  // load face descriptor database
  await loadFaceMatchDB();

  // enumerate all sample images in /assets
  title('Enumerating Input Images');
  const res = await fetch('/samples/in');
  dir = (res && res.ok) ? await res.json() : [];
  images = images.concat(dir.filter((img) => (img.endsWith('.jpg') && img.includes('sample'))));

  // could not dynamically enumerate images so using static list
  if (images.length === 0) {
    images = [
      'ai-face.jpg', 'ai-upper.jpg', 'ai-body.jpg', 'solvay1927.jpg',
      'group-1.jpg', 'group-2.jpg', 'group-3.jpg', 'group-4.jpg', 'group-5.jpg', 'group-6.jpg', 'group-7.jpg',
      'person-celeste.jpg', 'person-christina.jpg', 'person-lauren.jpg', 'person-lexi.jpg', 'person-linda.jpg', 'person-nicole.jpg', 'person-tasia.jpg', 'person-tetiana.jpg', 'person-vlado.jpg', 'person-vlado1.jpg', 'person-vlado5.jpg',
      'stock-group-1.jpg', 'stock-group-2.jpg',
      'stock-models-1.jpg', 'stock-models-2.jpg', 'stock-models-3.jpg', 'stock-models-4.jpg', 'stock-models-5.jpg', 'stock-models-6.jpg', 'stock-models-7.jpg', 'stock-models-8.jpg', 'stock-models-9.jpg',
      'stock-teen-1.jpg', 'stock-teen-2.jpg', 'stock-teen-3.jpg', 'stock-teen-4.jpg', 'stock-teen-5.jpg', 'stock-teen-6.jpg', 'stock-teen-7.jpg', 'stock-teen-8.jpg',
      'stock-models-10.jpg', 'stock-models-11.jpg', 'stock-models-12.jpg', 'stock-models-13.jpg', 'stock-models-14.jpg', 'stock-models-15.jpg', 'stock-models-16.jpg',
      'cgi-model-1.jpg', 'cgi-model-2.jpg', 'cgi-model-3.jpg', 'cgi-model-4.jpg', 'cgi-model-5.jpg', 'cgi-model-6.jpg', 'cgi-model-7.jpg', 'cgi-model-8.jpg', 'cgi-model-9.jpg',
      'cgi-model-10.jpg', 'cgi-model-11.jpg', 'cgi-model-12.jpg', 'cgi-model-13.jpg', 'cgi-model-14.jpg', 'cgi-model-15.jpg', 'cgi-model-18.jpg', 'cgi-model-19.jpg',
      'cgi-model-20.jpg', 'cgi-model-21.jpg', 'cgi-model-22.jpg', 'cgi-model-23.jpg', 'cgi-model-24.jpg', 'cgi-model-25.jpg', 'cgi-model-26.jpg', 'cgi-model-27.jpg', 'cgi-model-28.jpg', 'cgi-model-29.jpg',
      'cgi-model-30.jpg', 'cgi-model-31.jpg', 'cgi-model-33.jpg', 'cgi-model-34.jpg',
      'cgi-multiangle-1.jpg', 'cgi-multiangle-2.jpg', 'cgi-multiangle-3.jpg', 'cgi-multiangle-4.jpg', 'cgi-multiangle-6.jpg', 'cgi-multiangle-7.jpg', 'cgi-multiangle-8.jpg', 'cgi-multiangle-9.jpg', 'cgi-multiangle-10.jpg', 'cgi-multiangle-11.jpg',
      'stock-emotions-a-1.jpg', 'stock-emotions-a-2.jpg', 'stock-emotions-a-3.jpg', 'stock-emotions-a-4.jpg', 'stock-emotions-a-5.jpg', 'stock-emotions-a-6.jpg', 'stock-emotions-a-7.jpg', 'stock-emotions-a-8.jpg',
      'stock-emotions-b-1.jpg', 'stock-emotions-b-2.jpg', 'stock-emotions-b-3.jpg', 'stock-emotions-b-4.jpg', 'stock-emotions-b-5.jpg', 'stock-emotions-b-6.jpg', 'stock-emotions-b-7.jpg', 'stock-emotions-b-8.jpg',
    ];
    // add prefix for gitpages
    images = images.map((a) => `../../samples/in/${a}`);
    log('Adding static image list:', images);
  } else {
    log('Discovered images:', images);
  }

  // images = ['/samples/in/person-lexi.jpg', '/samples/in/person-carolina.jpg', '/samples/in/solvay1927.jpg'];

  const t0 = human.now();
  for (let i = 0; i < images.length; i++) await addImageElement(i, images[i], images.length);
  const t1 = human.now();

  // print stats
  const num = all.reduce((prev, cur) => prev += cur.length, 0);
  log('Extracted faces:', num, 'from images:', all.length, 'time:', Math.round(t1 - t0));
  log(human.tf.engine().memory());

  // if we didn't download db, generate it from current faces
  if (!db || db.length === 0) createFaceMatchDB();

  title('');
  log('Ready');
  human.validate(userConfig);
  human.match.similarity([], []);
}

window.onload = main;
