import { log } from '../log.js';
import * as tf from '../../dist/tfjs.esm.js';
import * as profile from '../profile.js';

const models = {};
let last = { gender: '' };
let skipped = Number.MAX_SAFE_INTEGER;
let alternative = false;

// tuning values
const rgb = [0.2989, 0.5870, 0.1140]; // factors for red/green/blue colors when converting to grayscale

async function load(config) {
  if (!models.gender) {
    models.gender = await tf.loadGraphModel(config.face.gender.modelPath);
    alternative = models.gender.inputs[0].shape[3] === 1;
    log(`load model: ${config.face.gender.modelPath.match(/\/(.*)\./)[1]}`);
  }
  return models.gender;
}

async function predict(image, config) {
  if (!models.gender) return null;
  if ((skipped < config.face.gender.skipFrames) && config.videoOptimized && last.gender !== '') {
    skipped++;
    return last;
  }
  if (config.videoOptimized) skipped = 0;
  else skipped = Number.MAX_SAFE_INTEGER;
  return new Promise(async (resolve) => {
    const resize = tf.image.resizeBilinear(image, [config.face.gender.inputSize, config.face.gender.inputSize], false);
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
    tf.dispose(resize);

    let genderT;
    const obj = {};

    if (!config.profile) {
      if (config.face.gender.enabled) genderT = await models.gender.predict(enhance);
    } else {
      const profileGender = config.face.gender.enabled ? await tf.profile(() => models.gender.predict(enhance)) : {};
      genderT = profileGender.result.clone();
      profileGender.result.dispose();
      // @ts-ignore
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
          obj.confidence = Math.min(0.99, confidence);
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
