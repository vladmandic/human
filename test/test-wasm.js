const log = require('@vladmandic/pilogger');
const tf = require('@tensorflow/tfjs');
const Human = require('../dist/human.node-wasm.js').default;

const config = {
  backend: 'wasm',
  wasmPath: 'assets/',
  debug: false,
  videoOptimized: false,
  async: false,
  modelBasePath: 'http://localhost:10030/models',
  filter: {
    enabled: true,
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
  // body: { modelPath: 'efficientpose.json', enabled: true },
  // body: { modelPath: 'blazepose.json', enabled: true },
  body: { modelPath: 'posenet.json', enabled: true },
  object: { enabled: false }, // Error: Kernel 'SparseToDense' not registered for backend 'wasm'
};

async function testInstance(human) {
  if (human) log.state('passed: create human');
  else log.error('failed: create human');

  // if (!human.tf) human.tf = tf;
  log.info('human version:', human.version);
  log.info('tfjs version:', human.tf.version_core);
  log.info('platform:', human.sysinfo.platform);
  log.info('agent:', human.sysinfo.agent);

  await human.load();
  if (human.models) {
    log.state('passed: load models');
    const keys = Object.keys(human.models);
    const loaded = keys.filter((model) => human.models[model]);
    log.data(' result: defined models:', keys.length, 'loaded models:', loaded.length);
  } else {
    log.error('failed: load models');
  }

  let warmup;
  try {
    warmup = await human.warmup();
  } catch (err) {
    log.error('error warmup');
  }
  if (warmup) {
    log.state('passed: warmup:', config.warmup);
    log.data(' result: face:', warmup.face?.length, 'body:', warmup.body?.length, 'hand:', warmup.hand?.length, 'gesture:', warmup.gesture?.length, 'object:', warmup.object?.length);
    log.data(' result: performance:', 'load:', warmup.performance?.load, 'total:', warmup.performance?.total);
  } else {
    log.error('failed: warmup');
  }
  const random = tf.randomNormal([1, 1024, 1024, 3]);
  let detect;
  try {
    detect = await human.detect(random);
  } catch (err) {
    log.error('error: detect', err);
  }
  tf.dispose(random);
  if (detect) {
    log.state('passed: detect:', 'random');
    log.data(' result: face:', detect.face?.length, 'body:', detect.body?.length, 'hand:', detect.hand?.length, 'gesture:', detect.gesture?.length, 'object:', detect.object?.length);
    log.data(' result: performance:', 'load:', detect?.performance.load, 'total:', detect.performance?.total);
  } else {
    log.error('failed: detect');
  }
}

async function test() {
  log.info('testing instance#1 - none');
  config.warmup = 'none';
  const human1 = new Human(config);
  await testInstance(human1);

  log.info('testing instance#2 - face');
  config.warmup = 'face';
  const human2 = new Human(config);
  await testInstance(human2);

  log.info('testing instance#3 - body');
  config.warmup = 'body';
  const human3 = new Human(config);
  await testInstance(human3);
}

test();
