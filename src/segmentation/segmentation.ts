/**
 * EfficientPose Module
 */

import { log, join } from '../helpers';
import * as tf from '../../dist/tfjs.esm.js';
import * as image from '../image/image';
import { GraphModel, Tensor } from '../tfjs/types';
import { Config } from '../config';
// import * as blur from './blur';

type Input = Tensor | typeof Image | ImageData | ImageBitmap | HTMLImageElement | HTMLMediaElement | HTMLVideoElement | HTMLCanvasElement | OffscreenCanvas;

let model: GraphModel;
// let blurKernel;

export async function load(config: Config): Promise<GraphModel> {
  if (!model) {
    // @ts-ignore type mismatch on GraphModel
    model = await tf.loadGraphModel(join(config.modelBasePath, config.segmentation.modelPath));
    if (!model || !model['modelUrl']) log('load model failed:', config.segmentation.modelPath);
    else if (config.debug) log('load model:', model['modelUrl']);
  } else if (config.debug) log('cached model:', model['modelUrl']);
  // if (!blurKernel) blurKernel = blur.getGaussianKernel(5, 1, 1);
  return model;
}

export async function predict(input: { tensor: Tensor | null, canvas: OffscreenCanvas | HTMLCanvasElement }, config: Config): Promise<Uint8ClampedArray | null> {
  if (!config.segmentation.enabled || !input.tensor || !input.canvas) return null;
  if (!model || !model.inputs[0].shape) return null;
  const resizeInput = tf.image.resizeBilinear(input.tensor, [model.inputs[0].shape[1], model.inputs[0].shape[2]], false);
  const norm = resizeInput.div(255);
  const res = model.predict(norm) as Tensor;
  // meet output:   1,256,256,1
  // selfie output: 1,144,256,2
  tf.dispose(resizeInput);
  tf.dispose(norm);

  const overlay = (typeof OffscreenCanvas !== 'undefined') ? new OffscreenCanvas(input.canvas.width, input.canvas.height) : document.createElement('canvas');
  overlay.width = input.canvas.width;
  overlay.height = input.canvas.height;

  const squeeze = tf.squeeze(res, 0);
  let resizeOutput;
  if (squeeze.shape[2] === 2) {
    // model meet has two channels for fg and bg
    const softmax = squeeze.softmax();
    const [bg, fg] = tf.unstack(softmax, 2);
    const expand = fg.expandDims(2);
    const pad = expand.expandDims(0);
    tf.dispose(softmax);
    tf.dispose(bg);
    tf.dispose(fg);
    // running sofmax before unstack creates 2x2 matrix so we only take upper-left quadrant
    const crop = tf.image.cropAndResize(pad, [[0, 0, 0.5, 0.5]], [0], [input.tensor?.shape[1], input.tensor?.shape[2]]);
    // otherwise run softmax after unstack and use standard resize
    // resizeOutput = tf.image.resizeBilinear(expand, [input.tensor?.shape[1], input.tensor?.shape[2]]);
    resizeOutput = crop.squeeze(0);
    tf.dispose(crop);
    tf.dispose(expand);
    tf.dispose(pad);
  } else { // model selfie has a single channel that we can use directly
    resizeOutput = tf.image.resizeBilinear(squeeze, [input.tensor?.shape[1], input.tensor?.shape[2]]);
  }

  if (tf.browser) await tf.browser.toPixels(resizeOutput, overlay);
  tf.dispose(resizeOutput);
  tf.dispose(squeeze);
  tf.dispose(res);

  // get alpha channel data
  const alphaCanvas = (typeof OffscreenCanvas !== 'undefined') ? new OffscreenCanvas(input.canvas.width, input.canvas.height) : document.createElement('canvas'); // need one more copy since input may already have gl context so 2d context fails
  alphaCanvas.width = input.canvas.width;
  alphaCanvas.height = input.canvas.height;
  const ctxAlpha = alphaCanvas.getContext('2d') as CanvasRenderingContext2D;
  ctxAlpha.filter = 'blur(8px';
  await ctxAlpha.drawImage(overlay, 0, 0);
  const alpha = ctxAlpha.getImageData(0, 0, input.canvas.width, input.canvas.height).data;

  // get original canvas merged with overlay
  const original = (typeof OffscreenCanvas !== 'undefined') ? new OffscreenCanvas(input.canvas.width, input.canvas.height) : document.createElement('canvas'); // need one more copy since input may already have gl context so 2d context fails
  original.width = input.canvas.width;
  original.height = input.canvas.height;
  const ctx = original.getContext('2d') as CanvasRenderingContext2D;
  await ctx.drawImage(input.canvas, 0, 0);
  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation // best options are: darken, color-burn, multiply
  ctx.globalCompositeOperation = 'darken';
  ctx.filter = 'blur(8px)'; // use css filter for bluring, can be done with gaussian blur manually instead
  await ctx.drawImage(overlay, 0, 0);
  ctx.globalCompositeOperation = 'source-over'; // reset
  ctx.filter = 'none'; // reset

  input.canvas = original;

  return alpha;
}

export async function process(input: Input, background: Input | undefined, config: Config): Promise<HTMLCanvasElement | OffscreenCanvas> {
  if (!config.segmentation.enabled) config.segmentation.enabled = true; // override config
  if (!model) await load(config);
  const img = image.process(input, config);
  const alpha = await predict(img, config);
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

    return c;
  }
  return img.canvas;
}
