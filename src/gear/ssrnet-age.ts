/**
 * Age model implementation
 *
 * Based on: [**SSR-Net**](https://github.com/shamangary/SSR-Net)
 */

import { log, now } from '../util/util';
import * as tf from '../../dist/tfjs.esm.js';
import { loadModel } from '../tfjs/load';
import { env } from '../util/env';
import { constants } from '../tfjs/constants';
import type { Config } from '../config';
import type { GraphModel, Tensor } from '../tfjs/types';

let model: GraphModel | null;
const last: Array<{ age: number }> = [];
let lastCount = 0;
let lastTime = 0;
let skipped = Number.MAX_SAFE_INTEGER;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function load(config: Config) {
  if (env.initial) model = null;
  if (!model) model = await loadModel(config.face['ssrnet'].modelPathAge);
  else if (config.debug) log('cached model:', model['modelUrl']);
  return model;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function predict(image: Tensor, config: Config, idx: number, count: number): Promise<{ age: number }> {
  if (!model) return { age: 0 };
  const skipFrame = skipped < (config.face['ssrnet']?.skipFrames || 0);
  const skipTime = (config.face['ssrnet']?.skipTime || 0) > (now() - lastTime);
  if (config.skipAllowed && skipFrame && skipTime && (lastCount === count) && last[idx]?.age && (last[idx]?.age > 0)) {
    skipped++;
    return last[idx];
  }
  skipped = 0;
  return new Promise(async (resolve) => {
    if (!model?.inputs || !model.inputs[0] || !model.inputs[0].shape) return;
    const t: Record<string, Tensor> = {};
    t.resize = tf.image.resizeBilinear(image, [model.inputs[0].shape[2], model.inputs[0].shape[1]], false);
    t.enhance = tf.mul(t.resize, constants.tf255);
    const obj = { age: 0 };
    if (config.face['ssrnet'].enabled) t.age = model.execute(t.enhance) as Tensor;
    if (t.age) {
      const data = await t.age.data();
      obj.age = Math.trunc(10 * data[0]) / 10;
    }
    Object.keys(t).forEach((tensor) => tf.dispose(t[tensor]));
    last[idx] = obj;
    lastCount = count;
    lastTime = now();
    resolve(obj);
  });
}
