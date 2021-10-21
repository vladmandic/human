/**
 * Image Processing algorithm implementation
 */

import * as tf from '../../dist/tfjs.esm.js';
import * as fxImage from './imagefx';
import type { Tensor } from '../tfjs/types';
import type { Config } from '../config';
import { env } from '../util/env';
import { log, now } from '../util/util';

export type Input = Tensor | ImageData | ImageBitmap | HTMLImageElement | HTMLMediaElement | HTMLVideoElement | HTMLCanvasElement | OffscreenCanvas | typeof Image | typeof env.Canvas;
export type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;

const maxSize = 2048;
// internal temp canvases
let inCanvas: AnyCanvas | null = null; // use global variable to avoid recreating canvas on each frame
let outCanvas: AnyCanvas | null = null; // use global variable to avoid recreating canvas on each frame
let tmpCanvas: AnyCanvas | null = null; // use global variable to avoid recreating canvas on each frame
// @ts-ignore // imagefx is js module that should be converted to a class
let fx: fxImage.GLImageFilter | null; // instance of imagefx

export function canvas(width, height): AnyCanvas {
  let c;
  if (env.browser) {
    if (env.offscreen) {
      c = new OffscreenCanvas(width, height);
    } else {
      if (typeof document === 'undefined') throw new Error('attempted to run in web worker but offscreenCanvas is not supported');
      c = document.createElement('canvas');
      c.width = width;
      c.height = height;
    }
  } else {
    // @ts-ignore // env.canvas is an external monkey-patch
    if (typeof env.Canvas !== 'undefined') c = new env.Canvas(width, height);
    else if (typeof globalThis.Canvas !== 'undefined') c = new globalThis.Canvas(width, height);
  }
  // if (!c) throw new Error('cannot create canvas');
  return c;
}

export function copy(input: AnyCanvas, output?: AnyCanvas) {
  const outputCanvas = output || canvas(input.width, input.height);
  const ctx = outputCanvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.drawImage(input, 0, 0);
  return outputCanvas;
}

// process input image and return tensor
// input can be tensor, imagedata, htmlimageelement, htmlvideoelement
// input is resized and run through imagefx filter
export function process(input: Input, config: Config, getTensor: boolean = true): { tensor: Tensor | null, canvas: AnyCanvas | null } {
  if (!input) {
    // throw new Error('input is missing');
    if (config.debug) log('input is missing');
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
    throw new Error('input type is not recognized');
  }
  if (input instanceof tf.Tensor) {
    // if input is tensor, use as-is
    if ((input)['isDisposedInternal']) {
      throw new Error('input tensor is disposed');
    } else if (!(input as Tensor).shape || (input as Tensor).shape.length !== 4 || (input as Tensor).shape[0] !== 1 || (input as Tensor).shape[3] !== 3) {
      throw new Error(`input tensor shape must be [1, height, width, 3] and instead was ${input['shape']}`);
    } else {
      return { tensor: tf.clone(input), canvas: (config.filter.return ? outCanvas : null) };
    }
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
    if (!targetWidth || !targetHeight) throw new Error('input cannot determine dimension');
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
      if (!fx) return { tensor: null, canvas: inCanvas };
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
    if (!outCanvas) throw new Error('cannot create output canvas');

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
      if (!tmpCanvas || (outCanvas.width !== tmpCanvas.width) || (outCanvas?.height !== tmpCanvas?.height)) tmpCanvas = canvas(outCanvas.width, outCanvas.height); // init output canvas
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
      /*
      const channels = tf.split(pixels, 4, 2); // split rgba to channels
      tf.dispose(pixels);
      const rgb = tf.stack([channels[0], channels[1], channels[2]], 2); // stack channels back to rgb and ignore alpha
      pixels = tf.reshape(rgb, [rgb.shape[0], rgb.shape[1], 3]); // move extra dim from the end of tensor and use it as batch number instead
      tf.dispose([rgb, ...channels]);
      */
    }
    if (!pixels) throw new Error('cannot create tensor from input');
    const casted = tf.cast(pixels, 'float32');
    const tensor = tf.expandDims(casted, 0);
    tf.dispose([pixels, casted]);
    return { tensor, canvas: (config.filter.return ? outCanvas : null) };
  }
}

let lastInputSum = 0;
let lastCacheDiff = 1;
let benchmarked = 0;

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
  if (benchmarked === 0) {
    const t0 = now();
    await jsSum();
    const t1 = now();
    await tfSum();
    const t2 = now();
    benchmarked = t1 - t0 < t2 - t1 ? 1 : 2;
  }
  const res = benchmarked === 1 ? await jsSum() : await tfSum();
  tf.dispose(reduced);
  return res;
};

export async function skip(config, input: Tensor) {
  if (config.cacheSensitivity === 0) return false;
  const sum = await checksum(input);
  const diff = 100 * (Math.max(sum, lastInputSum) / Math.min(sum, lastInputSum) - 1);
  lastInputSum = sum;
  // if previous frame was skipped, skip this frame if changed more than cacheSensitivity
  // if previous frame was not skipped, then look for cacheSensitivity or difference larger than one in previous frame to avoid resetting cache in subsequent frames unnecessarily
  let skipFrame = diff < Math.max(config.cacheSensitivity, lastCacheDiff);
  // if difference is above 10x threshold, don't use last value to force reset cache for significant change of scenes or images
  lastCacheDiff = diff > 10 * config.cacheSensitivity ? 0 : diff;
  skipFrame = skipFrame && (lastCacheDiff > 0); // if no cached diff value then force no skip
  return skipFrame;
}
