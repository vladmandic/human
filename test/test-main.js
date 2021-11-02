const fs = require('fs');
const process = require('process');
const canvasJS = require('canvas');

let fetch; // fetch is dynamically imported later
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
  if (config.backend === human.tf.getBackend()) log('state', 'passed: set backend:', config.backend);
  else log('error', 'failed: set backend:', config.backend);
  log('state', 'tensors', human.tf.memory().numTensors);

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

async function testDetect(human, input, title, checkLeak = true) {
  await human.load(config);
  const tensors = human.tf.engine().state.numTensors;
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
  // check tensor leaks
  if (checkLeak) {
    const leak = human.tf.engine().state.numTensors - tensors;
    if (leak !== 0) log('error', 'failed: memory leak', leak);
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

  // test model loading
  await human.load();
  const models = Object.keys(human.models).map((model) => ({ name: model, loaded: (human.models[model] !== null) }));
  const loaded = models.filter((model) => model.loaded);
  if (models.length === 21 && loaded.length === 10) log('state', 'passed: models loaded', models.length, loaded.length, models);
  else log('error', 'failed: models loaded', models.length, loaded.length, models);

  // increase defaults
  config.face = { detector: { maxDetected: 20 } };

  // test warmup sequences
  await testInstance(human);
  config.cacheSensitivity = 0;
  config.warmup = 'none';
  res = await testWarmup(human, 'default');
  if (res.error !== 'null') log('error', 'failed: warmup none result mismatch');
  else log('state', 'passed: warmup none result match');
  config.warmup = 'face';
  res = await testWarmup(human, 'default');
  if (!res || res?.face?.length !== 1 || res?.body?.length !== 1 || res?.hand?.length !== 1 || res?.gesture?.length !== 8) log('error', 'failed: warmup face result mismatch', res?.face?.length, res?.body?.length, res?.hand?.length, res?.gesture?.length);
  else log('state', 'passed: warmup face result match');
  config.warmup = 'body';
  res = await testWarmup(human, 'default');
  if (!res || res?.face?.length !== 1 || res?.body?.length !== 1 || res?.hand?.length !== 1 || res?.gesture?.length !== 7) log('error', 'failed: warmup body result mismatch', res?.face?.length, res?.body?.length, res?.hand?.length, res?.gesture?.length);
  else log('state', 'passed: warmup body result match');

  // test default config async
  log('info', 'test default');
  human.reset();
  config.async = true;
  config.cacheSensitivity = 0;
  res = await testDetect(human, 'samples/in/ai-body.jpg', 'default');
  if (!res || res?.face?.length !== 1 || res?.face[0].gender !== 'female') log('error', 'failed: default result face mismatch', res?.face?.length, res?.body?.length, res?.hand?.length, res?.gesture?.length);
  else log('state', 'passed: default result face match');

  // test default config sync
  log('info', 'test sync');
  human.reset();
  config.async = false;
  config.cacheSensitivity = 0;
  res = await testDetect(human, 'samples/in/ai-body.jpg', 'default');
  if (!res || res?.face?.length !== 1 || res?.face[0].gender !== 'female') log('error', 'failed: default sync', res?.face?.length, res?.body?.length, res?.hand?.length, res?.gesture?.length);
  else log('state', 'passed: default sync');

  // test image processing
  const img1 = await human.image(null);
  const img2 = await human.image(await getImage(human, 'samples/in/ai-face.jpg'));
  if (!img1 || !img2 || img1.tensor !== null || img2.tensor?.shape?.length !== 4) log('error', 'failed: image input', img1?.tensor?.shape, img2?.tensor?.shape);
  else log('state', 'passed: image input', img1?.tensor?.shape, img2?.tensor?.shape);

  // test null input
  res = await human.detect(null);
  if (!res || !res.error) log('error', 'failed: invalid input', res);
  else log('state', 'passed: invalid input', res);

  // test face similarity
  log('info', 'test face similarity');
  human.reset();
  config.async = false;
  config.cacheSensitivity = 0;
  let res1 = await testDetect(human, 'samples/in/ai-face.jpg', 'default');
  let res2 = await testDetect(human, 'samples/in/ai-body.jpg', 'default');
  let res3 = await testDetect(human, 'samples/in/ai-upper.jpg', 'default');
  const desc1 = res1 && res1.face && res1.face[0] && res1.face[0].embedding ? [...res1.face[0].embedding] : null;
  const desc2 = res2 && res2.face && res2.face[0] && res2.face[0].embedding ? [...res2.face[0].embedding] : null;
  const desc3 = res3 && res3.face && res3.face[0] && res3.face[0].embedding ? [...res3.face[0].embedding] : null;
  if (!desc1 || !desc2 || !desc3 || desc1.length !== 1024 || desc2.length !== 1024 || desc3.length !== 1024) log('error', 'failed: face descriptor', desc1?.length, desc2?.length, desc3?.length);
  else log('state', 'passed: face descriptor');
  res1 = human.similarity(desc1, desc1);
  res2 = human.similarity(desc1, desc2);
  res3 = human.similarity(desc1, desc3);
  if (res1 < 1 || res2 < 0.55 || res3 < 0.5) log('error', 'failed: face similarity', { similarity: [res1, res2, res3], descriptors: [desc1?.length, desc2?.length, desc3?.length] });
  else log('state', 'passed: face similarity', { similarity: [res1, res2, res3], descriptors: [desc1?.length, desc2?.length, desc3?.length] });

  // test face matching
  log('info', 'test face matching');
  const db = JSON.parse(fs.readFileSync('demo/facematch/faces.json').toString());
  const arr = db.map((rec) => rec.embedding);
  if (db.length < 20) log('error', 'failed: face database ', db.length);
  else log('state', 'passed: face database', db.length);
  res1 = human.match(desc1, arr);
  res2 = human.match(desc2, arr);
  res3 = human.match(desc3, arr);
  if (res1.index !== 4 || res2.index !== 4 || res3.index !== 4) log('error', 'failed: face match', res1, res2, res3);
  else log('state', 'passed: face match', { first: { index: res1.index, similarity: res1.similarity } }, { second: { index: res2.index, similarity: res2.similarity } }, { third: { index: res3.index, similarity: res3.similarity } });

  // test object detection
  log('info', 'test object');
  human.reset();
  config.object = { enabled: true };
  res = await testDetect(human, 'samples/in/ai-body.jpg', 'default');
  if (!res || res?.object?.length !== 1 || res?.object[0]?.label !== 'person') log('error', 'failed: object result mismatch', res?.object?.length);
  else log('state', 'passed: object result match');

  // test sensitive config
  log('info', 'test sensitive');
  human.reset();
  config.cacheSensitivity = 0;
  config.face = { detector: { minConfidence: 0.0001, maxDetected: 1 } };
  config.body = { minConfidence: 0.0001 };
  config.hand = { minConfidence: 0.0001 };
  res = await testDetect(human, 'samples/in/ai-body.jpg', 'default');
  if (!res || res?.face?.length !== 1 || res?.body?.length !== 1 || res?.hand?.length !== 2 || res?.gesture?.length !== 9) log('error', 'failed: sensitive result mismatch', res?.face?.length, res?.body?.length, res?.hand?.length, res?.gesture?.length);
  else log('state', 'passed: sensitive result match');

  // test sensitive details face
  const face = res && res.face ? res.face[0] : null;
  if (!face || face?.box?.length !== 4 || face?.mesh?.length !== 478 || face?.embedding?.length !== 1024 || face?.rotation?.matrix?.length !== 9) {
    log('error', 'failed: sensitive face result mismatch', res?.face?.length, face?.box?.length, face?.mesh?.length, face?.embedding?.length, face?.rotation?.matrix?.length);
  } else log('state', 'passed: sensitive face result match');
  if (!face || face?.emotion?.length < 3) log('error', 'failed: sensitive face emotion result mismatch', face?.emotion.length);
  else log('state', 'passed: sensitive face emotion result mismatch', face?.emotion.length);

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
  res = await testDetect(human, 'samples/in/ai-body.jpg', 'default');
  if (!res || res?.face?.length !== 1 || res?.face[0]?.gender || res?.face[0]?.age || res?.face[0]?.embedding) log('error', 'failed: detectors result face mismatch', res?.face);
  else log('state', 'passed: detector result face match');
  if (!res || res?.hand?.length !== 1 || res?.hand[0]?.landmarks?.length > 0) log('error', 'failed: detectors result hand mismatch', res?.hand?.length);
  else log('state', 'passed: detector result hand match');

  // test multiple instances
  const first = new Human(config);
  const second = new Human(config);
  await testDetect(human, null, 'default');
  log('info', 'test: first instance');
  await testDetect(first, 'samples/in/ai-upper.jpg', 'default');
  log('info', 'test: second instance');
  await testDetect(second, 'samples/in/ai-upper.jpg', 'default');

  // test async multiple instances
  log('info', 'test: concurrent');
  await Promise.all([
    testDetect(human, 'samples/in/ai-face.jpg', 'default', false),
    testDetect(first, 'samples/in/ai-face.jpg', 'default', false),
    testDetect(second, 'samples/in/ai-face.jpg', 'default', false),
    testDetect(human, 'samples/in/ai-body.jpg', 'default', false),
    testDetect(first, 'samples/in/ai-body.jpg', 'default', false),
    testDetect(second, 'samples/in/ai-body.jpg', 'default', false),
    testDetect(human, 'samples/in/ai-upper.jpg', 'default', false),
    testDetect(first, 'samples/in/ai-upper.jpg', 'default', false),
    testDetect(second, 'samples/in/ai-upper.jpg', 'default', false),
  ]);

  // test monkey-patch
  globalThis.Canvas = canvasJS.Canvas; // monkey-patch to use external canvas library
  globalThis.ImageData = canvasJS.ImageData; // monkey-patch to use external canvas library
  const inputImage = await canvasJS.loadImage('samples/in/ai-face.jpg'); // load image using canvas library
  const inputCanvas = new canvasJS.Canvas(inputImage.width, inputImage.height); // create canvas
  const ctx = inputCanvas.getContext('2d');
  ctx.drawImage(inputImage, 0, 0); // draw input image onto canvas
  res = await human.detect(inputCanvas);
  if (!res || res?.face?.length !== 1) log('error', 'failed: monkey patch');
  else log('state', 'passed: monkey patch');

  // test segmentation
  res = await human.segmentation(inputCanvas, inputCanvas);
  if (!res || !res.data || !res.canvas) log('error', 'failed: segmentation');
  else log('state', 'passed: segmentation', [res.data.length]);
  human.env.Canvas = undefined;

  // check if all instances reported same
  const tensors1 = human.tf.engine().state.numTensors;
  const tensors2 = first.tf.engine().state.numTensors;
  const tensors3 = second.tf.engine().state.numTensors;
  if (tensors1 === tensors2 && tensors1 === tensors3 && tensors2 === tensors3) log('state', 'passeed: equal usage');
  else log('error', 'failed: equal usage', tensors1, tensors2, tensors3);

  // tests end
  const t1 = process.hrtime.bigint();

  // report end
  log('info', 'events:', evt);
  log('info', 'tensors', human.tf.memory().numTensors);
  log('info', 'test complete:', Math.trunc(Number(t1 - t0) / 1000 / 1000), 'ms');
}

exports.test = test;
