const tf = require('@tensorflow/tfjs');

const annotations = ['angry', 'discust', 'fear', 'happy', 'sad', 'surpise', 'neutral'];
const models = {};
let last = [];
let frame = 0;
const multiplier = 1.5;

function getImage(image, size) {
  const tensor = tf.tidy(() => {
    const buffer = tf.browser.fromPixels(image, 1);
    const resize = tf.image.resizeBilinear(buffer, [size, size]);
    const expand = tf.cast(tf.expandDims(resize, 0), 'float32');
    return expand;
  });
  return tensor;
}

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
  const enhance = tf.tidy(() => {
    if (image instanceof tf.Tensor) {
      const resize = tf.image.resizeBilinear(image, [config.face.emotion.inputSize, config.face.emotion.inputSize], false);
      const [r, g, b] = tf.split(resize, 3, 3);
      if (config.face.emotion.useGrayscale) {
        // weighted rgb to grayscale: https://www.mathworks.com/help/matlab/ref/rgb2gray.html
        const r1 = tf.mul(r, [0.2989]);
        const g1 = tf.mul(g, [0.5870]);
        const b1 = tf.mul(b, [0.1140]);
        const grayscale = tf.addN([r1, g1, b1]);
        return grayscale;
      }
      return g;
    }
    return getImage(image, config.face.emotion.inputSize);
  });
  const obj = [];
  if (config.face.emotion.enabled) {
    const emotionT = await models.emotion.predict(enhance);
    const data = await emotionT.data();
    for (let i = 0; i < data.length; i++) {
      if (multiplier * data[i] > config.face.emotion.minConfidence) obj.push({ score: Math.min(0.99, Math.trunc(100 * multiplier * data[i]) / 100), emotion: annotations[i] });
    }
    obj.sort((a, b) => b.score - a.score);
    tf.dispose(emotionT);
  }
  tf.dispose(enhance);
  last = obj;
  return obj;
}

exports.predict = predict;
exports.load = load;
