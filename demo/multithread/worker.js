/// <reference lib="webworker" />

// load Human using IIFE script as Chome Mobile does not support Modules as Workers
self.importScripts('../../dist/human.js'); // eslint-disable-line no-restricted-globals

let human;

onmessage = async (msg) => {
  // received from index.js using:
  // worker.postMessage({ image: image.data.buffer, width: canvas.width, height: canvas.height, config }, [image.data.buffer]);

  // Human is registered as global namespace using IIFE script
  if (!human) human = new Human.default(msg.data.config); // eslint-disable-line no-undef, new-cap
  const image = new ImageData(new Uint8ClampedArray(msg.data.image), msg.data.width, msg.data.height);
  let result = {};
  result = await human.detect(image, msg.data.config);
  postMessage({ result: result[msg.data.type], type: msg.data.type });
};
