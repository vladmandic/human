import * as tf from '../../dist/tfjs.esm.js';
import { Tensor } from '../tfjs/types';

function get1dGaussianKernel(sigma: number, size: number): Tensor {
  // Generate a 1d gaussian distribution size numbers long
  const range = tf.range(Math.floor(-size / 2) + 1, Math.floor(size / 2) + 1);
  const distribution = tf.pow(tf.exp(range.div(-2.0 * (sigma * sigma))), 2);
  const normalized = distribution.div(tf.sum(distribution)) as Tensor;
  return normalized;
}

function get2dGaussianKernel(size: number, sigma?: number): Tensor {
  // This default is to mimic opencv2.
  sigma = sigma === undefined ? 0.3 * ((size - 1) * 0.5 - 1) + 0.8 : sigma;
  const kerne1d = get1dGaussianKernel(sigma, size);
  return tf.outerProduct(kerne1d, kerne1d);
}

export function getGaussianKernel(size = 5, channels = 1, sigma?: number): Tensor {
  return tf.tidy(() => {
    const kerne2d = get2dGaussianKernel(size, sigma);
    const kerne3d = channels === 3 ? tf.stack([kerne2d, kerne2d, kerne2d]) : kerne2d;
    return tf.reshape(kerne3d, [size, size, channels, 1]);
  });
}

export function blur(image: Tensor, kernel: Tensor, pad: number | 'valid' | 'same' = 'same'): Tensor {
  return tf.tidy(() => tf.depthwiseConv2d(image, kernel, 1, pad));
}
