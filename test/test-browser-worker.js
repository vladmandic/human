/// <reference lib="webworker"/>

// load Human using IIFE script as Chome Mobile does not support Modules as Workers
self.importScripts('../dist/human.js'); // eslint-disable-line no-restricted-globals

// eslint-disable-next-line new-cap, no-undef
const human = new Human.default();

onmessage = async (msg) => { // receive message from main thread
  console.log('worker onmessage', msg.data); // eslint-disable-line no-console
  const image = new ImageData(new Uint8ClampedArray(msg.data.image), msg.data.width, msg.data.height);
  const result = await human.detect(image, msg.data.userConfig);
  result.tensors = human.tf.engine().state.numTensors; // append to result object so main thread get info
  result.backend = human.tf.getBackend(); // append to result object so main thread get info
  result.canvas = null; // must strip original canvas from return value as it cannot be transfered from worker thread
  console.log('worker result', result); // eslint-disable-line no-console
  postMessage({ result }); // send message back to main thread without canvas
};
