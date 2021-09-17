import { log, now, mergeDeep } from './helpers';
import * as sample from './sample';
import * as tf from '../dist/tfjs.esm.js';
import * as image from './image/image';
import type { Config } from './config';
import type { Result } from './result';
import { env } from './env';

async function warmupBitmap(instance) {
  const b64toBlob = (base64: string, type = 'application/octet-stream') => fetch(`data:${type};base64,${base64}`).then((res) => res.blob());
  let blob;
  let res;
  switch (instance.config.warmup) {
    case 'face': blob = await b64toBlob(sample.face); break;
    case 'full': blob = await b64toBlob(sample.body); break;
    default: blob = null;
  }
  if (blob) {
    const bitmap = await createImageBitmap(blob);
    res = await instance.detect(bitmap, instance.config);
    bitmap.close();
  }
  return res;
}

async function warmupCanvas(instance) {
  return new Promise((resolve) => {
    let src;
    // let size = 0;
    switch (instance.config.warmup) {
      case 'face':
        // size = 256;
        src = 'data:image/jpeg;base64,' + sample.face;
        break;
      case 'full':
      case 'body':
        // size = 1200;
        src = 'data:image/jpeg;base64,' + sample.body;
        break;
      default:
        src = null;
    }
    // src = encodeURI('../assets/human-sample-upper.jpg');
    let img;
    if (typeof Image !== 'undefined') img = new Image();
    // @ts-ignore env.image is an external monkey-patch
    else if (env.Image) img = new env.Image();
    img.onload = async () => {
      const canvas = image.canvas(img.naturalWidth, img.naturalHeight);
      if (!canvas) {
        log('Warmup: Canvas not found');
        resolve({});
      } else {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.drawImage(img, 0, 0);
        // const data = ctx?.getImageData(0, 0, canvas.height, canvas.width);
        const tensor = await instance.image(canvas);
        const res = await instance.detect(tensor.tensor, instance.config);
        resolve(res);
      }
    };
    if (src) img.src = src;
    else resolve(null);
  });
}

async function warmupNode(instance) {
  const atob = (str: string) => Buffer.from(str, 'base64');
  let img;
  if (instance.config.warmup === 'face') img = atob(sample.face);
  if (instance.config.warmup === 'body' || instance.config.warmup === 'full') img = atob(sample.body);
  if (!img) return null;
  let res;
  if (typeof tf['node'] !== 'undefined') {
    const data = tf['node'].decodeJpeg(img);
    const expanded = data.expandDims(0);
    instance.tf.dispose(data);
    // log('Input:', expanded);
    res = await instance.detect(expanded, instance.config);
    instance.tf.dispose(expanded);
  } else {
    if (instance.config.debug) log('Warmup tfjs-node not loaded');
    /*
    const input = await canvasJS.loadImage(img);
    const canvas = canvasJS.createCanvas(input.width, input.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, input.width, input.height);
    res = await instance.detect(input, instance.config);
    */
  }
  return res;
}

/** Warmup method pre-initializes all configured models for faster inference
 * - can take significant time on startup
 * - only used for `webgl` and `humangl` backends
 * @param userConfig?: Config
*/
export async function warmup(instance, userConfig?: Partial<Config>): Promise<Result | { error }> {
  const t0 = now();
  if (userConfig) instance.config = mergeDeep(instance.config, userConfig) as Config;
  if (!instance.config.warmup || instance.config.warmup === 'none') return { error: 'null' };
  let res;
  if (typeof createImageBitmap === 'function') res = await warmupBitmap(instance);
  else if (typeof Image !== 'undefined' || env.Canvas !== undefined) res = await warmupCanvas(instance);
  else res = await warmupNode(instance);
  const t1 = now();
  if (instance.config.debug) log('Warmup', instance.config.warmup, Math.round(t1 - t0), 'ms');
  instance.emit('warmup');
  return res;
}
