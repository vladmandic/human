/**
 * Module that analyzes person gender
 * Obsolete
 */

import { log, join } from '../helpers';
import * as tf from '../../dist/tfjs.esm.js';
import type { Config } from '../config';
import type { GraphModel, Tensor } from '../tfjs/types';
import { env } from '../env';

let model: GraphModel | null;
let last = { gender: '' };
let skipped = Number.MAX_SAFE_INTEGER;
let alternative = false;

// tuning values
const rgb = [0.2989, 0.5870, 0.1140]; // factors for red/green/blue colors when converting to grayscale

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function load(config: Config | any) {
  if (env.initial) model = null;
  if (!model) {
    model = await tf.loadGraphModel(join(config.modelBasePath, config.face.gender.modelPath)) as unknown as GraphModel;
    alternative = model.inputs[0].shape ? model.inputs[0]?.shape[3] === 1 : false;
    if (!model || !model['modelUrl']) log('load model failed:', config.face.gender.modelPath);
    else if (config.debug) log('load model:', model['modelUrl']);
  } else if (config.debug) log('cached model:', model['modelUrl']);
  return model;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function predict(image: Tensor, config: Config | any) {
  if (!model) return null;
  if ((skipped < config.face.gender.skipFrames) && config.skipFrame && last.gender !== '') {
    skipped++;
    return last;
  }
  skipped = 0;
  return new Promise(async (resolve) => {
    if (!model?.inputs[0].shape) return;
    const resize = tf.image.resizeBilinear(image, [model.inputs[0].shape[2], model.inputs[0].shape[1]], false);
    let enhance;
    if (alternative) {
      enhance = tf.tidy(() => {
        const [red, green, blue] = tf.split(resize, 3, 3);
        const redNorm = tf.mul(red, rgb[0]);
        const greenNorm = tf.mul(green, rgb[1]);
        const blueNorm = tf.mul(blue, rgb[2]);
        const grayscale = tf.addN([redNorm, greenNorm, blueNorm]);
        const normalize = tf.mul(tf.sub(grayscale, 0.5), 2); // range grayscale:-1..1
        return normalize;
      });
    } else {
      enhance = tf.mul(resize, [255.0]); // range RGB:0..255
    }
    tf.dispose(resize);

    let genderT;
    const obj = { gender: '', confidence: 0 };

    if (config.face.gender.enabled) genderT = await model.predict(enhance);
    tf.dispose(enhance);

    if (genderT) {
      if (!Array.isArray(genderT)) {
        const data = await genderT.data();
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
        tf.dispose(genderT);
      } else {
        const gender = await genderT[0].data();
        const confidence = Math.trunc(200 * Math.abs((gender[0] - 0.5))) / 100;
        if (confidence > config.face.gender.minConfidence) {
          obj.gender = gender[0] <= 0.5 ? 'female' : 'male';
          obj.confidence = Math.min(0.99, confidence);
        }
        /*
        let age = (await genderT[1].argMax(1).data())[0];
        const all = await genderT[1].data();
        age = Math.round(all[age - 1] > all[age + 1] ? 10 * age - 100 * all[age - 1] : 10 * age + 100 * all[age + 1]) / 10;
        const descriptor = await genderT[1].data();
        */
        genderT.forEach((t) => tf.dispose(t));
      }
    }
    last = obj;
    resolve(obj);
  });
}
