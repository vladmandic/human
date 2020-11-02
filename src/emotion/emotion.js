const tf = require('@tensorflow/tfjs');
const profile = require('../profile.js');

const annotations = ['angry', 'discust', 'fear', 'happy', 'sad', 'surpise', 'neutral'];
const models = {};
let last = [];
let frame = 0;
const multiplier = 1.5;

async function load(config) {
  if (!models.emotion) models.emotion = await tf.loadGraphModel(config.face.emotion.modelPath);
  return models.emotion;
}

async function predict(image, config) {
  if (frame < config.face.emotion.skipFrames) {
    frame += 1;
    return last;
  }
  frame = 0;
  const resize = tf.image.resizeBilinear(image, [config.face.emotion.inputSize, config.face.emotion.inputSize], false);
  const [red, green, blue] = tf.split(resize, 3, 3);
  resize.dispose();
  // weighted rgb to grayscale: https://www.mathworks.com/help/matlab/ref/rgb2gray.html
  const redNorm = tf.mul(red, [0.2989]);
  const greenNorm = tf.mul(green, [0.5870]);
  const blueNorm = tf.mul(blue, [0.1140]);
  red.dispose();
  green.dispose();
  blue.dispose();
  const grayscale = tf.addN([redNorm, greenNorm, blueNorm]);
  redNorm.dispose();
  greenNorm.dispose();
  blueNorm.dispose();
  const obj = [];
  if (config.face.emotion.enabled) {
    let data;
    if (!config.profile) {
      const emotionT = await models.emotion.predict(grayscale);
      data = emotionT.dataSync();
      tf.dispose(emotionT);
    } else {
      const profileData = await tf.profile(() => models.emotion.predict(grayscale));
      data = profileData.result.dataSync();
      profileData.result.dispose();
      profile.run('emotion', profileData);
    }
    for (let i = 0; i < data.length; i++) {
      if (multiplier * data[i] > config.face.emotion.minConfidence) obj.push({ score: Math.min(0.99, Math.trunc(100 * multiplier * data[i]) / 100), emotion: annotations[i] });
    }
    obj.sort((a, b) => b.score - a.score);
  }
  tf.dispose(grayscale);
  last = obj;
  return obj;
}

exports.predict = predict;
exports.load = load;
