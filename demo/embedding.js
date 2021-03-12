import Human from '../dist/human.esm.js';

const userConfig = {
  backend: 'wasm',
  async: false,
  warmup: 'none',
  debug: true,
  filter: false,
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
};

const human = new Human(userConfig); // new instance of human

const samples = ['../assets/sample-me.jpg', '../assets/sample6.jpg', '../assets/sample1.jpg', '../assets/sample4.jpg', '../assets/sample5.jpg', '../assets/sample3.jpg', '../assets/sample2.jpg'];
// const samples = ['../assets/sample-me.jpg', '../assets/sample6.jpg', '../assets/sample1.jpg', '../assets/sample4.jpg', '../assets/sample5.jpg', '../assets/sample3.jpg', '../assets/sample2.jpg',
//   '../private/me (1).jpg', '../private/me (2).jpg', '../private/me (3).jpg', '../private/me (4).jpg', '../private/me (5).jpg', '../private/me (6).jpg', '../private/me (7).jpg', '../private/me (8).jpg',
//   '../private/me (9).jpg', '../private/me (10).jpg', '../private/me (11).jpg', '../private/me (12).jpg', '../private/me (13).jpg'];

const all = []; // array that will hold all detected faces

function log(...msg) {
  const dt = new Date();
  const ts = `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}.${dt.getMilliseconds().toString().padStart(3, '0')}`;
  // eslint-disable-next-line no-console
  console.log(ts, ...msg);
}

async function analyze(face) {
  log('Face:', face);

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
    const res = human.simmilarity(face.embedding, all[canvas.tag.sample][canvas.tag.face].embedding);
    // draw the canvas and simmilarity score
    canvas.title = res;
    await human.tf.browser.toPixels(all[canvas.tag.sample][canvas.tag.face].tensor, canvas);
    const ctx = canvas.getContext('2d');
    ctx.font = 'small-caps 1rem "Lato"';
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillText(`${(100 * res).toFixed(1)}%`, 3, 19);
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillText(`${(100 * res).toFixed(1)}%`, 4, 20);
  }

  // sort all faces by simmilarity
  const sorted = document.getElementById('faces');
  [...sorted.children]
    .sort((a, b) => parseFloat(b.title) - parseFloat(a.title))
    .forEach((canvas) => sorted.appendChild(canvas));
}

async function faces(index, res) {
  all[index] = res.face;
  for (const i in res.face) {
    // log(res.face[i]);
    const canvas = document.createElement('canvas');
    canvas.tag = { sample: index, face: i };
    canvas.width = 200;
    canvas.height = 200;
    canvas.className = 'face';
    // mouse click on any face canvas triggers analysis
    canvas.addEventListener('click', (evt) => {
      log('Select:', 'Image:', evt.target.tag.sample, 'Face:', evt.target.tag.face);
      analyze(all[evt.target.tag.sample][evt.target.tag.face]);
    });
    // if we actually got face image tensor, draw canvas with that face
    if (res.face[i].tensor) {
      human.tf.browser.toPixels(res.face[i].tensor, canvas);
      document.getElementById('faces').appendChild(canvas);
    }
  }
}

async function add(index) {
  log('Add image:', samples[index]);
  return new Promise((resolve) => {
    const img = new Image(100, 100);
    img.onload = () => { // must wait until image is loaded
      human.detect(img).then((res) => faces(index, res)); // then wait until image is analyzed
      document.getElementById('images').appendChild(img); // and finally we can add it
      resolve(true);
    };
    img.title = samples[index];
    img.src = samples[index];
  });
}

async function main() {
  await human.load();
  for (const i in samples) await add(i); // download and analyze all images
  log('Ready');
}

window.onload = main;
