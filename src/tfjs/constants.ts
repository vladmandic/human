import * as tf from '../../dist/tfjs.esm.js';
import type { Tensor } from './types';

export const constants: Record<string, Tensor | number | number[]> = {
  tf255: 255,
  tf1: 1,
  tf2: 2,
  tf05: 0.5,
  tf127: 127.5,
  rgb: [0.2989, 0.5870, 0.1140],
};

export function init() {
  constants.tf255 = tf.scalar(255, 'float32');
  constants.tf1 = tf.scalar(1, 'float32');
  constants.tf2 = tf.scalar(2, 'float32');
  constants.tf05 = tf.scalar(0.5, 'float32');
  constants.tf127 = tf.scalar(127.5, 'float32');
  constants.rgb = tf.tensor1d([0.2989, 0.5870, 0.1140], 'float32'); // factors for red/green/blue colors when converting to grayscale
}
