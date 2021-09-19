const process = require('process');
const canvasJS = require('canvas');

let fetch; // fetch is dynamically imported later
let tensors = 0;
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
    const tensor = human.tf.tensor(Array.from(imageData.data), [canvas.height, canvas.width, 4], 'float32'); // create rgba image tensor from flat array
    const channels = human.tf.split(tensor, 4, 2); // split rgba to channels
    const rgb = human.tf.stack([channels[0], channels[1], channels[2]], 2); // stack channels back to rgb
    const reshape = human.tf.reshape(rgb, [1, canvas.height, canvas.width, 3]); // move extra dim from the end of tensor and use it as batch number instead
    return reshape;
  });
  const sum = human.tf.sum(res);
  if (res && res.shape[0] === 1 && res.shape[3] === 3) log('state', 'passed: load image:', input, res.shape, { checksum: sum.dataSync()[0] });
  else log('error', 'failed: load image:', input, res);
  human.tf.dispose(sum);
  return res;
}

function printResults(detect) {
  const person = (detect.face && detect.face[0]) ? { score: detect.face[0].score, age: detect.face[0].age, gender: detect.face[0].gender } : {};
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
  log('info', 'platform:', human.env.platform, 'agent:', human.env.agent);
  log('info', 'tfjs version:', human.tf.version.tfjs);

  await human.load();
  tensors = human.tf.engine().state.numTensors;
  if (config.backend === human.tf.getBackend()) log('state', 'passed: set backend:', config.backend);
  else log('error', 'failed: set backend:', config.backend);
  log('state', 'tensors', tensors);

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
    // const count = human.tf.engine().state.numTensors;
    // if (count - tensors > 0) log('warn', 'failed: memory', config.warmup, title, 'tensors:', count - tensors);
    printResults(warmup);
  } else {
    log('error', 'failed: warmup:', config.warmup, title);
  }
  return warmup;
}

async function testDetect(human, input, title) {
  await human.load(config);
  tensors = human.tf.engine().state.numTensors;
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
    // const count = human.tf.engine().state.numTensors;
    // if (count - tensors > 0) log('warn', 'failed: memory', config.warmup, title, 'tensors:', count - tensors);
    printResults(detect);
  } else {
    log('error', 'failed: detect', input || 'random', title);
  }
  return detect;
}
const evt = { image: 0, detect: 0, warmup: 0 };
async function events(event) {
  log('state', 'event:', event);
  evt[event]++;
}

async function test(Human, inputConfig) {
  config = inputConfig;
  fetch = (await import('node-fetch')).default;
  const ok = await testHTTP();
  if (!ok) {
    log('error', 'aborting test');
    return;
  }
  const t0 = process.hrtime.bigint();
  let res;

  // test event emitter
  const human = new Human(config);

  human.events.addEventListener('warmup', () => events('warmup'));
  human.events.addEventListener('image', () => events('image'));
  human.events.addEventListener('detect', () => events('detect'));

  // test configuration validation
  let invalid = human.validate();
  if (invalid.length === 0) log('state', 'passed: configuration default validation', invalid);
  else log('error', 'failed: configuration default validation', invalid);
  config.invalid = true;
  invalid = human.validate(config);
  if (invalid.length === 1) log('state', 'passed: configuration invalid validation', invalid);
  else log('error', 'failed: configuration default validation', invalid);
  delete config.invalid;

  // test warmup sequences
  await testInstance(human);
  config.warmup = 'none';
  res = await testWarmup(human, 'default');
  if (res.error !== 'null') log('error', 'failed: warmup none result mismatch');
  else log('state', 'passed: warmup none result match');
  config.warmup = 'face';
  res = await testWarmup(human, 'default');
  if (!res || res?.face?.length !== 1 || res?.body?.length !== 1 || res?.hand?.length !== 0 || res?.gesture?.length !== 3) log('error', 'failed: warmup face result mismatch', res?.face?.length, res?.body?.length, res?.hand?.length, res?.gesture?.length);
  else log('state', 'passed: warmup face result match');

  config.warmup = 'body';
  res = await testWarmup(human, 'default');
  if (!res || res?.face?.length !== 1 || res?.body?.length !== 1 || res?.hand?.length !== 0 || res?.gesture?.length !== 3) log('error', 'failed: warmup body result mismatch', res?.face?.length, res?.body?.length, res?.hand?.length, res?.gesture?.length);
  else log('state', 'passed: warmup body result match');

  // test default config
  log('info', 'test default');
  human.reset();
  config.cacheSensitivity = 0;
  res = await testDetect(human, 'samples/ai-body.jpg', 'default');
  if (!res || res?.face?.length !== 1 || res?.face[0].gender !== 'female') log('error', 'failed: default result face mismatch', res?.face?.length, res?.body?.length, res?.hand?.length, res?.gesture?.length);
  else log('state', 'passed: default result face match');

  // test default config
  log('info', 'test sync');
  human.reset();
  config.async = false;
  res = await testDetect(human, 'samples/ai-body.jpg', 'default');
  if (!res || res?.face?.length !== 1 || res?.face[0].gender !== 'female') log('error', 'failed: default sync', res?.face?.length, res?.body?.length, res?.hand?.length, res?.gesture?.length);
  else log('state', 'passed: default sync');

  // test object detection
  log('info', 'test object');
  human.reset();
  config.object = { enabled: true };
  res = await testDetect(human, 'samples/ai-body.jpg', 'default');
  if (!res || res?.object?.length !== 1 || res?.object[0]?.label !== 'person') log('error', 'failed: object result mismatch', res?.object?.length);
  else log('state', 'passed: object result match');

  // test sensitive config
  log('info', 'test sensitive');
  human.reset();
  config.cacheSensitivity = 0;
  config.face = { detector: { minConfidence: 0.0001, maxDetected: 1 } };
  config.body = { minConfidence: 0.0001, maxDetected: 1 };
  config.hand = { minConfidence: 0.0001, maxDetected: 3 };
  res = await testDetect(human, 'samples/ai-body.jpg', 'default');
  if (!res || res?.face?.length !== 1 || res?.body?.length !== 1 || res?.hand?.length !== 3 || res?.gesture?.length !== 9) log('error', 'failed: sensitive result mismatch', res?.face?.length, res?.body?.length, res?.hand?.length, res?.gesture?.length);
  else log('state', 'passed: sensitive result match');

  // test sensitive details face
  const face = res && res.face ? res.face[0] : null;
  if (!face || face?.box?.length !== 4 || face?.mesh?.length !== 478 || face?.emotion?.length !== 4 || face?.embedding?.length !== 1024 || face?.rotation?.matrix?.length !== 9) {
    log('error', 'failed: sensitive face result mismatch', res?.face?.length, face?.box?.length, face?.mesh?.length, face?.emotion?.length, face?.embedding?.length, face?.rotation?.matrix?.length);
  } else log('state', 'passed: sensitive face result match');

  // test sensitive details body
  const body = res && res.body ? res.body[0] : null;
  if (!body || body?.box?.length !== 4 || body?.keypoints?.length !== 17) log('error', 'failed: sensitive body result mismatch', body);
  else log('state', 'passed: sensitive body result match');

  // test sensitive details hand
  const hand = res && res.hand ? res.hand[0] : null;
  if (!hand || hand?.box?.length !== 4 || hand?.keypoints?.length !== 21) log('error', 'failed: sensitive hand result mismatch', hand?.keypoints?.length);
  else log('state', 'passed: sensitive hand result match');

  // test detectors only
  log('info', 'test detectors');
  human.reset();
  config.face = { mesh: { enabled: false }, iris: { enabled: false }, description: { enabled: false }, emotion: { enabled: false } };
  config.hand = { landmarks: false };
  res = await testDetect(human, 'samples/ai-body.jpg', 'default');
  if (!res || res?.face?.length !== 1 || res?.face[0]?.gender || res?.face[0]?.age || res?.face[0]?.embedding) log('error', 'failed: detectors result face mismatch', res?.face);
  else log('state', 'passed: detector result face match');
  if (!res || res?.hand?.length !== 1 || res?.hand[0]?.landmarks) log('error', 'failed: detectors result hand mismatch', res?.hand?.length);
  else log('state', 'passed: detector result hand match');

  // test posenet and movenet
  log('info', 'test body variants');
  config.body = { modelPath: 'posenet.json' };
  await testDetect(human, 'samples/ai-body.jpg', 'posenet');
  config.body = { modelPath: 'movenet-lightning.json' };
  await testDetect(human, 'samples/ai-body.jpg', 'movenet');

  // test multiple instances
  const first = new Human(config);
  const second = new Human(config);
  await testDetect(human, null, 'default');
  log('info', 'test: first instance');
  await testDetect(first, 'samples/ai-upper.jpg', 'default');
  log('info', 'test: second instance');
  await testDetect(second, 'samples/ai-upper.jpg', 'default');

  // test async multiple instances
  log('info', 'test: concurrent');
  await Promise.all([
    testDetect(human, 'samples/ai-face.jpg', 'default'),
    testDetect(first, 'samples/ai-face.jpg', 'default'),
    testDetect(second, 'samples/ai-face.jpg', 'default'),
    testDetect(human, 'samples/ai-body.jpg', 'default'),
    testDetect(first, 'samples/ai-body.jpg', 'default'),
    testDetect(second, 'samples/ai-body.jpg', 'default'),
    testDetect(human, 'samples/ai-upper.jpg', 'default'),
    testDetect(first, 'samples/ai-upper.jpg', 'default'),
    testDetect(second, 'samples/ai-upper.jpg', 'default'),
  ]);

  // tests end
  const t1 = process.hrtime.bigint();

  // check tensor leaks
  const leak = human.tf.engine().state.numTensors - tensors;
  if (leak === 0) log('state', 'passeed: no memory leak');
  else log('error', 'failed: memory leak', leak);

  // check if all instances reported same
  const tensors1 = human.tf.engine().state.numTensors;
  const tensors2 = first.tf.engine().state.numTensors;
  const tensors3 = second.tf.engine().state.numTensors;
  if (tensors1 === tensors2 && tensors1 === tensors3 && tensors2 === tensors3) log('state', 'passeed: equal usage');
  else log('error', 'failed: equal usage', tensors1, tensors2, tensors3);

  // report end
  log('info', 'events:', evt);
  log('info', 'test complete:', Math.trunc(Number(t1 - t0) / 1000 / 1000), 'ms');
}

exports.test = test;
