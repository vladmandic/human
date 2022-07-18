const tf = require('@tensorflow/tfjs-node'); // in nodejs environments tfjs-node is required to be loaded before human
const Human = require('../dist/human.node.js'); // use this when using human in dev mode

async function main() {
  const log = (...msg) => console.log(...msg); // eslint-disable-line no-console
  const human = new Human.Human(); // create instance of human using default configuration
  const startTime = new Date();
  log('start', { human: human.version, tf: tf.version_core, progress: human.getModelStats().percentageLoaded });
  setInterval(() => log('interval', { elapsed: new Date() - startTime, progress: human.getModelStats().percentageLoaded }));
  const loadPromise = human.load();
  loadPromise.then(() => log('resolved', { progress: human.getModelStats().percentageLoaded }));
  await loadPromise;
  log('final', { progress: human.getModelStats().percentageLoaded });
  await human.warmup(); // optional as model warmup is performed on-demand first time its executed
  process.exit();
}

main();
