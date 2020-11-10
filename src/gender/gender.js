import { tf, loadGraphModel } from '../tf.js';
import * as profile from '../profile.js';

const models = {};
let last = { gender: '' };
let frame = Number.MAX_SAFE_INTEGER;
let alternative = false;

// tuning values
const zoom = [0, 0]; // 0..1 meaning 0%..100%
const rgb = [0.2989, 0.5870, 0.1140]; // factors for red/green/blue colors when converting to grayscale

async function load(config) {
  if (!models.gender) {
    models.gender = await loadGraphModel(config.face.gender.modelPath);
    alternative = models.gender.inputs[0].shape[3] === 1;
    // eslint-disable-next-line no-console
    console.log(`Human: load model: ${config.face.gender.modelPath.match(/\/(.*)\./)[1]}`);
  }
  return models.gender;
}

async function predict(image, config) {
  if ((frame < config.face.gender.skipFrames) && last.gender !== '') {
    frame += 1;
    return last;
  }
  frame = 0;
  return new Promise(async (resolve) => {
    const box = [[
      (image.shape[1] * zoom[0]) / image.shape[1],
      (image.shape[2] * zoom[1]) / image.shape[2],
      (image.shape[1] - (image.shape[1] * zoom[0])) / image.shape[1],
      (image.shape[2] - (image.shape[2] * zoom[1])) / image.shape[2],
    ]];
    const resize = tf.image.cropAndResize(image, box, [0], [config.face.gender.inputSize, config.face.gender.inputSize]);
    let enhance;
    if (alternative) {
      enhance = tf.tidy(() => {
        const [red, green, blue] = tf.split(resize, 3, 3);
        const redNorm = tf.mul(red, rgb[0]);
        const greenNorm = tf.mul(green, rgb[1]);
        const blueNorm = tf.mul(blue, rgb[2]);
        const grayscale = tf.addN([redNorm, greenNorm, blueNorm]);
        return grayscale.sub(0.5).mul(2);
      });
    } else {
      enhance = tf.mul(resize, [255.0]);
    }
    // const resize = tf.image.resizeBilinear(image, [config.face.age.inputSize, config.face.age.inputSize], false);
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
      if (alternative) {
        // returns two values 0..1, bigger one is prediction
        const confidence = Math.trunc(100 * Math.abs(data[0] - data[1])) / 100;
        if (confidence > config.face.gender.minConfidence) {
          obj.gender = data[0] > data[1] ? 'female' : 'male';
          obj.confidence = confidence;
        }
      } else {
        // returns one value 0..1, .5 is prediction threshold
        const confidence = Math.trunc(200 * Math.abs((data[0] - 0.5))) / 100;
        if (confidence > config.face.gender.minConfidence) {
          obj.gender = data[0] <= 0.5 ? 'female' : 'male';
          obj.confidence = confidence;
        }
      }
    }
    genderT.dispose();

    last = obj;
    resolve(obj);
  });
}

exports.predict = predict;
exports.load = load;
