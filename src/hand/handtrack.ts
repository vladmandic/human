/**
 * HandTrack model implementation
 *
 * Based on:
 * - Hand Detection & Skeleton: [**MediaPipe HandPose**](https://drive.google.com/file/d/1sv4sSb9BSNVZhLzxXJ0jBv9DqD-4jnAz/view)
 * - Hand Tracking: [**HandTracking**](https://github.com/victordibia/handtracking)
 */

import { log, join } from '../util/util';
import * as box from '../util/box';
import * as tf from '../../dist/tfjs.esm.js';
import type { HandResult, Box, Point } from '../result';
import type { GraphModel, Tensor } from '../tfjs/types';
import type { Config } from '../config';
import { env } from '../util/env';
import * as fingerPose from './fingerpose';
import { fakeOps } from '../tfjs/backend';

const models: [GraphModel | null, GraphModel | null] = [null, null];
const modelOutputNodes = ['StatefulPartitionedCall/Postprocessor/Slice', 'StatefulPartitionedCall/Postprocessor/ExpandDims_1'];

const inputSize = [[0, 0], [0, 0]];

const classes = ['hand', 'fist', 'pinch', 'point', 'face', 'tip', 'pinchtip'];

const boxExpandFact = 1.6; // increase to 160%

let skipped = 0;
let outputSize: [number, number] = [0, 0];

type HandDetectResult = {
  id: number,
  score: number,
  box: Box,
  boxRaw: Box,
  boxCrop: Box,
  label: string,
}

const cache: {
  boxes: Array<HandDetectResult>,
  hands: Array<HandResult>;
} = {
  boxes: [],
  hands: [],
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
  const height = Math.min(Math.round((input.shape[1] || 0) / 8) * 8, 512); // use dynamic input size but cap at 512
  const width = Math.round(height * ratio / 8) * 8;
  t.resize = tf.image.resizeBilinear(input, [height, width]); // todo: resize with padding
  t.cast = tf.cast(t.resize, 'int32');
  [t.rawScores, t.rawBoxes] = await models[0].executeAsync(t.cast, modelOutputNodes) as Tensor[];
  t.boxes = tf.squeeze(t.rawBoxes, [0, 2]);
  t.scores = tf.squeeze(t.rawScores, [0]);
  const classScores = tf.unstack(t.scores, 1); // unstack scores based on classes
  classScores.splice(4, 1); // remove faces
  t.filtered = tf.stack(classScores, 1); // restack
  tf.dispose(...classScores);
  t.max = tf.max(t.filtered, 1); // max overall score
  t.argmax = tf.argMax(t.filtered, 1); // class index of max overall score
  let id = 0;
  t.nms = await tf.image.nonMaxSuppressionAsync(t.boxes, t.max, config.hand.maxDetected, config.hand.iouThreshold, config.hand.minConfidence);
  const nms = await t.nms.data();
  const scores = await t.max.data();
  const classNum = await t.argmax.data();
  for (const nmsIndex of Array.from(nms)) { // generates results for each class
    const boxSlice = tf.slice(t.boxes, nmsIndex, 1);
    const boxData = await boxSlice.data();
    tf.dispose(boxSlice);
    const boxInput: Box = [boxData[1], boxData[0], boxData[3] - boxData[1], boxData[2] - boxData[0]];
    const boxRaw: Box = box.scale(boxInput, 1.2); // handtrack model returns tight box so we expand it a bit
    const boxFull: Box = [Math.trunc(boxRaw[0] * outputSize[0]), Math.trunc(boxRaw[1] * outputSize[1]), Math.trunc(boxRaw[2] * outputSize[0]), Math.trunc(boxRaw[3] * outputSize[1])];
    const score = scores[nmsIndex];
    const label = classes[classNum[nmsIndex]];
    const hand: HandDetectResult = { id: id++, score, box: boxFull, boxRaw, boxCrop: box.crop(boxRaw), label };
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
    t.crop = tf.image.cropAndResize(input, [box.crop(h.boxRaw)], [0], [inputSize[1][0], inputSize[1][1]], 'bilinear');
    t.cast = tf.cast(t.crop, 'float32');
    t.div = tf.div(t.cast, 255);
    [t.score, t.keypoints] = models[1].execute(t.div) as Tensor[];
    const rawScore = (await t.score.data())[0];
    const score = (100 - Math.trunc(100 / (1 + Math.exp(rawScore)))) / 100; // reverse sigmoid value
    if (score >= (config.hand.minConfidence || 0)) {
      hand.fingerScore = score;
      t.reshaped = tf.reshape(t.keypoints, [-1, 3]);
      const rawCoords = await t.reshaped.array() as Point[];
      hand.keypoints = (rawCoords as Point[]).map((kpt) => [
        outputSize[0] * ((h.boxCrop[3] - h.boxCrop[1]) * kpt[0] / inputSize[1][0] + h.boxCrop[1]),
        outputSize[1] * ((h.boxCrop[2] - h.boxCrop[0]) * kpt[1] / inputSize[1][1] + h.boxCrop[0]),
        (h.boxCrop[3] + h.boxCrop[3] / 2 * (kpt[2] || 0)),
      ]);
      hand.landmarks = fingerPose.analyze(hand.keypoints) as HandResult['landmarks']; // calculate finger landmarks
      for (const key of Object.keys(fingerMap)) { // map keypoints to per-finger annotations
        hand.annotations[key] = fingerMap[key].map((index) => (hand.landmarks && hand.keypoints[index] ? hand.keypoints[index] : null));
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
  if (config.skipFrame && (skipped <= (config.hand.skipFrames || 0))) {
    return cache.hands; // return cached results without running anything
  }
  return new Promise(async (resolve) => {
    skipped = 0;
    if (cache.boxes.length >= (config.hand.maxDetected || 0)) {
      cache.hands = await Promise.all(cache.boxes.map((handBox) => detectFingers(input, handBox, config))); // if we have enough cached boxes run detection using cache
    } else {
      cache.hands = []; // reset hands
    }

    if (cache.hands.length !== config.hand.maxDetected) { // did not find enough hands based on cached boxes so run detection on full frame
      cache.boxes = await detectHands(input, config);
      cache.hands = await Promise.all(cache.boxes.map((handBox) => detectFingers(input, handBox, config)));
    }

    const oldCache = [...cache.boxes];
    cache.boxes.length = 0; // reset cache
    for (let i = 0; i < cache.hands.length; i++) {
      const boxKpt = box.square(cache.hands[i].keypoints, outputSize);
      if (boxKpt.box[2] / (input.shape[2] || 1) > 0.05 && boxKpt.box[3] / (input.shape[1] || 1) > 0.05 && cache.hands[i].fingerScore && cache.hands[i].fingerScore > (config.hand.minConfidence || 0)) {
        const boxScale = box.scale(boxKpt.box, boxExpandFact);
        const boxScaleRaw = box.scale(boxKpt.boxRaw, boxExpandFact);
        const boxCrop = box.crop(boxScaleRaw);
        cache.boxes.push({ ...oldCache[i], box: boxScale, boxRaw: boxScaleRaw, boxCrop });
      }
    }
    resolve(cache.hands);
  });
}
