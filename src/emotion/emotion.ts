import { log } from '../log';
import * as tf from '../../dist/tfjs.esm.js';
import * as profile from '../profile';

const annotations = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral'];
let model;
let last: Array<{ score: number, emotion: string }> = [];
let skipped = Number.MAX_SAFE_INTEGER;

// tuning values
const rgb = [0.2989, 0.5870, 0.1140]; // factors for red/green/blue colors when converting to grayscale

export async function load(config) {
  if (!model) {
    model = await tf.loadGraphModel(config.face.emotion.modelPath);
    if (config.debug) log(`load model: ${config.face.emotion.modelPath.match(/\/(.*)\./)[1]}`);
  }
  return model;
}

export async function predict(image, config) {
  if (!model) return null;
  if ((skipped < config.face.emotion.skipFrames) && config.videoOptimized && (last.length > 0)) {
    skipped++;
    return last;
  }
  if (config.videoOptimized) skipped = 0;
  else skipped = Number.MAX_SAFE_INTEGER;
  return new Promise(async (resolve) => {
    /*
    const zoom = [0, 0]; // 0..1 meaning 0%..100%
    const box = [[
      (image.shape[1] * zoom[0]) / image.shape[1],
      (image.shape[2] * zoom[1]) / image.shape[2],
      (image.shape[1] - (image.shape[1] * zoom[0])) / image.shape[1],
      (image.shape[2] - (image.shape[2] * zoom[1])) / image.shape[2],
    ]];
    const resize = tf.image.cropAndResize(image, box, [0], [config.face.emotion.inputSize, config.face.emotion.inputSize]);
    */
    const resize = tf.image.resizeBilinear(image, [config.face.emotion.inputSize, config.face.emotion.inputSize], false);
    const [red, green, blue] = tf.split(resize, 3, 3);
    resize.dispose();
    // weighted rgb to grayscale: https://www.mathworks.com/help/matlab/ref/rgb2gray.html
    const redNorm = tf.mul(red, rgb[0]);
    const greenNorm = tf.mul(green, rgb[1]);
    const blueNorm = tf.mul(blue, rgb[2]);
    red.dispose();
    green.dispose();
    blue.dispose();
    const grayscale = tf.addN([redNorm, greenNorm, blueNorm]);
    redNorm.dispose();
    greenNorm.dispose();
    blueNorm.dispose();
    const normalize = tf.tidy(() => grayscale.sub(0.5).mul(2));
    grayscale.dispose();
    const obj: Array<{ score: number, emotion: string }> = [];
    if (config.face.emotion.enabled) {
      let data;
      if (!config.profile) {
        const emotionT = await model.predict(normalize); // result is already in range 0..1, no need for additional activation
        data = emotionT.dataSync();
        tf.dispose(emotionT);
      } else {
        const profileData = await tf.profile(() => model.predict(normalize));
        data = profileData.result.dataSync();
        profileData.result.dispose();
        profile.run('emotion', profileData);
      }
      for (let i = 0; i < data.length; i++) {
        if (data[i] > config.face.emotion.minConfidence) obj.push({ score: Math.min(0.99, Math.trunc(100 * data[i]) / 100), emotion: annotations[i] });
      }
      obj.sort((a, b) => b.score - a.score);
    }
    normalize.dispose();
    last = obj;
    resolve(obj);
  });
}
