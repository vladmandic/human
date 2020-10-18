import human from '../dist/human.esm.js';

let config;
let busy = false;

const log = (...msg) => {
  // eslint-disable-next-line no-console
  if (config.console) console.log(...msg);
};

onmessage = async (msg) => {
  if (busy) return;
  busy = true;
  // worker.postMessage({ image: image.data.buffer, width: canvas.width, height: canvas.height, config }, [image.data.buffer]);
  const image = new ImageData(new Uint8ClampedArray(msg.data.image), msg.data.width, msg.data.height);
  config = msg.data.config;
  let result = {};
  try {
    result = await human.detect(image, config);
  } catch (err) {
    result.error = err.message;
    log('Worker thread error:', err.message);
  }
  postMessage(result);
  busy = false;
};
