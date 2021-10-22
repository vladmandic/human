/**
 * EfficientPose model implementation
 *
 * Based on: [**BecauseofAI MobileFace**](https://github.com/becauseofAI/MobileFace)
 *
 * Obsolete and replaced by `faceres` that performs age/gender/descriptor analysis
 */

import { log, join } from '../util/util';
import * as tf from '../../dist/tfjs.esm.js';
import type { Tensor, GraphModel } from '../tfjs/types';
import { env } from '../util/env';

let model: GraphModel | null;

export async function load(config) {
  const modelUrl = join(config.modelBasePath, config.face.embedding.modelPath);
  if (env.initial) model = null;
  if (!model) {
    model = await tf.loadGraphModel(modelUrl) as unknown as GraphModel;
    if (!model) log('load model failed:', config.face.embedding.modelPath);
    else if (config.debug) log('load model:', modelUrl);
  } else if (config.debug) log('cached model:', modelUrl);
  return model;
}

export function enhance(input): Tensor {
  const image = tf.tidy(() => {
    // input received from detector is already normalized to 0..1
    // input is also assumed to be straightened
    // const data = tf.image.resizeBilinear(input, [model.inputs[0].shape[2], model.inputs[0].shape[1]], false); // just resize to fit the embedding model
    // do a tight crop of image and resize it to fit the model
    const box = [[0.05, 0.15, 0.85, 0.85]]; // empyrical values for top, left, bottom, right
    const tensor = input.image || input.tensor;
    if (!(tensor instanceof tf.Tensor)) return null;
    if (!model || !model.inputs || !model.inputs[0].shape) return null;
    const crop = (tensor.shape.length === 3)
      ? tf.image.cropAndResize(tf.expandDims(tensor, 0), box, [0], [model.inputs[0].shape[2], model.inputs[0].shape[1]]) // add batch dimension if missing
      : tf.image.cropAndResize(tensor, box, [0], [model.inputs[0].shape[2], model.inputs[0].shape[1]]);

    // convert to black&white to avoid colorization impact
    const rgb = [0.2989, 0.5870, 0.1140]; // factors for red/green/blue colors when converting to grayscale: https://www.mathworks.com/help/matlab/ref/rgb2gray.html
    const [red, green, blue] = tf.split(crop, 3, 3);
    const redNorm = tf.mul(red, rgb[0]);
    const greenNorm = tf.mul(green, rgb[1]);
    const blueNorm = tf.mul(blue, rgb[2]);
    const grayscale = tf.addN([redNorm, greenNorm, blueNorm]);
    const merge = tf.stack([grayscale, grayscale, grayscale], 3).squeeze(4);

    /*
    // optional increase image contrast
    // or do it per-channel so mean is done on each channel
    // or do it based on histogram
    const mean = merge.mean();
    const factor = 5;
    const contrast = merge.sub(mean).mul(factor).add(mean);
    */

    // normalize brightness from 0..1
    const darken = tf.sub(merge, merge.min());
    const lighten = tf.div(darken, darken.max());

    return lighten;
  });
  return image;
}

export async function predict(input, config): Promise<number[]> {
  if (!model) return [];
  return new Promise(async (resolve) => {
    // let data: Array<[]> = [];
    let data: Array<number> = [];
    if (config.face.embedding.enabled) {
      const image = enhance(input);
      const dataT = tf.tidy(() => {
        /*
        // if needed convert from NHWC to NCHW
        const nchw = image.transpose([3, 0, 1, 2]);
        */

        const res = model?.predict(image);

        /*
        // optionally do it twice with flipped image and average results
        const res1 = model.predict(image);
        const flipped = tf.image.flipLeftRight(image);
        const res2 = model.predict(flipped);
        const merge = tf.stack([res1, res2], 2).squeeze();
        const res = reshape.logSumExp(1);
        */

        /*
        // optional normalize outputs with l2 normalization
        const scaled = tf.tidy(() => {
          const l2 = res.norm('euclidean');
          const scale = res.div(l2);
          return scale;
        });
        */

        // optional reduce feature vector complexity
        const reshape = tf.reshape(res, [128, 2]); // split 256 vectors into 128 x 2
        const reduce = reshape.logSumExp(1); // reduce 2nd dimension by calculating logSumExp on it

        return reduce;
      });
      const output: Array<number> = await dataT.data();
      data = [...output]; // convert typed array to simple array
      tf.dispose(dataT);
      tf.dispose(image);
    }
    resolve(data);
  });
}
