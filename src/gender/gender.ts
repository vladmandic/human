import { log } from '../log';
import * as tf from '../../dist/tfjs.esm.js';
import * as profile from '../profile';

let model;
let last = { gender: '' };
let skipped = Number.MAX_SAFE_INTEGER;
let alternative = false;

// tuning values
const rgb = [0.2989, 0.5870, 0.1140]; // factors for red/green/blue colors when converting to grayscale

export async function load(config) {
  if (!model) {
    model = await tf.loadGraphModel(config.face.gender.modelPath);
    alternative = model.inputs[0].shape[3] === 1;
    if (config.debug) log(`load model: ${config.face.gender.modelPath.match(/\/(.*)\./)[1]}`);
  }
  return model;
}

export async function predict(image, config) {
  if (!model) return null;
  if ((skipped < config.face.gender.skipFrames) && config.videoOptimized && last.gender !== '') {
    skipped++;
    return last;
  }
  if (config.videoOptimized) skipped = 0;
  else skipped = Number.MAX_SAFE_INTEGER;
  return new Promise(async (resolve) => {
    const resize = tf.image.resizeBilinear(image, [model.inputs[0].shape[2], model.inputs[0].shape[1]], false);
    let enhance;
    if (alternative) {
      enhance = tf.tidy(() => {
        const [red, green, blue] = tf.split(resize, 3, 3);
        const redNorm = tf.mul(red, rgb[0]);
        const greenNorm = tf.mul(green, rgb[1]);
        const blueNorm = tf.mul(blue, rgb[2]);
        const grayscale = tf.addN([redNorm, greenNorm, blueNorm]);
        const normalize = grayscale.sub(0.5).mul(2); // range grayscale:-1..1
        return normalize;
      });
    } else {
      enhance = tf.mul(resize, [255.0]); // range RGB:0..255
    }
    tf.dispose(resize);

    let genderT;
    const obj = { gender: '', confidence: 0 };

    if (!config.profile) {
      if (config.face.gender.enabled) genderT = await model.predict(enhance);
    } else {
      const profileGender = config.face.gender.enabled ? await tf.profile(() => model.predict(enhance)) : {};
      genderT = profileGender.result.clone();
      profileGender.result.dispose();
      profile.run('gender', profileGender);
    }
    enhance.dispose();

    if (genderT) {
      const data = genderT.dataSync();
      if (alternative) {
        // returns two values 0..1, bigger one is prediction
        if (data[0] > config.face.gender.minConfidence || data[1] > config.face.gender.minConfidence) {
          obj.gender = data[0] > data[1] ? 'female' : 'male';
          obj.confidence = data[0] > data[1] ? (Math.trunc(100 * data[0]) / 100) : (Math.trunc(100 * data[1]) / 100);
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
