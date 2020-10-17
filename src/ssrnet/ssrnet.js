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
  if (frame > config.face.age.skipFrames) {
    frame = 0;
  } else {
    frame += 1;
  }
  if (frame === 0) return last;
  let enhance;
  if (image instanceof tf.Tensor) {
    const resize = tf.image.resizeBilinear(image, [config.face.age.inputSize, config.face.age.inputSize], false);
    enhance = tf.mul(resize, [255.0]);
    tf.dispose(resize);
  } else {
    enhance = await getImage(image, config.face.age.inputSize);
  }

  const promises = [];
  let ageT;
  let genderT;
  if (config.face.age.enabled) promises.push(ageT = models.age.predict(enhance));
  if (config.face.gender.enabled) promises.push(genderT = models.gender.predict(enhance));
  await Promise.all(promises);

  const obj = {};
  if (ageT) {
    const data = await ageT.data();
    obj.age = Math.trunc(10 * data[0]) / 10;
    tf.dispose(ageT);
  }
  if (genderT) {
    const data = await genderT.data();
    const confidence = Math.trunc(Math.abs(1.9 * 100 * (data[0] - 0.5))) / 100;
    if (confidence > config.face.gender.minConfidence) {
      obj.gender = data[0] <= 0.5 ? 'female' : 'male';
      obj.confidence = confidence;
    }
    tf.dispose(genderT);
  }

  tf.dispose(enhance);
  last = obj;
  return obj;
}

exports.predict = predict;
exports.loadAge = loadAge;
exports.loadGender = loadGender;
