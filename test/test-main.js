const process = require('process');
const canvasJS = require('canvas');
const fetch = require('node-fetch').default;

let config;

const log = (status, ...data) => {
  if (typeof process.send !== 'undefined') process.send([status, data]); // send to parent process over ipc
  // eslint-disable-next-line no-console
  else console.log(status, ...data); // write to console if no parent process
};

async function testHTTP() {
  if (config.modelBasePath.startsWith('file:')) return true;
  return new Promise((resolve) => {
    fetch(config.modelBasePath)
      .then((res) => {
        if (res && res.ok) log('state', 'passed: model server:', config.modelBasePath);
        else log('error', 'failed: model server:', config.modelBasePath);
        resolve(res && res.ok);
      })
      .catch((err) => {
        log('error', 'failed: model server:', err.message);
        resolve(false);
      });
  });
}

async function getImage(human, input) {
  let img;
  try {
    img = await canvasJS.loadImage(input);
  } catch (err) {
    log('error', 'failed: load image', input, err.message);
    return img;
  }
  const canvas = canvasJS.createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, img.width, img.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const res = human.tf.tidy(() => {
    const tensor = human.tf.tensor(Array.from(imageData.data), [canvas.height, canvas.width, 4], 'int32'); // create rgba image tensor from flat array
    const channels = human.tf.split(tensor, 4, 2); // split rgba to channels
    const rgb = human.tf.stack([channels[0], channels[1], channels[2]], 2); // stack channels back to rgb
    const reshape = human.tf.reshape(rgb, [1, canvas.height, canvas.width, 3]); // move extra dim from the end of tensor and use it as batch number instead
    return reshape;
  });
  if (res && res.shape[0] === 1 && res.shape[3] === 3) log('state', 'passed: load image:', input, res.shape);
  else log('error', 'failed: load image:', input, res);
  return res;
}

function printResults(detect) {
  const person = (detect.face && detect.face[0]) ? { confidence: detect.face[0].confidence, age: detect.face[0].age, gender: detect.face[0].gender } : {};
  const object = (detect.object && detect.object[0]) ? { score: detect.object[0].score, class: detect.object[0].label } : {};
  const body = (detect.body && detect.body[0]) ? { score: detect.body[0].score, keypoints: detect.body[0].keypoints.length } : {};
  const persons = detect.persons;
  if (detect.face) log('data', ' result: face:', detect.face?.length, 'body:', detect.body?.length, 'hand:', detect.hand?.length, 'gesture:', detect.gesture?.length, 'object:', detect.object?.length, 'person:', persons.length, person, object, body);
  if (detect.performance) log('data', ' result: performance:', 'load:', detect?.performance.load, 'total:', detect.performance?.total);
}

async function testInstance(human) {
  if (human) log('state', 'passed: create human');
  else log('error', 'failed: create human');

  // if (!human.tf) human.tf = tf;
  log('info', 'human version:', human.version);
  log('info', 'platform:', human.sysinfo.platform, 'agent:', human.sysinfo.agent);
  log('info', 'tfjs version:', human.tf.version.tfjs);

  await human.load();
  if (config.backend === human.tf.getBackend()) log('state', 'passed: set backend:', config.backend);
  else log('error', 'failed: set backend:', config.backend);

  if (human.models) {
    log('state', 'passed: load models');
    const keys = Object.keys(human.models);
    const loaded = keys.filter((model) => human.models[model]);
    log('state', ' result: defined models:', keys.length, 'loaded models:', loaded.length);
    return true;
  }
  log('error', 'failed: load models');
  return false;
}

async function testWarmup(human, title) {
  let warmup;
  try {
    warmup = await human.warmup(config);
  } catch (err) {
    log('error', 'error warmup');
  }
  if (warmup) {
    log('state', 'passed: warmup:', config.warmup, title);
    printResults(warmup);
    return true;
  }
  log('error', 'failed: warmup:', config.warmup, title);
  return false;
}

async function testDetect(human, input, title) {
  const image = input ? await getImage(human, input) : human.tf.randomNormal([1, 1024, 1024, 3]);
  if (!image) {
    log('error', 'failed: detect: input is null');
    return false;
  }
  let detect;
  try {
    detect = await human.detect(image, config);
  } catch (err) {
    log('error', 'error: detect', err);
  }
  if (image instanceof human.tf.Tensor) human.tf.dispose(image);
  if (detect) {
    log('state', 'passed: detect:', input || 'random', title);
    printResults(detect);
    return true;
  }
  log('error', 'failed: detect', input || 'random', title);
  return false;
}

async function test(Human, inputConfig) {
  config = inputConfig;
  const ok = await testHTTP();
  if (!ok) {
    log('error', 'aborting test');
    return;
  }
  const t0 = process.hrtime.bigint();
  const human = new Human(config);
  await testInstance(human);
  config.warmup = 'none';
  await testWarmup(human, 'default');
  config.warmup = 'face';
  await testWarmup(human, 'default');
  config.warmup = 'body';
  await testWarmup(human, 'default');

  log('info', 'test body variants');
  config.body = { modelPath: 'posenet.json', enabled: true };
  await testDetect(human, 'samples/ai-body.jpg', 'posenet');
  config.body = { modelPath: 'movenet-lightning.json', enabled: true };
  await testDetect(human, 'samples/ai-body.jpg', 'movenet');

  await testDetect(human, null, 'default');
  log('info', 'test: first instance');
  await testDetect(human, 'samples/ai-upper.jpg', 'default');
  log('info', 'test: second instance');
  const second = new Human(config);
  await testDetect(second, 'samples/ai-upper.jpg', 'default');
  log('info', 'test: concurrent');
  await Promise.all([
    testDetect(human, 'samples/ai-face.jpg', 'default'),
    testDetect(second, 'samples/ai-face.jpg', 'default'),
    testDetect(human, 'samples/ai-body.jpg', 'default'),
    testDetect(second, 'samples/ai-body.jpg', 'default'),
  ]);
  const t1 = process.hrtime.bigint();
  log('info', 'test complete:', Math.trunc(Number(t1 - t0) / 1000 / 1000), 'ms');
}

exports.test = test;
