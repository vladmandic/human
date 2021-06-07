/**
 * Module that analyzes person age
 * Obsolete
 */

import { log, join } from '../helpers';
import * as tf from '../../dist/tfjs.esm.js';
import { Config } from '../config';
import { GraphModel, Tensor } from '../tfjs/types';

let model: GraphModel;

let last = { age: 0 };
let skipped = Number.MAX_SAFE_INTEGER;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function load(config: Config | any) {
  if (!model) {
    // @ts-ignore type mismatch on GraphModel
    model = await tf.loadGraphModel(join(config.modelBasePath, config.face.age.modelPath));
    if (!model || !model['modelUrl']) log('load model failed:', config.face.age.modelPath);
    else if (config.debug) log('load model:', model['modelUrl']);
  } else if (config.debug) log('cached model:', model['modelUrl']);
  return model;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function predict(image: Tensor, config: Config | any) {
  if (!model) return null;
  if ((skipped < config.face.age.skipFrames) && config.skipFrame && last.age && (last.age > 0)) {
    skipped++;
    return last;
  }
  skipped = 0;
  return new Promise(async (resolve) => {
    if (!model.inputs[0].shape) return;
    const resize = tf.image.resizeBilinear(image, [model.inputs[0].shape[2], model.inputs[0].shape[1]], false);
    const enhance = tf.mul(resize, [255.0]);
    tf.dispose(resize);

    let ageT;
    const obj = { age: 0 };

    if (config.face.age.enabled) ageT = await model.predict(enhance);
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
