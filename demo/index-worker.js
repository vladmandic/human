/**
 * Web worker used by main demo app
 * Loaded from index.js
 */

/// <reference lib="webworker"/>

// load Human using IIFE script as Chome Mobile does not support Modules as Workers
self.importScripts('../dist/human.js');

let busy = false;
// @ts-ignore
// eslint-disable-next-line new-cap, no-undef
const human = new Human.default();

onmessage = async (msg) => { // receive message from main thread
  if (busy) return;
  busy = true;
  // received from index.js using:
  // worker.postMessage({ image: image.data.buffer, width: canvas.width, height: canvas.height, config }, [image.data.buffer]);
  const image = new ImageData(new Uint8ClampedArray(msg.data.image), msg.data.width, msg.data.height);
  let result = {};
  result = await human.detect(image, msg.data.userConfig);
  result.tensors = human.tf.engine().state.numTensors; // append to result object so main thread get info
  result.backend = human.tf.getBackend(); // append to result object so main thread get info
  if (result.canvas) { // convert canvas to imageData and send it by reference
    const canvas = new OffscreenCanvas(result.canvas.width, result.canvas.height);
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.drawImage(result.canvas, 0, 0);
    const img = ctx ? ctx.getImageData(0, 0, result.canvas.width, result.canvas.height) : null;
    result.canvas = null; // must strip original canvas from return value as it cannot be transfered from worker thread
    if (img) postMessage({ result, image: img.data.buffer, width: msg.data.width, height: msg.data.height }, [img.data.buffer]);
    else postMessage({ result }); // send message back to main thread with canvas
  } else {
    postMessage({ result }); // send message back to main thread without canvas
  }
  busy = false;
};
