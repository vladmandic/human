import { tf, loadGraphModel } from '../tf.js';
import * as profile from '../profile.js';

const models = {};
let last = { age: 0 };
let frame = Number.MAX_SAFE_INTEGER;

async function load(config) {
  if (!models.age) {
    models.age = await loadGraphModel(config.face.age.modelPath);
    // eslint-disable-next-line no-console
    console.log(`Human: load model: ${config.face.age.modelPath.match(/\/(.*)\./)[1]}`);
  }
  return models.age;
}

async function predict(image, config) {
  if (!models.age) return null;
  if ((frame < config.face.age.skipFrames) && last.age && (last.age > 0)) {
    frame += 1;
    return last;
  }
  frame = 0;
  return new Promise(async (resolve) => {
    /*
    const zoom = [0, 0]; // 0..1 meaning 0%..100%
    const box = [[
      (image.shape[1] * zoom[0]) / image.shape[1],
      (image.shape[2] * zoom[1]) / image.shape[2],
      (image.shape[1] - (image.shape[1] * zoom[0])) / image.shape[1],
      (image.shape[2] - (image.shape[2] * zoom[1])) / image.shape[2],
    ]];
    const resize = tf.image.cropAndResize(image, box, [0], [config.face.age.inputSize, config.face.age.inputSize]);
    */
    const resize = tf.image.resizeBilinear(image, [config.face.age.inputSize, config.face.age.inputSize], false);
    const enhance = tf.mul(resize, [255.0]);
    tf.dispose(resize);

    let ageT;
    const obj = {};

    if (!config.profile) {
      if (config.face.age.enabled) ageT = await models.age.predict(enhance);
    } else {
      const profileAge = config.face.age.enabled ? await tf.profile(() => models.age.predict(enhance)) : {};
      ageT = profileAge.result.clone();
      profileAge.result.dispose();
      profile.run('age', profileAge);
    }
    enhance.dispose();

    if (ageT) {
      const data = ageT.dataSync();
      obj.age = Math.trunc(10 * data[0]) / 10;
    }
    ageT.dispose();

    last = obj;
    resolve(obj);
  });
}

exports.predict = predict;
exports.load = load;
