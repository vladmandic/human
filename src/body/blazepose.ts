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
import * as detect from './blazeposedetector';

interface DetectedBox { box: Box, boxRaw: Box, score: number }

const env = { initial: true };
// const models: [GraphModel | null, GraphModel | null] = [null, null];
const models: { detector: GraphModel | null, landmarks: GraphModel | null } = { detector: null, landmarks: null };
const inputSize: { detector: [number, number], landmarks: [number, number] } = { detector: [224, 224], landmarks: [256, 256] };
let skipped = Number.MAX_SAFE_INTEGER;
const outputNodes: { detector: string[], landmarks: string[] } = {
  landmarks: ['ld_3d', 'activation_segmentation', 'activation_heatmap', 'world_3d', 'output_poseflag'],
  detector: [],
};

let cache: BodyResult | null = null;
let lastBox: Box | undefined;
let padding: [number, number][] = [[0, 0], [0, 0], [0, 0], [0, 0]];
let lastTime = 0;

const sigmoid = (x) => (1 - (1 / (1 + Math.exp(x))));

export async function loadDetect(config: Config): Promise<GraphModel> {
  if (env.initial) models.detector = null;
  if (!models.detector && config.body['detector'] && config.body['detector']['modelPath'] || '') {
    models.detector = await tf.loadGraphModel(join(config.modelBasePath, config.body['detector']['modelPath'] || '')) as unknown as GraphModel;
    const inputs = Object.values(models.detector.modelSignature['inputs']);
    inputSize.detector[0] = Array.isArray(inputs) ? parseInt(inputs[0].tensorShape.dim[1].size) : 0;
    inputSize.detector[1] = Array.isArray(inputs) ? parseInt(inputs[0].tensorShape.dim[2].size) : 0;
    if (!models.detector || !models.detector['modelUrl']) log('load model failed:', config.body['detector']['modelPath']);
    else if (config.debug) log('load model:', models.detector['modelUrl']);
  } else if (config.debug && models.detector) log('cached model:', models.detector['modelUrl']);
  await detect.createAnchors();
  return models.detector as GraphModel;
}

export async function loadPose(config: Config): Promise<GraphModel> {
  if (env.initial) models.landmarks = null;
  if (!models.landmarks) {
    models.landmarks = await tf.loadGraphModel(join(config.modelBasePath, config.body.modelPath || '')) as unknown as GraphModel;
    const inputs = Object.values(models.landmarks.modelSignature['inputs']);
    inputSize.landmarks[0] = Array.isArray(inputs) ? parseInt(inputs[0].tensorShape.dim[1].size) : 0;
    inputSize.landmarks[1] = Array.isArray(inputs) ? parseInt(inputs[0].tensorShape.dim[2].size) : 0;
    if (!models.landmarks || !models.landmarks['modelUrl']) log('load model failed:', config.body.modelPath);
    else if (config.debug) log('load model:', models.landmarks['modelUrl']);
  } else if (config.debug) log('cached model:', models.landmarks['modelUrl']);
  return models.landmarks;
}

export async function load(config: Config): Promise<[GraphModel | null, GraphModel | null]> {
  if (!models.detector) await loadDetect(config);
  if (!models.landmarks) await loadPose(config);
  return [models.detector, models.landmarks];
}

function calculateBoxes(keypoints: Array<BodyKeypoint>, outputSize: [number, number]): { keypointsBox: Box, keypointsBoxRaw: Box } {
  const x = keypoints.map((a) => a.position[0]);
  const y = keypoints.map((a) => a.position[1]);
  const keypointsBox: Box = [Math.min(...x), Math.min(...y), Math.max(...x) - Math.min(...x), Math.max(...y) - Math.min(...y)];
  const keypointsBoxRaw: Box = [keypointsBox[0] / outputSize[0], keypointsBox[1] / outputSize[1], keypointsBox[2] / outputSize[0], keypointsBox[3] / outputSize[1]];
  return { keypointsBox, keypointsBoxRaw };
}

async function prepareImage(input: Tensor, size: number, box?: Box): Promise<Tensor> {
  const t: Record<string, Tensor> = {};
  if (!input.shape || !input.shape[1] || !input.shape[2]) return input;
  let final: Tensor;
  if (input.shape[1] !== input.shape[2]) { // only pad if width different than height
    const height: [number, number] = box
      ? [Math.trunc(input.shape[1] * box[1]), Math.trunc(input.shape[1] * (box[1] + box[3]))]
      : [input.shape[2] > input.shape[1] ? Math.trunc((input.shape[2] - input.shape[1]) / 2) : 0, input.shape[2] > input.shape[1] ? Math.trunc((input.shape[2] - input.shape[1]) / 2) : 0];
    const width: [number, number] = box
      ? [Math.trunc(input.shape[2] * box[0]), Math.trunc(input.shape[2] * (box[0] + box[2]))]
      : [input.shape[1] > input.shape[2] ? Math.trunc((input.shape[1] - input.shape[2]) / 2) : 0, input.shape[1] > input.shape[2] ? Math.trunc((input.shape[1] - input.shape[2]) / 2) : 0];
    padding = [
      [0, 0], // dont touch batch
      height, // height before&after
      width, // width before&after
      [0, 0], // dont touch rbg
    ];
    if (box) {
      t.resize = tf.image.cropAndResize(input, [box], [0], [size, size]);
    } else {
      t.pad = tf.pad(input, padding);
      t.resize = tf.image.resizeBilinear(t.pad, [size, size]);
    }
    final = tf.div(t.resize, constants.tf255);
  } else if (input.shape[1] !== size) { // if input needs resizing
    t.resize = tf.image.resizeBilinear(input, [size, size]);
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
      Math.trunc(kpt.position[0] * (outputSize[0] + padding[2][0] + padding[2][1]) / outputSize[0] - padding[2][0]),
      Math.trunc(kpt.position[1] * (outputSize[1] + padding[1][0] + padding[1][1]) / outputSize[1] - padding[1][0]),
      kpt.position[2] as number,
    ];
    kpt.positionRaw = [kpt.position[0] / outputSize[0], kpt.position[1] / outputSize[1], kpt.position[2] as number];
  }
  return keypoints;
}

function rescaleBoxes(boxes: Array<DetectedBox>, outputSize: [number, number]): Array<DetectedBox> {
  for (const box of boxes) {
    box.box = [
      Math.trunc(box.box[0] * (outputSize[0] + padding[2][0] + padding[2][1]) / outputSize[0]),
      Math.trunc(box.box[1] * (outputSize[1] + padding[1][0] + padding[1][1]) / outputSize[1]),
      Math.trunc(box.box[2] * (outputSize[0] + padding[2][0] + padding[2][1]) / outputSize[0]),
      Math.trunc(box.box[3] * (outputSize[1] + padding[1][0] + padding[1][1]) / outputSize[1]),
    ];
    box.boxRaw = [box.box[0] / outputSize[0], box.box[1] / outputSize[1], box.box[2] / outputSize[0], box.box[3] / outputSize[1]];
  }
  return boxes;
}

async function detectLandmarks(input: Tensor, config: Config, outputSize: [number, number]): Promise<BodyResult | null> {
  /**
   * t.ld: 39 keypoints [x,y,z,score,presence] normalized to input size
   * t.segmentation:
   * t.heatmap:
   * t.world: 39 keypoints [x,y,z] normalized to -1..1
   * t.poseflag: body score
  */
  const t: Record<string, Tensor> = {};
  [t.ld/* 1,195(39*5) */, t.segmentation/* 1,256,256,1 */, t.heatmap/* 1,64,64,39 */, t.world/* 1,117(39*3) */, t.poseflag/* 1,1 */] = models.landmarks?.execute(input, outputNodes.landmarks) as Tensor[]; // run model
  const poseScore = (await t.poseflag.data())[0];
  const points = await t.ld.data();
  Object.keys(t).forEach((tensor) => tf.dispose(t[tensor])); // dont need tensors after this
  const keypointsRelative: Array<BodyKeypoint> = [];
  const depth = 5; // each points has x,y,z,visibility,presence
  for (let i = 0; i < points.length / depth; i++) {
    const score = sigmoid(points[depth * i + 3]);
    const presence = sigmoid(points[depth * i + 4]);
    const adjScore = Math.trunc(100 * score * presence * poseScore) / 100;
    const positionRaw: Point = [points[depth * i + 0] / inputSize.landmarks[0], points[depth * i + 1] / inputSize.landmarks[1], points[depth * i + 2] + 0];
    const position: Point = [Math.trunc(outputSize[0] * positionRaw[0]), Math.trunc(outputSize[1] * positionRaw[1]), positionRaw[2] as number];
    keypointsRelative.push({ part: coords.kpt[i], positionRaw, position, score: adjScore });
  }
  if (poseScore < (config.body.minConfidence || 0)) return null;
  const keypoints: Array<BodyKeypoint> = rescaleKeypoints(keypointsRelative, outputSize); // keypoints were relative to input image which is padded
  const boxes = calculateBoxes(keypoints, [outputSize[0], outputSize[1]]); // now find boxes based on rescaled keypoints
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

async function detectBoxes(input: Tensor, config: Config, outputSize: [number, number]) {
  const t: Record<string, Tensor> = {};
  t.res = models.detector?.execute(input, ['Identity']) as Tensor; //
  t.logitsRaw = tf.slice(t.res, [0, 0, 0], [1, -1, 1]);
  t.boxesRaw = tf.slice(t.res, [0, 0, 1], [1, -1, -1]);
  t.logits = tf.squeeze(t.logitsRaw);
  t.boxes = tf.squeeze(t.boxesRaw);
  const boxes = await detect.decode(t.boxes, t.logits, config, outputSize);
  rescaleBoxes(boxes, outputSize);
  Object.keys(t).forEach((tensor) => tf.dispose(t[tensor]));
  return boxes;
}

export async function predict(input: Tensor, config: Config): Promise<BodyResult[]> {
  const outputSize: [number, number] = [input.shape[2] || 0, input.shape[1] || 0];
  const skipTime = (config.body.skipTime || 0) > (now() - lastTime);
  const skipFrame = skipped < (config.body.skipFrames || 0);
  if (config.skipAllowed && skipTime && skipFrame && cache !== null) {
    skipped++;
  } else {
    const t: Record<string, Tensor> = {};
    if (config.body['detector'] && config.body['detector']['enabled']) {
      t.detector = await prepareImage(input, 224);
      const boxes = await detectBoxes(t.detector, config, outputSize);
      if (boxes && boxes.length === 1) {
        t.landmarks = await prepareImage(input, 256, boxes[0].box); // padded and resized according to detector
        cache = await detectLandmarks(t.landmarks, config, outputSize);
      }
      if (cache) cache.score = boxes[0].score;
    } else {
      t.landmarks = await prepareImage(input, 256, lastBox); // padded and resized
      cache = await detectLandmarks(t.landmarks, config, outputSize);
      /*
      lastBox = undefined;
      if (cache?.box) {
        const cx = cache.boxRaw[0] + (cache.boxRaw[2] / 2);
        const cy = cache.boxRaw[1] + (cache.boxRaw[3] / 2);
        let size = cache.boxRaw[2] > cache.boxRaw[3] ? cache.boxRaw[2] : cache.boxRaw[3];
        size = (size * 1.2) / 2; // enlarge and half it
        lastBox = [cx - size, cy - size, 2 * size, 2 * size];
      }
      */
    }
    Object.keys(t).forEach((tensor) => tf.dispose(t[tensor]));
    // if (cache && boxes.length > 0) cache.box = boxes[0].box;
    lastTime = now();
    skipped = 0;
  }
  if (cache) return [cache];
  return [];
}
