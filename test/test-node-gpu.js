const Human = require('../dist/human.node-gpu.js').default;
const test = require('./test-main.js').test;

const config = {
  modelBasePath: 'file://models/',
  backend: 'tensorflow',
  debug: false,
  async: false,
  face: {
    enabled: true,
    detector: { enabled: true, rotation: true },
    mesh: { enabled: true },
    iris: { enabled: true },
    description: { enabled: true },
    emotion: { enabled: true },
  },
  hand: { enabled: true },
  body: { enabled: true },
  object: { enabled: true },
  segmentation: { enabled: true },
  filter: { enabled: false },
};

test(Human, config);
