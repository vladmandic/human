const tf = require('@tensorflow/tfjs');
const profile = require('../profile.js');

const models = {};
let last = { gender: '' };
let frame = Number.MAX_SAFE_INTEGER;

// tuning values
const zoom = [0, 0]; // 0..1 meaning 0%..100%

async function load(config) {
  if (!models.gender) models.gender = await tf.loadGraphModel(config.face.gender.modelPath);
  return models.gender;
}

async function predict(image, config) {
  return new Promise(async (resolve) => {
    if (frame < config.face.age.skipFrames) {
      frame += 1;
      resolve(last);
    }
    frame = 0;
    const box = [[
      (image.shape[1] * zoom[0]) / image.shape[1],
      (image.shape[2] * zoom[1]) / image.shape[2],
      (image.shape[1] - (image.shape[1] * zoom[0])) / image.shape[1],
      (image.shape[2] - (image.shape[2] * zoom[1])) / image.shape[2],
    ]];
    const resize = tf.image.cropAndResize(image, box, [0], [config.face.age.inputSize, config.face.age.inputSize]);
    // const resize = tf.image.resizeBilinear(image, [config.face.age.inputSize, config.face.age.inputSize], false);
    const enhance = tf.mul(resize, [255.0]);
    tf.dispose(resize);

    let genderT;
    const obj = {};

    if (!config.profile) {
      if (config.face.gender.enabled) genderT = await models.gender.predict(enhance);
    } else {
      const profileGender = config.face.gender.enabled ? await tf.profile(() => models.gender.predict(enhance)) : {};
      genderT = profileGender.result.clone();
      profileGender.result.dispose();
      profile.run('gender', profileGender);
    }
    enhance.dispose();

    if (genderT) {
      const data = genderT.dataSync();
      const confidence = Math.trunc(Math.abs(1.9 * 100 * (data[0] - 0.5))) / 100;
      if (confidence > config.face.gender.minConfidence) {
        obj.gender = data[0] <= 0.5 ? 'female' : 'male';
        obj.confidence = confidence;
      }
    }
    genderT.dispose();

    last = obj;
    resolve(obj);
  });
}

exports.predict = predict;
exports.load = load;
