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
    description: { enabled: true },
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

const minScore = 0.6;
const minConfidence = 0.8;

function log(...msg) {
  const dt = new Date();
  const ts = `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}.${dt.getMilliseconds().toString().padStart(3, '0')}`;
  // eslint-disable-next-line no-console
  console.log(ts, ...msg);
}

async function getFaceDB() {
  // download db with known faces
  try {
    const res = await fetch('/demo/facematch-faces.json');
    db = (res && res.ok) ? await res.json() : [];
    for (const rec of db) {
      rec.embedding = rec.embedding.map((a) => parseFloat(a.toFixed(4)));
    }
  } catch (err) {
    log('Could not load faces database', err);
  }
}

async function analyze(face) {
  // refresh faces database
  await getFaceDB();

  // if we have face image tensor, enhance it and display it
  if (face.tensor) {
    const enhanced = human.enhance(face);
    const desc = document.getElementById('desc');
    desc.innerText = `{"name":"unknown", "source":"${face.fileName}", "embedding":[${face.embedding}]},`;
    const embedding = face.embedding.map((a) => parseFloat(a.toFixed(4)));
    navigator.clipboard.writeText(`{"name":"unknown", "source":"${face.fileName}", "embedding":[${embedding}]},`);
    if (enhanced) {
      const c = document.getElementById('orig');
      const squeeze = enhanced.squeeze().div(255);
      await human.tf.browser.toPixels(squeeze, c);
      enhanced.dispose();
      squeeze.dispose();
      const ctx = c.getContext('2d');
      ctx.font = 'small-caps 0.4rem "Lato"';
      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    }
  }

  // loop through all canvases that contain faces
  const canvases = document.getElementsByClassName('face');
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
    ctx.fillText(`${current.age}y ${(100 * (current.genderConfidence || 0)).toFixed(1)}% ${current.gender}`, 4, canvas.height - 6);
    // identify person
    ctx.font = 'small-caps 1rem "Lato"';
    const person = await human.match(current.embedding, db);
    if (person.similarity && person.similarity > minScore && current.confidence > minConfidence) ctx.fillText(`${(100 * person.similarity).toFixed(1)}% ${person.name}`, 4, canvas.height - 30);
  }

  // sort all faces by similarity
  const sorted = document.getElementById('faces');
  [...sorted.children]
    .sort((a, b) => parseFloat(b.title) - parseFloat(a.title))
    .forEach((canvas) => sorted.appendChild(canvas));
}

async function faces(index, res, fileName) {
  all[index] = res.face;
  for (const i in res.face) {
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
      await human.tf.browser.toPixels(res.face[i].tensor, canvas);
      document.getElementById('faces').appendChild(canvas);
      const ctx = canvas.getContext('2d');
      ctx.font = 'small-caps 0.8rem "Lato"';
      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      ctx.fillText(`${res.face[i].age}y ${(100 * (res.face[i].genderConfidence || 0)).toFixed(1)}% ${res.face[i].gender}`, 4, canvas.height - 6);
      const person = await human.match(res.face[i].embedding, db);
      ctx.font = 'small-caps 1rem "Lato"';
      if (person.similarity && person.similarity > minScore && res.face[i].confidence > minConfidence) ctx.fillText(`${(100 * person.similarity).toFixed(1)}% ${person.name}`, 4, canvas.height - 30);
    }
  }
}

async function process(index, image) {
  return new Promise((resolve) => {
    const img = new Image(128, 128);
    img.onload = () => { // must wait until image is loaded
      human.detect(img).then(async (res) => {
        await faces(index, res, image); // then wait until image is analyzed
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

  let res;
  let images = [];
  let dir = [];
  await getFaceDB();
  // enumerate all sample images in /assets
  res = await fetch('/assets');
  dir = (res && res.ok) ? await res.json() : [];
  images = images.concat(dir.filter((img) => (img.endsWith('.jpg') && img.includes('sample'))));
  // enumerate additional private test images in /private, not includded in git repository
  res = await fetch('/private/me');
  dir = (res && res.ok) ? await res.json() : [];
  images = images.concat(dir.filter((img) => (img.endsWith('.jpg'))));

  // enumerate additional error images, not includded in git repository
  res = await fetch('/private/err');
  dir = (res && res.ok) ? await res.json() : [];
  images = images.concat(dir.filter((img) => (img.endsWith('.jpg'))));

  // download and analyze all images
  log('Enumerated:', images.length, 'images');
  for (let i = 0; i < images.length; i++) await process(i, images[i]);

  // could not dynamically enumerate images so using static list
  if (images.length === 0) {
    images = [
      '/assets/sample1.jpg',
      '/assets/sample2.jpg',
      '/assets/sample3.jpg',
      '/assets/sample4.jpg',
      '/assets/sample5.jpg',
      '/assets/sample6.jpg',
      '/assets/sample6.jpg',
      '/assets/sample-me.jpg',
      '/assets/human-sample-face.jpg',
      '/assets/human-sample-upper.jpg',
      '/assets/human-sample-body.jpg',
    ];
  }

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
