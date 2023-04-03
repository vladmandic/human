/**
 * NanoDet object detection model implementation
 *
 * Based on: [**NanoDet**](https://github.com/RangiLyu/nanodet)
 */

import * as tf from 'dist/tfjs.esm.js';
import { log, now } from '../util/util';
import { loadModel } from '../tfjs/load';
import { constants } from '../tfjs/constants';
import { labels } from './labels';
import type { ObjectResult, ObjectType, Box } from '../result';
import type { GraphModel, Tensor, Tensor2D, Tensor4D } from '../tfjs/types';
import type { Config } from '../config';
import { env } from '../util/env';

let model: GraphModel;
let last: ObjectResult[] = [];
let lastTime = 0;
let skipped = Number.MAX_SAFE_INTEGER;
let inputSize = 0;

const scaleBox = 2.5; // increase box size

export async function load(config: Config): Promise<GraphModel> {
  if (!model || env.initial) {
    model = await loadModel(config.object.modelPath);
    const inputs = model?.['executor'] ? Object.values(model.modelSignature['inputs']) : undefined;
    // @ts-ignore model signature properties are not typed and inputs are unreliable for this model
    inputSize = Array.isArray(inputs) ? parseInt(inputs[0].tensorShape.dim[2].size) : 416;
  } else if (config.debug) log('cached model:', model['modelUrl']);
  return model;
}

async function process(res: Tensor[], outputShape: [number, number], config: Config) {
  let id = 0;
  let results: ObjectResult[] = [];
  const size = inputSize;
  for (const strideSize of [1, 2, 4]) { // try each stride size as it detects large/medium/small objects
    // find scores, boxes, classes
    const baseSize = strideSize * 13; // 13x13=169, 26x26=676, 52x52=2704
    // find boxes and scores output depending on stride
    const scoresT = tf.squeeze(res.find((a) => (a.shape[1] === (baseSize ** 2) && (a.shape[2] || 0) === labels.length)) as Tensor2D);
    const scores = await scoresT.array(); // optionally use exponential scores or just as-is
    const featuresT = tf.squeeze(res.find((a) => (a.shape[1] === (baseSize ** 2) && (a.shape[2] || 0) < labels.length)) as Tensor2D);
    const boxesMaxT = tf.reshape(featuresT, [-1, 4, (featuresT.shape?.[1] || 0) / 4]); // reshape [output] to [4, output / 4] where number is number of different features inside each stride
    const boxIdxT = tf.argMax(boxesMaxT, 2); // what we need is indexes of features with highest scores, not values itself
    const boxIdx = await boxIdxT.array(); // what we need is indexes of features with highest scores, not values itself
    for (let i = 0; i < scoresT.shape[0]; i++) { // total strides (x * y matrix)
      for (let j = 0; j < (scoresT.shape?.[1] || 0); j++) { // one score for each class
        const score = scores[i][j]; // get score for current position
        if (score > (config.object.minConfidence || 0) && j !== 61) {
          const cx = (0.5 + Math.trunc(i % baseSize)) / baseSize; // center.x normalized to range 0..1
          const cy = (0.5 + Math.trunc(i / baseSize)) / baseSize; // center.y normalized to range 0..1
          const boxOffset = boxIdx[i].map((a: number) => a * (baseSize / strideSize / (size))); // just grab indexes of features with highest scores
          const [x, y] = [
            cx - (scaleBox / strideSize * boxOffset[0]),
            cy - (scaleBox / strideSize * boxOffset[1]),
          ];
          const [w, h] = [
            cx + (scaleBox / strideSize * boxOffset[2]) - x,
            cy + (scaleBox / strideSize * boxOffset[3]) - y,
          ];
          let boxRaw: Box = [x, y, w, h]; // results normalized to range 0..1
          boxRaw = boxRaw.map((a) => Math.max(0, Math.min(a, 1))) as Box; // fix out-of-bounds coords
          const box = [ // results normalized to input image pixels
            boxRaw[0] * outputShape[0],
            boxRaw[1] * outputShape[1],
            boxRaw[2] * outputShape[0],
            boxRaw[3] * outputShape[1],
          ];
          const result = {
            id: id++,
            // strideSize,
            score: Math.round(100 * score) / 100,
            class: j + 1,
            label: labels[j].label as ObjectType,
            // center: [Math.trunc(outputShape[0] * cx), Math.trunc(outputShape[1] * cy)],
            // centerRaw: [cx, cy],
            box: box.map((a) => Math.trunc(a)) as Box,
            boxRaw,
          };
          results.push(result);
        }
      }
    }
    tf.dispose([scoresT, featuresT, boxesMaxT, boxIdxT]);
  }

  // normally nms is run on raw results, but since boxes need to be calculated this way we skip calulcation of
  // unnecessary boxes and run nms only on good candidates (basically it just does IOU analysis as scores are already filtered)
  const nmsBoxes = results.map((a) => [a.boxRaw[1], a.boxRaw[0], a.boxRaw[3], a.boxRaw[2]]); // switches coordinates from x,y to y,x as expected by tf.nms
  const nmsScores = results.map((a) => a.score);
  let nmsIdx: number[] = [];
  if (nmsBoxes && nmsBoxes.length > 0) {
    const nms = await tf.image.nonMaxSuppressionAsync(nmsBoxes, nmsScores, config.object.maxDetected || 0, config.object.iouThreshold, config.object.minConfidence);
    nmsIdx = Array.from(await nms.data());
    tf.dispose(nms);
  }

  // filter & sort results
  results = results
    .filter((_val, idx) => nmsIdx.includes(idx))
    .sort((a, b) => (b.score - a.score));

  return results;
}

export async function predict(image: Tensor4D, config: Config): Promise<ObjectResult[]> {
  if (!model?.['executor']) return [];
  const skipTime = (config.object.skipTime || 0) > (now() - lastTime);
  const skipFrame = skipped < (config.object.skipFrames || 0);
  if (config.skipAllowed && skipTime && skipFrame && (last.length > 0)) {
    skipped++;
    return last;
  }
  skipped = 0;
  if (!env.kernels.includes('mod') || !env.kernels.includes('sparsetodense')) return last;
  return new Promise(async (resolve) => {
    const outputSize = [image.shape[2] || 0, image.shape[1] || 0];
    const resizeT = tf.image.resizeBilinear(image, [inputSize, inputSize], false);
    const normT = tf.div(resizeT, constants.tf255);
    const transposeT = tf.transpose(normT, [0, 3, 1, 2]);

    let objectT;
    if (config.object.enabled) objectT = model.execute(transposeT);
    lastTime = now();

    const obj = await process(objectT as Tensor[], outputSize as [number, number], config);
    last = obj;
    tf.dispose([resizeT, normT, transposeT, ...objectT]);
    resolve(obj);
  });
}
