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

export async function predict(input: { tensor: Tensor | null, canvas: OffscreenCanvas | HTMLCanvasElement | null }, config: Config)
: Promise<{ data: Uint8ClampedArray | null, canvas: HTMLCanvasElement | OffscreenCanvas | null, alpha: HTMLCanvasElement | OffscreenCanvas | null }> {
  const width = input.tensor?.shape[2] || 0;
  const height = input.tensor?.shape[1] || 0;
  if (!input.tensor || !model || !model.inputs[0].shape) return { data: null, canvas: null, alpha: null };
  const resizeInput = tf.image.resizeBilinear(input.tensor, [model.inputs[0].shape[1], model.inputs[0].shape[2]], false);
  const norm = tf.div(resizeInput, 255);
  const res = model.predict(norm) as Tensor;
  // meet output:   1,256,256,1
  // selfie output: 1,144,256,2
  tf.dispose(resizeInput);
  tf.dispose(norm);

  const squeeze = tf.squeeze(res, 0);
  tf.dispose(res);
  let dataT;
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
    dataT = tf.squeeze(crop, 0);
    tf.dispose(crop);
    tf.dispose(expand);
    tf.dispose(pad);
  } else { // model selfie has a single channel that we can use directly
    dataT = tf.image.resizeBilinear(squeeze, [height, width]);
  }
  tf.dispose(squeeze);
  const data = await dataT.dataSync();

  if (env.node) {
    tf.dispose(dataT);
    return { data, canvas: null, alpha: null }; // running in nodejs so return alpha array as-is
  }

  const alphaCanvas = image.canvas(width, height);
  await tf.browser.toPixels(dataT, alphaCanvas);
  tf.dispose(dataT);
  const alphaCtx = alphaCanvas.getContext('2d') as CanvasRenderingContext2D;
  if (config.segmentation.blur && config.segmentation.blur > 0) alphaCtx.filter = `blur(${config.segmentation.blur}px)`; // use css filter for bluring, can be done with gaussian blur manually instead
  const alphaData = alphaCtx.getImageData(0, 0, width, height);

  // original canvas where only alpha shows
  const compositeCanvas = image.canvas(width, height);
  const compositeCtx = compositeCanvas.getContext('2d') as CanvasRenderingContext2D;
  if (input.canvas) compositeCtx.drawImage(input.canvas, 0, 0);
  compositeCtx.globalCompositeOperation = 'darken'; // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation // best options are: darken, color-burn, multiply
  if (config.segmentation.blur && config.segmentation.blur > 0) compositeCtx.filter = `blur(${config.segmentation.blur}px)`; // use css filter for bluring, can be done with gaussian blur manually instead
  compositeCtx.drawImage(alphaCanvas, 0, 0);
  compositeCtx.globalCompositeOperation = 'source-over'; // reset composite operation
  compositeCtx.filter = 'none'; // reset css filter
  const compositeData = compositeCtx.getImageData(0, 0, width, height);
  for (let i = 0; i < width * height; i++) compositeData.data[4 * i + 3] = alphaData.data[4 * i + 0]; // copy original alpha value to new composite canvas
  compositeCtx.putImageData(compositeData, 0, 0);

  return { data, canvas: compositeCanvas, alpha: alphaCanvas };
}

export async function process(input: Input, background: Input | undefined, config: Config)
: Promise<{ data: Uint8ClampedArray | null, canvas: HTMLCanvasElement | OffscreenCanvas | null, alpha: HTMLCanvasElement | OffscreenCanvas | null }> {
  if (busy) return { data: null, canvas: null, alpha: null };
  busy = true;
  if (!model) await load(config);
  const inputImage = image.process(input, config);
  const segmentation = await predict(inputImage, config);
  tf.dispose(inputImage.tensor);
  let mergedCanvas: HTMLCanvasElement | OffscreenCanvas | null = null;

  if (background && segmentation.canvas) { // draw background with segmentation as overlay if background is present
    mergedCanvas = image.canvas(inputImage.canvas?.width || 0, inputImage.canvas?.height || 0);
    const bgImage = image.process(background, config);
    tf.dispose(bgImage.tensor);
    const ctxMerge = mergedCanvas.getContext('2d') as CanvasRenderingContext2D;
    // ctxMerge.globalCompositeOperation = 'source-over';
    ctxMerge.drawImage(bgImage.canvas as HTMLCanvasElement, 0, 0, mergedCanvas.width, mergedCanvas.height);
    // ctxMerge.globalCompositeOperation = 'source-atop';
    ctxMerge.drawImage(segmentation.canvas as HTMLCanvasElement, 0, 0);
    // ctxMerge.globalCompositeOperation = 'source-over';
  }

  busy = false;
  return { data: segmentation.data, canvas: mergedCanvas || segmentation.canvas, alpha: segmentation.alpha };
}
