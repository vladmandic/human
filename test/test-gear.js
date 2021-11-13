require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');
const log = require('@vladmandic/pilogger');
const Human = require('../dist/human.node.js').default;

process.env.TF_CPP_MIN_LOG_LEVEL = '2';
const humanConfig = {
  backend: 'tensorflow',
  face: {
    detector: { enabled: true, modelPath: 'file://../human-models/models/blazeface-back.json', cropFactor: 1.6 },
    mesh: { enabled: false },
    iris: { enabled: false },
    description: { enabled: true, modelPath: 'file://../human-models/models/faceres.json' },
    gear: { enabled: true, modelPath: 'file://../human-models/models/gear.json' },
    ssrnet: { enabled: true, modelPathAge: 'file://../human-models/models/age.json', modelPathGender: 'file://../human-models/models/gender.json' },
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
    log.warn(`error loading image: ${imageFile}: ${e.message}`);
  }
  return tensor;
}

function printResult(obj) {
  if (!obj || !obj.res || !obj.res.face || obj.res.face.length === 0) log.warn('no faces detected');
  else obj.res.face.forEach((face, i) => log.data({ face: i, model: obj.model, image: obj.image, age: face.age, gender: face.gender, genderScore: face.genderScore, race: face.race }));
}

async function main() {
  log.header();
  if (process.argv.length !== 3) {
    log.error('parameters: <input-image> or <input-folder> missing');
    process.exit(1);
  }
  if (!fs.existsSync(process.argv[2])) {
    log.error(`file not found: ${process.argv[2]}`);
    process.exit(1);
  }
  const stat = fs.statSync(process.argv[2]);
  const files = [];
  if (stat.isFile()) files.push(process.argv[2]);
  else if (stat.isDirectory()) fs.readdirSync(process.argv[2]).forEach((f) => files.push(path.join(process.argv[2], f)));
  log.data('input:', files);
  await human.load();
  let res;
  for (const f of files) {
    const tensor = getImageTensor(f);
    if (!tensor) continue;
    human.config.face.description.enabled = true;
    human.config.face.gear.enabled = false;
    human.config.face.ssrnet.enabled = false;
    res = await human.detect(tensor);
    printResult({ model: 'faceres', image: f, res });
    human.config.face.description.enabled = false;
    human.config.face.gear.enabled = true;
    human.config.face.ssrnet.enabled = false;
    res = await human.detect(tensor);
    printResult({ model: 'gear', image: f, res });
    human.config.face.description.enabled = false;
    human.config.face.gear.enabled = false;
    human.config.face.ssrnet.enabled = true;
    res = await human.detect(tensor);
    printResult({ model: 'ssrnet', image: f, res });
    human.tf.dispose(tensor);
  }
}

main();
