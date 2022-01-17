/**
 * Emotion model implementation
 *
 * [**Oarriaga**](https://github.com/oarriaga/face_classification)
 */

import type { Emotion } from '../result';
import { log, now } from '../util/util';
import type { Config } from '../config';
import type { GraphModel, Tensor } from '../tfjs/types';
import * as tf from '../../dist/tfjs.esm.js';
import { loadModel } from '../tfjs/load';
import { env } from '../util/env';
import { constants } from '../tfjs/constants';

const annotations = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral'];
let model: GraphModel | null;
const last: Array<Array<{ score: number, emotion: Emotion }>> = [];
let lastCount = 0;
let lastTime = 0;
let skipped = Number.MAX_SAFE_INTEGER;

export async function load(config: Config): Promise<GraphModel> {
  if (env.initial) model = null;
  if (!model) model = await loadModel(config.face.emotion?.modelPath);
  else if (config.debug) log('cached model:', model['modelUrl']);
  return model;
}

export async function predict(image: Tensor, config: Config, idx: number, count: number): Promise<Array<{ score: number, emotion: Emotion }>> {
  if (!model) return [];
  const skipFrame = skipped < (config.face.emotion?.skipFrames || 0);
  const skipTime = (config.face.emotion?.skipTime || 0) > (now() - lastTime);
  if (config.skipAllowed && skipTime && skipFrame && (lastCount === count) && last[idx] && (last[idx].length > 0)) {
    skipped++;
    return last[idx];
  }
  skipped = 0;
  return new Promise(async (resolve) => {
    const obj: Array<{ score: number, emotion: Emotion }> = [];
    if (config.face.emotion?.enabled) {
      const t: Record<string, Tensor> = {};
      const inputSize = model?.inputs[0].shape ? model.inputs[0].shape[2] : 0;
      t.resize = tf.image.resizeBilinear(image, [inputSize, inputSize], false);
      // const box = [[0.15, 0.15, 0.85, 0.85]]; // empyrical values for top, left, bottom, right
      // const resize = tf.image.cropAndResize(image, box, [0], [inputSize, inputSize]);
      // [t.red, t.green, t.blue] = tf.split(t.resize, 3, 3);
      // weighted rgb to grayscale: https://www.mathworks.com/help/matlab/ref/rgb2gray.html
      // t.redNorm = tf.mul(t.red, rgb[0]);
      // t.greenNorm = tf.mul(t.green, rgb[1]);
      // t.blueNorm = tf.mul(t.blue, rgb[2]);
      // t.grayscale = tf.addN([t.redNorm, t.greenNorm, t.blueNorm]);
      t.channels = tf.mul(t.resize, constants.rgb);
      t.grayscale = tf.sum(t.channels, 3, true);
      t.grayscaleSub = tf.sub(t.grayscale, constants.tf05);
      t.grayscaleMul = tf.mul(t.grayscaleSub, constants.tf2);
      t.emotion = model?.execute(t.grayscaleMul) as Tensor; // result is already in range 0..1, no need for additional activation
      lastTime = now();
      const data = await t.emotion.data();
      for (let i = 0; i < data.length; i++) {
        if (data[i] > (config.face.emotion?.minConfidence || 0)) obj.push({ score: Math.min(0.99, Math.trunc(100 * data[i]) / 100), emotion: annotations[i] as Emotion });
      }
      obj.sort((a, b) => b.score - a.score);
      Object.keys(t).forEach((tensor) => tf.dispose(t[tensor]));
    }
    last[idx] = obj;
    lastCount = count;
    resolve(obj);
  });
}
