/**
 * Image segmentation for body detection model
 *
 * Based on:
 * - [**MediaPipe Meet**](https://drive.google.com/file/d/1lnP1bRi9CSqQQXUHa13159vLELYDgDu0/preview)
 * - [**MediaPipe Selfie**](https://drive.google.com/file/d/1dCfozqknMa068vVsO2j_1FgZkW_e3VWv/preview)
 */

import { log } from '../util/util';
import * as tf from '../../dist/tfjs.esm.js';
import { loadModel } from '../tfjs/load';
import * as image from '../image/image';
import { constants } from '../tfjs/constants';
import type { GraphModel, Tensor } from '../tfjs/types';
import type { Config } from '../config';
import { env } from '../util/env';
import type { Input, AnyCanvas } from '../exports';

let model: GraphModel;
let busy = false;

export async function load(config: Config): Promise<GraphModel> {
  if (!model || env.initial) model = await loadModel(config.segmentation.modelPath);
  else if (config.debug) log('cached model:', model['modelUrl']);
  return model;
}

export async function process(input: Input, background: Input | undefined, config: Config)
: Promise<{ data: Array<number> | Tensor, canvas: AnyCanvas | null, alpha: AnyCanvas | null }> {
  if (busy) return { data: [], canvas: null, alpha: null };
  busy = true;
  if (!model) await load(config);
  const inputImage = await image.process(input, config);
  const width = inputImage.tensor?.shape[2] || 0;
  const height = inputImage.tensor?.shape[1] || 0;
  if (!inputImage.tensor) return { data: [], canvas: null, alpha: null };
  const t: Record<string, Tensor> = {};

  t.resize = tf.image.resizeBilinear(inputImage.tensor, [model.inputs[0].shape ? model.inputs[0].shape[1] : 0, model.inputs[0].shape ? model.inputs[0].shape[2] : 0], false);
  tf.dispose(inputImage.tensor);
  t.norm = tf.div(t.resize, constants.tf255);
  t.res = model.execute(t.norm) as Tensor;

  t.squeeze = tf.squeeze(t.res, 0); // meet.shape:[1,256,256,1], selfie.shape:[1,144,256,2]
  if (t.squeeze.shape[2] === 2) {
    t.softmax = tf.softmax(t.squeeze); // model meet has two channels for fg and bg
    [t.bg, t.fg] = tf.unstack(t.softmax, 2);
    t.expand = tf.expandDims(t.fg, 2);
    t.pad = tf.expandDims(t.expand, 0);
    t.crop = tf.image.cropAndResize(t.pad, [[0, 0, 0.5, 0.5]], [0], [width, height]);
    // running sofmax before unstack creates 2x2 matrix so we only take upper-left quadrant
    // otherwise run softmax after unstack and use standard resize
    // resizeOutput = tf.image.resizeBilinear(expand, [input.tensor?.shape[1], input.tensor?.shape[2]]);
    t.data = tf.squeeze(t.crop, 0);
  } else {
    t.data = tf.image.resizeBilinear(t.squeeze, [height, width]); // model selfie has a single channel that we can use directly
  }
  const data = Array.from(await t.data.data()) as number[];

  if (env.node && !env.Canvas && (typeof ImageData === 'undefined')) {
    if (config.debug) log('canvas support missing');
    Object.keys(t).forEach((tensor) => tf.dispose(t[tensor]));
    return { data, canvas: null, alpha: null }; // running in nodejs so return alpha array as-is
  }

  const alphaCanvas = image.canvas(width, height);
  // @ts-ignore browser is not defined in tfjs-node
  if (tf.browser) await tf.browser.toPixels(t.data, alphaCanvas);
  const alphaCtx = alphaCanvas.getContext('2d') as CanvasRenderingContext2D;
  if (config.segmentation.blur && config.segmentation.blur > 0) alphaCtx.filter = `blur(${config.segmentation.blur}px)`; // use css filter for bluring, can be done with gaussian blur manually instead
  const alphaData = alphaCtx.getImageData(0, 0, width, height);

  const compositeCanvas = image.canvas(width, height);
  const compositeCtx = compositeCanvas.getContext('2d') as CanvasRenderingContext2D;
  if (inputImage.canvas) compositeCtx.drawImage(inputImage.canvas, 0, 0);
  compositeCtx.globalCompositeOperation = 'darken'; // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation // best options are: darken, color-burn, multiply
  if (config.segmentation.blur && config.segmentation.blur > 0) compositeCtx.filter = `blur(${config.segmentation.blur}px)`; // use css filter for bluring, can be done with gaussian blur manually instead
  compositeCtx.drawImage(alphaCanvas, 0, 0);
  compositeCtx.globalCompositeOperation = 'source-over'; // reset composite operation
  compositeCtx.filter = 'none'; // reset css filter
  const compositeData = compositeCtx.getImageData(0, 0, width, height);
  for (let i = 0; i < width * height; i++) compositeData.data[4 * i + 3] = alphaData.data[4 * i + 0]; // copy original alpha value to new composite canvas
  compositeCtx.putImageData(compositeData, 0, 0);

  let mergedCanvas: AnyCanvas | null = null;
  if (background && compositeCanvas) { // draw background with segmentation as overlay if background is present
    mergedCanvas = image.canvas(width, height);
    const bgImage = await image.process(background, config);
    tf.dispose(bgImage.tensor);
    const ctxMerge = mergedCanvas.getContext('2d') as CanvasRenderingContext2D;
    ctxMerge.drawImage(bgImage.canvas as HTMLCanvasElement, 0, 0, mergedCanvas.width, mergedCanvas.height);
    ctxMerge.drawImage(compositeCanvas, 0, 0);
  }

  Object.keys(t).forEach((tensor) => tf.dispose(t[tensor]));
  busy = false;
  // return { data, canvas: mergedCanvas || compositeCanvas, alpha: alphaCanvas };
  return { data, canvas: compositeCanvas, alpha: alphaCanvas };
}
