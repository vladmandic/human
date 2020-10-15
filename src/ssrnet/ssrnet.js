const tf = require('@tensorflow/tfjs');

const models = {};
let last = { age: 0, gender: '' };
let frame = 0;

async function getImage(image, size) {
  const buffer = tf.browser.fromPixels(image);
  const resize = tf.image.resizeBilinear(buffer, [size, size]);
  const expand = tf.cast(tf.expandDims(resize, 0), 'float32');
  return expand;
}

async function loadAge(config) {
  if (!models.age) models.age = await tf.loadGraphModel(config.face.age.modelPath);
  return models.age;
}

async function loadGender(config) {
  if (!models.gender) models.gender = await tf.loadGraphModel(config.face.gender.modelPath);
  return models.gender;
}

async function predict(image, config) {
  frame += 1;
  if (frame >= config.face.age.skipFrames) {
    frame = 0;
    return last;
  }
  let enhance;
  if (image instanceof tf.Tensor) {
    const resize = tf.image.resizeBilinear(image, [config.face.age.inputSize, config.face.age.inputSize], false);
    enhance = tf.mul(resize, [255.0]);
    tf.dispose(resize);
  } else {
    enhance = await getImage(image, config.face.age.inputSize);
  }
  const obj = {};
  if (config.face.age.enabled) {
    const ageT = await models.age.predict(enhance);
    const data = await ageT.data();
    obj.age = Math.trunc(10 * data[0]) / 10;
    tf.dispose(ageT);
  }
  if (config.face.gender.enabled) {
    const genderT = await models.gender.predict(enhance);
    const data = await genderT.data();
    obj.gender = Math.trunc(100 * data[0]) < 50 ? 'female' : 'male';
    tf.dispose(genderT);
  }
  tf.dispose(enhance);
  last = obj;
  return obj;
}

exports.predict = predict;
exports.loadAge = loadAge;
exports.loadGender = loadGender;
