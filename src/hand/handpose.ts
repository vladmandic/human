/**
 * HandPose model implementation
 *
 * Based on: [**MediaPipe HandPose**](https://drive.google.com/file/d/1sv4sSb9BSNVZhLzxXJ0jBv9DqD-4jnAz/view)
 */

import { log } from '../util/util';
import * as handdetector from './handposedetector';
import * as handpipeline from './handposepipeline';
import * as fingerPose from './fingerpose';
import { loadModel } from '../tfjs/load';
import type { HandResult, Box, Point } from '../result';
import type { Tensor, GraphModel } from '../tfjs/types';
import type { Config } from '../config';
import { env } from '../util/env';

const meshAnnotations = {
  thumb: [1, 2, 3, 4],
  index: [5, 6, 7, 8],
  middle: [9, 10, 11, 12],
  ring: [13, 14, 15, 16],
  pinky: [17, 18, 19, 20],
  palm: [0],
};

let handDetectorModel: GraphModel | null;
let handPoseModel: GraphModel | null;
let handPipeline: handpipeline.HandPipeline;

export async function predict(input: Tensor, config: Config): Promise<HandResult[]> {
  const predictions = await handPipeline.estimateHands(input, config);
  if (!predictions) return [];
  const hands: Array<HandResult> = [];
  for (let i = 0; i < predictions.length; i++) {
    const annotations = {};
    if (predictions[i].landmarks) {
      for (const key of Object.keys(meshAnnotations)) {
        annotations[key] = meshAnnotations[key].map((index) => predictions[i].landmarks[index]);
      }
    }
    const keypoints = predictions[i].landmarks as unknown as Array<Point>;
    let box: Box = [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 0, 0]; // maximums so conditionals work
    let boxRaw: Box = [0, 0, 0, 0];
    if (keypoints && keypoints.length > 0) { // if we have landmarks, calculate box based on landmarks
      for (const pt of keypoints) {
        if (pt[0] < box[0]) box[0] = pt[0];
        if (pt[1] < box[1]) box[1] = pt[1];
        if (pt[0] > box[2]) box[2] = pt[0];
        if (pt[1] > box[3]) box[3] = pt[1];
      }
      box[2] -= box[0];
      box[3] -= box[1];
      boxRaw = [box[0] / (input.shape[2] || 0), box[1] / (input.shape[1] || 0), box[2] / (input.shape[2] || 0), box[3] / (input.shape[1] || 0)];
    } else { // otherwise use box from prediction
      box = predictions[i].box ? [
        Math.trunc(Math.max(0, predictions[i].box.topLeft[0])),
        Math.trunc(Math.max(0, predictions[i].box.topLeft[1])),
        Math.trunc(Math.min((input.shape[2] || 0), predictions[i].box.bottomRight[0]) - Math.max(0, predictions[i].box.topLeft[0])),
        Math.trunc(Math.min((input.shape[1] || 0), predictions[i].box.bottomRight[1]) - Math.max(0, predictions[i].box.topLeft[1])),
      ] : [0, 0, 0, 0];
      boxRaw = [
        (predictions[i].box.topLeft[0]) / (input.shape[2] || 0),
        (predictions[i].box.topLeft[1]) / (input.shape[1] || 0),
        (predictions[i].box.bottomRight[0] - predictions[i].box.topLeft[0]) / (input.shape[2] || 0),
        (predictions[i].box.bottomRight[1] - predictions[i].box.topLeft[1]) / (input.shape[1] || 0),
      ];
    }
    const landmarks = fingerPose.analyze(keypoints);
    hands.push({
      id: i,
      score: Math.round(100 * predictions[i].confidence) / 100,
      boxScore: Math.round(100 * predictions[i].boxConfidence) / 100,
      fingerScore: Math.round(100 * predictions[i].fingerConfidence) / 100,
      label: 'hand',
      box,
      boxRaw,
      keypoints,
      annotations: annotations as HandResult['annotations'],
      landmarks: landmarks as HandResult['landmarks'],
    });
  }
  return hands;
}

export async function load(config: Config): Promise<[GraphModel | null, GraphModel | null]> {
  if (env.initial) {
    handDetectorModel = null;
    handPoseModel = null;
  }
  if (!handDetectorModel || !handPoseModel) {
    [handDetectorModel, handPoseModel] = await Promise.all([
      config.hand.enabled ? loadModel(config.hand.detector?.modelPath) : null,
      config.hand.landmarks ? loadModel(config.hand.skeleton?.modelPath) : null,
    ]);
  } else {
    if (config.debug) log('cached model:', handDetectorModel['modelUrl']);
    if (config.debug) log('cached model:', handPoseModel['modelUrl']);
  }
  const handDetector = new handdetector.HandDetector(handDetectorModel);
  handPipeline = new handpipeline.HandPipeline(handDetector, handPoseModel);
  return [handDetectorModel, handPoseModel];
}
