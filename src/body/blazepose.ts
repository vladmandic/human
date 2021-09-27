/**
 * BlazePose model implementation
 *
 * Based on : [**BlazePose**](https://github.com/google/mediapipe/blob/master/mediapipe/modules/pose_detection)
 */

import { log, join } from '../util/util';
import * as tf from '../../dist/tfjs.esm.js';
import type { BodyResult, Box, Point } from '../result';
import type { GraphModel, Tensor } from '../tfjs/types';
import type { Config } from '../config';
import { env } from '../util/env';
import * as annotations from './annotations';

// const boxScaleFact = 1.5; // hand finger model prefers slighly larger box
const models: [GraphModel | null, GraphModel | null] = [null, null];
const outputNodes = ['ld_3d', 'activation_segmentation', 'activation_heatmap', 'world_3d', 'output_poseflag'];

const inputSize = [[0, 0], [0, 0]];

// let skipped = 0;
let outputSize: [number, number] = [0, 0];

type Keypoints = { score: number, part: string, position: Point, positionRaw: Point };

/*
type BodyDetectResult = {
  id: number,
  score: number,
  box: Box,
  boxRaw: Box,
  label: string,
  yxBox: Box,
}

const cache: {
  bodyBoxes: Array<BodyDetectResult>,
  partBoxes: Array<BodyDetectResult>
  tmpBoxes: Array<BodyDetectResult>
} = {
  bodyBoxes: [],
  partBoxes: [],
  tmpBoxes: [],
};
*/

export async function loadDetect(config: Config): Promise<GraphModel> {
  if (env.initial) models[0] = null;
  if (!models[0]) {
    models[0] = await tf.loadGraphModel(join(config.modelBasePath, config.body.detector?.modelPath || '')) as unknown as GraphModel;
    const inputs = Object.values(models[0].modelSignature['inputs']);
    inputSize[0][0] = Array.isArray(inputs) ? parseInt(inputs[0].tensorShape.dim[1].size) : 0;
    inputSize[0][1] = Array.isArray(inputs) ? parseInt(inputs[0].tensorShape.dim[2].size) : 0;
    if (!models[0] || !models[0]['modelUrl']) log('load model failed:', config.object.modelPath);
    else if (config.debug) log('load model:', models[0]['modelUrl']);
  } else if (config.debug) log('cached model:', models[0]['modelUrl']);
  return models[0];
}

export async function loadPose(config: Config): Promise<GraphModel> {
  if (env.initial) models[1] = null;
  if (!models[1]) {
    models[1] = await tf.loadGraphModel(join(config.modelBasePath, config.body.modelPath || '')) as unknown as GraphModel;
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
  if (!models[1]) await loadPose(config);
  return models;
}

/*
async function detectBody(input: Tensor, config: Config): Promise<BodyDetectResult[]> {
  if ((config.body.detector?.modelPath.length || 0) > 0 && models[0]) {
    const t: Record<string, Tensor> = {};
    t.resize = tf.image.resizeBilinear(input, [inputSize[0][0], inputSize[0][1]]);
    t.res = await models[0]?.predict(t.resize) as Tensor; // [1,2254,13]
    t.logits = tf.slice(t.res, [0, 0, 0], [1, -1, 1]);
    t.sigmoid = tf.sigmoid(t.logits);
    t.rawBoxes = tf.slice(t.res, [0, 0, 1], [1, -1, -1]);
    t.packedBoxes = tf.squeeze(t.rawBoxes); // [2254,12]
    t.scores = tf.squeeze(t.sigmoid); // [2254,1]
    // boxes need to be decoded based on anchors
    Object.keys(t).forEach((tensor) => tf.dispose(t[tensor]));
  }
  return [];
}
*/

async function detectParts(input: Tensor, config: Config): Promise<BodyResult> {
  const t: Record<string, Tensor> = {};
  t.resize = tf.image.resizeBilinear(input, [inputSize[1][0], inputSize[1][1]]);
  [t.ld/* 1,195 */, t.segmentation/* 1,256,256,1 */, t.heatmap/* 1,64,64,39 */, t.world/* 1,117 */, t.poseflag/* 1,1 */] = await models[1]?.execute(t.resize, outputNodes) as Tensor[]; // [1,2254,13]
  const points = await t.ld.data();
  const keypoints: Array<Keypoints> = [];
  const labels = points?.length === 195 ? annotations.full : annotations.upper; // full model has 39 keypoints, upper has 31 keypoints
  const depth = 5; // each points has x,y,z,visibility,presence
  for (let i = 0; i < points.length / depth; i++) {
    const score = (100 - Math.trunc(100 / (1 + Math.exp(points[depth * i + 3])))) / 100; // reverse sigmoid value
    // const presence = (100 - Math.trunc(100 / (1 + Math.exp(points[depth * i + 4])))) / 100; // reverse sigmoid value
    if (score > (config.body.minConfidence || 0)) {
      keypoints.push({
        part: labels[i],
        position: [
          Math.trunc(outputSize[0] * points[depth * i + 0] / 255), // return normalized x value istead of 0..255
          Math.trunc(outputSize[1] * points[depth * i + 1] / 255), // return normalized y value istead of 0..255
          Math.trunc(points[depth * i + 2]) + 0, // fix negative zero
        ],
        positionRaw: [
          points[depth * i + 0] / 255, // return x value normalized to 0..1
          points[depth * i + 1] / 255, // return y value normalized to 0..1
          points[depth * i + 2] + 0, // fix negative zero
        ],
        score,
      });
    }
  }
  const x = keypoints.map((a) => a.position[0]);
  const y = keypoints.map((a) => a.position[1]);
  const box: Box = [
    Math.min(...x),
    Math.min(...y),
    Math.max(...x) - Math.min(...x),
    Math.max(...y) - Math.min(...x),
  ];
  const boxRaw: Box = [0, 0, 0, 0]; // not yet implemented
  const score = keypoints.reduce((prev, curr) => (curr.score > prev ? curr.score : prev), 0);
  Object.keys(t).forEach((tensor) => tf.dispose(t[tensor]));
  return { id: 0, score, box, boxRaw, keypoints };
}

export async function predict(input: Tensor, config: Config): Promise<BodyResult[]> {
  outputSize = [input.shape[2] || 0, input.shape[1] || 0];
  const bodies: Array<BodyResult> = [];
  const body = await detectParts(input, config);
  bodies.push(body);
  /*
  cache.tmpBoxes = []; // clear temp cache
  if ((skipped < (config.body.skipFrames || 0)) && config.skipFrame) { // just run part detection while reusing cached boxes
    skipped++;
    bodies = await Promise.all(cache.partBoxes.map((body) => detectParts(input, body, config))); // run from parts box cache
  } else { // calculate new boxes and run part detection
    skipped = 0;
    bodies = await Promise.all(cache.partBoxes.map((body) => detectParts(input, body, config))); // run from part box cache
    if (bodies.length !== config.body.maxDetected) { // run body detection only if we dont have enough bodies in cache
      cache.bodyBoxes = await detectBody(input, config);
      const newBodies = await Promise.all(cache.bodyBoxes.map((body) => detectParts(input, body, config)));
      bodies = bodies.concat(newBodies);
    }
  }
  cache.partBoxes = [...cache.tmpBoxes]; // repopulate cache with validated bodies
  */
  return bodies as BodyResult[];
}
