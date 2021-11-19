/**
 * BlazePose model implementation
 */

import * as tf from '../../dist/tfjs.esm.js';
import { constants } from '../tfjs/constants';
import { log, join, now } from '../util/util';
import type { BodyKeypoint, BodyResult, Box, Point } from '../result';
import type { GraphModel, Tensor } from '../tfjs/types';
import type { Config } from '../config';
import * as coords from './blazeposecoords';

const env = { initial: true };
const models: [GraphModel | null, GraphModel | null] = [null, null];
const inputSize = [[0, 0], [0, 0]];
let skipped = Number.MAX_SAFE_INTEGER;
let outputNodes: string[]; // different for lite/full/heavy
let cache: BodyResult | null = null;
let padding: [number, number][] = [[0, 0], [0, 0], [0, 0], [0, 0]];
let lastTime = 0;

export async function loadDetect(config: Config): Promise<GraphModel> {
  if (env.initial) models[0] = null;
  if (!models[0] && config.body.detector?.modelPath || '') {
    models[0] = await tf.loadGraphModel(join(config.modelBasePath, config.body.detector?.modelPath || '')) as unknown as GraphModel;
    const inputs = Object.values(models[0].modelSignature['inputs']);
    inputSize[0][0] = Array.isArray(inputs) ? parseInt(inputs[0].tensorShape.dim[1].size) : 0;
    inputSize[0][1] = Array.isArray(inputs) ? parseInt(inputs[0].tensorShape.dim[2].size) : 0;
    if (!models[0] || !models[0]['modelUrl']) log('load model failed:', config.body.detector?.modelPath);
    else if (config.debug) log('load model:', models[0]['modelUrl']);
  } else if (config.debug && models[0]) log('cached model:', models[0]['modelUrl']);
  return models[0] as GraphModel;
}

export async function loadPose(config: Config): Promise<GraphModel> {
  if (env.initial) models[1] = null;
  if (!models[1]) {
    models[1] = await tf.loadGraphModel(join(config.modelBasePath, config.body.modelPath || '')) as unknown as GraphModel;
    const inputs = Object.values(models[1].modelSignature['inputs']);
    inputSize[1][0] = Array.isArray(inputs) ? parseInt(inputs[0].tensorShape.dim[1].size) : 0;
    inputSize[1][1] = Array.isArray(inputs) ? parseInt(inputs[0].tensorShape.dim[2].size) : 0;
    if (config.body.modelPath?.includes('lite')) outputNodes = ['ld_3d', 'output_segmentation', 'output_heatmap', 'world_3d', 'output_poseflag'];
    else outputNodes = ['Identity', 'Identity_2', 'Identity_3', 'Identity_4', 'Identity_1']; // v2 from pinto full and heavy
    if (!models[1] || !models[1]['modelUrl']) log('load model failed:', config.body.modelPath);
    else if (config.debug) log('load model:', models[1]['modelUrl']);
  } else if (config.debug) log('cached model:', models[1]['modelUrl']);
  return models[1];
}

export async function load(config: Config): Promise<[GraphModel | null, GraphModel | null]> {
  if (!models[0]) await loadDetect(config);
  if (!models[1]) await loadPose(config);
  return models;
}

function calculateBoxes(keypoints: Array<BodyKeypoint>, outputSize: [number, number]): { keypointsBox: Box, keypointsBoxRaw: Box } {
  const x = keypoints.map((a) => a.position[0]);
  const y = keypoints.map((a) => a.position[1]);
  const keypointsBox: Box = [Math.min(...x), Math.min(...y), Math.max(...x) - Math.min(...x), Math.max(...y) - Math.min(...y)];
  const keypointsBoxRaw: Box = [keypointsBox[0] / outputSize[0], keypointsBox[1] / outputSize[1], keypointsBox[2] / outputSize[0], keypointsBox[3] / outputSize[1]];
  return { keypointsBox, keypointsBoxRaw };
}

async function prepareImage(input: Tensor): Promise<Tensor> {
  const t: Record<string, Tensor> = {};
  if (!input.shape || !input.shape[1] || !input.shape[2]) return input;
  let final: Tensor;
  if (input.shape[1] !== input.shape[2]) { // only pad if width different than height
    padding = [
      [0, 0], // dont touch batch
      [input.shape[2] > input.shape[1] ? Math.trunc((input.shape[2] - input.shape[1]) / 2) : 0, input.shape[2] > input.shape[1] ? Math.trunc((input.shape[2] - input.shape[1]) / 2) : 0], // height before&after
      [input.shape[1] > input.shape[2] ? Math.trunc((input.shape[1] - input.shape[2]) / 2) : 0, input.shape[1] > input.shape[2] ? Math.trunc((input.shape[1] - input.shape[2]) / 2) : 0], // width before&after
      [0, 0], // dont touch rbg
    ];
    t.pad = tf.pad(input, padding);
    t.resize = tf.image.resizeBilinear(t.pad, [inputSize[1][0], inputSize[1][1]]);
    final = tf.div(t.resize, constants.tf255);
  } else if (input.shape[1] !== inputSize[1][0]) { // if input needs resizing
    t.resize = tf.image.resizeBilinear(input, [inputSize[1][0], inputSize[1][1]]);
    final = tf.div(t.resize, constants.tf255);
  } else { // if input is already in a correct resolution just normalize it
    final = tf.div(input, constants.tf255);
  }
  Object.keys(t).forEach((tensor) => tf.dispose(t[tensor]));
  return final;
}

function rescaleKeypoints(keypoints: Array<BodyKeypoint>, outputSize: [number, number]): Array<BodyKeypoint> {
  for (const kpt of keypoints) {
    kpt.position = [
      kpt.position[0] * (outputSize[0] + padding[2][0] + padding[2][1]) / outputSize[0] - padding[2][0],
      kpt.position[1] * (outputSize[1] + padding[1][0] + padding[1][1]) / outputSize[1] - padding[1][0],
      kpt.position[2] as number,
    ];
    kpt.positionRaw = [
      kpt.position[0] / outputSize[0], kpt.position[1] / outputSize[1], kpt.position[2] as number,
    ];
  }
  return keypoints;
}

const sigmoid = (x) => (1 - (1 / (1 + Math.exp(x))));

async function detectParts(input: Tensor, config: Config, outputSize: [number, number]): Promise<BodyResult | null> {
  const t: Record<string, Tensor> = {};
  t.input = await prepareImage(input);
  /**
   * t.ld: 39 keypoints [x,y,z,score,presence] normalized to input size
   * t.segmentation:
   * t.heatmap:
   * t.world: 39 keypoints [x,y,z] normalized to -1..1
   * t.poseflag: body score
   */
  [t.ld/* 1,195(39*5) */, t.segmentation/* 1,256,256,1 */, t.heatmap/* 1,64,64,39 */, t.world/* 1,117(39*3) */, t.poseflag/* 1,1 */] = models[1]?.execute(t.input, outputNodes) as Tensor[]; // run model
  const poseScoreRaw = (await t.poseflag.data())[0];
  const poseScore = Math.max(0, (poseScoreRaw - 0.8) / (1 - 0.8)); // blow up score variance 5x
  const points = await t.ld.data();
  const keypointsRelative: Array<BodyKeypoint> = [];
  const depth = 5; // each points has x,y,z,visibility,presence
  for (let i = 0; i < points.length / depth; i++) {
    const score = sigmoid(points[depth * i + 3]);
    const presence = sigmoid(points[depth * i + 4]);
    const adjScore = Math.trunc(100 * score * presence * poseScore) / 100;
    const positionRaw: Point = [points[depth * i + 0] / inputSize[1][0], points[depth * i + 1] / inputSize[1][1], points[depth * i + 2] + 0];
    const position: Point = [Math.trunc(outputSize[0] * positionRaw[0]), Math.trunc(outputSize[1] * positionRaw[1]), positionRaw[2] as number];
    keypointsRelative.push({ part: coords.kpt[i], positionRaw, position, score: adjScore });
  }
  if (poseScore < (config.body.minConfidence || 0)) return null;
  const keypoints: Array<BodyKeypoint> = rescaleKeypoints(keypointsRelative, outputSize); // keypoints were relative to input image which is cropped
  const boxes = calculateBoxes(keypoints, [outputSize[0], outputSize[1]]); // now find boxes based on rescaled keypoints
  Object.keys(t).forEach((tensor) => tf.dispose(t[tensor]));
  const annotations: Record<string, Point[][]> = {};
  for (const [name, indexes] of Object.entries(coords.connected)) {
    const pt: Array<Point[]> = [];
    for (let i = 0; i < indexes.length - 1; i++) {
      const pt0 = keypoints.find((kpt) => kpt.part === indexes[i]);
      const pt1 = keypoints.find((kpt) => kpt.part === indexes[i + 1]);
      // if (pt0 && pt1 && pt0.score > (config.body.minConfidence || 0) && pt1.score > (config.body.minConfidence || 0)) pt.push([pt0.position, pt1.position]);
      if (pt0 && pt1) pt.push([pt0.position, pt1.position]);
    }
    annotations[name] = pt;
  }
  const body = { id: 0, score: Math.trunc(100 * poseScore) / 100, box: boxes.keypointsBox, boxRaw: boxes.keypointsBoxRaw, keypoints, annotations };
  return body;
}

export async function predict(input: Tensor, config: Config): Promise<BodyResult[]> {
  const outputSize: [number, number] = [input.shape[2] || 0, input.shape[1] || 0];
  const skipTime = (config.body.skipTime || 0) > (now() - lastTime);
  const skipFrame = skipped < (config.body.skipFrames || 0);
  if (config.skipAllowed && skipTime && skipFrame && cache !== null) {
    skipped++;
  } else {
    cache = await detectParts(input, config, outputSize);
    lastTime = now();
    skipped = 0;
  }
  if (cache) return [cache];
  return [];
}
