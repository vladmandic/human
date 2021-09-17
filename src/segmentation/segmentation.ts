/**
 * EfficientPose Module
 */

import { log, join } from '../helpers';
import * as tf from '../../dist/tfjs.esm.js';
import * as image from '../image/image';
import type { GraphModel, Tensor } from '../tfjs/types';
import type { Config } from '../config';
import { env } from '../env';

type Input = Tensor | typeof Image | ImageData | ImageBitmap | HTMLImageElement | HTMLMediaElement | HTMLVideoElement | HTMLCanvasElement | OffscreenCanvas;

let model: GraphModel;
let busy = false;

export async function load(config: Config): Promise<GraphModel> {
  if (!model || env.initial) {
    model = await tf.loadGraphModel(join(config.modelBasePath, config.segmentation.modelPath || '')) as unknown as GraphModel;
    if (!model || !model['modelUrl']) log('load model failed:', config.segmentation.modelPath);
    else if (config.debug) log('load model:', model['modelUrl']);
  } else if (config.debug) log('cached model:', model['modelUrl']);
  return model;
}

export async function predict(input: { tensor: Tensor | null, canvas: OffscreenCanvas | HTMLCanvasElement | null }): Promise<Uint8ClampedArray | null> {
  const width = input.tensor?.shape[1] || 0;
  const height = input.tensor?.shape[2] || 0;
  if (!input.tensor) return null;
  if (!model || !model.inputs[0].shape) return null;
  const resizeInput = tf.image.resizeBilinear(input.tensor, [model.inputs[0].shape[1], model.inputs[0].shape[2]], false);
  const norm = tf.div(resizeInput, 255);
  const res = model.predict(norm) as Tensor;
  // meet output:   1,256,256,1
  // selfie output: 1,144,256,2
  tf.dispose(resizeInput);
  tf.dispose(norm);

  const squeeze = tf.squeeze(res, 0);
  tf.dispose(res);
  let resizeOutput;
  if (squeeze.shape[2] === 2) {
    // model meet has two channels for fg and bg
    const softmax = squeeze.softmax();
    const [bg, fg] = tf.unstack(softmax, 2);
    const expand = tf.expandDims(fg, 2);
    const pad = tf.expandDims(expand, 0);
    tf.dispose(softmax);
    tf.dispose(bg);
    tf.dispose(fg);
    // running sofmax before unstack creates 2x2 matrix so we only take upper-left quadrant
    const crop = tf.image.cropAndResize(pad, [[0, 0, 0.5, 0.5]], [0], [width, height]);
    // otherwise run softmax after unstack and use standard resize
    // resizeOutput = tf.image.resizeBilinear(expand, [input.tensor?.shape[1], input.tensor?.shape[2]]);
    resizeOutput = tf.squeeze(crop, 0);
    tf.dispose(crop);
    tf.dispose(expand);
    tf.dispose(pad);
  } else { // model selfie has a single channel that we can use directly
    resizeOutput = tf.image.resizeBilinear(squeeze, [width, height]);
  }
  tf.dispose(squeeze);

  if (env.node) {
    const data = await resizeOutput.data();
    tf.dispose(resizeOutput);
    return data; // we're running in nodejs so return alpha array as-is
  }

  const overlay = (typeof OffscreenCanvas !== 'undefined') ? new OffscreenCanvas(width, height) : document.createElement('canvas');
  overlay.width = width;
  overlay.height = height;
  if (tf.browser) await tf.browser.toPixels(resizeOutput, overlay);
  tf.dispose(resizeOutput);

  // get alpha channel data
  const alphaCanvas = (typeof OffscreenCanvas !== 'undefined') ? new OffscreenCanvas(width, height) : document.createElement('canvas'); // need one more copy since input may already have gl context so 2d context fails
  alphaCanvas.width = width;
  alphaCanvas.height = height;
  const ctxAlpha = alphaCanvas.getContext('2d') as CanvasRenderingContext2D;
  ctxAlpha.filter = 'blur(8px';
  await ctxAlpha.drawImage(overlay, 0, 0);
  const alpha = ctxAlpha.getImageData(0, 0, width, height).data;

  // get original canvas merged with overlay
  const original = (typeof OffscreenCanvas !== 'undefined') ? new OffscreenCanvas(width, height) : document.createElement('canvas'); // need one more copy since input may already have gl context so 2d context fails
  original.width = width;
  original.height = height;
  const ctx = original.getContext('2d') as CanvasRenderingContext2D;
  if (input.canvas) await ctx.drawImage(input.canvas, 0, 0);
  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation // best options are: darken, color-burn, multiply
  ctx.globalCompositeOperation = 'darken';
  ctx.filter = 'blur(8px)'; // use css filter for bluring, can be done with gaussian blur manually instead
  await ctx.drawImage(overlay, 0, 0);
  ctx.globalCompositeOperation = 'source-over'; // reset
  ctx.filter = 'none'; // reset

  input.canvas = original;

  return alpha;
}

export async function process(input: Input, background: Input | undefined, config: Config): Promise<HTMLCanvasElement | OffscreenCanvas | null> {
  if (busy) return null;
  busy = true;
  if (!model) await load(config);
  const img = image.process(input, config);
  const alpha = await predict(img);
  tf.dispose(img.tensor);

  if (background && alpha) {
    const tmp = image.process(background, config);
    const bg = tmp.canvas;
    tf.dispose(tmp.tensor);
    const fg = img.canvas;
    const fgData = fg.getContext('2d')?.getImageData(0, 0, fg.width, fg.height).data as Uint8ClampedArray;

    const c = (typeof OffscreenCanvas !== 'undefined') ? new OffscreenCanvas(fg.width, fg.height) : document.createElement('canvas');
    c.width = fg.width;
    c.height = fg.height;
    const ctx = c.getContext('2d') as CanvasRenderingContext2D;

    ctx.globalCompositeOperation = 'copy'; // reset
    ctx.drawImage(bg, 0, 0, c.width, c.height);
    const cData = ctx.getImageData(0, 0, c.width, c.height) as ImageData;
    for (let i = 0; i < c.width * c.height; i++) { // this should be done with globalCompositeOperation instead of looping through image data
      cData.data[4 * i + 0] = ((255 - alpha[4 * i + 0]) / 255.0 * cData.data[4 * i + 0]) + (alpha[4 * i + 0] / 255.0 * fgData[4 * i + 0]);
      cData.data[4 * i + 1] = ((255 - alpha[4 * i + 1]) / 255.0 * cData.data[4 * i + 1]) + (alpha[4 * i + 1] / 255.0 * fgData[4 * i + 1]);
      cData.data[4 * i + 2] = ((255 - alpha[4 * i + 2]) / 255.0 * cData.data[4 * i + 2]) + (alpha[4 * i + 2] / 255.0 * fgData[4 * i + 2]);
      cData.data[4 * i + 3] = ((255 - alpha[4 * i + 3]) / 255.0 * cData.data[4 * i + 3]) + (alpha[4 * i + 3] / 255.0 * fgData[4 * i + 3]);
    }
    ctx.putImageData(cData, 0, 0);
    img.canvas = c;
  }
  busy = false;
  return img.canvas;
}
