const fs = require('fs');
const path = require('path');
const log = require('@vladmandic/pilogger');
const H = require('../dist/human.node.js');

const models = ['emotion.json', 'gear-e1.json', 'gear-e2.json', 'affectnet-mobilenet.json'];
const humanConfig = {
  debug: false,
  cacheSensitivity: 0,
  modelBasePath: 'https://vladmandic.github.io/human-models/models/',
  face: {
    scale: 1.4,
    detector: { enabled: true, maxDetected: 1, minSize: 256 },
    mesh: { enabled: true },
    iris: { enabled: false },
    description: { enabled: false },
    emotion: { enabled: true, crop: 0.15 },
  },
  body: { enabled: false },
  hand: { enabled: false },
  object: { enabled: false },
  gestures: { enabled: false },
};

function samples() {
  const dir = path.join(__dirname, '../samples/in');
  return fs.readdirSync(dir).filter((f) => f.includes('emotions')).map((i) => path.join(dir, i));
}

async function main() {
  log.configure({ inspect: { breakLength: 350 } });
  const inputs = process.argv.length > 2 ? process.argv.slice(2) : samples();
  const human = new H.Human(humanConfig);
  for (const model of models) {
    human.env.initial = true; // reset to allow model change instead of using cached model
    humanConfig.face.emotion.modelPath = model;
    await human.load(humanConfig);
    for (const input of inputs) {
      const stat = fs.statSync(input);
      const files = [];
      if (stat.isFile()) files.push(input);
      else if (stat.isDirectory()) fs.readdirSync(input).forEach((f) => files.push(path.join(input, f)));
      for (const f of files) {
        const buffer = fs.readFileSync(f);
        const tensor = human.tf.node.decodeImage(buffer, 3);
        const res = await human.detect(tensor);
        res.face.forEach((face) => log.info({ model, image: f, emotion: face.emotion }));
        human.tf.dispose(tensor);
      }
    }
  }
}

main();
