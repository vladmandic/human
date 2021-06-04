/**
 * EfficientPose Module
 */

import { log, join } from '../helpers';
import * as tf from '../../dist/tfjs.esm.js';
import { GraphModel, Tensor } from '../tfjs/types';
import { Config } from '../config';
// import * as blur from './blur';

let model: GraphModel;
// let blurKernel;

export type Segmentation = boolean;

export async function load(config: Config): Promise<GraphModel> {
  if (!model) {
    // @ts-ignore type mismatch on GraphModel
    model = await tf.loadGraphModel(join(config.modelBasePath, config.segmentation.modelPath));
    if (!model || !model['modelUrl']) log('load model failed:', config.segmentation.modelPath);
    else if (config.debug) log('load model:', model['modelUrl']);
  } else if (config.debug) log('cached model:', model['modelUrl']);
  // if (!blurKernel) blurKernel = blur.getGaussianKernel(50, 1, 1);
  return model;
}

export async function predict(input: { tensor: Tensor | null, canvas: OffscreenCanvas | HTMLCanvasElement }, config: Config): Promise<Segmentation> {
  if (!config.segmentation.enabled || !input.tensor || !input.canvas) return false;
  if (!model || !model.inputs[0].shape) return false;
  const resizeInput = tf.image.resizeBilinear(input.tensor, [model.inputs[0].shape[1], model.inputs[0].shape[2]], false);
  const norm = resizeInput.div(255);
  const res = model.predict(norm) as Tensor;
  tf.dispose(resizeInput);
  tf.dispose(norm);

  const overlay = (typeof OffscreenCanvas !== 'undefined') ? new OffscreenCanvas(input.canvas.width, input.canvas.height) : document.createElement('canvas');
  overlay.width = input.canvas.width;
  overlay.height = input.canvas.height;

  const squeeze = tf.squeeze(res, 0);
  let resizeOutput;
  if (squeeze.shape[2] === 2) { // model meet has two channels for fg and bg
    const softmax = squeeze.softmax();
    const [bg, fg] = tf.unstack(softmax, 2);
    tf.dispose(softmax);
    const expand = fg.expandDims(2);
    tf.dispose(bg);
    tf.dispose(fg);
    resizeOutput = tf.image.resizeBilinear(expand, [input.tensor?.shape[1], input.tensor?.shape[2]]);
    tf.dispose(expand);
  } else { // model selfie has a single channel
    resizeOutput = tf.image.resizeBilinear(squeeze, [input.tensor?.shape[1], input.tensor?.shape[2]]);
  }

  // const blurred = blur.blur(resizeOutput, blurKernel);
  if (tf.browser) await tf.browser.toPixels(resizeOutput, overlay);
  // tf.dispose(blurred);
  tf.dispose(resizeOutput);
  tf.dispose(squeeze);
  tf.dispose(res);

  const ctx = input.canvas.getContext('2d') as CanvasRenderingContext2D;
  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
  // best options are: darken, color-burn, multiply
  ctx.globalCompositeOperation = 'darken';
  await ctx?.drawImage(overlay, 0, 0);
  ctx.globalCompositeOperation = 'source-in';
  return true;
}

/* Segmentation todo:
- Smoothen
- Get latest canvas in interpolate
- Buffered fetches latest from video instead from interpolate
*/
