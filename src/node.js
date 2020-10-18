const console = require('console');
const tf = require('@tensorflow/tfjs-node');
const human = require('..'); // this resolves to project root which is '@vladmandic/human'

const logger = new console.Console({
  stdout: process.stdout,
  stderr: process.stderr,
  ignoreErrors: true,
  groupIndentation: 2,
  inspectOptions: {
    showHidden: true,
    depth: 5,
    colors: true,
    showProxy: true,
    maxArrayLength: 1024,
    maxStringLength: 10240,
    breakLength: 300,
    compact: 64,
    sorted: false,
    getters: true,
  },
});

async function main() {
  await tf.ready();
  logger.info('Human:', human.version);
  logger.info('Default Configuration', human.defaults);
  logger.info('TFJS Version:', tf.version_core, 'Backend:', tf.getBackend());
  logger.info('TFJS Flags:', tf.env().features);
}

main();
