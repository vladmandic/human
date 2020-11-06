const tf = require('@tensorflow/tfjs');
const profile = require('../profile.js');

const annotations = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surpise', 'neutral'];
const models = {};
let last = [];
let frame = Number.MAX_SAFE_INTEGER;

// tuning values
const zoom = [0, 0]; // 0..1 meaning 0%..100%
const rgb = [0.2989, 0.5870, 0.1140]; // factors for red/green/blue colors when converting to grayscale
const scale = 1; // score multiplication factor

async function load(config) {
  if (!models.emotion) models.emotion = await tf.loadGraphModel(config.face.emotion.modelPath);
  return models.emotion;
}

async function predict(image, config) {
  if ((frame < config.face.emotion.skipFrames) && (last.length > 0)) {
    frame += 1;
    return last;
  }
  frame = 0;
  return new Promise(async (resolve) => {
    const box = [[
      (image.shape[1] * zoom[0]) / image.shape[1],
      (image.shape[2] * zoom[1]) / image.shape[2],
      (image.shape[1] - (image.shape[1] * zoom[0])) / image.shape[1],
      (image.shape[2] - (image.shape[2] * zoom[1])) / image.shape[2],
    ]];
    const resize = tf.image.cropAndResize(image, box, [0], [config.face.emotion.inputSize, config.face.emotion.inputSize]);
    // const resize = tf.image.resizeBilinear(image, [config.face.emotion.inputSize, config.face.emotion.inputSize], false);
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
        const profileData = await tf.profile(() => models.emotion.predict(grayscale));
        data = profileData.result.dataSync();
        profileData.result.dispose();
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
