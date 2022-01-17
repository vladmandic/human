/**
 * EfficientPose model implementation
 *
 * Based on: [**EfficientPose**](https://github.com/daniegr/EfficientPose)
 */

import { log, now } from '../util/util';
import * as tf from '../../dist/tfjs.esm.js';
import { loadModel } from '../tfjs/load';
import * as coords from './efficientposecoords';
import { constants } from '../tfjs/constants';
import type { BodyResult, Point, BodyLandmark, BodyAnnotation } from '../result';
import type { GraphModel, Tensor } from '../tfjs/types';
import type { Config } from '../config';
import { env } from '../util/env';

let model: GraphModel | null;
let lastTime = 0;
const cache: BodyResult = { id: 0, keypoints: [], box: [0, 0, 0, 0], boxRaw: [0, 0, 0, 0], score: 0, annotations: {} as Record<BodyAnnotation, Point[][]> };

// const keypoints: Array<BodyKeypoint> = [];
// let box: Box = [0, 0, 0, 0];
// let boxRaw: Box = [0, 0, 0, 0];
// let score = 0;
let skipped = Number.MAX_SAFE_INTEGER;

export async function load(config: Config): Promise<GraphModel> {
  if (env.initial) model = null;
  if (!model) model = await loadModel(config.body.modelPath);
  else if (config.debug) log('cached model:', model['modelUrl']);
  return model;
}

// performs argmax and max functions on a 2d tensor
async function max2d(inputs, minScore) {
  const [width, height] = inputs.shape;
  const reshaped = tf.reshape(inputs, [height * width]); // combine all data
  const max = tf.max(reshaped, 0);
  const newScore = (await max.data())[0]; // get highest score
  tf.dispose([reshaped, max]);
  if (newScore > minScore) { // skip coordinate calculation is score is too low
    const coordinates = tf.argMax(reshaped, 0);
    const mod = tf.mod(coordinates, width);
    const x = (await mod.data())[0];
    const div = tf.div(coordinates, tf.scalar(width, 'int32'));
    const y = (await div.data())[0];
    tf.dispose([mod, div]);
    return [x, y, newScore];
  }
  return [0, 0, newScore];
}

export async function predict(image: Tensor, config: Config): Promise<BodyResult[]> {
  const skipTime = (config.body.skipTime || 0) > (now() - lastTime);
  const skipFrame = skipped < (config.body.skipFrames || 0);
  if (config.skipAllowed && skipTime && skipFrame && Object.keys(cache.keypoints).length > 0) {
    skipped++;
    return [cache];
  }
  skipped = 0;
  return new Promise(async (resolve) => {
    const tensor = tf.tidy(() => {
      if (!model?.inputs[0].shape) return null;
      const resize = tf.image.resizeBilinear(image, [model.inputs[0].shape[2], model.inputs[0].shape[1]], false);
      const enhance = tf.mul(resize, constants.tf2);
      const norm = tf.sub(enhance, constants.tf1);
      return norm;
    });

    let resT;
    if (config.body.enabled) resT = model?.execute(tensor);
    lastTime = now();
    tf.dispose(tensor);

    if (resT) {
      cache.keypoints.length = 0;
      const squeeze = resT.squeeze();
      tf.dispose(resT);
      // body parts are basically just a stack of 2d tensors
      const stack = squeeze.unstack(2);
      tf.dispose(squeeze);
      // process each unstacked tensor as a separate body part
      for (let id = 0; id < stack.length; id++) {
        // actual processing to get coordinates and score
        const [x, y, partScore] = await max2d(stack[id], config.body.minConfidence);
        if (partScore > (config.body?.minConfidence || 0)) {
          cache.keypoints.push({
            score: Math.round(100 * partScore) / 100,
            part: coords.kpt[id] as BodyLandmark,
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
    cache.score = cache.keypoints.reduce((prev, curr) => (curr.score > prev ? curr.score : prev), 0);
    const x = cache.keypoints.map((a) => a.position[0]);
    const y = cache.keypoints.map((a) => a.position[1]);
    cache.box = [
      Math.min(...x),
      Math.min(...y),
      Math.max(...x) - Math.min(...x),
      Math.max(...y) - Math.min(...y),
    ];
    const xRaw = cache.keypoints.map((a) => a.positionRaw[0]);
    const yRaw = cache.keypoints.map((a) => a.positionRaw[1]);
    cache.boxRaw = [
      Math.min(...xRaw),
      Math.min(...yRaw),
      Math.max(...xRaw) - Math.min(...xRaw),
      Math.max(...yRaw) - Math.min(...yRaw),
    ];
    for (const [name, indexes] of Object.entries(coords.connected)) {
      const pt: Array<Point[]> = [];
      for (let i = 0; i < indexes.length - 1; i++) {
        const pt0 = cache.keypoints.find((kpt) => kpt.part === indexes[i]);
        const pt1 = cache.keypoints.find((kpt) => kpt.part === indexes[i + 1]);
        if (pt0 && pt1 && pt0.score > (config.body.minConfidence || 0) && pt1.score > (config.body.minConfidence || 0)) pt.push([pt0.position, pt1.position]);
      }
      cache.annotations[name] = pt;
    }
    resolve([cache]);
  });
}
