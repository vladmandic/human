/**
 * Hand Detection and Segmentation
 */

import { log, join } from '../helpers';
import * as tf from '../../dist/tfjs.esm.js';
import type { HandResult } from '../result';
import type { GraphModel, Tensor } from '../tfjs/types';
import type { Config } from '../config';
import { env } from '../env';
import * as fingerPose from '../fingerpose/fingerpose';

const models: [GraphModel | null, GraphModel | null] = [null, null];
const modelOutputNodes = ['StatefulPartitionedCall/Postprocessor/Slice', 'StatefulPartitionedCall/Postprocessor/ExpandDims_1'];
const inputSize = [0, 0];

const classes = [
  'hand',
  'fist',
  'pinch',
  'point',
  'face',
  'tip',
  'pinchtip',
];

let skipped = 0;
let outputSize;

type HandDetectResult = {
  id: number,
  score: number,
  box: [number, number, number, number],
  boxRaw: [number, number, number, number],
  label: string,
  yxBox: [number, number, number, number],
}

let boxes: Array<HandDetectResult> = [];

const fingerMap = {
  thumb: [1, 2, 3, 4],
  index: [5, 6, 7, 8],
  middle: [9, 10, 11, 12],
  ring: [13, 14, 15, 16],
  pinky: [17, 18, 19, 20],
  palm: [0],
};

export async function load(config: Config): Promise<[GraphModel, GraphModel]> {
  if (env.initial) {
    models[0] = null;
    models[1] = null;
  }
  if (!models[0]) {
    models[0] = await tf.loadGraphModel(join(config.modelBasePath, config.hand.detector?.modelPath || '')) as unknown as GraphModel;
    const inputs = Object.values(models[0].modelSignature['inputs']);
    inputSize[0] = Array.isArray(inputs) ? parseInt(inputs[0].tensorShape.dim[2].size) : 0;
    if (!models[0] || !models[0]['modelUrl']) log('load model failed:', config.object.modelPath);
    else if (config.debug) log('load model:', models[0]['modelUrl']);
  } else if (config.debug) log('cached model:', models[0]['modelUrl']);
  if (!models[1]) {
    models[1] = await tf.loadGraphModel(join(config.modelBasePath, config.hand.skeleton?.modelPath || '')) as unknown as GraphModel;
    const inputs = Object.values(models[1].modelSignature['inputs']);
    inputSize[1] = Array.isArray(inputs) ? parseInt(inputs[0].tensorShape.dim[2].size) : 0;
    if (!models[1] || !models[1]['modelUrl']) log('load model failed:', config.object.modelPath);
    else if (config.debug) log('load model:', models[1]['modelUrl']);
  } else if (config.debug) log('cached model:', models[1]['modelUrl']);
  return models as [GraphModel, GraphModel];
}

async function detectHands(input: Tensor, config: Config): Promise<HandDetectResult[]> {
  const hands: HandDetectResult[] = [];
  if (!input || !models[0]) return hands;
  const t: Record<string, Tensor> = {};
  t.resize = tf.image.resizeBilinear(input, [240, 320]); // todo: resize with padding
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
      const yxBox = await boxSlice.data();
      const boxRaw: [number, number, number, number] = [yxBox[1], yxBox[0], yxBox[3] - yxBox[1], yxBox[2] - yxBox[0]];
      const box: [number, number, number, number] = [Math.trunc(boxRaw[0] * outputSize[0]), Math.trunc(boxRaw[1] * outputSize[1]), Math.trunc(boxRaw[2] * outputSize[0]), Math.trunc(boxRaw[3] * outputSize[1])];
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
  return hands;
}

/*
const scaleFact = 1.2;

function updateBoxes(h, keypoints) {
  const fingerX = keypoints.map((pt) => pt[0]);
  const fingerY = keypoints.map((pt) => pt[1]);
  const minX = Math.min(...fingerX);
  const maxX = Math.max(...fingerX);
  const minY = Math.min(...fingerY);
  const maxY = Math.max(...fingerY);
  h.box = [
    Math.trunc(minX / scaleFact),
    Math.trunc(minY / scaleFact),
    Math.trunc(scaleFact * maxX - minX),
    Math.trunc(scaleFact * maxY - minY),
  ] as [number, number, number, number];
  h.bowRaw = [
    h.box / outputSize[0],
    h.box / outputSize[1],
    h.box / outputSize[0],
    h.box / outputSize[1],
  ] as [number, number, number, number];
  h.yxBox = [
    h.boxRaw[1],
    h.boxRaw[0],
    h.boxRaw[3] + h.boxRaw[1],
    h.boxRaw[2] + h.boxRaw[0],
  ] as [number, number, number, number];
  return h;
}
*/

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
  if (!input || !models[1] || !config.hand.landmarks) return hand;
  const t: Record<string, Tensor> = {};
  t.crop = tf.image.cropAndResize(input, [h.yxBox], [0], [inputSize[1], inputSize[1]], 'bilinear');
  t.cast = tf.cast(t.crop, 'float32');
  t.div = tf.div(t.cast, 255);
  [t.score, t.keypoints] = models[1].execute(t.div) as Tensor[];
  const score = Math.round(100 * (await t.score.data())[0] / 100);
  if (score > (config.hand.minConfidence || 0)) {
    hand.fingerScore = score;
    t.reshaped = tf.reshape(t.keypoints, [-1, 3]);
    const rawCoords = await t.reshaped.array() as number[];
    hand.keypoints = (rawCoords as number[]).map((coord) => [
      (h.box[2] * coord[0] / inputSize[1]) + h.box[0],
      (h.box[3] * coord[1] / inputSize[1]) + h.box[1],
      (h.box[2] + h.box[3]) / 2 / inputSize[1] * coord[2],
    ]);
    // h = updateBoxes(h, hand.keypoints); // replace detected box with box calculated around keypoints
    hand.landmarks = fingerPose.analyze(hand.keypoints) as HandResult['landmarks']; // calculate finger landmarks
    for (const key of Object.keys(fingerMap)) { // map keypoints to per-finger annotations
      hand.annotations[key] = fingerMap[key].map((index) => (hand.landmarks && hand.keypoints[index] ? hand.keypoints[index] : null));
    }
  }
  Object.keys(t).forEach((tensor) => tf.dispose(t[tensor]));
  return hand;
}

let last = 0;
export async function predict(input: Tensor, config: Config): Promise<HandResult[]> {
  outputSize = [input.shape[2] || 0, input.shape[1] || 0];
  if ((skipped < (config.object.skipFrames || 0)) && config.skipFrame) {
    // use cached boxes
    skipped++;
    const hands: HandResult[] = await Promise.all(boxes.map((hand) => detectFingers(input, hand, config)));
    const withFingers = hands.filter((hand) => hand.fingerScore > 0).length;
    if (withFingers === last) return hands;
  }
  // calculate new boxes
  skipped = 0;
  boxes = await detectHands(input, config);
  const hands: HandResult[] = await Promise.all(boxes.map((hand) => detectFingers(input, hand, config)));
  const withFingers = hands.filter((hand) => hand.fingerScore > 0).length;
  last = withFingers;
  // console.log('NEW', withFingers, hands.length, boxes.length);
  return hands;
}

/*
<https://victordibia.com/handtrack.js/#/>
<https://github.com/victordibia/handtrack.js/>
<https://github.com/victordibia/handtracking>
<https://medium.com/@victor.dibia/how-to-build-a-real-time-hand-detector-using-neural-networks-ssd-on-tensorflow-d6bac0e4b2ce>
*/

/* TODO
- smart resize
- updateboxes is drifting
*/
