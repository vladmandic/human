const fs = require('fs');
const process = require('process');
const canvasJS = require('canvas'); // eslint-disable-line node/no-extraneous-require, node/no-missing-require

let config;
let lastOp = 'unknown';

const log = (status, ...data) => {
  if (typeof process.send !== 'undefined') process.send([status, data]); // send to parent process over ipc
  else console.log(status, ...data); // eslint-disable-line no-console
};

process.on('uncaughtException', (err) => {
  log('error', 'failed:', lastOp);
  log('error', 'uncaughtException', { name: err.name, message: err.message, cause: err.cause, stack: err.stack?.split('\n') });
  process.exit(1); // eslint-disable-line no-process-exit
  // throw new Error(err);
});

async function testHTTP() {
  if (config.modelBasePath.startsWith('file:')) return true;
  return new Promise((resolve) => {
    fetch(config.modelBasePath)
      .then((res) => {
        if (res && res.ok) log('state', 'passed: model server:', config.modelBasePath);
        else log('error', 'failed: model server:', config.modelBasePath);
        resolve(res && res.ok); // eslint-disable-line promise/always-return
      })
      .catch((err) => {
        log('error', 'failed: model server:', err.message);
        resolve(false);
      });
  });
}

async function getImage(human, input, options = { channels: 3, expand: true, cast: true }) {
  lastOp = `getImage ${input}`;
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

  const data = human.tf.tensor(Array.from(imageData.data), [canvas.height, canvas.width, 4], options.cast ? 'float32' : 'int32'); // create rgba image tensor from flat array
  const channels = options.channels === 3 ? human.tf.slice3d(data, [0, 0, 0], [-1, -1, 3]) : human.tf.clone(data); // optionally strip alpha channel
  const tensor = options.expand ? human.tf.expandDims(channels, 0) : human.tf.clone(channels); // optionally add batch num dimension
  human.tf.dispose([data, channels]);
  const sum = human.tf.sum(tensor);
  log('state', 'passed: load image:', input, tensor.shape, { checksum: sum.dataSync()[0] });
  human.tf.dispose(sum);
  return tensor;
}

function printResults(detect) {
  lastOp = `printResults ${detect}`;
  const person = (detect.face && detect.face[0]) ? { score: detect.face[0]?.score, age: detect.face[0]?.age, gender: detect.face[0]?.gender } : {};
  const object = (detect.object && detect.object[0]) ? { score: detect.object[0]?.score, class: detect.object[0].label } : {};
  const body = (detect.body && detect.body[0]) ? { score: detect.body[0]?.score, keypoints: detect.body[0]?.keypoints?.length } : {};
  const persons = detect.persons;
  if (detect.face) log('data', ' result: face:', detect.face?.length, 'body:', detect.body?.length, 'hand:', detect.hand?.length, 'gesture:', detect.gesture?.length, 'object:', detect.object?.length, 'person:', persons.length, person, object, body);
  if (detect.performance) log('data', ' result: performance:', 'load:', detect?.performance.load, 'total:', detect.performance?.total);
}

async function testInstance(human) {
  lastOp = `testInstance ${human}`;
  if (human) log('state', 'passed: create human');
  else log('error', 'failed: create human');

  // if (!human.tf) human.tf = tf;
  log('info', 'human version:', human.version);
  log('info', 'platform:', human.env.platform, 'agent:', human.env.agent);
  log('info', 'tfjs version:', human.tf.version.tfjs);
  const env = JSON.parse(JSON.stringify(human.env));
  env.kernels = human.env.kernels.length;
  log('info', 'env:', env);

  await human.load();
  if (config.backend === human.tf.getBackend()) {
    log('state', 'passed: set backend:', config.backend);
  } else {
    log('error', 'failed: set backend:', config.backend); // abort immediately
    return false;
  }
  log('state', 'tensors', human.tf.memory().numTensors);

  const keys = Object.keys(human.models.models);
  const loaded = human.models.loaded();
  log('state', ' result: defined models:', keys.length, 'loaded models:', loaded.length);
  if (loaded.length > 10) {
    log('state', 'passed: load models', loaded.length);
    return true;
  }
  log('error', 'failed: load models', loaded.length);
  return false;
}

async function testWarmup(human, title) {
  lastOp = `testWarmup ${title}`;
  let warmup;
  // try default
  try {
    warmup = await human.warmup(config);
  } catch (err) {
    log('error', 'error warmup');
  }
  if (warmup) {
    log('state', 'passed: warmup:', config.warmup, title);
    printResults(warmup);
  } else {
    log('error', 'failed: warmup:', config.warmup, title);
  }

  return warmup;
}

async function testDetect(human, input, title, checkLeak = true) {
  lastOp = `testDetect ${title}`;
  log('state', 'start', title);
  await human.load(config);
  const missing = human.models.validate();
  for (const op of missing) log('warn', 'missing kernel ops', { title, model: op.name, url: op.url, missing: op.missing, backkend: human.tf.getBackend() });
  const tensors = human.tf.engine().state.numTensors;
  const image = input ? await getImage(human, input) : human.tf.randomNormal([1, 1024, 1024, 3]);
  if (!image) {
    log('error', 'failed: detect: input is null', { input, title });
    return false;
  }
  lastOp = `testDetect ${title}`;
  let detect = {};
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

const verify = (state, ...messages) => {
  lastOp = `verify ${messages}`;
  if (state) log('state', 'passed:', ...messages);
  else log('error', 'failed:', ...messages);
};

async function verifyDetails(human) {
  lastOp = `verifyDetails ${human}`;
  log('info', 'test: details verification');
  const res = await testDetect(human, 'samples/in/ai-body.jpg', 'default');
  verify(res.face.length === 1, 'details face length', res.face.length);
  for (const face of res.face) {
    verify(face.score > 0.9 && face.boxScore > 0.9 && face.faceScore > 0.9, 'details face score', face.score, face.boxScore, face.faceScore);
    verify(face.age > 23 && face.age < 30 && face.gender === 'female' && face.genderScore > 0.9 && face.distance > 0.5 && face.distance < 2.5, 'details face age/gender', face.age, face.gender, face.genderScore, face.distance);
    verify(face.box.length === 4 && face.boxRaw.length === 4 && face.mesh.length === 478 && face.meshRaw.length === 478 && face.embedding.length === 1024, 'details face arrays', face.box.length, face.mesh.length, face.embedding.length);
    verify(face.emotion.length >= 2 && face.emotion[0].score > 0.30 && face.emotion[0].emotion === 'angry', 'details face emotion', face.emotion.length, face.emotion[0]);
    verify(face.real > 0.55, 'details face anti-spoofing', face.real);
    verify(face.live > 0.70, 'details face liveness', face.live);
  }
  verify(res.body.length === 1, 'details body length', res.body.length);
  for (const body of res.body) {
    verify(body.score > 0.9 && body.box.length === 4 && body.boxRaw.length === 4 && body.keypoints.length === 17 && Object.keys(body.annotations).length === 6, 'details body', body.score, body.keypoints.length, Object.keys(body.annotations).length);
  }
  verify(res.hand.length === 1, 'details hand length', res.hand.length);
  for (const hand of res.hand) {
    verify(hand.score > 0.5 && hand.boxScore > 0.5 && hand.fingerScore > 0.5 && hand.box.length === 4 && hand.boxRaw.length === 4 && hand.label === 'point', 'details hand', hand.boxScore, hand.fingerScore, hand.label);
    verify(hand.keypoints.length === 21 && Object.keys(hand.landmarks).length === 5 && Object.keys(hand.annotations).length === 7, 'details hand arrays', hand.keypoints.length, Object.keys(hand.landmarks).length, Object.keys(hand.annotations).length);
  }
  verify(res.gesture.length >= 6, 'details gesture length', res.gesture.length);
  verify(res.gesture[0].gesture === 'facing right', 'details gesture first', res.gesture[0]);
  verify(res.object.length === 1, 'details object length', res.object.length);
  for (const obj of res.object) {
    verify(obj.score > 0.7 && obj.label === 'person' && obj.box.length === 4 && obj.boxRaw.length === 4, 'details object', obj.score, obj.label);
  }
}

async function testTensorShapes(human, input) {
  lastOp = `testTensorShapes ${input}`;
  await human.load(config);
  const numTensors = human.tf.engine().state.numTensors;
  let res;
  let tensor;

  tensor = await getImage(human, input, { channels: 4, expand: true, cast: true });
  res = await human.detect(tensor, config);
  verify(res.face.length === 1 && res.face[0].gender === 'female', 'tensor shape:', tensor.shape, 'dtype:', tensor.dtype);
  human.tf.dispose(tensor);

  tensor = await getImage(human, input, { channels: 4, expand: false, cast: true });
  res = await human.detect(tensor, config);
  verify(res.face.length === 1 && res.face[0].gender === 'female', 'tensor shape:', tensor.shape, 'dtype:', tensor.dtype);
  human.tf.dispose(tensor);

  tensor = await getImage(human, input, { channels: 3, expand: true, cast: true });
  res = await human.detect(tensor, config);
  verify(res.face.length === 1 && res.face[0].gender === 'female', 'tensor shape:', tensor.shape, 'dtype:', tensor.dtype);
  human.tf.dispose(tensor);

  tensor = await getImage(human, input, { channels: 3, expand: false, cast: true });
  res = await human.detect(tensor, config);
  verify(res.face.length === 1 && res.face[0].gender === 'female', 'tensor shape:', tensor.shape, 'dtype:', tensor.dtype);
  human.tf.dispose(tensor);

  tensor = await getImage(human, input, { channels: 4, expand: true, cast: false });
  res = await human.detect(tensor, config);
  verify(res.face.length === 1 && res.face[0].gender === 'female', 'tensor shape:', tensor.shape, 'dtype:', tensor.dtype);
  human.tf.dispose(tensor);

  const leak = human.tf.engine().state.numTensors - numTensors;
  if (leak !== 0) log('error', 'failed: memory leak', leak);
}

async function verifyCompare(human) {
  lastOp = `verifyCompare ${human}`;
  log('info', 'test: input compare');
  const t1 = await getImage(human, 'samples/in/ai-face.jpg');
  const t2 = await getImage(human, 'samples/in/ai-body.jpg');
  const n1 = await human.compare(t1, t1);
  const n2 = await human.compare(t1, t2);
  const n3 = await human.compare(t2, t1);
  const n4 = await human.compare(t2, t2);
  verify(n1 === 0 && n4 === 0 && Math.round(n2) === Math.round(n3) && n2 > 20 && n2 < 30, 'image compare', n1, n2);
  human.tf.dispose([t1, t2]);
}

async function test(Human, inputConfig) {
  lastOp = `test ${inputConfig}`;
  config = inputConfig;
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
  log('info', 'test: configuration validation');
  let invalid = human.validate();
  if (invalid.length === 0) log('state', 'passed: configuration default validation', invalid);
  else log('error', 'failed: configuration default validation', invalid);
  config.invalid = true;
  invalid = human.validate(config);
  if (invalid.length === 1) log('state', 'passed: configuration invalid validation', invalid);
  else log('error', 'failed: configuration default validation', invalid);
  delete config.invalid;

  // test model loading
  log('info', 'test: model load');
  await human.load();
  const models = human.models.list();
  const loaded = human.models.loaded();
  if (loaded.length === 11) log('state', 'passed: models loaded', models.length, loaded.length, models);
  else log('error', 'failed: models loaded', models.length, loaded.length, models);
  log('info', 'memory:', { memory: human.tf.memory() });
  log('info', 'state:', { state: human.tf.engine().state });

  // increase defaults
  config.face = { detector: { maxDetected: 20 } };

  // test warmup sequences
  log('info', 'test: warmup');
  res = await testInstance(human);
  if (!res) {
    log('error', 'failed: instance backend:', human.tf.getBackend());
    return;
  }
  config.cacheSensitivity = 0;
  config.warmup = 'none';
  res = await testWarmup(human, 'default');
  if (res.error !== null) log('error', 'failed: warmup none result mismatch');
  else log('state', 'passed: warmup none result match');
  config.warmup = 'face';
  res = await testWarmup(human, 'default');
  if (!res || res?.face?.length !== 1 || res?.body?.length !== 1 || res?.hand?.length !== 1 || res?.gesture?.length < 6) log('error', 'failed: warmup face result mismatch', res?.face?.length, res?.body?.length, res?.hand?.length, res?.gesture?.length);
  else log('state', 'passed: warmup face result match');
  config.warmup = 'body';
  res = await testWarmup(human, 'default');
  if (!res || res?.face?.length !== 1 || res?.body?.length !== 1 || res?.hand?.length !== 1 || res?.gesture?.length < 6) log('error', 'failed: warmup body result mismatch', res?.face?.length, res?.body?.length, res?.hand?.length, res?.gesture?.length);
  else log('state', 'passed: warmup body result match');
  if (res) {
    log('state', 'details:', {
      face: { boxScore: res.face[0].boxScore, faceScore: res.face[0].faceScore, age: res.face[0].age, gender: res.face[0].gender, genderScore: res.face[0].genderScore },
      emotion: res.face[0].emotion,
      body: { score: res.body[0]?.score, keypoints: res.body[0]?.keypoints.length },
      hand: { boxScore: res.hand[0]?.boxScore, fingerScore: res.hand[0]?.fingerScore, keypoints: res.hand[0]?.keypoints.length },
      gestures: res.gesture,
    });
  }

  await verifyDetails(human);
  await testTensorShapes(human, 'samples/in/ai-body.jpg');

  // test default config async
  log('info', 'test default');
  human.reset();
  config.async = true;
  config.cacheSensitivity = 0;
  res = await testDetect(human, 'samples/in/ai-body.jpg', 'async');
  if (!res || res.face?.length !== 1 || res.face[0].gender !== 'female') log('error', 'failed: default result face mismatch', res.face?.length, res.face[0].gender, res.face[0].genderScore);
  else log('state', 'passed: default result face match', res.face?.length, res.face[0]?.gender, res.face[0]?.genderScore);

  // test default config sync
  log('info', 'test sync');
  human.reset();
  config.async = false;
  config.cacheSensitivity = 0;
  res = await testDetect(human, 'samples/in/ai-body.jpg', 'sync');
  if (!res || res.face?.length !== 1 || res.face[0].gender !== 'female') log('error', 'failed: default sync', res.face?.length, res.face[0].gender, res.face[0].genderScore);
  else log('state', 'passed: default sync', res.face?.length, res.face[0]?.gender, res.face[0]?.genderScore);

  // test image processing
  log('info', 'test: image process');
  const img1 = await human.image(null, true);
  const img2 = await human.image(await getImage(human, 'samples/in/ai-face.jpg'), true);
  if (!img1 || !img2 || img1.tensor !== null || img2.tensor?.shape?.length !== 4) log('error', 'failed: image input', img1?.tensor?.shape, img2?.tensor?.shape);
  else log('state', 'passed: image input', img1?.tensor?.shape, img2?.tensor?.shape);

  // test null input
  log('info', 'test: image null');
  res = await human.detect(null);
  if (!res || !res.error) log('error', 'failed: invalid input', res);
  else log('state', 'passed: invalid input', res.error || res);

  // test face similarity
  log('info', 'test face similarity');
  human.reset();
  config.async = false;
  config.cacheSensitivity = 0;
  let res1 = await testDetect(human, 'samples/in/ai-face.jpg', 'face similarity');
  let res2 = await testDetect(human, 'samples/in/ai-body.jpg', 'face similarity');
  let res3 = await testDetect(human, 'samples/in/ai-upper.jpg', 'face similarity');
  const desc1 = res1 && res1.face && res1.face[0] && res1.face[0].embedding ? [...res1.face[0].embedding] : null;
  const desc2 = res2 && res2.face && res2.face[0] && res2.face[0].embedding ? [...res2.face[0].embedding] : null;
  const desc3 = res3 && res3.face && res3.face[0] && res3.face[0].embedding ? [...res3.face[0].embedding] : null;
  if (!desc1 || !desc2 || !desc3 || desc1.length !== 1024 || desc2.length !== 1024 || desc3.length !== 1024) log('error', 'failed: face descriptor', desc1?.length, desc2?.length, desc3?.length);
  else log('state', 'passed: face descriptor');
  res1 = human.match.similarity(desc1, desc1);
  res2 = human.match.similarity(desc1, desc2);
  res3 = human.match.similarity(desc1, desc3);
  if (res1 < 1 || res2 < 0.40 || res3 < 0.40 || res2 > 0.75 || res3 > 0.75) log('error', 'failed: face similarity', { similarity: [res1, res2, res3], descriptors: [desc1?.length, desc2?.length, desc3?.length] });
  else log('state', 'passed: face similarity', { similarity: [res1, res2, res3], descriptors: [desc1?.length, desc2?.length, desc3?.length] });

  // test object detection
  log('info', 'test object');
  config.object = { enabled: true, modelPath: 'centernet.json' };
  res = await testDetect(human, 'samples/in/ai-body.jpg', 'object');
  if (!res || res.object?.length < 1 || res.object[0]?.label !== 'person') log('error', 'failed: centernet', res.object);
  else log('state', 'passed: centernet');
  human.models.models.centernet = null;
  config.object = { enabled: true, modelPath: 'https://vladmandic.github.io/human-models/models/nanodet.json' };
  res = await testDetect(human, 'samples/in/ai-body.jpg', 'object');
  if (!res || res.object?.length < 1 || res.object[0]?.label !== 'person') log('error', 'failed: nanodet', res.object);
  else log('state', 'passed: nanodet');
  human.models.models.nanodet = null;
  config.object.enabled = false;

  // test sensitive config
  log('info', 'test sensitive');
  human.reset();
  config.cacheSensitivity = 0;
  config.face = { detector: { minConfidence: 0.0001, maxDetected: 1 } };
  config.body = { minConfidence: 0.0001 };
  config.hand = { minConfidence: 0.0001 };
  res = await testDetect(human, 'samples/in/ai-body.jpg', 'sensitive');
  if (!res || res.face?.length !== 1 || res.body?.length !== 1 || res.hand?.length !== 2 || res.gesture?.length < 8) log('error', 'failed: sensitive result mismatch', res.face?.length, res.body?.length, res.hand?.length, res.gesture?.length);
  else log('state', 'passed: sensitive result match');

  // test sensitive details face
  const face = res && res.face ? res.face[0] : null;
  if (!face || face?.box?.length !== 4 || face?.mesh?.length !== 478 || face?.embedding?.length !== 1024 || face?.rotation?.matrix?.length !== 9) {
    log('error', 'failed: sensitive face result mismatch', res.face?.length, face?.box?.length, face?.mesh?.length, face?.embedding?.length, face?.rotation?.matrix?.length);
  } else log('state', 'passed: sensitive face result match');
  if (!face || face?.emotion?.length < 1 || face.emotion[0].score < 0.30) log('error', 'failed: sensitive face emotion result mismatch', face?.emotion);
  else log('state', 'passed: sensitive face emotion result', face?.emotion);

  // test sensitive details body
  const body = res && res.body ? res.body[0] : null;
  if (!body || body?.box?.length !== 4 || body?.keypoints?.length !== 17) log('error', 'failed: sensitive body result mismatch', body);
  else log('state', 'passed: sensitive body result match');

  // test sensitive details hand
  const hand = res && res.hand ? res.hand[0] : null;
  if (!hand || hand?.box?.length !== 4 || hand?.keypoints?.length !== 21) log('error', 'failed: sensitive hand result mismatch', hand?.keypoints?.length);
  else log('state', 'passed: sensitive hand result match');

  // test body alternatives
  log('info', 'test body');
  human.reset();
  config.async = false;
  config.cacheSensitivity = 0;

  config.body = { enabled: true, modelPath: 'https://vladmandic.github.io/human-models/models/blazepose-heavy.json' };
  res = await testDetect(human, 'samples/in/ai-body.jpg', 'blazepose');
  if (!res || !res.body || !res.body[0] || res.body[0].score < 0.9 || res.body[0].keypoints?.length !== 39) log('error', 'failed: blazepose', { body: res.body?.[0] });
  else log('state', 'passed: blazepose');

  config.body = { enabled: true, modelPath: 'https://vladmandic.github.io/human-models/models/efficientpose.json' };
  res = await testDetect(human, 'samples/in/ai-body.jpg', 'efficientpose');
  if (!res || !res.body || !res.body[0] || res.body[0].score < 0.7 || res.body[0].keypoints?.length !== 13) log('error', 'failed: efficientpose', { body: res.body?.[0] });
  else log('state', 'passed: efficientpose');

  config.body = { enabled: true, modelPath: 'https://vladmandic.github.io/human-models/models/posenet.json' };
  res = await testDetect(human, 'samples/in/ai-body.jpg', 'posenet');
  if (!res || !res.body || !res.body[0] || res.body[0].score < 0.9 || res.body[0].keypoints?.length !== 16) log('error', 'failed: posenet', { body: res.body?.[0] });
  else log('state', 'passed: posenet');

  config.body = { enabled: true, modelPath: 'https://vladmandic.github.io/human-models/models/movenet-lightning.json' };
  res = await testDetect(human, 'samples/in/ai-body.jpg', 'movenet');
  if (!res || !res.body || !res.body[0] || res.body[0].score < 0.9 || res.body[0].keypoints?.length !== 17) log('error', 'failed: movenet', { body: res.body?.[0] });
  else log('state', 'passed: movenet');

  // test face matching
  log('info', 'test face matching');
  const db = JSON.parse(fs.readFileSync('demo/facematch/faces.json').toString());
  const arr = db.map((rec) => rec.embedding);
  if (db.length < 20) log('error', 'failed: face database ', db.length);
  else log('state', 'passed: face database', db.length);
  res1 = human.match.find(desc1, arr);
  res2 = human.match.find(desc2, arr);
  res3 = human.match.find(desc3, arr);
  if (res1.index !== 4 || res2.index !== 4 || res3.index !== 4) log('error', 'failed: face match', res1, res2, res3);
  else log('state', 'passed: face match', { first: { index: res1.index, similarity: res1.similarity } }, { second: { index: res2.index, similarity: res2.similarity } }, { third: { index: res3.index, similarity: res3.similarity } });

  // test alternative face embeddings
  log('info', 'test face similarity alternative');
  human.reset();
  config.async = false;
  config.cacheSensitivity = 0;
  config.face.mobilefacenet = { enabled: true, modelPath: 'https://vladmandic.github.io/human-models/models/mobilefacenet.json' };
  res = await testDetect(human, 'samples/in/ai-face.jpg', 'face embeddings');
  if (!res || !res.face || !res.face[0] || res.face[0].embedding?.length !== 192) log('error', 'failed: mobilefacenet', { embedding: res.face?.[0]?.embedding?.length });
  else log('state', 'passed: mobilefacenet', { embedding: res.face?.[0]?.embedding?.length });
  config.face.insightface = { enabled: true, modelPath: 'https://vladmandic.github.io/insightface/models/insightface-mobilenet-swish.json' };
  res = await testDetect(human, 'samples/in/ai-face.jpg', 'face embeddings');
  if (!res || !res.face || !res.face[0] || res.face[0]?.embedding?.length !== 512) log('error', 'failed: insightface', { embedding: res.face?.[0]?.embedding?.length });
  else log('state', 'passed: insightface', { embedding: res.face?.[0]?.embedding?.length });
  human.models.models.mobilefacenet = null;
  config.face.mobilefacenet = { enabled: false };
  human.models.models.insightface = null;
  config.face.insightface = { enabled: false };

  // test face attention
  log('info', 'test face attention');
  human.models.models.facemesh = null;
  config.softwareKernels = true;
  config.face.attention = { enabled: true, modelPath: 'https://vladmandic.github.io/human-models/models/facemesh-attention.json' };
  res = await testDetect(human, 'samples/in/ai-face.jpg', 'face attention');
  if (!res || !res.face[0] || res.face[0].mesh.length !== 478 || Object.keys(res.face[0].annotations).length !== 36) log('error', 'failed: face attention', { mesh: res.face?.[0]?.mesh?.length, annotations: Object.keys(res.face?.[0]?.annotations | {}).length });
  else log('state', 'passed: face attention');
  human.models.models.facemesh = null; // unload model
  config.face.attention = { enabled: false };

  // test detectors only
  log('info', 'test detectors');
  human.reset();
  config.face = { mesh: { enabled: false }, iris: { enabled: false }, description: { enabled: false }, emotion: { enabled: false } };
  config.hand = { landmarks: false };
  res = await testDetect(human, 'samples/in/ai-body.jpg', 'detectors');
  if (!res || res.face?.length !== 1 || res.face[0]?.gender !== 'unknown' || res.face[0]?.age || res.face[0]?.embedding?.length > 0) log('error', 'failed: detectors result face mismatch', res.face);
  else log('state', 'passed: detector result face match');
  if (!res || res.hand?.length !== 1 || res.hand[0]?.landmarks?.length > 0) log('error', 'failed: detectors result hand mismatch', res.hand?.length);
  else log('state', 'passed: detector result hand match');

  // test multiple instances
  log('info', 'test: multi-instance');
  const first = new Human(config);
  const second = new Human(config);
  await testDetect(human, null, 'multi instance');
  log('info', 'test: first instance');
  await testDetect(first, 'samples/in/ai-upper.jpg', 'multi instance');
  log('info', 'test: second instance');
  await testDetect(second, 'samples/in/ai-upper.jpg', 'multi instance');

  // test async multiple instances
  log('info', 'test: concurrent');
  await Promise.all([
    testDetect(human, 'samples/in/ai-face.jpg', 'concurrent', false),
    testDetect(first, 'samples/in/ai-face.jpg', 'concurrent', false),
    testDetect(second, 'samples/in/ai-face.jpg', 'concurrent', false),
    testDetect(human, 'samples/in/ai-body.jpg', 'concurrent', false),
    testDetect(first, 'samples/in/ai-body.jpg', 'concurrent', false),
    testDetect(second, 'samples/in/ai-body.jpg', 'concurrent', false),
    testDetect(human, 'samples/in/ai-upper.jpg', 'concurrent', false),
    testDetect(first, 'samples/in/ai-upper.jpg', 'concurrent', false),
    testDetect(second, 'samples/in/ai-upper.jpg', 'concurrent', false),
  ]);

  // test monkey-patch
  log('info', 'test: monkey-patch');
  globalThis.Canvas = canvasJS.Canvas; // monkey-patch to use external canvas library
  globalThis.ImageData = canvasJS.ImageData; // monkey-patch to use external canvas library
  const inputImage = await canvasJS.loadImage('samples/in/ai-face.jpg'); // load image using canvas library
  const inputCanvas = new canvasJS.Canvas(inputImage.width, inputImage.height); // create canvas
  const ctx = inputCanvas.getContext('2d');
  ctx.drawImage(inputImage, 0, 0); // draw input image onto canvas
  res = await human.detect(inputCanvas);
  if (res?.face?.length !== 1) log('error', 'failed: monkey patch');
  else log('state', 'passed: monkey patch');

  // test segmentation
  config.segmentation = { enabled: true, modelPath: 'https://vladmandic.github.io/human-models/models/rvm.json' };
  res = await human.segmentation(inputCanvas, config);
  if (res?.shape?.length !== 3) log('error', 'failed: segmentation');
  else log('state', 'passed: segmentation', [res.size]);
  human.tf.dispose(res);
  config.segmentation = { enabled: false };

  human.env.Canvas = null; // disable canvas monkey-patch

  // check if all instances reported same
  const tensors1 = human.tf.engine().state.numTensors;
  const tensors2 = first.tf.engine().state.numTensors;
  const tensors3 = second.tf.engine().state.numTensors;
  if (tensors1 === tensors2 && tensors1 === tensors3 && tensors2 === tensors3) log('state', 'passeed: equal usage');
  else log('error', 'failed: equal usage', tensors1, tensors2, tensors3);

  // validate cache compare algorithm
  await verifyCompare(human);

  // tests end
  const t1 = process.hrtime.bigint();

  // report end
  log('info', 'events:', evt);
  log('info', 'tensors', human.tf.memory().numTensors);
  log('info', 'test complete:', Math.trunc(Number(t1 - t0) / 1000 / 1000), 'ms');
}

exports.test = test;
exports.log = log;
