import { log } from '../helpers';
import * as tf from '../../dist/tfjs.esm.js';
import * as profile from '../profile';

let model;
let keypoints = { };
let skipped = Number.MAX_SAFE_INTEGER;

const bodyParts = ['head', 'neck', 'rightShoulder', 'rightElbow', 'rightWrist', 'chest', 'leftShoulder', 'leftElbow', 'leftWrist', 'pelvis', 'rightHip', 'rightKnee', 'rightAnkle', 'leftHip', 'leftKnee', 'leftAnkle'];

export async function load(config) {
  if (!model) {
    model = await tf.loadGraphModel(config.body.modelPath);
    if (config.debug) log(`load model: ${config.body.modelPath.match(/\/(.*)\./)[1]}`);
  }
  return model;
}

// performs argmax and max functions on a 2d tensor
function max2d(inputs, minScore) {
  const [width, height] = inputs.shape;
  return tf.tidy(() => {
    // modulus op implemented in tf
    const mod = (a, b) => tf.sub(a, tf.mul(tf.div(a, tf.scalar(b, 'int32')), tf.scalar(b, 'int32')));
    // combine all data
    const reshaped = tf.reshape(inputs, [height * width]);
    // get highest score
    const score = tf.max(reshaped, 0).dataSync()[0];
    if (score > minScore) {
      // skip coordinate calculation is score is too low
      const coords = tf.argMax(reshaped, 0);
      const x = mod(coords, width).dataSync()[0];
      const y = tf.div(coords, tf.scalar(width, 'int32')).dataSync()[0];
      return [x, y, score];
    }
    return [0, 0, score];
  });
}

export async function predict(image, config) {
  if (!model) return null;
  if ((skipped < config.body.skipFrames) && config.videoOptimized && Object.keys(keypoints).length > 0) {
    skipped++;
    return keypoints;
  }
  if (config.videoOptimized) skipped = 0;
  else skipped = Number.MAX_SAFE_INTEGER;
  return new Promise(async (resolve) => {
    const tensor = tf.tidy(() => {
      const resize = tf.image.resizeBilinear(image, [model.inputs[0].shape[2], model.inputs[0].shape[1]], false);
      const enhance = tf.mul(resize, 2);
      const norm = enhance.sub(1);
      return norm;
    });

    let resT;

    if (!config.profile) {
      if (config.body.enabled) resT = await model.executeAsync(tensor);
    } else {
      const profileT = config.body.enabled ? await tf.profile(() => model.executeAsync(tensor)) : {};
      resT = profileT.result.clone();
      profileT.result.dispose();
      profile.run('body', profileT);
    }
    tensor.dispose();

    if (resT) {
      const parts: Array<{ id, score, part, position: { x, y }, positionRaw: { xRaw, yRaw} }> = [];
      const squeeze = resT.squeeze();
      tf.dispose(resT);
      // body parts are basically just a stack of 2d tensors
      const stack = squeeze.unstack(2);
      tf.dispose(squeeze);
      // process each unstacked tensor as a separate body part
      for (let id = 0; id < stack.length; id++) {
        // actual processing to get coordinates and score
        const [x, y, score] = max2d(stack[id], config.body.scoreThreshold);
        if (score > config.body.scoreThreshold) {
          parts.push({
            id,
            score,
            part: bodyParts[id],
            positionRaw: {
              xRaw: x / model.inputs[0].shape[2], // x normalized to 0..1
              yRaw: y / model.inputs[0].shape[1], // y normalized to 0..1
            },
            position: {
              x: Math.round(image.shape[2] * x / model.inputs[0].shape[2]), // x normalized to input image size
              y: Math.round(image.shape[1] * y / model.inputs[0].shape[1]), // y normalized to input image size
            },
          });
        }
      }
      stack.forEach((s) => tf.dispose(s));
      keypoints = parts;
    }
    resolve([{ keypoints }]);
  });
}
