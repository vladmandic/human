const tf = require('@tensorflow/tfjs-node'); // in nodejs environments tfjs-node is required to be loaded before human
const Human = require('../dist/human.node.js'); // use this when using human in dev mode

const log = (status, ...data) => {
  if (typeof process.send !== 'undefined') process.send([status, data]); // send to parent process over ipc
  else console.log(status, ...data); // eslint-disable-line no-console
};

async function main() {
  const human = new Human.Human(); // create instance of human using default configuration
  const startTime = new Date();
  log('info', 'load start', { human: human.version, tf: tf.version_core, progress: human.models.stats().percentageLoaded });

  async function monitor() {
    const progress = human.models.stats().percentageLoaded;
    log('data', 'load interval', { elapsed: new Date() - startTime, progress });
    if (progress < 1) setTimeout(monitor, 10);
  }

  monitor();
  const loadPromise = human.load();
  loadPromise
    .then(() => log('state', 'passed', { progress: human.models.stats().percentageLoaded }))
    .catch(() => log('error', 'load promise'));
  await loadPromise;
  log('info', 'load final', { progress: human.models.stats().percentageLoaded });
  await human.warmup(); // optional as model warmup is performed on-demand first time its executed
}

exports.test = main;

if (require.main === module) main();
