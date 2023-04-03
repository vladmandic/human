/**
 * BlazePose model implementation
 */

import * as tf from 'dist/tfjs.esm.js';
import { loadModel } from '../tfjs/load';
import { constants } from '../tfjs/constants';
import { log, now } from '../util/util';
import type { BodyKeypoint, BodyResult, BodyLandmark, Box, Point, BodyAnnotation } from '../result';
import type { GraphModel, Tensor, Tensor4D } from '../tfjs/types';
import type { Config } from '../config';
import * as coords from './blazeposecoords';
import { loadDetector, detectBoxes, DetectedBox } from './blazeposedetector';
import * as box from '../util/box';
import { env } from '../util/env';

// const models: [GraphModel | null, GraphModel | null] = [null, null];
let model: GraphModel | null;
let inputSize = 256;
let skipped = Number.MAX_SAFE_INTEGER;
const outputNodes: { detector: string[], landmarks: string[] } = {
  landmarks: ['ld_3d', 'activation_segmentation', 'activation_heatmap', 'world_3d', 'output_poseflag'],
  detector: [],
};

const cache: BodyResult[] = [];
let padding: [number, number][] = [[0, 0], [0, 0], [0, 0], [0, 0]];
let lastTime = 0;

const sigmoid = (x) => (1 - (1 / (1 + Math.exp(x))));

export const loadDetect = (config: Config): Promise<GraphModel> => loadDetector(config);

export async function loadPose(config: Config): Promise<GraphModel> {
  if (env.initial) model = null;
  if (!model) {
    model = await loadModel(config.body.modelPath);
    const inputs = model?.['executor'] ? Object.values(model.modelSignature['inputs']) : undefined;
    // @ts-ignore model signature properties are not typed and inputs are unreliable for this model
    inputSize = Array.isArray(inputs) ? parseInt(inputs[0].tensorShape.dim[1].size) : 0;
  } else if (config.debug) log('cached model:', model['modelUrl']);
  return model;
}

function prepareImage(input: Tensor4D, size: number, cropBox?: Box): Tensor {
  const t: Record<string, Tensor> = {};
  if (!input?.shape?.[1] || !input?.shape?.[2]) return input;
  let final: Tensor;
  if (cropBox) {
    t.cropped = tf.image.cropAndResize(input, [cropBox], [0], [input.shape[1], input.shape[2]]); // if we have cached box use it to crop input
  }
  if (input.shape[1] !== input.shape[2]) { // only pad if width different than height
    const height: [number, number] = [
      input.shape[2] > input.shape[1] ? Math.trunc((input.shape[2] - input.shape[1]) / 2) : 0,
      input.shape[2] > input.shape[1] ? Math.trunc((input.shape[2] - input.shape[1]) / 2) : 0,
    ];
    const width: [number, number] = [
      input.shape[1] > input.shape[2] ? Math.trunc((input.shape[1] - input.shape[2]) / 2) : 0,
      input.shape[1] > input.shape[2] ? Math.trunc((input.shape[1] - input.shape[2]) / 2) : 0,
    ];
    padding = [
      [0, 0], // dont touch batch
      height, // height before&after
      width, // width before&after
      [0, 0], // dont touch rbg
    ];
    t.pad = tf.pad(t.cropped || input, padding); // use cropped box if it exists
    t.resize = tf.image.resizeBilinear(t.pad as Tensor4D, [size, size]);
    final = tf.div(t.resize, constants.tf255);
  } else if (input.shape[1] !== size) { // if input needs resizing
    t.resize = tf.image.resizeBilinear(t.cropped as Tensor4D || input, [size, size]);
    final = tf.div(t.resize, constants.tf255);
  } else { // if input is already in a correct resolution just normalize it
    final = tf.div(t.cropped || input, constants.tf255);
  }
  Object.keys(t).forEach((tensor) => tf.dispose(t[tensor]));
  return final;
}

function rescaleKeypoints(keypoints: BodyKeypoint[], outputSize: [number, number], cropBox?: Box): BodyKeypoint[] {
  for (const kpt of keypoints) { // first rescale due to padding
    kpt.position = [
      Math.trunc(kpt.position[0] * (outputSize[0] + padding[2][0] + padding[2][1]) / outputSize[0] - padding[2][0]),
      Math.trunc(kpt.position[1] * (outputSize[1] + padding[1][0] + padding[1][1]) / outputSize[1] - padding[1][0]),
      kpt.position[2] as number,
    ];
    kpt.positionRaw = [kpt.position[0] / outputSize[0], kpt.position[1] / outputSize[1], 2 * (kpt.position[2] as number) / (outputSize[0] + outputSize[1])];
  }
  if (cropBox) { // second rescale due to cropping
    const width = cropBox[2] - cropBox[0];
    const height = cropBox[3] - cropBox[1];
    for (const kpt of keypoints) {
      kpt.positionRaw = [
        kpt.positionRaw[0] / height + cropBox[1], // correct offset due to crop
        kpt.positionRaw[1] / width + cropBox[0], // correct offset due to crop
        kpt.positionRaw[2] as number,
      ];
      kpt.position = [
        Math.trunc(kpt.positionRaw[0] * outputSize[0]),
        Math.trunc(kpt.positionRaw[1] * outputSize[1]),
        kpt.positionRaw[2] as number,
      ];
    }
  }
  return keypoints;
}

function fixKeypoints(keypoints: BodyKeypoint[]) {
  // palm z-coord is incorrect around near-zero so we approximate it
  const leftPalm = keypoints.find((k) => k.part === 'leftPalm') as BodyKeypoint;
  const leftWrist = keypoints.find((k) => k.part === 'leftWrist') as BodyKeypoint;
  const leftIndex = keypoints.find((k) => k.part === 'leftIndex') as BodyKeypoint;
  leftPalm.position[2] = ((leftWrist.position[2] || 0) + (leftIndex.position[2] || 0)) / 2;
  const rightPalm = keypoints.find((k) => k.part === 'rightPalm') as BodyKeypoint;
  const rightWrist = keypoints.find((k) => k.part === 'rightWrist') as BodyKeypoint;
  const rightIndex = keypoints.find((k) => k.part === 'rightIndex') as BodyKeypoint;
  rightPalm.position[2] = ((rightWrist.position[2] || 0) + (rightIndex.position[2] || 0)) / 2;
}

async function detectLandmarks(input: Tensor, config: Config, outputSize: [number, number]): Promise<BodyResult | null> {
  /**
   * t.ld: 39 keypoints [x,y,z,score,presence] normalized to input size
   * t.segmentation:
   * t.heatmap:
   * t.world: 39 keypoints [x,y,z] normalized to -1..1
   * t.poseflag: body score
  */
  if (!model?.['executor']) return null;
  const t: Record<string, Tensor> = {};
  [t.ld/* 1,195(39*5) */, t.segmentation/* 1,256,256,1 */, t.heatmap/* 1,64,64,39 */, t.world/* 1,117(39*3) */, t.poseflag/* 1,1 */] = model?.execute(input, outputNodes.landmarks) as Tensor[]; // run model
  const poseScore = (await t.poseflag.data())[0];
  const points = await t.ld.data();
  const distances = await t.world.data();
  Object.keys(t).forEach((tensor) => tf.dispose(t[tensor])); // dont need tensors after this
  const keypointsRelative: BodyKeypoint[] = [];
  const depth = 5; // each points has x,y,z,visibility,presence
  for (let i = 0; i < points.length / depth; i++) {
    const score = sigmoid(points[depth * i + 3]);
    const presence = sigmoid(points[depth * i + 4]);
    const adjScore = Math.trunc(100 * score * presence * poseScore) / 100;
    const positionRaw: Point = [points[depth * i + 0] / inputSize, points[depth * i + 1] / inputSize, points[depth * i + 2] + 0];
    const position: Point = [Math.trunc(outputSize[0] * positionRaw[0]), Math.trunc(outputSize[1] * positionRaw[1]), positionRaw[2] as number];
    const distance: Point = [distances[depth * i + 0], distances[depth * i + 1], distances[depth * i + 2] + 0];
    keypointsRelative.push({ part: coords.kpt[i] as BodyLandmark, positionRaw, position, distance, score: adjScore });
  }
  if (poseScore < (config.body.minConfidence || 0)) return null;
  fixKeypoints(keypointsRelative);
  const keypoints: BodyKeypoint[] = rescaleKeypoints(keypointsRelative, outputSize); // keypoints were relative to input image which is padded
  const kpts = keypoints.map((k) => k.position);
  const boxes = box.calc(kpts, [outputSize[0], outputSize[1]]); // now find boxes based on rescaled keypoints
  const annotations: Record<BodyAnnotation, Point[][]> = {} as Record<BodyAnnotation, Point[][]>;
  for (const [name, indexes] of Object.entries(coords.connected)) {
    const pt: Point[][] = [];
    for (let i = 0; i < indexes.length - 1; i++) {
      const pt0 = keypoints.find((kpt) => kpt.part === indexes[i]);
      const pt1 = keypoints.find((kpt) => kpt.part === indexes[i + 1]);
      if (pt0 && pt1) pt.push([pt0.position, pt1.position]);
    }
    annotations[name] = pt;
  }
  const body = { id: 0, score: Math.trunc(100 * poseScore) / 100, box: boxes.box, boxRaw: boxes.boxRaw, keypoints, annotations };
  return body;
}

export async function predict(input: Tensor4D, config: Config): Promise<BodyResult[]> {
  const outputSize: [number, number] = [input.shape[2] || 0, input.shape[1] || 0];
  const skipTime = (config.body.skipTime || 0) > (now() - lastTime);
  const skipFrame = skipped < (config.body.skipFrames || 0);
  if (config.skipAllowed && skipTime && skipFrame && cache !== null) {
    skipped++;
  } else {
    let boxes: DetectedBox[] = [];
    if (config.body?.['detector']?.['enabled']) {
      const preparedImage = prepareImage(input, 224);
      boxes = await detectBoxes(preparedImage, config, outputSize);
      tf.dispose(preparedImage);
    } else {
      boxes = [{ box: [0, 0, 0, 0] as Box, boxRaw: [0, 0, 1, 1], score: 0 }]; // running without detector
    }
    for (let i = 0; i < boxes.length; i++) {
      const preparedBox = prepareImage(input, 256, boxes[i]?.boxRaw); // padded and resized
      cache.length = 0;
      const bodyResult = await detectLandmarks(preparedBox, config, outputSize);
      tf.dispose(preparedBox);
      if (!bodyResult) continue;
      bodyResult.id = i;
      // bodyResult.score = 0; // TBD
      cache.push(bodyResult);
    }
    /*
    cropBox = [0, 0, 1, 1]; // reset crop coordinates
    if (cache?.boxRaw && config.skipAllowed) {
      const cx = (2.0 * cache.boxRaw[0] + cache.boxRaw[2]) / 2;
      const cy = (2.0 * cache.boxRaw[1] + cache.boxRaw[3]) / 2;
      let size = cache.boxRaw[2] > cache.boxRaw[3] ? cache.boxRaw[2] : cache.boxRaw[3];
      size = (size * 1.0) / 2; // enlarge and half it
      if (cx > 0.1 && cx < 0.9 && cy > 0.1 && cy < 0.9 && size > 0.1) { // only update if box is sane
        const y = 0; // cy - size;
        const x = cx - size;
        cropBox = [y, x, y + 1, x + 1]; // [y0,x0,y1,x1] used for cropping but width/height are not yet implemented so we only reposition image to center of body
      }
    }
    */
    lastTime = now();
    skipped = 0;
  }
  return cache;
}
