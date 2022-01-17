/**
 * EfficientPose model implementation
 *
 * Based on: [**BecauseofAI MobileFace**](https://github.com/becauseofAI/MobileFace)
 *
 * Obsolete and replaced by `faceres` that performs age/gender/descriptor analysis
 */

import { log, now } from '../util/util';
import * as tf from '../../dist/tfjs.esm.js';
import { loadModel } from '../tfjs/load';
import type { Tensor, GraphModel } from '../tfjs/types';
import type { Config } from '../config';
import { env } from '../util/env';

let model: GraphModel | null;
const last: Array<number[]> = [];
let lastCount = 0;
let lastTime = 0;
let skipped = Number.MAX_SAFE_INTEGER;

export async function load(config: Config): Promise<GraphModel> {
  if (env.initial) model = null;
  if (!model) model = await loadModel(config.face['mobilefacenet'].modelPath);
  else if (config.debug) log('cached model:', model['modelUrl']);
  return model;
}

/*
// convert to black&white to avoid colorization impact
const rgb = [0.2989, 0.5870, 0.1140]; // factors for red/green/blue colors when converting to grayscale: https://www.mathworks.com/help/matlab/ref/rgb2gray.html
const [red, green, blue] = tf.split(crop, 3, 3);
const redNorm = tf.mul(red, rgb[0]);
const greenNorm = tf.mul(green, rgb[1]);
const blueNorm = tf.mul(blue, rgb[2]);
const grayscale = tf.addN([redNorm, greenNorm, blueNorm]);
const merge = tf.stack([grayscale, grayscale, grayscale], 3).squeeze(4);

// optional increase image contrast
// or do it per-channel so mean is done on each channel
// or do it based on histogram
const mean = merge.mean();
const factor = 5;
const contrast = merge.sub(mean).mul(factor).add(mean);
*/

export async function predict(input: Tensor, config: Config, idx, count): Promise<number[]> {
  if (!model) return [];
  const skipFrame = skipped < (config.face['embedding']?.skipFrames || 0);
  const skipTime = (config.face['embedding']?.skipTime || 0) > (now() - lastTime);
  if (config.skipAllowed && skipTime && skipFrame && (lastCount === count) && last[idx]) {
    skipped++;
    return last[idx];
  }
  return new Promise(async (resolve) => {
    let data: Array<number> = [];
    if (config.face['embedding']?.enabled && model?.inputs[0].shape) {
      const t: Record<string, Tensor> = {};
      t.crop = tf.image.resizeBilinear(input, [model.inputs[0].shape[2], model.inputs[0].shape[1]], false); // just resize to fit the embedding model
      // do a tight crop of image and resize it to fit the model
      // const box = [[0.05, 0.15, 0.85, 0.85]]; // empyrical values for top, left, bottom, right
      // t.crop = tf.image.cropAndResize(input, box, [0], [model.inputs[0].shape[2], model.inputs[0].shape[1]]);
      t.data = model?.execute(t.crop) as Tensor;
      /*
      // optional normalize outputs with l2 normalization
      const scaled = tf.tidy(() => {
        const l2 = res.norm('euclidean');
        const scale = res.div(l2);
        return scale;
      });

      // optional reduce feature vector complexity
      const reshape = tf.reshape(res, [128, 2]); // split 256 vectors into 128 x 2
      const reduce = reshape.logSumExp(1); // reduce 2nd dimension by calculating logSumExp on it
      */
      const output = await t.data.data();
      data = Array.from(output); // convert typed array to simple array
    }
    last[idx] = data;
    lastCount = count;
    lastTime = now();
    resolve(data);
  });
}
