import human from '../dist/human.esm.js';

onmessage = async (msg) => {
  const result = await human.detect(msg.data.image, msg.data.config);
  postMessage(result);
};
