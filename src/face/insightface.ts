/**
 * InsightFace model implementation
 *
 * Based on: [**DeepInsight InsightFace**](https://github.com/deepinsight/insightface)
 *
 * Alternative face embedding detection
 */

import * as tf from 'dist/tfjs.esm.js';
import { log, now } from '../util/util';
import { loadModel } from '../tfjs/load';
import type { Tensor, Tensor4D, GraphModel } from '../tfjs/types';
import type { Config } from '../config';
import { env } from '../util/env';

let model: GraphModel | null;
const last: number[][] = [];
let lastCount = 0;
let lastTime = 0;
let skipped = Number.MAX_SAFE_INTEGER;

export async function load(config: Config): Promise<GraphModel> {
  if (env.initial) model = null;
  if (!model) model = await loadModel(config.face['insightface'].modelPath);
  else if (config.debug) log('cached model:', model['modelUrl']);
  return model;
}

export async function predict(input: Tensor4D, config: Config, idx, count): Promise<number[]> {
  if (!model?.['executor']) return [];
  const skipFrame = skipped < (config.face['insightface']?.skipFrames || 0);
  const skipTime = (config.face['insightface']?.skipTime || 0) > (now() - lastTime);
  if (config.skipAllowed && skipTime && skipFrame && (lastCount === count) && last[idx]) {
    skipped++;
    return last[idx];
  }
  return new Promise(async (resolve) => {
    let data: number[] = [];
    if (config.face['insightface']?.enabled && model?.inputs[0].shape) {
      const t: Record<string, Tensor> = {};
      t.crop = tf.image.resizeBilinear(input, [model.inputs[0].shape[2], model.inputs[0].shape[1]], false); // just resize to fit the embedding model
      // do a tight crop of image and resize it to fit the model
      // const box = [[0.05, 0.15, 0.85, 0.85]]; // empyrical values for top, left, bottom, right
      // t.crop = tf.image.cropAndResize(input, box, [0], [model.inputs[0].shape[2], model.inputs[0].shape[1]]);
      t.data = model.execute(t.crop) as Tensor;
      const output = await t.data.data();
      data = Array.from(output); // convert typed array to simple array
      Object.keys(t).forEach((tensor) => tf.dispose(t[tensor]));
    }
    last[idx] = data;
    lastCount = count;
    lastTime = now();
    resolve(data);
  });
}
