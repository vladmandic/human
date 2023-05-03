/**
 * Image enhancements
 */

import * as tf from 'dist/tfjs.esm.js';
import type { Tensor } from '../tfjs/types';

export async function histogramEqualization(inputImage: Tensor): Promise<Tensor> {
  const squeeze = inputImage.shape.length === 4 ? tf.squeeze(inputImage) : inputImage;
  const rgb = tf.split(squeeze, 3, 2);
  const min: Tensor[] = [tf.min(rgb[0]), tf.min(rgb[1]), tf.min(rgb[2])]; // minimum pixel value per channel T[]
  const max: Tensor[] = [tf.max(rgb[0]), tf.max(rgb[1]), tf.max(rgb[2])]; // maximum pixel value per channel T[]
  // const absMin = await Promise.all(min.map((channel) => channel.data())); // minimum pixel value per channel A[]
  // const minValue = Math.min(absMax[0][0], absMin[1][0], absMin[2][0]);
  const absMax = await Promise.all(max.map((channel) => channel.data())); // maximum pixel value per channel A[]
  const maxValue = Math.max(absMax[0][0], absMax[1][0], absMax[2][0]);
  const maxRange = maxValue > 1 ? 255 : 1;
  const factor = maxRange / maxValue;
  let final: Tensor;
  if (factor > 1) {
    const sub = [tf.sub(rgb[0], min[0]), tf.sub(rgb[1], min[1]), tf.sub(rgb[2], min[2])]; // channels offset by min values
    const range = [tf.sub(max[0], min[0]), tf.sub(max[1], min[1]), tf.sub(max[2], min[2])]; // channel ranges
    // const fact = [tf.div(maxRange, absMax[0]), tf.div(maxRange, absMax[1]), tf.div(maxRange, absMax[1])]; // factors between
    const enh = [tf.mul(sub[0], factor), tf.mul(sub[1], factor), tf.mul(sub[2], factor)];
    const stack = tf.stack([enh[0], enh[1], enh[2]], 2);
    final = tf.reshape(stack, [1, squeeze.shape[0] || 0, squeeze.shape[1] || 0, 3]);
    tf.dispose([...sub, ...range, ...enh, stack]);
  } else {
    final = tf.expandDims(squeeze, 0);
  }
  tf.dispose([...rgb, ...min, ...max, rgb, squeeze, inputImage]);
  return final;
}
