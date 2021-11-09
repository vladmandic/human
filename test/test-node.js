process.env.TF_CPP_MIN_LOG_LEVEL = '2';
const Human = require('../dist/human.node.js').default;
const test = require('./test-main.js').test;

const config = {
  cacheSensitivity: 0,
  modelBasePath: 'file://models/',
  backend: 'tensorflow',
  debug: false,
  async: true,
  face: {
    enabled: true,
    detector: { rotation: true },
    mesh: { enabled: true },
    iris: { enabled: true },
    description: { enabled: true },
    emotion: { enabled: true },
    antispoof: { enabled: true },
    liveness: { enabled: true },
  },
  hand: { enabled: true },
  body: { enabled: true },
  object: { enabled: true },
  segmentation: { enabled: true },
  filter: { enabled: false },
};

test(Human, config);
