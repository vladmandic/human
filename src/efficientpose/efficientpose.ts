/**
 * EfficientPose Module
 */

import { log, join } from '../helpers';
import * as tf from '../../dist/tfjs.esm.js';
import { Body } from '../result';
import { GraphModel, Tensor } from '../tfjs/types';
import { Config } from '../config';

let model: GraphModel;

type Keypoints = { score: number, part: string, position: [number, number], positionRaw: [number, number] };

const keypoints: Array<Keypoints> = [];
let box: [number, number, number, number] = [0, 0, 0, 0];
let boxRaw: [number, number, number, number] = [0, 0, 0, 0];
let score = 0;
let skipped = Number.MAX_SAFE_INTEGER;

const bodyParts = ['head', 'neck', 'rightShoulder', 'rightElbow', 'rightWrist', 'chest', 'leftShoulder', 'leftElbow', 'leftWrist', 'pelvis', 'rightHip', 'rightKnee', 'rightAnkle', 'leftHip', 'leftKnee', 'leftAnkle'];

export async function load(config: Config): Promise<GraphModel> {
  if (!model) {
    // @ts-ignore type mismatch on GraphModel
    model = await tf.loadGraphModel(join(config.modelBasePath, config.body.modelPath));
    if (!model || !model['modelUrl']) log('load model failed:', config.body.modelPath);
    else if (config.debug) log('load model:', model['modelUrl']);
  } else if (config.debug) log('cached model:', model['modelUrl']);
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
    const newScore = tf.max(reshaped, 0).dataSync()[0];
    if (newScore > minScore) {
      // skip coordinate calculation is score is too low
      const coords = tf.argMax(reshaped, 0);
      const x = mod(coords, width).dataSync()[0];
      const y = tf.div(coords, tf.scalar(width, 'int32')).dataSync()[0];
      return [x, y, newScore];
    }
    return [0, 0, newScore];
  });
}

export async function predict(image: Tensor, config: Config): Promise<Body[]> {
  if ((skipped < config.body.skipFrames) && config.skipFrame && Object.keys(keypoints).length > 0) {
    skipped++;
    return [{ id: 0, score, box, boxRaw, keypoints }];
  }
  skipped = 0;
  return new Promise(async (resolve) => {
    const tensor = tf.tidy(() => {
      if (!model.inputs[0].shape) return null;
      const resize = tf.image.resizeBilinear(image, [model.inputs[0].shape[2], model.inputs[0].shape[1]], false);
      const enhance = tf.mul(resize, 2);
      const norm = enhance.sub(1);
      return norm;
    });

    let resT;
    if (config.body.enabled) resT = await model.predict(tensor);
    tensor.dispose();

    if (resT) {
      keypoints.length = 0;
      const squeeze = resT.squeeze();
      tf.dispose(resT);
      // body parts are basically just a stack of 2d tensors
      const stack = squeeze.unstack(2);
      tf.dispose(squeeze);
      // process each unstacked tensor as a separate body part
      for (let id = 0; id < stack.length; id++) {
        // actual processing to get coordinates and score
        const [x, y, partScore] = max2d(stack[id], config.body.minConfidence);
        if (score > config.body.minConfidence) {
          keypoints.push({
            score: Math.round(100 * partScore) / 100,
            part: bodyParts[id],
            positionRaw: [ // normalized to 0..1
              // @ts-ignore model is not undefined here
              x / model.inputs[0].shape[2], y / model.inputs[0].shape[1],
            ],
            position: [ // normalized to input image size
              // @ts-ignore model is not undefined here
              Math.round(image.shape[2] * x / model.inputs[0].shape[2]), Math.round(image.shape[1] * y / model.inputs[0].shape[1]),
            ],
          });
        }
      }
      stack.forEach((s) => tf.dispose(s));
    }
    score = keypoints.reduce((prev, curr) => (curr.score > prev ? curr.score : prev), 0);
    const x = keypoints.map((a) => a.position[0]);
    const y = keypoints.map((a) => a.position[1]);
    box = [
      Math.min(...x),
      Math.min(...y),
      Math.max(...x) - Math.min(...x),
      Math.max(...y) - Math.min(...y),
    ];
    const xRaw = keypoints.map((a) => a.positionRaw[0]);
    const yRaw = keypoints.map((a) => a.positionRaw[1]);
    boxRaw = [
      Math.min(...xRaw),
      Math.min(...yRaw),
      Math.max(...xRaw) - Math.min(...xRaw),
      Math.max(...yRaw) - Math.min(...yRaw),
    ];
    resolve([{ id: 0, score, box, boxRaw, keypoints }]);
  });
}
