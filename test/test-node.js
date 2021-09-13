const Human = require('../dist/human.node.js').default;
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
  hand: { enabled: false, rotation: true },
  body: { enabled: false },
  object: { enabled: false },
  segmentation: { enabled: false },
  filter: { enabled: false },
};

test(Human, config);
