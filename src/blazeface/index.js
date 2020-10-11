const tf = require('@tensorflow/tfjs');
const face = require('./face');

async function load(config) {
  const blazeface = await tf.loadGraphModel(config.detector.modelPath, { fromTFHub: config.detector.modelPath.includes('tfhub.dev') });
  const model = new face.BlazeFaceModel(blazeface, config);
  return model;
}
exports.load = load;
const face_2 = require('./face');

Object.defineProperty(exports, 'BlazeFaceModel', { enumerable: true, get() { return face_2.BlazeFaceModel; } });
