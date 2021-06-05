/**
 * Image Processing module used by Human
 */

import * as tf from '../../dist/tfjs.esm.js';
import * as fxImage from './imagefx';
import { Tensor } from '../tfjs/types';
import { Config } from '../config';

type Input = Tensor | typeof Image | ImageData | ImageBitmap | HTMLImageElement | HTMLMediaElement | HTMLVideoElement | HTMLCanvasElement | OffscreenCanvas;

const maxSize = 2048;
// internal temp canvases
let inCanvas;
let outCanvas;
// instance of fximage
let fx;

// process input image and return tensor
// input can be tensor, imagedata, htmlimageelement, htmlvideoelement
// input is resized and run through imagefx filter
export function process(input: Input, config: Config): { tensor: Tensor | null, canvas: OffscreenCanvas | HTMLCanvasElement } {
  let tensor;
  if (!input) throw new Error('Human: Input is missing');
  // sanity checks since different browsers do not implement all dom elements
  if (
    !(input instanceof tf.Tensor)
    && !(typeof Image !== 'undefined' && input instanceof Image)
    && !(typeof ImageData !== 'undefined' && input instanceof ImageData)
    && !(typeof ImageBitmap !== 'undefined' && input instanceof ImageBitmap)
    && !(typeof HTMLImageElement !== 'undefined' && input instanceof HTMLImageElement)
    && !(typeof HTMLMediaElement !== 'undefined' && input instanceof HTMLMediaElement)
    && !(typeof HTMLVideoElement !== 'undefined' && input instanceof HTMLVideoElement)
    && !(typeof HTMLCanvasElement !== 'undefined' && input instanceof HTMLCanvasElement)
    && !(typeof OffscreenCanvas !== 'undefined' && input instanceof OffscreenCanvas)
  ) {
    throw new Error('Human: Input type is not recognized');
  }
  if (input instanceof tf.Tensor) {
    // if input is tensor, use as-is
    if (input.shape && input.shape.length === 4 && input.shape[0] === 1 && input.shape[3] === 3) tensor = tf.clone(input);
    else throw new Error(`Human: Input tensor shape must be [1, height, width, 3] and instead was ${input.shape}`);
  } else {
    // check if resizing will be needed
    const originalWidth = input['naturalWidth'] || input['videoWidth'] || input['width'] || (input['shape'] && (input['shape'][1] > 0));
    const originalHeight = input['naturalHeight'] || input['videoHeight'] || input['height'] || (input['shape'] && (input['shape'][2] > 0));
    if (!originalWidth || !originalHeight) return { tensor: null, canvas: inCanvas }; // video may become temporarily unavailable due to onresize
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
    if (config.filter.width > 0) targetWidth = config.filter.width;
    else if (config.filter.height > 0) targetWidth = originalWidth * (config.filter.height / originalHeight);
    if (config.filter.height > 0) targetHeight = config.filter.height;
    else if (config.filter.width > 0) targetHeight = originalHeight * (config.filter.width / originalWidth);
    if (!targetWidth || !targetHeight) throw new Error('Human: Input cannot determine dimension');
    if (!inCanvas || (inCanvas?.width !== targetWidth) || (inCanvas?.height !== targetHeight)) {
      inCanvas = (typeof OffscreenCanvas !== 'undefined') ? new OffscreenCanvas(targetWidth, targetHeight) : document.createElement('canvas');
      if (inCanvas?.width !== targetWidth) inCanvas.width = targetWidth;
      if (inCanvas?.height !== targetHeight) inCanvas.height = targetHeight;
    }

    // draw input to our canvas
    const ctx = inCanvas.getContext('2d');
    if (input instanceof ImageData) {
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
    if (config.filter.enabled) {
      if (!fx || !outCanvas || (inCanvas.width !== outCanvas.width) || (inCanvas?.height !== outCanvas?.height)) {
        outCanvas = (typeof OffscreenCanvas !== 'undefined') ? new OffscreenCanvas(inCanvas?.width, inCanvas?.height) : document.createElement('canvas');
        if (outCanvas?.width !== inCanvas?.width) outCanvas.width = inCanvas?.width;
        if (outCanvas?.height !== inCanvas?.height) outCanvas.height = inCanvas?.height;
        // log('created FX filter');
        fx = tf.ENV.flags.IS_BROWSER ? new fxImage.GLImageFilter({ canvas: outCanvas }) : null; // && (typeof document !== 'undefined')
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
      }
      */
    } else {
      outCanvas = inCanvas;
      if (fx) fx = null;
    }

    // create tensor from image
    let pixels;
    if (outCanvas.data) { // if we have data, just convert to tensor
      const shape = [outCanvas.height, outCanvas.width, 3];
      pixels = tf.tensor3d(outCanvas.data, shape, 'int32');
    } else if (outCanvas instanceof ImageData) { // if input is imagedata, just use it
      pixels = tf.browser ? tf.browser.fromPixels(outCanvas) : null;
    } else if (config.backend === 'webgl' || config.backend === 'humangl') { // tf kernel-optimized method to get imagedata
      // we can use canvas as-is as it already has a context, so we do a silly one more canvas
      const tempCanvas = (typeof OffscreenCanvas !== 'undefined') ? new OffscreenCanvas(targetWidth, targetHeight) : document.createElement('canvas');
      tempCanvas.width = targetWidth;
      tempCanvas.height = targetHeight;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx?.drawImage(outCanvas, 0, 0);
      pixels = tf.browser ? tf.browser.fromPixels(tempCanvas) : null;
    } else { // cpu and wasm kernel does not implement efficient fromPixels method
      // we can use canvas as-is as it already has a context, so we do a silly one more canvas
      const tempCanvas = (typeof OffscreenCanvas !== 'undefined') ? new OffscreenCanvas(targetWidth, targetHeight) : document.createElement('canvas');
      tempCanvas.width = targetWidth;
      tempCanvas.height = targetHeight;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx?.drawImage(outCanvas, 0, 0);
      const data = tempCtx?.getImageData(0, 0, targetWidth, targetHeight);
      pixels = tf.browser ? tf.browser.fromPixels(data) : null;
    }
    if (pixels) {
      const casted = pixels.toFloat();
      tensor = casted.expandDims(0);
      pixels.dispose();
      casted.dispose();
    }
  }
  const canvas = config.filter.return ? outCanvas : null;
  return { tensor, canvas };
}
