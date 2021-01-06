import { log } from '../log.js';
import * as tf from '../../dist/tfjs.esm.js';
import * as profile from '../profile.js';

const annotations = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral'];
const models = {};
let last = [];
let skipped = Number.MAX_SAFE_INTEGER;

// tuning values
const rgb = [0.2989, 0.5870, 0.1140]; // factors for red/green/blue colors when converting to grayscale
const scale = 1; // score multiplication factor

async function load(config) {
  if (!models.emotion) {
    models.emotion = await tf.loadGraphModel(config.face.emotion.modelPath);
    log(`load model: ${config.face.emotion.modelPath.match(/\/(.*)\./)[1]}`);
  }
  return models.emotion;
}

async function predict(image, config) {
  if (!models.emotion) return null;
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
    const obj = [];
    if (config.face.emotion.enabled) {
      let data;
      if (!config.profile) {
        const emotionT = await models.emotion.predict(normalize);
        data = emotionT.dataSync();
        tf.dispose(emotionT);
      } else {
        const profileData = await tf.profile(() => models.emotion.predict(normalize));
        data = profileData.result.dataSync();
        profileData.result.dispose();
        // @ts-ignore
        profile.run('emotion', profileData);
      }
      for (let i = 0; i < data.length; i++) {
        if (scale * data[i] > config.face.emotion.minConfidence) obj.push({ score: Math.min(0.99, Math.trunc(100 * scale * data[i]) / 100), emotion: annotations[i] });
      }
      obj.sort((a, b) => b.score - a.score);
    }
    normalize.dispose();
    last = obj;
    resolve(obj);
  });
}

exports.predict = predict;
exports.load = load;
