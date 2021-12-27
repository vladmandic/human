/**
 * Image Processing algorithm implementation
 */

import * as tf from '../../dist/tfjs.esm.js';
import * as fxImage from './imagefx';
import type { Input, AnyCanvas, Tensor, Config } from '../exports';
import { env } from '../util/env';
import { log } from '../util/util';
import * as enhance from './enhance';

const maxSize = 2048;
// internal temp canvases
let inCanvas: AnyCanvas | null = null; // use global variable to avoid recreating canvas on each frame
let outCanvas: AnyCanvas | null = null; // use global variable to avoid recreating canvas on each frame
let tmpCanvas: AnyCanvas | null = null; // use global variable to avoid recreating canvas on each frame
// @ts-ignore // imagefx is js module that should be converted to a class
let fx: fxImage.GLImageFilter | null; // instance of imagefx

const last: { inputSum: number, cacheDiff: number, sumMethod: number, inputTensor: undefined | Tensor } = {
  inputSum: 0,
  cacheDiff: 1,
  sumMethod: 0,
  inputTensor: undefined,
};

export function canvas(width: number, height: number): AnyCanvas {
  let c;
  if (env.browser) { // browser defines canvas object
    if (env.worker) { // if runing in web  worker use OffscreenCanvas
      if (typeof OffscreenCanvas === 'undefined') throw new Error('canvas error: attempted to run in web worker but OffscreenCanvas is not supported');
      c = new OffscreenCanvas(width, height);
    } else { // otherwise use DOM canvas
      if (typeof document === 'undefined') throw new Error('canvas error: attempted to run in browser but DOM is not defined');
      c = document.createElement('canvas');
      c.width = width;
      c.height = height;
    }
  } else { // if not running in browser, there is no "default" canvas object, so we need monkey patch or fail
    // @ts-ignore // env.canvas is an external monkey-patch
    if (typeof env.Canvas !== 'undefined') c = new env.Canvas(width, height);
    else if (typeof globalThis.Canvas !== 'undefined') c = new globalThis.Canvas(width, height);
    // else throw new Error('canvas error: attempted to use canvas in nodejs without canvas support installed');
  }
  return c;
}

// helper function to copy canvas from input to output
export function copy(input: AnyCanvas, output?: AnyCanvas) {
  const outputCanvas = output || canvas(input.width, input.height);
  const ctx = outputCanvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.drawImage(input, 0, 0);
  return outputCanvas;
}

// process input image and return tensor
// input can be tensor, imagedata, htmlimageelement, htmlvideoelement
// input is resized and run through imagefx filter
export async function process(input: Input, config: Config, getTensor: boolean = true): Promise<{ tensor: Tensor | null, canvas: AnyCanvas | null }> {
  if (!input) {
    // throw new Error('input is missing');
    if (config.debug) log('input error: input is missing');
    return { tensor: null, canvas: null }; // video may become temporarily unavailable due to onresize
  }
  // sanity checks since different browsers do not implement all dom elements
  if (
    !(input instanceof tf.Tensor)
    && !(typeof Image !== 'undefined' && input instanceof Image)
    && !(typeof env.Canvas !== 'undefined' && input instanceof env.Canvas)
    && !(typeof globalThis.Canvas !== 'undefined' && input instanceof globalThis.Canvas)
    && !(typeof ImageData !== 'undefined' && input instanceof ImageData)
    && !(typeof ImageBitmap !== 'undefined' && input instanceof ImageBitmap)
    && !(typeof HTMLImageElement !== 'undefined' && input instanceof HTMLImageElement)
    && !(typeof HTMLMediaElement !== 'undefined' && input instanceof HTMLMediaElement)
    && !(typeof HTMLVideoElement !== 'undefined' && input instanceof HTMLVideoElement)
    && !(typeof HTMLCanvasElement !== 'undefined' && input instanceof HTMLCanvasElement)
    && !(typeof OffscreenCanvas !== 'undefined' && input instanceof OffscreenCanvas)
  ) {
    throw new Error('input error: type is not recognized');
  }
  if (input instanceof tf.Tensor) { // if input is tensor use as-is without filters but correct shape as needed
    let tensor: Tensor | null = null;
    if ((input as Tensor)['isDisposedInternal']) throw new Error('input error: attempted to use tensor but it is disposed');
    if (!(input as Tensor)['shape']) throw new Error('input error: attempted to use tensor without a shape');
    if ((input as Tensor).shape.length === 3) { // [height, width, 3 || 4]
      if ((input as Tensor).shape[2] === 3) { // [height, width, 3] so add batch
        tensor = tf.expandDims(input, 0);
      } else if ((input as Tensor).shape[2] === 4) { // [height, width, 4] so strip alpha and add batch
        const rgb = tf.slice3d(input, [0, 0, 0], [-1, -1, 3]);
        tensor = tf.expandDims(rgb, 0);
        tf.dispose(rgb);
      }
    } else if ((input as Tensor).shape.length === 4) { // [1, width, height, 3 || 4]
      if ((input as Tensor).shape[3] === 3) { // [1, width, height, 3] just clone
        tensor = tf.clone(input);
      } else if ((input as Tensor).shape[3] === 4) { // [1, width, height, 4] so strip alpha
        tensor = tf.slice4d(input, [0, 0, 0, 0], [-1, -1, -1, 3]);
      }
    }
    // at the end shape must be [1, height, width, 3]
    if (tensor == null || tensor.shape.length !== 4 || tensor.shape[0] !== 1 || tensor.shape[3] !== 3) throw new Error(`input error: attempted to use tensor with unrecognized shape: ${input['shape']}`);
    if ((tensor as Tensor).dtype === 'int32') {
      const cast = tf.cast(tensor, 'float32');
      tf.dispose(tensor);
      tensor = cast;
    }
    return { tensor, canvas: (config.filter.return ? outCanvas : null) };
  } else {
    // check if resizing will be needed
    if (typeof input['readyState'] !== 'undefined' && input['readyState'] <= 2) {
      if (config.debug) log('input stream is not ready');
      return { tensor: null, canvas: inCanvas }; // video may become temporarily unavailable due to onresize
    }
    const originalWidth = input['naturalWidth'] || input['videoWidth'] || input['width'] || (input['shape'] && (input['shape'][1] > 0));
    const originalHeight = input['naturalHeight'] || input['videoHeight'] || input['height'] || (input['shape'] && (input['shape'][2] > 0));
    if (!originalWidth || !originalHeight) {
      if (config.debug) log('cannot determine input dimensions');
      return { tensor: null, canvas: inCanvas }; // video may become temporarily unavailable due to onresize
    }
    let targetWidth = originalWidth;
    let targetHeight = originalHeight;
    if (targetWidth > maxSize) {
      targetWidth = maxSize;
      targetHeight = Math.trunc(targetWidth * originalHeight / originalWidth);
    }
    if (targetHeight > maxSize) {
      targetHeight = maxSize;
      targetWidth = Math.trunc(targetHeight * originalWidth / originalHeight);
    }

    // create our canvas and resize it if needed
    if ((config.filter.width || 0) > 0) targetWidth = config.filter.width;
    else if ((config.filter.height || 0) > 0) targetWidth = originalWidth * ((config.filter.height || 0) / originalHeight);
    if ((config.filter.height || 0) > 0) targetHeight = config.filter.height;
    else if ((config.filter.width || 0) > 0) targetHeight = originalHeight * ((config.filter.width || 0) / originalWidth);
    if (!targetWidth || !targetHeight) throw new Error('input error: cannot determine dimension');
    if (!inCanvas || (inCanvas?.width !== targetWidth) || (inCanvas?.height !== targetHeight)) inCanvas = canvas(targetWidth, targetHeight);

    // draw input to our canvas
    const inCtx = inCanvas.getContext('2d') as CanvasRenderingContext2D;
    if ((typeof ImageData !== 'undefined') && (input instanceof ImageData)) {
      inCtx.putImageData(input, 0, 0);
    } else {
      if (config.filter.flip && typeof inCtx.translate !== 'undefined') {
        inCtx.translate(originalWidth, 0);
        inCtx.scale(-1, 1);
        inCtx.drawImage(input as AnyCanvas, 0, 0, originalWidth, originalHeight, 0, 0, inCanvas?.width, inCanvas?.height);
        inCtx.setTransform(1, 0, 0, 1, 0, 0); // resets transforms to defaults
      } else {
        inCtx.drawImage(input as AnyCanvas, 0, 0, originalWidth, originalHeight, 0, 0, inCanvas?.width, inCanvas?.height);
      }
    }

    if (!outCanvas || (inCanvas.width !== outCanvas.width) || (inCanvas?.height !== outCanvas?.height)) outCanvas = canvas(inCanvas.width, inCanvas.height); // init output canvas

    // imagefx transforms using gl from input canvas to output canvas
    if (config.filter.enabled && env.webgl.supported) {
      if (!fx) fx = env.browser ? new fxImage.GLImageFilter() : null; // && (typeof document !== 'undefined')
      env.filter = !!fx;
      if (!fx || !fx.add) {
        if (config.debug) log('input process error: cannot initialize filters');
        return { tensor: null, canvas: inCanvas };
      }
      fx.reset();
      if (config.filter.brightness !== 0) fx.add('brightness', config.filter.brightness);
      if (config.filter.contrast !== 0) fx.add('contrast', config.filter.contrast);
      if (config.filter.sharpness !== 0) fx.add('sharpen', config.filter.sharpness);
      if (config.filter.blur !== 0) fx.add('blur', config.filter.blur);
      if (config.filter.saturation !== 0) fx.add('saturation', config.filter.saturation);
      if (config.filter.hue !== 0) fx.add('hue', config.filter.hue);
      if (config.filter.negative) fx.add('negative');
      if (config.filter.sepia) fx.add('sepia');
      if (config.filter.vintage) fx.add('brownie');
      if (config.filter.sepia) fx.add('sepia');
      if (config.filter.kodachrome) fx.add('kodachrome');
      if (config.filter.technicolor) fx.add('technicolor');
      if (config.filter.polaroid) fx.add('polaroid');
      if (config.filter.pixelate !== 0) fx.add('pixelate', config.filter.pixelate);
      if (fx.get() > 0) outCanvas = fx.apply(inCanvas);
      else outCanvas = fx.draw(inCanvas);
    } else {
      copy(inCanvas, outCanvas); // if no filters applied, output canvas is input canvas
      if (fx) fx = null;
      env.filter = !!fx;
    }

    if (!getTensor) return { tensor: null, canvas: outCanvas }; // just canvas was requested
    if (!outCanvas) throw new Error('canvas error: cannot create output');

    // create tensor from image unless input was a tensor already
    let pixels;
    let depth = 3;
    if ((typeof ImageData !== 'undefined' && input instanceof ImageData) || (input['data'] && input['width'] && input['height'])) { // if input is imagedata, just use it
      if (env.browser && tf.browser) {
        pixels = tf.browser ? tf.browser.fromPixels(input) : null;
      } else {
        depth = input['data'].length / input['height'] / input['width'];
        // const arr = Uint8Array.from(input['data']);
        const arr = new Uint8Array(input['data']['buffer']);
        pixels = tf.tensor(arr, [input['height'], input['width'], depth], 'int32');
      }
    } else {
      if (!tmpCanvas || (outCanvas.width !== tmpCanvas.width) || (outCanvas.height !== tmpCanvas.height)) tmpCanvas = canvas(outCanvas.width, outCanvas.height); // init output canvas
      if (tf.browser && env.browser) {
        if (config.backend === 'webgl' || config.backend === 'humangl' || config.backend === 'webgpu') {
          pixels = tf.browser.fromPixels(outCanvas); // safe to reuse since both backend and context are gl based
        } else {
          tmpCanvas = copy(outCanvas); // cannot use output canvas as it already has gl context so we do a silly one more canvas
          pixels = tf.browser.fromPixels(tmpCanvas);
        }
      } else {
        const tempCanvas = copy(outCanvas); // cannot use output canvas as it already has gl context so we do a silly one more canvas
        const tempCtx = tempCanvas.getContext('2d') as CanvasRenderingContext2D;
        const tempData = tempCtx.getImageData(0, 0, targetWidth, targetHeight);
        depth = tempData.data.length / targetWidth / targetHeight;
        const arr = new Uint8Array(tempData.data.buffer);
        pixels = tf.tensor(arr, [targetWidth, targetHeight, depth]);
      }
    }
    if (depth === 4) { // rgba to rgb
      const rgb = tf.slice3d(pixels, [0, 0, 0], [-1, -1, 3]); // strip alpha channel
      tf.dispose(pixels);
      pixels = rgb;
    }
    if (!pixels) throw new Error('input error: cannot create tensor');
    const casted = tf.cast(pixels, 'float32');
    const tensor = config.filter.equalization ? await enhance.histogramEqualization(casted) : tf.expandDims(casted, 0);
    tf.dispose([pixels, casted]);
    return { tensor, canvas: (config.filter.return ? outCanvas : null) };
  }
}

/*
const checksum = async (input: Tensor): Promise<number> => { // use tf sum or js based sum loop depending on which is faster
  const resizeFact = 48;
  const reduced: Tensor = tf.image.resizeBilinear(input, [Math.trunc((input.shape[1] || 1) / resizeFact), Math.trunc((input.shape[2] || 1) / resizeFact)]);
  const tfSum = async (): Promise<number> => {
    const sumT = tf.sum(reduced);
    const sum0 = await sumT.data();
    tf.dispose(sumT);
    return sum0[0];
  };
  const jsSum = async (): Promise<number> => {
    const reducedData = await reduced.data(); // raw image rgb array
    let sum0 = 0;
    for (let i = 0; i < reducedData.length / 3; i++) sum0 += reducedData[3 * i + 2]; // look only at green value of each pixel
    return sum0;
  };
  if (last.sumMethod === 0) {
    const t0 = now();
    await jsSum();
    const t1 = now();
    await tfSum();
    const t2 = now();
    last.sumMethod = t1 - t0 < t2 - t1 ? 1 : 2;
  }
  const res = last.sumMethod === 1 ? await jsSum() : await tfSum();
  tf.dispose(reduced);
  return res;
};
*/

export async function skip(config: Partial<Config>, input: Tensor) {
  let skipFrame = false;
  if (config.cacheSensitivity === 0 || !input.shape || input.shape.length !== 4 || input.shape[1] > 2048 || input.shape[2] > 2048) return skipFrame; // cache disabled or input is invalid or too large for cache analysis

  /*
  const checkSum = await checksum(input);
  const diff = 100 * (Math.max(checkSum, last.inputSum) / Math.min(checkSum, last.inputSum) - 1);
  last.inputSum = checkSum;
  // if previous frame was skipped, skip this frame if changed more than cacheSensitivity
  // if previous frame was not skipped, then look for cacheSensitivity or difference larger than one in previous frame to avoid resetting cache in subsequent frames unnecessarily
  let skipFrame = diff < Math.max(config.cacheSensitivity, last.cacheDiff);
  // if difference is above 10x threshold, don't use last value to force reset cache for significant change of scenes or images
  last.cacheDiff = diff > 10 * config.cacheSensitivity ? 0 : diff;
  skipFrame = skipFrame && (last.cacheDiff > 0); // if no cached diff value then force no skip
  */

  if (!last.inputTensor) {
    last.inputTensor = tf.clone(input);
  } else if (last.inputTensor.shape[1] !== input.shape[1] || last.inputTensor.shape[2] !== input.shape[2]) { // input resolution changed
    tf.dispose(last.inputTensor);
    last.inputTensor = tf.clone(input);
  } else {
    const t: Record<string, Tensor> = {};
    t.diff = tf.sub(input, last.inputTensor);
    t.squared = tf.mul(t.diff, t.diff);
    t.sum = tf.sum(t.squared);
    const diffSum = await t.sum.data();
    const diffRelative = diffSum[0] / (input.shape[1] || 1) / (input.shape[2] || 1) / 255 / 3; // squared difference relative to input resolution and averaged per channel
    tf.dispose([last.inputTensor, t.diff, t.squared, t.sum]);
    last.inputTensor = tf.clone(input);
    skipFrame = diffRelative <= (config.cacheSensitivity || 0);
  }
  return skipFrame;
}

export async function compare(config: Partial<Config>, input1: Tensor, input2: Tensor): Promise<number> {
  const t: Record<string, Tensor> = {};
  if (!input1 || !input2 || input1.shape.length !== 4 || input1.shape.length !== input2.shape.length) {
    if (!config.debug) log('invalid input tensor or tensor shapes do not match:', input1.shape, input2.shape);
    return 0;
  }
  if (input1.shape[0] !== 1 || input2.shape[0] !== 1 || input1.shape[3] !== 3 || input2.shape[3] !== 3) {
    if (!config.debug) log('input tensors must be of shape [1, height, width, 3]:', input1.shape, input2.shape);
    return 0;
  }
  t.input1 = tf.clone(input1);
  t.input2 = (input1.shape[1] !== input2.shape[1] || input1.shape[2] !== input2.shape[2]) ? tf.image.resizeBilinear(input2, [input1.shape[1], input1.shape[2]]) : tf.clone(input2);
  t.diff = tf.sub(t.input1, t.input2);
  t.squared = tf.mul(t.diff, t.diff);
  t.sum = tf.sum(t.squared);
  const diffSum = await t.sum.data();
  const diffRelative = diffSum[0] / (input1.shape[1] || 1) / (input1.shape[2] || 1) / 255 / 3;
  tf.dispose([t.input1, t.input2, t.diff, t.squared, t.sum]);
  return diffRelative;
}
