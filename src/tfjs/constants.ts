import * as tf from '../../dist/tfjs.esm.js';
import type { Tensor } from './types';

export const tf255: Tensor = tf.scalar(255, 'float32');
export const tf1: Tensor = tf.scalar(1, 'float32');
export const tf2: Tensor = tf.scalar(2, 'float32');
export const tf05: Tensor = tf.scalar(0.5, 'float32');
export const tf127: Tensor = tf.scalar(127.5, 'float32');
export const rgb: Tensor = tf.tensor1d([0.2989, 0.5870, 0.1140], 'float32'); // factors for red/green/blue colors when converting to grayscale
