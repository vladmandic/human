/**
 * Human demo for NodeJS
 */

const log = require('@vladmandic/pilogger');
const fs = require('fs');
const process = require('process');

let fetch; // fetch is dynamically imported later

// eslint-disable-next-line import/no-extraneous-dependencies, no-unused-vars, @typescript-eslint/no-unused-vars
const tf = require('@tensorflow/tfjs-node'); // in nodejs environments tfjs-node is required to be loaded before human
// const faceapi = require('@vladmandic/face-api'); // use this when human is installed as module (majority of use cases)
const Human = require('../../dist/human.node.js'); // use this when using human in dev mode

let human = null;

const myConfig = {
  modelBasePath: 'file://models/',
  debug: false,
  async: true,
  filter: { enabled: false },
  face: {
    enabled: true,
    detector: { enabled: true },
    mesh: { enabled: true },
    iris: { enabled: true },
    description: { enabled: true },
    emotion: { enabled: true },
  },
  hand: { enabled: true },
  body: { enabled: true },
  object: { enabled: true },
};

async function detect(input) {
  // read input image from file or url into buffer
  let buffer;
  log.info('Loading image:', input);
  if (input.startsWith('http:') || input.startsWith('https:')) {
    fetch = (await import('node-fetch')).default;
    const res = await fetch(input);
    if (res && res.ok) buffer = await res.buffer();
    else log.error('Invalid image URL:', input, res.status, res.statusText, res.headers.get('content-type'));
  } else {
    buffer = fs.readFileSync(input);
  }

  // decode image using tfjs-node so we don't need external depenencies
  if (!buffer) return;
  const tensor = human.tf.node.decodeImage(buffer, 3);

  // run detection
  await human.detect(tensor, myConfig);
  human.tf.dispose(tensor); // dispose image tensor as we no longer need it
}

async function main() {
  log.header();

  human = new Human.Human(myConfig);

  if (human.events) {
    human.events.addEventListener('warmup', () => {
      log.info('Event Warmup');
    });

    human.events.addEventListener('load', () => {
      const loaded = Object.keys(human.models).filter((a) => human.models[a]);
      log.info('Event Loaded:', loaded, human.tf.engine().memory());
    });

    human.events.addEventListener('image', () => {
      log.info('Event Image:', human.process.tensor.shape);
    });

    human.events.addEventListener('detect', () => {
      log.data('Event Detected:');
      const persons = human.result.persons;
      for (let i = 0; i < persons.length; i++) {
        const face = persons[i].face;
        const faceTxt = face ? `score:${face.score} age:${face.age} gender:${face.gender} iris:${face.iris}` : null;
        const body = persons[i].body;
        const bodyTxt = body ? `score:${body.score} keypoints:${body.keypoints?.length}` : null;
        log.data(`  #${i}: Face:${faceTxt} Body:${bodyTxt} LeftHand:${persons[i].hands.left ? 'yes' : 'no'} RightHand:${persons[i].hands.right ? 'yes' : 'no'} Gestures:${persons[i].gestures.length}`);
      }
    });
  }

  await human.tf.ready(); // wait until tf is ready

  const input = process.argv[2]; // process input
  if (input) await detect(input);
  else log.error('Missing <input>');
}

main();
