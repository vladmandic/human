/**
 * Image Processing module used by Human
 */

import * as tf from '../../dist/tfjs.esm.js';
import * as fxImage from './imagefx';
import type { Tensor } from '../tfjs/types';
import type { Config } from '../config';
import { env } from '../env';
import { log } from '../helpers';

type Input = Tensor | ImageData | ImageBitmap | HTMLImageElement | HTMLMediaElement | HTMLVideoElement | HTMLCanvasElement | OffscreenCanvas | typeof Image | typeof env.Canvas;

const maxSize = 2048;
// internal temp canvases
let inCanvas;
let outCanvas;
// @ts-ignore // imagefx is js module that should be converted to a class
let fx: fxImage.GLImageFilter | null; // instance of imagefx

export function canvas(width, height): HTMLCanvasElement | OffscreenCanvas {
  let c;
  if (env.browser) {
    if (typeof OffscreenCanvas !== 'undefined') {
      c = new OffscreenCanvas(width, height);
    } else {
      c = document.createElement('canvas');
      c.width = width;
      c.height = height;
    }
  } else {
    // @ts-ignore // env.canvas is an external monkey-patch
    c = (typeof env.Canvas !== 'undefined') ? new env.Canvas(width, height) : null;
  }
  // if (!c) throw new Error('cannot create canvas');
  return c;
}

// process input image and return tensor
// input can be tensor, imagedata, htmlimageelement, htmlvideoelement
// input is resized and run through imagefx filter
export function process(input: Input, config: Config): { tensor: Tensor | null, canvas: OffscreenCanvas | HTMLCanvasElement } {
  let tensor;
  if (!input) throw new Error('input is missing');
  // sanity checks since different browsers do not implement all dom elements
  if (
    !(input instanceof tf.Tensor)
    && !(typeof Image !== 'undefined' && input instanceof Image)
    && !(typeof env.Canvas !== 'undefined' && input instanceof env.Canvas)
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
    if ((input as unknown as Tensor).shape && (input as unknown as Tensor).shape.length === 4 && (input as unknown as Tensor).shape[0] === 1 && (input as unknown as Tensor).shape[3] === 3) tensor = tf.clone(input);
    else throw new Error(`input tensor shape must be [1, height, width, 3] and instead was ${(input as unknown as Tensor).shape}`);
  } else {
    // check if resizing will be needed
    if (typeof input['readyState'] !== 'undefined' && input['readyState'] <= 2) {
      log('input stream is not ready');
      return { tensor: null, canvas: inCanvas }; // video may become temporarily unavailable due to onresize
    }
    const originalWidth = input['naturalWidth'] || input['videoWidth'] || input['width'] || (input['shape'] && (input['shape'][1] > 0));
    const originalHeight = input['naturalHeight'] || input['videoHeight'] || input['height'] || (input['shape'] && (input['shape'][2] > 0));
    if (!originalWidth || !originalHeight) {
      log('cannot determine input dimensions');
      return { tensor: null, canvas: inCanvas }; // video may become temporarily unavailable due to onresize
    }
    let targetWidth = originalWidth;
    let targetHeight = originalHeight;
    if (targetWidth > maxSize) {
      targetWidth = maxSize;
      targetHeight = targetWidth * originalHeight / originalWidth;
    }
    if (targetHeight > maxSize) {
      targetHeight = maxSize;
      targetWidth = targetHeight * originalWidth / originalHeight;
    }

    // create our canvas and resize it if needed
    if ((config.filter.width || 0) > 0) targetWidth = config.filter.width;
    else if ((config.filter.height || 0) > 0) targetWidth = originalWidth * ((config.filter.height || 0) / originalHeight);
    if ((config.filter.height || 0) > 0) targetHeight = config.filter.height;
    else if ((config.filter.width || 0) > 0) targetHeight = originalHeight * ((config.filter.width || 0) / originalWidth);
    if (!targetWidth || !targetHeight) throw new Error('input cannot determine dimension');
    if (!inCanvas || (inCanvas?.width !== targetWidth) || (inCanvas?.height !== targetHeight)) inCanvas = canvas(targetWidth, targetHeight);

    // draw input to our canvas
    const ctx = inCanvas.getContext('2d');
    if ((typeof ImageData !== 'undefined') && (input instanceof ImageData)) {
      ctx.putImageData(input, 0, 0);
    } else {
      if (config.filter.flip && typeof ctx.translate !== 'undefined') {
        ctx.translate(originalWidth, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(input, 0, 0, originalWidth, originalHeight, 0, 0, inCanvas?.width, inCanvas?.height);
        ctx.setTransform(1, 0, 0, 1, 0, 0); // resets transforms to defaults
      } else {
        ctx.drawImage(input, 0, 0, originalWidth, originalHeight, 0, 0, inCanvas?.width, inCanvas?.height);
      }
    }
    // imagefx transforms using gl
    if (config.filter.enabled && env.webgl.supported) {
      if (!fx || !outCanvas || (inCanvas.width !== outCanvas.width) || (inCanvas?.height !== outCanvas?.height)) {
        outCanvas = canvas(inCanvas?.width, inCanvas?.height);
        if (outCanvas?.width !== inCanvas?.width) outCanvas.width = inCanvas?.width;
        if (outCanvas?.height !== inCanvas?.height) outCanvas.height = inCanvas?.height;
        // log('created FX filter');
        fx = env.browser ? new fxImage.GLImageFilter({ canvas: outCanvas }) : null; // && (typeof document !== 'undefined')
      }
      if (!fx) return { tensor: null, canvas: inCanvas };
      fx.reset();
      fx.addFilter('brightness', config.filter.brightness); // must have at least one filter enabled
      if (config.filter.contrast !== 0) fx.addFilter('contrast', config.filter.contrast);
      if (config.filter.sharpness !== 0) fx.addFilter('sharpen', config.filter.sharpness);
      if (config.filter.blur !== 0) fx.addFilter('blur', config.filter.blur);
      if (config.filter.saturation !== 0) fx.addFilter('saturation', config.filter.saturation);
      if (config.filter.hue !== 0) fx.addFilter('hue', config.filter.hue);
      if (config.filter.negative) fx.addFilter('negative');
      if (config.filter.sepia) fx.addFilter('sepia');
      if (config.filter.vintage) fx.addFilter('brownie');
      if (config.filter.sepia) fx.addFilter('sepia');
      if (config.filter.kodachrome) fx.addFilter('kodachrome');
      if (config.filter.technicolor) fx.addFilter('technicolor');
      if (config.filter.polaroid) fx.addFilter('polaroid');
      if (config.filter.pixelate !== 0) fx.addFilter('pixelate', config.filter.pixelate);
      fx.apply(inCanvas);
      // read pixel data
      /*
      const gl = outCanvas.getContext('webgl');
      if (gl) {
        const glBuffer = new Uint8Array(outCanvas.width * outCanvas.height * 4);
        const pixBuffer = new Uint8Array(outCanvas.width * outCanvas.height * 3);
        gl.readPixels(0, 0, outCanvas.width, outCanvas.height, gl.RGBA, gl.UNSIGNED_BYTE, glBuffer);
        // gl returns rbga while we only need rgb, so discarding alpha channel
        // gl returns starting point as lower left, so need to invert vertical
        let i = 0;
        for (let y = outCanvas.height - 1; y >= 0; y--) {
          for (let x = 0; x < outCanvas.width; x++) {
            const index = (x + y * outCanvas.width) * 4;
            pixBuffer[i++] = glBuffer[index + 0];
            pixBuffer[i++] = glBuffer[index + 1];
            pixBuffer[i++] = glBuffer[index + 2];
          }
        }
        outCanvas.data = pixBuffer;
        const shape = [outCanvas.height, outCanvas.width, 3];
        const pixels = tf.tensor3d(outCanvas.data, shape, 'float32');
        tensor = tf.expandDims(pixels, 0);
        tf.dispose(pixels);
      }
      */
    } else {
      outCanvas = inCanvas;
      if (fx) fx = null;
    }
    // create tensor from image if tensor is not already defined
    if (!tensor) {
      let pixels;
      if (outCanvas.data) { // if we have data, just convert to tensor
        const shape = [outCanvas.height, outCanvas.width, 3];
        pixels = tf.tensor3d(outCanvas.data, shape, 'int32');
      } else if ((typeof ImageData !== 'undefined') && (outCanvas instanceof ImageData)) { // if input is imagedata, just use it
        pixels = tf.browser ? tf.browser.fromPixels(outCanvas) : null;
      } else if (config.backend === 'webgl' || config.backend === 'humangl') { // tf kernel-optimized method to get imagedata
        // we cant use canvas as-is as it already has a context, so we do a silly one more canvas
        const tempCanvas = canvas(targetWidth, targetHeight);
        tempCanvas.width = targetWidth;
        tempCanvas.height = targetHeight;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx?.drawImage(outCanvas, 0, 0);
        try {
          pixels = (tf.browser && env.browser) ? tf.browser.fromPixels(tempCanvas) : null;
        } catch (err) {
          throw new Error('browser webgl error');
        }
      } else { // cpu and wasm kernel does not implement efficient fromPixels method
        // we cant use canvas as-is as it already has a context, so we do a silly one more canvas and do fromPixels on ImageData instead
        const tempCanvas = canvas(targetWidth, targetHeight);
        if (!tempCanvas) return { tensor: null, canvas: inCanvas };
        tempCanvas.width = targetWidth;
        tempCanvas.height = targetHeight;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return { tensor: null, canvas: inCanvas };
        tempCtx.drawImage(outCanvas, 0, 0);
        const data = tempCtx.getImageData(0, 0, targetWidth, targetHeight);
        if (tf.browser && env.browser) {
          pixels = tf.browser.fromPixels(data);
        } else {
          pixels = tf.tidy(() => {
            const imageData = tf.tensor(Array.from(data.data), [targetWidth, targetHeight, 4]);
            const channels = tf.split(imageData, 4, 2); // split rgba to channels
            const rgb = tf.stack([channels[0], channels[1], channels[2]], 2); // stack channels back to rgb and ignore alpha
            const expand = tf.reshape(rgb, [imageData.shape[0], imageData.shape[1], 3]); // move extra dim from the end of tensor and use it as batch number instead
            return expand;
          });
        }
      }
      if (pixels) {
        const casted = tf.cast(pixels, 'float32');
        tensor = tf.expandDims(casted, 0);
        tf.dispose(pixels);
        tf.dispose(casted);
      } else {
        tensor = tf.zeros([1, targetWidth, targetHeight, 3]);
        throw new Error('cannot create tensor from input');
      }
    }
  }
  return { tensor, canvas: (config.filter.return ? outCanvas : null) };
}

let lastInputSum = 0;
let lastCacheDiff = 1;
export async function skip(config, input: Tensor) {
  if (config.cacheSensitivity === 0) return false;
  const resizeFact = 32;
  if (!input.shape[1] || !input.shape[2]) return false;
  const reduced: Tensor = tf.image.resizeBilinear(input, [Math.trunc(input.shape[1] / resizeFact), Math.trunc(input.shape[2] / resizeFact)]);

  // use tensor sum
  /*
  const sumT = this.tf.sum(reduced);
  const sum = await sumT.data()[0] as number;
  sumT.dispose();
  */
  // use js loop sum, faster than uploading tensor to gpu calculating and downloading back
  const reducedData = await reduced.data(); // raw image rgb array
  tf.dispose(reduced);
  let sum = 0;
  for (let i = 0; i < reducedData.length / 3; i++) sum += reducedData[3 * i + 2]; // look only at green value of each pixel

  const diff = 100 * (Math.max(sum, lastInputSum) / Math.min(sum, lastInputSum) - 1);
  lastInputSum = sum;
  // if previous frame was skipped, skip this frame if changed more than cacheSensitivity
  // if previous frame was not skipped, then look for cacheSensitivity or difference larger than one in previous frame to avoid resetting cache in subsequent frames unnecessarily
  const skipFrame = diff < Math.max(config.cacheSensitivity, lastCacheDiff);
  // if difference is above 10x threshold, don't use last value to force reset cache for significant change of scenes or images
  lastCacheDiff = diff > 10 * config.cacheSensitivity ? 0 : diff;
  // console.log('skipFrame', skipFrame, this.config.cacheSensitivity, diff);
  return skipFrame;
}
