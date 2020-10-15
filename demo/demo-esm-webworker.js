import human from '../dist/human.esm.js';

let config;

const log = (...msg) => {
  // eslint-disable-next-line no-console
  if (config.console) console.log(...msg);
};

onmessage = async (msg) => {
  config = msg.data.config;
  let result = {};
  try {
    result = await human.detect(msg.data.image, config);
  } catch (err) {
    result.error = err.message;
    log('Worker thread error:', err.message);
  }
  postMessage(result);
};
