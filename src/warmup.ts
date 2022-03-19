/**
 * Warmup algorithm that uses embedded images to exercise loaded models for faster future inference
 */

import { log, now, mergeDeep } from './util/util';
import * as sample from './sample';
import * as tf from '../dist/tfjs.esm.js';
import * as image from './image/image';
import { env } from './util/env';
import type { Config } from './config';
import type { Result } from './result';
import type { Human, Models } from './human';
import type { Tensor, GraphModel } from './tfjs/types';

async function warmupBitmap(instance: Human): Promise<Result | undefined> {
  const b64toBlob = (base64: string, type = 'application/octet-stream') => fetch(`data:${type};base64,${base64}`).then((res) => res.blob());
  let blob;
  let res;
  switch (instance.config.warmup) {
    case 'face': blob = await b64toBlob(sample.face); break;
    case 'body':
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

async function warmupCanvas(instance: Human): Promise<Result | undefined> {
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
    let img: HTMLImageElement;
    if (typeof Image !== 'undefined') img = new Image();
    // @ts-ignore env.image is an external monkey-patch
    else if (env.Image) img = new env.Image();
    else return;
    img.onload = async () => {
      const canvas = image.canvas(img.naturalWidth, img.naturalHeight);
      if (!canvas) {
        log('Warmup: Canvas not found');
        resolve(undefined);
      } else {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.drawImage(img, 0, 0);
        // const data = ctx?.getImageData(0, 0, canvas.height, canvas.width);
        const tensor = await instance.image(canvas);
        const res = await instance.detect(tensor.tensor as Tensor, instance.config);
        resolve(res);
      }
    };
    if (src) img.src = src;
    else resolve(undefined);
  });
}

async function warmupNode(instance: Human): Promise<Result | undefined> {
  const atob = (str: string) => Buffer.from(str, 'base64');
  let img;
  if (instance.config.warmup === 'face') img = atob(sample.face);
  else img = atob(sample.body);
  let res;
  if ('node' in tf) {
    // @ts-ignore tf.node may be undefined
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

async function runInference(instance: Human) {
  let res: Result | undefined;
  if (typeof createImageBitmap === 'function') res = await warmupBitmap(instance);
  else if (typeof Image !== 'undefined' || env.Canvas !== undefined) res = await warmupCanvas(instance);
  else res = await warmupNode(instance);
  return res;
}

/** Runs pre-compile on all loaded models */
export async function runCompile(allModels: Models) {
  const backendType = tf.getBackend();
  const webGLBackend = tf.backend();
  if ((backendType !== 'webgl' && backendType !== 'humangl') || (!webGLBackend || !webGLBackend.checkCompileCompletion)) {
    log('compile pass: skip');
    return;
  }
  const models = Object.values(allModels).filter((m) => m !== null) as GraphModel[];
  tf.env().set('ENGINE_COMPILE_ONLY', true);
  const numTensorsStart = tf.engine().state.numTensors;
  for (const model of models) {
    const shape = (model.inputs && model.inputs[0] && model.inputs[0].shape) ? [...model.inputs[0].shape] : [1, 64, 64, 3];
    const dtype = (model.inputs && model.inputs[0] && model.inputs[0].dtype) ? model.inputs[0].dtype : 'float32';
    for (let dim = 0; dim < shape.length; dim++) {
      if (shape[dim] === -1) shape[dim] = dim === 0 ? 1 : 64; // override batch number and any dynamic dimensions
    }
    const tensor = tf.zeros(shape, dtype);
    const res = await model.executeAsync(tensor);
    if (Array.isArray(res)) res.forEach((t) => tf.dispose(t));
    else tf.dispose(res);
    tf.dispose(tensor);
  }
  const kernels = await webGLBackend.checkCompileCompletionAsync();
  webGLBackend.getUniformLocations();
  log('compile pass kernels:', kernels.length);
  tf.env().set('ENGINE_COMPILE_ONLY', false);
  const numTensorsEnd = tf.engine().state.numTensors;
  if ((numTensorsEnd - numTensorsStart) > 0) log('tensor leak:', numTensorsEnd - numTensorsStart);
}

/** Warmup method pre-initializes all configured models for faster inference
 * - can take significant time on startup
 * - only used for `webgl` and `humangl` backends
 * @param userConfig?: Config
*/
export async function warmup(instance: Human, userConfig?: Partial<Config>): Promise<Result | undefined> {
  const t0 = now();
  instance.state = 'warmup';
  if (userConfig) instance.config = mergeDeep(instance.config, userConfig) as Config;
  if (!instance.config.warmup || instance.config.warmup.length === 0 || instance.config.warmup === 'none') {
    return { face: [], body: [], hand: [], gesture: [], object: [], performance: instance.performance, timestamp: now(), persons: [], error: null };
  }
  return new Promise(async (resolve) => {
    // await runCompile(instance.models);
    const res = await runInference(instance);
    const t1 = now();
    if (instance.config.debug) log('warmup', instance.config.warmup, Math.round(t1 - t0), 'ms');
    instance.emit('warmup');
    resolve(res);
  });
}
