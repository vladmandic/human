const log = require('@vladmandic/pilogger');
const Human = require('../../dist/human.node.js').default; // or const Human = require('../dist/human.node-gpu.js').default;

const config = {
  debug: false,
};

async function main() {
  const human = new Human(config);
  await human.tf.ready();
  log.info('Human:', human.version);
  log.data('Environment', human.env);
  await human.load();
  const models = Object.keys(human.models).map((model) => ({ name: model, loaded: (human.models[model] !== null) }));
  log.data('Models:', models);
  log.info('Memory state:', human.tf.engine().memory());
  // log.data('Config', human.config);
  log.info('TFJS flags:', human.tf.ENV.flags);
}

main();
