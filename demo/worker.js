import Human from '../dist/human.esm.js';

let busy = false;
const human = new Human();

function log(...msg) {
  const dt = new Date();
  const ts = `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}.${dt.getMilliseconds().toString().padStart(3, '0')}`;
  // eslint-disable-next-line no-console
  if (msg) console.log(ts, 'Human:', ...msg);
}

onmessage = async (msg) => {
  if (busy) return;
  busy = true;
  // worker.postMessage({ image: image.data.buffer, width: canvas.width, height: canvas.height, config }, [image.data.buffer]);
  const image = new ImageData(new Uint8ClampedArray(msg.data.image), msg.data.width, msg.data.height);
  let result = {};
  try {
    result = await human.detect(image, msg.data.userConfig);
  } catch (err) {
    result.error = err.message;
    log('worker thread error:', err.message);
  }
  // must strip canvas from return value as it cannot be transfered from worker thread
  if (result.canvas) result.canvas = null;
  postMessage({ result });
  busy = false;
};
