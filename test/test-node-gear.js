require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');
const Human = require('../dist/human.node.js').default;

const log = (status, ...data) => {
  if (typeof process.send !== 'undefined') process.send([status, data]); // send to parent process over ipc
  else console.log(status, ...data); // eslint-disable-line no-console
};

process.env.TF_CPP_MIN_LOG_LEVEL = '2';
const humanConfig = {
  backend: 'tensorflow',
  debug: false,
  cacheSensitivity: 0,
  modelBasePath: 'https://vladmandic.github.io/human-models/models/',
  face: {
    detector: { enabled: true, modelPath: 'blazeface-back.json' },
    mesh: { enabled: true },
    iris: { enabled: false },
    description: { enabled: true, modelPath: 'faceres.json' },
    gear: { enabled: true, modelPath: 'gear.json' },
    ssrnet: { enabled: true, modelPathAge: 'age.json', modelPathGender: 'gender.json' },
    emotion: { enabled: false },
  },
  body: { enabled: false },
  hand: { enabled: false },
  object: { enabled: false },
  gestures: { enabled: false },
};
const human = new Human(humanConfig);

function getImageTensor(imageFile) {
  let tensor;
  try {
    const buffer = fs.readFileSync(imageFile);
    tensor = human.tf.node.decodeImage(buffer, 3);
  } catch (e) {
    log('error', `failed: loading image ${imageFile}: ${e.message}`);
  }
  return tensor;
}

function printResult(obj) {
  if (!obj || !obj.res || !obj.res.face || obj.res.face.length === 0) log('warn', 'failed: no faces detected');
  else obj.res.face.forEach((face, i) => log('data', 'results', { face: i, model: obj.model, image: obj.image, age: face.age, gender: face.gender, genderScore: face.genderScore, race: face.race, emotion: face.emotion }));
}

async function main() {
  const inputs = process.argv.length === 3 ? process.argv[2] : 'samples/in/ai-face.jpg';
  if (!fs.existsSync(inputs)) throw new Error(`file not found: ${inputs}`);
  const stat = fs.statSync(inputs);
  const files = [];
  if (stat.isFile()) files.push(inputs);
  else if (stat.isDirectory()) fs.readdirSync(inputs).forEach((f) => files.push(path.join(inputs, f)));
  log('data', 'input:', files);
  let res;
  for (const f of files) {
    const tensor = getImageTensor(f);
    if (!tensor) continue;
    let msg = {};

    human.config.face.description.enabled = true;
    human.config.face.gear.enabled = false;
    human.config.face.ssrnet.enabled = false;
    human.env.initial = true;
    await human.models.reset();
    await human.load();
    res = await human.detect(tensor);
    msg = { model: 'faceres', image: f, res };
    if (res?.face?.[0].age > 20 && res?.face?.[0].age < 30) log('state', 'passed: gear', msg.model, msg.image);
    else log('error', 'failed: gear', msg);
    printResult(msg);

    human.config.face.description.enabled = false;
    human.config.face.gear.enabled = true;
    human.config.face.ssrnet.enabled = false;
    human.env.initial = true;
    await human.models.reset();
    await human.load();
    res = await human.detect(tensor);
    msg = { model: 'gear', image: f, res };
    if (res?.face?.[0].age > 20 && res?.face?.[0].age < 30) log('state', 'passed: gear', msg.model, msg.image);
    else log('error', 'failed: gear', msg);
    printResult(msg);

    human.config.face.description.enabled = false;
    human.config.face.gear.enabled = false;
    human.config.face.ssrnet.enabled = true;
    human.env.initial = true;
    await human.models.reset();
    await human.load();
    res = await human.detect(tensor);
    msg = { model: 'ssrnet', image: f, res };
    if (res?.face?.[0].age > 20 && res?.face?.[0].age < 30) log('state', 'passed: gear', msg.model, msg.image);
    else log('error', 'failed: gear', msg);
    printResult(msg);

    human.config.face.description.enabled = false;
    human.config.face.gear.enabled = false;
    human.config.face.ssrnet = { enabled: true, modelPathAge: 'age.json', modelPathGender: 'gender-ssrnet-imdb.json' };
    human.env.initial = true;
    await human.models.reset();
    await human.load();
    res = await human.detect(tensor);
    msg = { model: 'ssrnet', image: f, res };
    if (res?.face?.[0].age > 20 && res?.face?.[0].age < 30) log('state', 'passed: gear', msg.model, msg.image);
    else log('error', 'failed: gear', msg);
    printResult(msg);

    human.tf.dispose(tensor);
  }
}

exports.test = main;

if (require.main === module) main();
