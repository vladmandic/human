import { log } from './log.js';
import * as tf from '../dist/tfjs.esm.js';
import * as fxImage from './imagefx.js';

// internal temp canvases
let inCanvas = null;
let outCanvas = null;

// process input image and return tensor
// input can be tensor, imagedata, htmlimageelement, htmlvideoelement
// input is resized and run through imagefx filter
function process(input, config) {
  let tensor;
  if (input instanceof tf.Tensor) {
    tensor = tf.clone(input);
  } else {
    const originalWidth = input.naturalWidth || input.videoWidth || input.width || (input.shape && (input.shape[1] > 0));
    const originalHeight = input.naturalHeight || input.videoHeight || input.height || (input.shape && (input.shape[2] > 0));
    let targetWidth = originalWidth;
    let targetHeight = originalHeight;
    if (config.filter.width > 0) targetWidth = config.filter.width;
    else if (config.filter.height > 0) targetWidth = originalWidth * (config.filter.height / originalHeight);
    if (config.filter.height > 0) targetHeight = config.filter.height;
    else if (config.filter.width > 0) targetHeight = originalHeight * (config.filter.width / originalWidth);
    if (!targetWidth || !targetHeight) {
      log('Human: invalid input', input);
      return null;
    }
    if (!inCanvas || (inCanvas.width !== targetWidth) || (inCanvas.height !== targetHeight)) {
      inCanvas = (typeof OffscreenCanvas !== 'undefined') ? new OffscreenCanvas(targetWidth, targetHeight) : document.createElement('canvas');
      if (inCanvas.width !== targetWidth) inCanvas.width = targetWidth;
      if (inCanvas.height !== targetHeight) inCanvas.height = targetHeight;
    }
    const ctx = inCanvas.getContext('2d');
    if (input instanceof ImageData) ctx.putImageData(input, 0, 0);
    else ctx.drawImage(input, 0, 0, originalWidth, originalHeight, 0, 0, inCanvas.width, inCanvas.height);
    if (config.filter.enabled) {
      if (!this.fx || !outCanvas || (inCanvas.width !== outCanvas.width) || (inCanvas.height !== outCanvas.height)) {
        outCanvas = (typeof OffscreenCanvas !== 'undefined') ? new OffscreenCanvas(inCanvas.width, inCanvas.height) : document.createElement('canvas');
        if (outCanvas.width !== inCanvas.width) outCanvas.width = inCanvas.width;
        if (outCanvas.height !== inCanvas.height) outCanvas.height = inCanvas.height;
        this.fx = tf.ENV.flags.IS_BROWSER ? new fxImage.Canvas({ canvas: outCanvas }) : null; // && (typeof document !== 'undefined')
      }
      if (!this.fx) return inCanvas;
      this.fx.reset();
      this.fx.addFilter('brightness', config.filter.brightness); // must have at least one filter enabled
      if (config.filter.contrast !== 0) this.fx.addFilter('contrast', config.filter.contrast);
      if (config.filter.sharpness !== 0) this.fx.addFilter('sharpen', config.filter.sharpness);
      if (config.filter.blur !== 0) this.fx.addFilter('blur', config.filter.blur);
      if (config.filter.saturation !== 0) this.fx.addFilter('saturation', config.filter.saturation);
      if (config.filter.hue !== 0) this.fx.addFilter('hue', config.filter.hue);
      if (config.filter.negative) this.fx.addFilter('negative');
      if (config.filter.sepia) this.fx.addFilter('sepia');
      if (config.filter.vintage) this.fx.addFilter('brownie');
      if (config.filter.sepia) this.fx.addFilter('sepia');
      if (config.filter.kodachrome) this.fx.addFilter('kodachrome');
      if (config.filter.technicolor) this.fx.addFilter('technicolor');
      if (config.filter.polaroid) this.fx.addFilter('polaroid');
      if (config.filter.pixelate !== 0) this.fx.addFilter('pixelate', config.filter.pixelate);
      this.fx.apply(inCanvas);
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
    }
    let pixels;
    if (outCanvas.data) {
      const shape = [outCanvas.height, outCanvas.width, 3];
      pixels = tf.tensor3d(outCanvas.data, shape, 'int32');
    } else if ((config.backend === 'webgl') || (outCanvas instanceof ImageData)) {
      // tf kernel-optimized method to get imagedata, also if input is imagedata, just use it
      pixels = tf.browser.fromPixels(outCanvas);
    } else {
      // cpu and wasm kernel does not implement efficient fromPixels method nor we can use canvas as-is, so we do a silly one more canvas
      const tempCanvas = (typeof OffscreenCanvas !== 'undefined') ? new OffscreenCanvas(targetWidth, targetHeight) : document.createElement('canvas');
      tempCanvas.width = targetWidth;
      tempCanvas.height = targetHeight;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx?.drawImage(outCanvas, 0, 0);
      const data = tempCtx?.getImageData(0, 0, targetWidth, targetHeight);
      pixels = tf.browser.fromPixels(data);
    }
    const casted = pixels.toFloat();
    tensor = casted.expandDims(0);
    pixels.dispose();
    casted.dispose();
  }
  return { tensor, canvas: config.filter.return ? outCanvas : null };
}

exports.process = process;
