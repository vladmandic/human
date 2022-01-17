/**
 * Gender model implementation
 *
 * Based on: [**SSR-Net**](https://github.com/shamangary/SSR-Net)
 */

import { log, now } from '../util/util';
import * as tf from '../../dist/tfjs.esm.js';
import { loadModel } from '../tfjs/load';
import { constants } from '../tfjs/constants';
import type { Gender } from '../result';
import type { Config } from '../config';
import type { GraphModel, Tensor } from '../tfjs/types';
import { env } from '../util/env';

let model: GraphModel | null;
const last: Array<{ gender: Gender, genderScore: number }> = [];
let lastCount = 0;
let lastTime = 0;
let skipped = Number.MAX_SAFE_INTEGER;

// tuning values
const rgb = [0.2989, 0.5870, 0.1140]; // factors for red/green/blue colors when converting to grayscale

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function load(config: Config | any) {
  if (env.initial) model = null;
  if (!model) model = await loadModel(config.face['ssrnet'].modelPathGender);
  else if (config.debug) log('cached model:', model['modelUrl']);
  return model;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function predict(image: Tensor, config: Config, idx, count): Promise<{ gender: Gender, genderScore: number }> {
  if (!model) return { gender: 'unknown', genderScore: 0 };
  const skipFrame = skipped < (config.face['ssrnet']?.skipFrames || 0);
  const skipTime = (config.face['ssrnet']?.skipTime || 0) > (now() - lastTime);
  if (config.skipAllowed && skipFrame && skipTime && (lastCount === count) && last[idx]?.gender && (last[idx]?.genderScore > 0)) {
    skipped++;
    return last[idx];
  }
  skipped = 0;
  return new Promise(async (resolve) => {
    if (!model?.inputs[0].shape) return;
    const t: Record<string, Tensor> = {};
    t.resize = tf.image.resizeBilinear(image, [model.inputs[0].shape[2], model.inputs[0].shape[1]], false);
    t.enhance = tf.tidy(() => {
      const [red, green, blue] = tf.split(t.resize, 3, 3);
      const redNorm = tf.mul(red, rgb[0]);
      const greenNorm = tf.mul(green, rgb[1]);
      const blueNorm = tf.mul(blue, rgb[2]);
      const grayscale = tf.addN([redNorm, greenNorm, blueNorm]);
      const normalize = tf.mul(tf.sub(grayscale, constants.tf05), 2); // range grayscale:-1..1
      return normalize;
    });
    const obj: { gender: Gender, genderScore: number } = { gender: 'unknown', genderScore: 0 };
    if (config.face['ssrnet'].enabled) t.gender = model.execute(t.enhance) as Tensor;
    const data = await t.gender.data();
    obj.gender = data[0] > data[1] ? 'female' : 'male'; // returns two values 0..1, bigger one is prediction
    obj.genderScore = data[0] > data[1] ? (Math.trunc(100 * data[0]) / 100) : (Math.trunc(100 * data[1]) / 100);
    Object.keys(t).forEach((tensor) => tf.dispose(t[tensor]));
    last[idx] = obj;
    lastCount = count;
    lastTime = now();
    resolve(obj);
  });
}
