/**
 * HandTrack model implementation
 *
 * Based on:
 * - Hand Detection & Skeleton: [**MediaPipe HandPose**](https://drive.google.com/file/d/1sv4sSb9BSNVZhLzxXJ0jBv9DqD-4jnAz/view)
 * - Hand Tracking: [**HandTracking**](https://github.com/victordibia/handtracking)
 */

import { log, join } from '../util/util';
import { scale } from '../util/box';
import * as tf from '../../dist/tfjs.esm.js';
import type { HandResult, Box, Point } from '../result';
import type { GraphModel, Tensor } from '../tfjs/types';
import type { Config } from '../config';
import { env } from '../util/env';
import * as fingerPose from '../fingerpose/fingerpose';
import { fakeOps } from '../tfjs/backend';

const boxScaleFact = 1.5; // hand finger model prefers slighly larger box
const models: [GraphModel | null, GraphModel | null] = [null, null];
const modelOutputNodes = ['StatefulPartitionedCall/Postprocessor/Slice', 'StatefulPartitionedCall/Postprocessor/ExpandDims_1'];

const inputSize = [[0, 0], [0, 0]];

const classes = ['hand', 'fist', 'pinch', 'point', 'face', 'tip', 'pinchtip'];

let skipped = 0;
let outputSize: Point = [0, 0];

type HandDetectResult = {
  id: number,
  score: number,
  box: Box,
  boxRaw: Box,
  label: string,
  yxBox: Box,
}

const cache: {
  handBoxes: Array<HandDetectResult>,
  fingerBoxes: Array<HandDetectResult>
  tmpBoxes: Array<HandDetectResult>
} = {
  handBoxes: [],
  fingerBoxes: [],
  tmpBoxes: [],
};

const fingerMap = {
  thumb: [1, 2, 3, 4],
  index: [5, 6, 7, 8],
  middle: [9, 10, 11, 12],
  ring: [13, 14, 15, 16],
  pinky: [17, 18, 19, 20],
  palm: [0],
};

export async function loadDetect(config: Config): Promise<GraphModel> {
  // HandTrack Model: Original: <https://github.com/victordibia/handtracking> TFJS Port: <https://github.com/victordibia/handtrack.js/>
  if (env.initial) models[0] = null;
  if (!models[0]) {
    // handtrack model has some kernel ops defined in model but those are never referenced and non-existent in tfjs
    // ideally need to prune the model itself
    fakeOps(['tensorlistreserve', 'enter', 'tensorlistfromtensor', 'merge', 'loopcond', 'switch', 'exit', 'tensorliststack', 'nextiteration', 'tensorlistsetitem', 'tensorlistgetitem', 'reciprocal', 'shape', 'split', 'where'], config);
    models[0] = await tf.loadGraphModel(join(config.modelBasePath, config.hand.detector?.modelPath || '')) as unknown as GraphModel;
    const inputs = Object.values(models[0].modelSignature['inputs']);
    inputSize[0][0] = Array.isArray(inputs) ? parseInt(inputs[0].tensorShape.dim[1].size) : 0;
    inputSize[0][1] = Array.isArray(inputs) ? parseInt(inputs[0].tensorShape.dim[2].size) : 0;
    if (!models[0] || !models[0]['modelUrl']) log('load model failed:', config.object.modelPath);
    else if (config.debug) log('load model:', models[0]['modelUrl']);
  } else if (config.debug) log('cached model:', models[0]['modelUrl']);
  return models[0];
}

export async function loadSkeleton(config: Config): Promise<GraphModel> {
  if (env.initial) models[1] = null;
  if (!models[1]) {
    models[1] = await tf.loadGraphModel(join(config.modelBasePath, config.hand.skeleton?.modelPath || '')) as unknown as GraphModel;
    const inputs = Object.values(models[1].modelSignature['inputs']);
    inputSize[1][0] = Array.isArray(inputs) ? parseInt(inputs[0].tensorShape.dim[1].size) : 0;
    inputSize[1][1] = Array.isArray(inputs) ? parseInt(inputs[0].tensorShape.dim[2].size) : 0;
    if (!models[1] || !models[1]['modelUrl']) log('load model failed:', config.object.modelPath);
    else if (config.debug) log('load model:', models[1]['modelUrl']);
  } else if (config.debug) log('cached model:', models[1]['modelUrl']);
  return models[1];
}

export async function load(config: Config): Promise<[GraphModel | null, GraphModel | null]> {
  if (!models[0]) await loadDetect(config);
  if (!models[1]) await loadSkeleton(config);
  return models;
}

async function detectHands(input: Tensor, config: Config): Promise<HandDetectResult[]> {
  const hands: HandDetectResult[] = [];
  if (!input || !models[0]) return hands;
  const t: Record<string, Tensor> = {};
  const ratio = (input.shape[2] || 1) / (input.shape[1] || 1);
  const height = Math.min(Math.round((input.shape[1] || 0) / 8) * 8, 512); // use dynamic input size but cap at 1024
  const width = Math.round(height * ratio / 8) * 8;
  t.resize = tf.image.resizeBilinear(input, [height, width]); // todo: resize with padding
  t.cast = tf.cast(t.resize, 'int32');
  [t.rawScores, t.rawBoxes] = await models[0].executeAsync(t.cast, modelOutputNodes) as Tensor[];
  t.boxes = tf.squeeze(t.rawBoxes, [0, 2]);
  t.scores = tf.squeeze(t.rawScores, [0]);
  const classScores = tf.unstack(t.scores, 1);
  let id = 0;
  for (let i = 0; i < classScores.length; i++) {
    if (i !== 0 && i !== 1) continue;
    t.nms = await tf.image.nonMaxSuppressionAsync(t.boxes, classScores[i], config.hand.maxDetected, config.hand.iouThreshold, config.hand.minConfidence);
    const nms = await t.nms.data();
    tf.dispose(t.nms);
    for (const res of Array.from(nms)) { // generates results for each class
      const boxSlice = tf.slice(t.boxes, res, 1);
      let yxBox: Box = [0, 0, 0, 0];
      if (config.hand.landmarks) { // scale box
        const detectedBox: Box = await boxSlice.data();
        const boxCenter: Point = [(detectedBox[0] + detectedBox[2]) / 2, (detectedBox[1] + detectedBox[3]) / 2];
        const boxDiff: Box = [+boxCenter[0] - detectedBox[0], +boxCenter[1] - detectedBox[1], -boxCenter[0] + detectedBox[2], -boxCenter[1] + detectedBox[3]];
        yxBox = [boxCenter[0] - boxScaleFact * boxDiff[0], boxCenter[1] - boxScaleFact * boxDiff[1], boxCenter[0] + boxScaleFact * boxDiff[2], boxCenter[1] + boxScaleFact * boxDiff[3]];
      } else { // use box as-is
        yxBox = await boxSlice.data();
      }
      const boxRaw: Box = [yxBox[1], yxBox[0], yxBox[3] - yxBox[1], yxBox[2] - yxBox[0]];
      const box: Box = [Math.trunc(boxRaw[0] * outputSize[0]), Math.trunc(boxRaw[1] * outputSize[1]), Math.trunc(boxRaw[2] * outputSize[0]), Math.trunc(boxRaw[3] * outputSize[1])];
      tf.dispose(boxSlice);
      const scoreSlice = tf.slice(classScores[i], res, 1);
      const score = (await scoreSlice.data())[0];
      tf.dispose(scoreSlice);
      const hand: HandDetectResult = { id: id++, score, box, boxRaw, label: classes[i], yxBox };
      hands.push(hand);
    }
  }
  classScores.forEach((tensor) => tf.dispose(tensor));
  Object.keys(t).forEach((tensor) => tf.dispose(t[tensor]));
  hands.sort((a, b) => b.score - a.score);
  if (hands.length > (config.hand.maxDetected || 1)) hands.length = (config.hand.maxDetected || 1);
  return hands;
}

async function detectFingers(input: Tensor, h: HandDetectResult, config: Config): Promise<HandResult> {
  const hand: HandResult = {
    id: h.id,
    score: Math.round(100 * h.score) / 100,
    boxScore: Math.round(100 * h.score) / 100,
    fingerScore: 0,
    box: h.box,
    boxRaw: h.boxRaw,
    label: h.label,
    keypoints: [],
    landmarks: {} as HandResult['landmarks'],
    annotations: {} as HandResult['annotations'],
  };
  if (!input || !models[1]) return hand; // something is wrong
  if (config.hand.landmarks) {
    const t: Record<string, Tensor> = {};
    if (!h.yxBox) return hand;
    t.crop = tf.image.cropAndResize(input, [h.yxBox], [0], [inputSize[1][0], inputSize[1][1]], 'bilinear');
    t.cast = tf.cast(t.crop, 'float32');
    t.div = tf.div(t.cast, 255);
    [t.score, t.keypoints] = models[1].execute(t.div) as Tensor[];
    const score = Math.round(100 * (await t.score.data())[0] / 100);
    if (score > (config.hand.minConfidence || 0)) {
      hand.fingerScore = score;
      t.reshaped = tf.reshape(t.keypoints, [-1, 3]);
      const rawCoords = await t.reshaped.array() as Point[];
      hand.keypoints = (rawCoords as Point[]).map((coord) => [
        (h.box[2] * coord[0] / inputSize[1][0]) + h.box[0],
        (h.box[3] * coord[1] / inputSize[1][1]) + h.box[1],
        (h.box[2] + h.box[3]) / 2 / inputSize[1][0] * (coord[2] || 0),
      ]);
      const updatedBox = scale(hand.keypoints, boxScaleFact, outputSize); // replace detected box with box calculated around keypoints
      h.box = updatedBox.box;
      h.boxRaw = updatedBox.boxRaw;
      h.yxBox = updatedBox.yxBox;
      hand.box = h.box;
      hand.landmarks = fingerPose.analyze(hand.keypoints) as HandResult['landmarks']; // calculate finger landmarks
      for (const key of Object.keys(fingerMap)) { // map keypoints to per-finger annotations
        hand.annotations[key] = fingerMap[key].map((index) => (hand.landmarks && hand.keypoints[index] ? hand.keypoints[index] : null));
      }
      cache.tmpBoxes.push(h); // if finger detection is enabled, only update cache if fingers are detected
    }
    Object.keys(t).forEach((tensor) => tf.dispose(t[tensor]));
  }
  return hand;
}

export async function predict(input: Tensor, config: Config): Promise<HandResult[]> {
  outputSize = [input.shape[2] || 0, input.shape[1] || 0];
  let hands: Array<HandResult> = [];
  cache.tmpBoxes = []; // clear temp cache
  if (!config.hand.landmarks) cache.fingerBoxes = cache.handBoxes; // if hand detection only reset finger boxes cache
  if ((skipped < (config.hand.skipFrames || 0)) && config.skipFrame) { // just run finger detection while reusing cached boxes
    skipped++;
    hands = await Promise.all(cache.fingerBoxes.map((hand) => detectFingers(input, hand, config))); // run from finger box cache
  } else { // calculate new boxes and run finger detection
    skipped = 0;
    hands = await Promise.all(cache.fingerBoxes.map((hand) => detectFingers(input, hand, config))); // run from finger box cache
    if (hands.length !== config.hand.maxDetected) { // run hand detection only if we dont have enough hands in cache
      cache.handBoxes = await detectHands(input, config);
      const newHands = await Promise.all(cache.handBoxes.map((hand) => detectFingers(input, hand, config)));
      hands = hands.concat(newHands);
    }
  }
  cache.fingerBoxes = [...cache.tmpBoxes]; // repopulate cache with validated hands
  return hands as HandResult[];
}
