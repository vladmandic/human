/**
 * Human demo for NodeJS
 */

const log = require('@vladmandic/pilogger');
const fs = require('fs');
const path = require('path');
const process = require('process');

let fetch; // fetch is dynamically imported later

// eslint-disable-next-line import/no-extraneous-dependencies, no-unused-vars, @typescript-eslint/no-unused-vars
const tf = require('@tensorflow/tfjs-node'); // in nodejs environments tfjs-node is required to be loaded before human
// const human = require('@vladmandic/human'); // use this when human is installed as module (majority of use cases)
const Human = require('../../dist/human.node.js'); // use this when using human in dev mode

let human = null;

const myConfig = {
  // backend: 'tensorflow',
  modelBasePath: 'file://models/',
  debug: true,
  async: false,
  filter: {
    enabled: true,
    flip: true,
  },
  face: {
    enabled: true,
    detector: { enabled: true, rotation: false },
    mesh: { enabled: true },
    iris: { enabled: true },
    description: { enabled: true },
    emotion: { enabled: true },
  },
  hand: {
    enabled: true,
  },
  // body: { modelPath: 'blazepose.json', enabled: true },
  body: { enabled: true },
  object: { enabled: true },
};

async function init() {
  // create instance of human
  human = new Human.Human(myConfig);
  // wait until tf is ready
  await human.tf.ready();
  // pre-load models
  log.info('Human:', human.version);
  // log.info('Active Configuration', human.config);
  await human.load();
  const loaded = Object.keys(human.models).filter((a) => human.models[a]);
  log.info('Loaded:', loaded);
  // log.info('Memory state:', human.tf.engine().memory());
  log.data(tf.backend()['binding'] ? tf.backend()['binding']['TF_Version'] : null);
}

async function detect(input) {
  // read input image file and create tensor to be used for processing
  let buffer;
  log.info('Loading image:', input);
  if (input.startsWith('http:') || input.startsWith('https:')) {
    const res = await fetch(input);
    if (res && res.ok) buffer = await res.buffer();
    else log.error('Invalid image URL:', input, res.status, res.statusText, res.headers.get('content-type'));
  } else {
    buffer = fs.readFileSync(input);
  }

  // decode image using tfjs-node so we don't need external depenencies
  // can also be done using canvas.js or some other 3rd party image library
  if (!buffer) return {};
  const tensor = human.tf.tidy(() => {
    const decode = human.tf.node.decodeImage(buffer, 3);
    let expand;
    if (decode.shape[2] === 4) { // input is in rgba format, need to convert to rgb
      const channels = human.tf.split(decode, 4, 2); // tf.split(tensor, 4, 2); // split rgba to channels
      const rgb = human.tf.stack([channels[0], channels[1], channels[2]], 2); // stack channels back to rgb and ignore alpha
      expand = human.tf.reshape(rgb, [1, decode.shape[0], decode.shape[1], 3]); // move extra dim from the end of tensor and use it as batch number instead
    } else {
      expand = human.tf.expandDims(decode, 0);
    }
    const cast = human.tf.cast(expand, 'float32');
    return cast;
  });

  // image shape contains image dimensions and depth
  log.state('Processing:', tensor['shape']);

  // run actual detection
  let result;
  try {
    result = await human.detect(tensor, myConfig);
  } catch (err) {
    log.error('caught');
  }

  // dispose image tensor as we no longer need it
  human.tf.dispose(tensor);

  // print data to console
  log.data('Results:');
  if (result && result.face && result.face.length > 0) {
    for (let i = 0; i < result.face.length; i++) {
      const face = result.face[i];
      const emotion = face.emotion.reduce((prev, curr) => (prev.score > curr.score ? prev : curr));
      log.data(`  Face: #${i} boxScore:${face.boxScore} faceScore:${face.faceScore} age:${face.age} genderScore:${face.genderScore} gender:${face.gender} emotionScore:${emotion.score} emotion:${emotion.emotion} iris:${face.iris}`);
    }
  } else {
    log.data('  Face: N/A');
  }
  if (result && result.body && result.body.length > 0) {
    for (let i = 0; i < result.body.length; i++) {
      const body = result.body[i];
      log.data(`  Body: #${i} score:${body.score} keypoints:${body.keypoints?.length}`);
    }
  } else {
    log.data('  Body: N/A');
  }
  if (result && result.hand && result.hand.length > 0) {
    for (let i = 0; i < result.hand.length; i++) {
      const hand = result.hand[i];
      log.data(`  Hand: #${i} score:${hand.score} keypoints:${hand.keypoints?.length}`);
    }
  } else {
    log.data('  Hand: N/A');
  }
  if (result && result.gesture && result.gesture.length > 0) {
    for (let i = 0; i < result.gesture.length; i++) {
      const [key, val] = Object.entries(result.gesture[i]);
      log.data(`  Gesture: ${key[0]}#${key[1]} gesture:${val[1]}`);
    }
  } else {
    log.data('  Gesture: N/A');
  }

  if (result && result.object && result.object.length > 0) {
    for (let i = 0; i < result.object.length; i++) {
      const object = result.object[i];
      log.data(`  Object: #${i} score:${object.score} label:${object.label}`);
    }
  } else {
    log.data('  Object: N/A');
  }

  // print data to console
  if (result) {
    // invoke persons getter
    const persons = result.persons;

    // write result objects to file
    // fs.writeFileSync('result.json', JSON.stringify(result, null, 2));

    log.data('Persons:');
    for (let i = 0; i < persons.length; i++) {
      const face = persons[i].face;
      const faceTxt = face ? `score:${face.score} age:${face.age} gender:${face.gender} iris:${face.iris}` : null;
      const body = persons[i].body;
      const bodyTxt = body ? `score:${body.score} keypoints:${body.keypoints?.length}` : null;
      log.data(`  #${i}: Face:${faceTxt} Body:${bodyTxt} LeftHand:${persons[i].hands.left ? 'yes' : 'no'} RightHand:${persons[i].hands.right ? 'yes' : 'no'} Gestures:${persons[i].gestures.length}`);
    }
  }

  return result;
}

async function test() {
  process.on('unhandledRejection', (err) => {
    // @ts-ignore // no idea if exception message is compelte
    log.error(err?.message || err || 'no error message');
  });

  // test with embedded full body image
  let result;

  log.state('Processing embedded warmup image: face');
  myConfig.warmup = 'face';
  result = await human.warmup(myConfig);

  log.state('Processing embedded warmup image: full');
  myConfig.warmup = 'full';
  result = await human.warmup(myConfig);
  // no need to print results as they are printed to console during detection from within the library due to human.config.debug set
  return result;
}

async function main() {
  log.configure({ inspect: { breakLength: 265 } });
  log.header();
  log.info('Current folder:', process.env.PWD);
  fetch = (await import('node-fetch')).default;
  await init();
  const f = process.argv[2];
  if (process.argv.length !== 3) {
    log.warn('Parameters: <input image | folder> missing');
    await test();
  } else if (!fs.existsSync(f) && !f.startsWith('http')) {
    log.error(`File not found: ${process.argv[2]}`);
  } else {
    if (fs.existsSync(f)) {
      const stat = fs.statSync(f);
      if (stat.isDirectory()) {
        const dir = fs.readdirSync(f);
        for (const file of dir) {
          await detect(path.join(f, file));
        }
      } else {
        await detect(f);
      }
    } else {
      await detect(f);
    }
  }
}

main();
