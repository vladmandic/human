// load Human using IIFE script as Chome Mobile does not support Modules as Workers
// import Human from '../dist/human.esm.js';
self.importScripts('../dist/human.js');

let busy = false;
// @ts-ignore // Human is registered as global namespace using IIFE script
// eslint-disable-next-line no-undef, new-cap
const human = new Human.default();

function log(...msg) {
  const dt = new Date();
  const ts = `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}.${dt.getMilliseconds().toString().padStart(3, '0')}`;
  // eslint-disable-next-line no-console
  if (msg) console.log(ts, 'Human:', ...msg);
}

onmessage = async (msg) => {
  if (busy) return;
  busy = true;
  // received from index.js using:
  // worker.postMessage({ image: image.data.buffer, width: canvas.width, height: canvas.height, config }, [image.data.buffer]);
  const image = new ImageData(new Uint8ClampedArray(msg.data.image), msg.data.width, msg.data.height);
  let result = {};
  try {
    result = await human.detect(image, msg.data.userConfig);
  } catch (err) {
    result.error = err.message;
    log('worker thread error:', err.message);
  }

  if (result.canvas) { // convert canvas to imageData and send it by reference
    const canvas = new OffscreenCanvas(result.canvas.width, result.canvas.height);
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.drawImage(result.canvas, 0, 0);
    const img = ctx ? ctx.getImageData(0, 0, result.canvas.width, result.canvas.height) : null;
    result.canvas = null; // must strip original canvas from return value as it cannot be transfered from worker thread
    // @ts-ignore tslint wrong type matching for worker
    if (img) postMessage({ result, image: img.data.buffer, width: msg.data.width, height: msg.data.height }, [img.data.buffer]);
    // @ts-ignore tslint wrong type matching for worker
    else postMessage({ result });
  } else {
    // @ts-ignore tslint wrong type matching for worker
    postMessage({ result });
  }
  busy = false;
};
