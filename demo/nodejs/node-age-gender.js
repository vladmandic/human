const fs = require('fs');
const process = require('process');
const log = require('@vladmandic/pilogger'); // eslint-disable-line node/no-unpublished-require
const tf = require('@tensorflow/tfjs-node'); // eslint-disable-line node/no-unpublished-require
const Human = require('../../dist/human.node.js');

const humanConfig = {
  debug: false,
  face: {
    enabled: true,
    detector: { enabled: true, modelPath: 'blazeface.json' },
    description: { enabled: true, modelPath: 'faceres.json' },
    // gear: { enabled: true, modelPath: '/home/vlado/dev/human-models/models/gear.json' },
    // ssrnet: { enabled: true, modelPathAge: '/home/vlado/dev/human-models/models/age.json', modelPathGender: '/home/vlado/dev/human-models/models/gender.json' },
    emotion: { enabled: false },
    mesh: { enabled: false },
    iris: { enabled: false },
    antispoof: { enabled: false },
    liveness: { enabled: false },
  },
  body: { enabled: false },
  hand: { enabled: false },
  gesture: { enabled: false },
};
const human = new Human.Human(humanConfig);
const ageThreshold = 18;

async function detect(inputFile) {
  try {
    const buffer = fs.readFileSync(inputFile);
    const tensor = human.tf.node.decodeImage(buffer);
    const result = await human.detect(tensor);
    human.tf.dispose(tensor);
    if (!result || !result.face || result.face.length === 0) return false;
    let msg = ` file=${inputFile} resolution=${tensor.shape}`;
    for (const face of result.face) {
      msg = ` file=${inputFile} resolution=${tensor.shape} age=${face.age} gender=${face.gender} confidence=${face.genderScore}`;
      if (face.age < ageThreshold) {
        log.warn('fail:' + msg);
        return true;
      }
    }
    log.info('pass: ' + msg);
    return false;
  } catch (err) {
    log.error(`error: file=${inputFile}: ${err}`);
  }
  return false;
}

async function main() {
  log.info(`Human: version=${human.version} tf=${tf.version_core}`);
  process.noDeprecation = true;
  if (process.argv.length < 3) return;
  await human.load();
  await human.warmup();
  const t0 = performance.now();
  const args = process.argv.slice(2);
  let pass = 0;
  let fail = 0;
  for (const arg of args) {
    const ok = await detect(arg);
    if (ok) pass++;
    else fail++;
  }
  const t1 = performance.now();
  log.info(`Human: files=${args.length} pass=${pass} fail=${fail} time=${Math.round(t1 - t0)} fps=${Math.round(10000 * args.length / (t1 - t0)) / 10}`);
}

main();
