import { log } from '../helpers';
import * as tf from '../../dist/tfjs.esm.js';
import * as profile from '../profile';

/*
Prototype implementation for model processing
Must implement
- load()
- predict()
Must account for:
- image processing, tfjs profiling
*/

let model;
let last = { };
let skipped = Number.MAX_SAFE_INTEGER;

export async function load(config) {
  if (!model) {
    model = await tf.loadGraphModel(config.prototype.modelPath);
    if (config.debug) log(`load model: ${config.prototype.modelPath.match(/\/(.*)\./)[1]}`);
  }
  return model;
}

export async function predict(image, config) {
  if (!model) return null;
  if ((skipped < config.prototype.skipFrames) && config.videoOptimized && Object.keys(last).length > 0) {
    skipped++;
    return last;
  }
  if (config.videoOptimized) skipped = 0;
  else skipped = Number.MAX_SAFE_INTEGER;
  return new Promise(async (resolve) => {
    const resize = tf.image.resizeBilinear(image, [model.inputs[0].shape[2], model.inputs[0].shape[1]], false);
    const enhance = tf.mul(resize, [255.0]);
    tf.dispose(resize);

    let resT;

    if (!config.profile) {
      if (config.prototype.enabled) resT = await model.predict(enhance);
    } else {
      const profileT = config.prototype.enabled ? await tf.profile(() => model.predict(enhance)) : {};
      resT = profileT.result.clone();
      profileT.result.dispose();
      profile.run('prototype', profileT);
    }
    enhance.dispose();

    let obj = {};
    if (resT) {
      const data = resT.dataSync();
      obj = { data };
      tf.dispose(resT);
    }

    last = obj;
    resolve(obj);
  });
}
