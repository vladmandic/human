process.env.TF_CPP_MIN_LOG_LEVEL = '2';
const H = require('../dist/human.node.js');
const test = require('./test-node-main.js').test;

const config = {
  cacheSensitivity: 0,
  modelBasePath: 'file://models/',
  backend: 'cpu',
  debug: false,
  async: true,
  face: {
    enabled: true,
    detector: { rotation: false },
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

async function main() {
  test(H.Human, config);
}

if (require.main === module) main();
