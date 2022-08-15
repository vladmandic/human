/**
 * HandTrack model implementation
 *
 * Based on:
 * - Hand Detection & Skeleton: [**MediaPipe HandPose**](https://drive.google.com/file/d/1sv4sSb9BSNVZhLzxXJ0jBv9DqD-4jnAz/view)
 * - Hand Tracking: [**HandTracking**](https://github.com/victordibia/handtracking)
 */

import { log, now } from '../util/util';
import * as box from '../util/box';
import * as tf from '../../dist/tfjs.esm.js';
import { loadModel } from '../tfjs/load';
import type { HandResult, HandType, Box, Point } from '../result';
import type { GraphModel, Tensor } from '../tfjs/types';
import type { Config } from '../config';
import { env } from '../util/env';
import * as fingerPose from './fingerpose';
import { fakeOps } from '../tfjs/backend';
import { constants } from '../tfjs/constants';

const models: [GraphModel | null, GraphModel | null] = [null, null];
const modelOutputNodes = ['StatefulPartitionedCall/Postprocessor/Slice', 'StatefulPartitionedCall/Postprocessor/ExpandDims_1'];

const inputSize = [[0, 0], [0, 0]];

const classes = ['hand', 'fist', 'pinch', 'point', 'face', 'tip', 'pinchtip'];
const faceIndex = 4;

const boxExpandFact = 1.6;
const maxDetectorResolution = 512;
const detectorExpandFact = 1.4;

let skipped = Number.MAX_SAFE_INTEGER;
let lastTime = 0;
let outputSize: [number, number] = [0, 0];

type HandDetectResult = {
  id: number,
  score: number,
  box: Box,
  boxRaw: Box,
  label: HandType,
}

const cache: {
  boxes: Array<HandDetectResult>,
  hands: Array<HandResult>;
} = {
  boxes: [],
  hands: [],
};

const fingerMap = {
  /*
  thumb: [0, 1, 2, 3, 4],
  index: [0, 5, 6, 7, 8],
  middle: [0, 9, 10, 11, 12],
  ring: [0, 13, 14, 15, 16],
  pinky: [0, 17, 18, 19, 20],
  palm: [0],
  */
  thumb: [1, 2, 3, 4],
  index: [5, 6, 7, 8],
  middle: [9, 10, 11, 12],
  ring: [13, 14, 15, 16],
  pinky: [17, 18, 19, 20],
  base: [0],
  palm: [0, 17, 13, 9, 5, 1, 0],
};

export async function loadDetect(config: Config): Promise<GraphModel> {
  // HandTrack Model: Original: <https://github.com/victordibia/handtracking> TFJS Port: <https://github.com/victordibia/handtrack.js/>
  if (env.initial) models[0] = null;
  if (!models[0]) {
    // handtrack model has some kernel ops defined in model but those are never referenced and non-existent in tfjs
    // ideally need to prune the model itself
    fakeOps(['tensorlistreserve', 'enter', 'tensorlistfromtensor', 'merge', 'loopcond', 'switch', 'exit', 'tensorliststack', 'nextiteration', 'tensorlistsetitem', 'tensorlistgetitem', 'reciprocal', 'shape', 'split', 'where'], config);
    models[0] = await loadModel(config.hand.detector?.modelPath);
    const inputs = Object.values(models[0].modelSignature['inputs']);
    inputSize[0][0] = Array.isArray(inputs) ? parseInt(inputs[0].tensorShape.dim[1].size) : 0;
    inputSize[0][1] = Array.isArray(inputs) ? parseInt(inputs[0].tensorShape.dim[2].size) : 0;
  } else if (config.debug) log('cached model:', models[0]['modelUrl']);
  return models[0];
}

export async function loadSkeleton(config: Config): Promise<GraphModel> {
  if (env.initial) models[1] = null;
  if (!models[1]) {
    models[1] = await loadModel(config.hand.skeleton?.modelPath);
    const inputs = Object.values(models[1].modelSignature['inputs']);
    inputSize[1][0] = Array.isArray(inputs) ? parseInt(inputs[0].tensorShape.dim[1].size) : 0;
    inputSize[1][1] = Array.isArray(inputs) ? parseInt(inputs[0].tensorShape.dim[2].size) : 0;
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
  const height = Math.min(Math.round((input.shape[1] || 0) / 8) * 8, maxDetectorResolution); // use dynamic input size but cap at 512
  const width = Math.round(height * ratio / 8) * 8;
  t.resize = tf.image.resizeBilinear(input, [height, width]); // todo: resize with padding
  t.cast = tf.cast(t.resize, 'int32');
  [t.rawScores, t.rawBoxes] = await models[0].executeAsync(t.cast, modelOutputNodes) as Tensor[];
  t.boxes = tf.squeeze(t.rawBoxes, [0, 2]);
  t.scores = tf.squeeze(t.rawScores, [0]);
  const classScores: Array<Tensor> = tf.unstack(t.scores, 1); // unstack scores based on classes
  tf.dispose(classScores[faceIndex]);
  classScores.splice(faceIndex, 1); // remove faces
  t.filtered = tf.stack(classScores, 1); // restack
  tf.dispose(classScores);
  // t.filtered = t.scores;
  t.max = tf.max(t.filtered, 1); // max overall score
  t.argmax = tf.argMax(t.filtered, 1); // class index of max overall score
  let id = 0;
  t.nms = await tf.image.nonMaxSuppressionAsync(t.boxes, t.max, (config.hand.maxDetected || 0) + 1, config.hand.iouThreshold || 0, config.hand.minConfidence || 1);
  const nms = await t.nms.data();
  const scores = await t.max.data();
  const classNum = await t.argmax.data();
  for (const nmsIndex of Array.from(nms)) { // generates results for each class
    const boxSlice = tf.slice(t.boxes, nmsIndex, 1);
    const boxYX = await boxSlice.data();
    tf.dispose(boxSlice);
    const boxData: Box = [boxYX[1], boxYX[0], boxYX[3] - boxYX[1], boxYX[2] - boxYX[0]]; // yx box reshaped to standard box
    const boxRaw: Box = box.scale(boxData, detectorExpandFact);
    const boxFull: Box = [Math.trunc(boxData[0] * outputSize[0]), Math.trunc(boxData[1] * outputSize[1]), Math.trunc(boxData[2] * outputSize[0]), Math.trunc(boxData[3] * outputSize[1])];
    const score = scores[nmsIndex];
    const label = classes[classNum[nmsIndex]] as HandType;
    const hand: HandDetectResult = { id: id++, score, box: boxFull, boxRaw, label };
    hands.push(hand);
  }
  Object.keys(t).forEach((tensor) => tf.dispose(t[tensor]));
  hands.sort((a, b) => b.score - a.score);
  if (hands.length > (config.hand.maxDetected || 1)) hands.length = (config.hand.maxDetected || 1);
  return hands;
}

async function detectFingers(input: Tensor, h: HandDetectResult, config: Config): Promise<HandResult> {
  const hand: HandResult = { // initial values inherited from hand detect
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
  if (input && models[1] && config.hand.landmarks && h.score > (config.hand.minConfidence || 0)) {
    const t: Record<string, Tensor> = {};
    const boxCrop = [h.boxRaw[1], h.boxRaw[0], h.boxRaw[3] + h.boxRaw[1], h.boxRaw[2] + h.boxRaw[0]] as Box;
    t.crop = tf.image.cropAndResize(input, [boxCrop], [0], [inputSize[1][0], inputSize[1][1]], 'bilinear');
    t.div = tf.div(t.crop, constants.tf255);
    [t.score, t.keypoints] = models[1].execute(t.div, ['Identity_1', 'Identity']) as Tensor[];
    const rawScore = (await t.score.data())[0];
    const score = (100 - Math.trunc(100 / (1 + Math.exp(rawScore)))) / 100; // reverse sigmoid value
    if (score >= (config.hand.minConfidence || 0)) {
      hand.fingerScore = score;
      t.reshaped = tf.reshape(t.keypoints, [-1, 3]);
      const coordsData: Point[] = await t.reshaped.array() as Point[];
      const coordsRaw: Point[] = coordsData.map((kpt) => [kpt[0] / inputSize[1][1], kpt[1] / inputSize[1][0], (kpt[2] || 0)]);
      const coordsNorm: Point[] = coordsRaw.map((kpt) => [kpt[0] * h.boxRaw[2], kpt[1] * h.boxRaw[3], (kpt[2] || 0)]);
      hand.keypoints = (coordsNorm).map((kpt) => [outputSize[0] * (kpt[0] + h.boxRaw[0]), outputSize[1] * (kpt[1] + h.boxRaw[1]), (kpt[2] || 0)]);
      hand.landmarks = fingerPose.analyze(hand.keypoints) as HandResult['landmarks']; // calculate finger gestures
      for (const key of Object.keys(fingerMap)) { // map keypoints to per-finger annotations
        hand.annotations[key] = fingerMap[key].map((index: number) => (hand.landmarks && hand.keypoints[index] ? hand.keypoints[index] : null));
      }
    }
    Object.keys(t).forEach((tensor) => tf.dispose(t[tensor]));
  }
  return hand;
}

export async function predict(input: Tensor, config: Config): Promise<HandResult[]> {
  if (!models[0] || !models[1] || !models[0]?.inputs[0].shape || !models[1]?.inputs[0].shape) return []; // something is wrong with the model
  outputSize = [input.shape[2] || 0, input.shape[1] || 0];
  skipped++; // increment skip frames
  const skipTime = (config.hand.skipTime || 0) > (now() - lastTime);
  const skipFrame = skipped < (config.hand.skipFrames || 0);
  if (config.skipAllowed && skipTime && skipFrame) {
    return cache.hands; // return cached results without running anything
  }
  return new Promise(async (resolve) => {
    const skipTimeExtended = 3 * (config.hand.skipTime || 0) > (now() - lastTime);
    const skipFrameExtended = skipped < 3 * (config.hand.skipFrames || 0);
    if (config.skipAllowed && cache.hands.length === config.hand.maxDetected) { // we have all detected hands so we're definitely skipping
      cache.hands = await Promise.all(cache.boxes.map((handBox) => detectFingers(input, handBox, config)));
    } else if (config.skipAllowed && skipTimeExtended && skipFrameExtended && cache.hands.length > 0) { // we have some cached results: maybe not enough but anyhow continue for bit longer
      cache.hands = await Promise.all(cache.boxes.map((handBox) => detectFingers(input, handBox, config)));
    } else { // finally rerun detector
      cache.boxes = await detectHands(input, config);
      lastTime = now();
      cache.hands = await Promise.all(cache.boxes.map((handBox) => detectFingers(input, handBox, config)));
      skipped = 0;
    }

    const oldCache = [...cache.boxes];
    cache.boxes.length = 0; // reset cache
    if (config.cacheSensitivity > 0) {
      for (let i = 0; i < cache.hands.length; i++) {
        const boxKpt = box.square(cache.hands[i].keypoints, outputSize);
        if (boxKpt.box[2] / (input.shape[2] || 1) > 0.05 && boxKpt.box[3] / (input.shape[1] || 1) > 0.05 && cache.hands[i].fingerScore && cache.hands[i].fingerScore > (config.hand.minConfidence || 0)) {
          const boxScale = box.scale(boxKpt.box, boxExpandFact);
          const boxScaleRaw = box.scale(boxKpt.boxRaw, boxExpandFact);
          // const boxCrop = box.crop(boxScaleRaw);
          cache.boxes.push({ ...oldCache[i], box: boxScale, boxRaw: boxScaleRaw });
        }
      }
    }
    for (let i = 0; i < cache.hands.length; i++) { // replace detected boxes with calculated boxes in final output
      const bbox = box.calc(cache.hands[i].keypoints, outputSize);
      cache.hands[i].box = bbox.box;
      cache.hands[i].boxRaw = bbox.boxRaw;
    }
    resolve(cache.hands);
  });
}
