/**
 * Emotion Module
 */

import { log, join } from '../helpers';
import { Config } from '../config';
import { Tensor, GraphModel } from '../tfjs/types';
import * as tf from '../../dist/tfjs.esm.js';

const annotations = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral'];
let model;
// let last: Array<{ score: number, emotion: string }> = [];
const last: Array<Array<{ score: number, emotion: string }>> = [];
let lastCount = 0;
let skipped = Number.MAX_SAFE_INTEGER;

// tuning values
const rgb = [0.2989, 0.5870, 0.1140]; // factors for red/green/blue colors when converting to grayscale

export async function load(config: Config): Promise<GraphModel> {
  if (!model) {
    model = await tf.loadGraphModel(join(config.modelBasePath, config.face.emotion.modelPath));
    if (!model || !model.modelUrl) log('load model failed:', config.face.emotion.modelPath);
    else if (config.debug) log('load model:', model.modelUrl);
  } else if (config.debug) log('cached model:', model.modelUrl);
  return model;
}

export async function predict(image: Tensor, config: Config, idx, count) {
  if (!model) return null;
  if ((skipped < config.face.emotion.skipFrames) && config.skipFrame && (lastCount === count) && last[idx] && (last[idx].length > 0)) {
    skipped++;
    return last[idx];
  }
  skipped = 0;
  return new Promise(async (resolve) => {
    const resize = tf.image.resizeBilinear(image, [model.inputs[0].shape[2], model.inputs[0].shape[1]], false);
    const [red, green, blue] = tf.split(resize, 3, 3);
    tf.dispose(resize);
    // weighted rgb to grayscale: https://www.mathworks.com/help/matlab/ref/rgb2gray.html
    const redNorm = tf.mul(red, rgb[0]);
    const greenNorm = tf.mul(green, rgb[1]);
    const blueNorm = tf.mul(blue, rgb[2]);
    tf.dispose(red);
    tf.dispose(green);
    tf.dispose(blue);
    const grayscale = tf.addN([redNorm, greenNorm, blueNorm]);
    tf.dispose(redNorm);
    tf.dispose(greenNorm);
    tf.dispose(blueNorm);
    const normalize = tf.tidy(() => tf.mul(tf.sub(grayscale, 0.5), 2));
    tf.dispose(grayscale);
    const obj: Array<{ score: number, emotion: string }> = [];
    if (config.face.emotion.enabled) {
      const emotionT = await model.predict(normalize); // result is already in range 0..1, no need for additional activation
      const data = emotionT.dataSync();
      tf.dispose(emotionT);
      for (let i = 0; i < data.length; i++) {
        if (data[i] > config.face.emotion.minConfidence) obj.push({ score: Math.min(0.99, Math.trunc(100 * data[i]) / 100), emotion: annotations[i] });
      }
      obj.sort((a, b) => b.score - a.score);
    }
    tf.dispose(normalize);
    last[idx] = obj;
    lastCount = count;
    resolve(obj);
  });
}
