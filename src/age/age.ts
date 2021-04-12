import { log, join } from '../helpers';
import * as tf from '../../dist/tfjs.esm.js';
import * as profile from '../profile';

let model;
let last = { age: 0 };
let skipped = Number.MAX_SAFE_INTEGER;

export async function load(config) {
  if (!model) {
    model = await tf.loadGraphModel(join(config.modelBasePath, config.face.age.modelPath));
    if (!model || !model.modelUrl) log('load model failed:', config.face.age.modelPath);
    else if (config.debug) log('load model:', model.modelUrl);
  } else if (config.debug) log('cached model:', model.modelUrl);
  return model;
}

export async function predict(image, config) {
  if (!model) return null;
  if ((skipped < config.face.age.skipFrames) && config.videoOptimized && last.age && (last.age > 0)) {
    skipped++;
    return last;
  }
  if (config.videoOptimized) skipped = 0;
  else skipped = Number.MAX_SAFE_INTEGER;
  return new Promise(async (resolve) => {
    const resize = tf.image.resizeBilinear(image, [model.inputs[0].shape[2], model.inputs[0].shape[1]], false);
    const enhance = tf.mul(resize, [255.0]);
    tf.dispose(resize);

    let ageT;
    const obj = { age: 0 };

    if (!config.profile) {
      if (config.face.age.enabled) ageT = await model.predict(enhance);
    } else {
      const profileAge = config.face.age.enabled ? await tf.profile(() => model.predict(enhance)) : {};
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
