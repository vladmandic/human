const log = require('@vladmandic/pilogger');
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
const tf = require('@tensorflow/tfjs-node');
const Human = require('../dist/human.node.js').default;

const config = {
  backend: 'tensorflow',
  debug: false,
  videoOptimized: false,
  async: false,
  warmup: 'full',
  filter: {
    enabled: true,
  },
  face: {
    enabled: true,
    detector: { modelPath: 'file://models/blazeface-back.json', enabled: true, rotation: false },
    mesh: { modelPath: 'file://models/facemesh.json', enabled: true },
    iris: { modelPath: 'file://models/iris.json', enabled: true },
    description: { modelPath: 'file://models/faceres.json', enabled: true },
    emotion: { modelPath: 'file://models/emotion.json', enabled: true },
  },
  hand: {
    enabled: true,
    detector: { modelPath: 'file://models/handdetect.json' },
    skeleton: { modelPath: 'file://models/handskeleton.json' },
  },
  // body: { modelPath: 'file://models/efficientpose.json', enabled: true },
  // body: { modelPath: 'file://models/blazepose.json', enabled: true },
  body: { modelPath: 'file://models/posenet.json', enabled: true },
  object: { modelPath: 'file://models/nanodet.json', enabled: true },
};

async function test() {
  const human = new Human(config);
  if (human) log.state('passed: create human');
  else log.error('failed: create human');

  await human.load();
  if (human.models) {
    log.state('passed: load models');
    const keys = Object.keys(human.models);
    const loaded = keys.filter((model) => human.models[model]);
    log.data(' result: defined models:', keys.length, 'loaded models:', loaded.length);
  } else {
    log.error('failed: load models');
  }

  const warmup = await human.warmup();
  if (warmup) {
    log.state('passed: warmup:', config.warmup);
    log.data(' result: face:', warmup.face.length, 'body:', warmup.body.length, 'hand:', warmup.hand.length, 'gesture:', warmup.gesture.length, 'object:', warmup.object.length);
    log.data(' result: performance:', 'load:', warmup.performance.load, 'total:', warmup.performance.total);
  } else {
    log.error('failed: warmup');
  }
}

test();
