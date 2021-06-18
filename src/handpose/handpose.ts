/**
 * HandPose module entry point
 */

import { log, join } from '../helpers';
import * as tf from '../../dist/tfjs.esm.js';
import * as handdetector from './handdetector';
import * as handpipeline from './handpipeline';
import { Hand } from '../result';
import { Tensor, GraphModel } from '../tfjs/types';
import { Config } from '../config';

const meshAnnotations = {
  thumb: [1, 2, 3, 4],
  indexFinger: [5, 6, 7, 8],
  middleFinger: [9, 10, 11, 12],
  ringFinger: [13, 14, 15, 16],
  pinky: [17, 18, 19, 20],
  palmBase: [0],
};

let handDetectorModel: GraphModel | null;
let handPoseModel: GraphModel | null;
let handPipeline: handpipeline.HandPipeline;

export async function predict(input: Tensor, config: Config): Promise<Hand[]> {
  const predictions = await handPipeline.estimateHands(input, config);
  if (!predictions) return [];
  const hands: Array<Hand> = [];
  for (let i = 0; i < predictions.length; i++) {
    const annotations = {};
    if (predictions[i].landmarks) {
      for (const key of Object.keys(meshAnnotations)) {
        // @ts-ignore landmarks are not undefined
        annotations[key] = meshAnnotations[key].map((index) => predictions[i].landmarks[index]);
      }
    }

    const keypoints = predictions[i].landmarks as unknown as Array<[number, number, number]>;

    let box: [number, number, number, number] = [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 0, 0]; // maximums so conditionals work
    let boxRaw: [number, number, number, number] = [0, 0, 0, 0];
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
    hands.push({ id: i, score: Math.round(100 * predictions[i].confidence) / 100, box, boxRaw, keypoints, annotations });
  }
  return hands;
}

export async function load(config: Config): Promise<[GraphModel | null, GraphModel | null]> {
  if (!handDetectorModel || !handPoseModel) {
    // @ts-ignore type mismatch on GraphModel
    [handDetectorModel, handPoseModel] = await Promise.all([
      config.hand.enabled ? tf.loadGraphModel(join(config.modelBasePath, config.hand.detector.modelPath), { fromTFHub: config.hand.detector.modelPath.includes('tfhub.dev') }) : null,
      config.hand.landmarks ? tf.loadGraphModel(join(config.modelBasePath, config.hand.skeleton.modelPath), { fromTFHub: config.hand.skeleton.modelPath.includes('tfhub.dev') }) : null,
    ]);
    if (config.hand.enabled) {
      if (!handDetectorModel || !handDetectorModel['modelUrl']) log('load model failed:', config.hand.detector.modelPath);
      else if (config.debug) log('load model:', handDetectorModel['modelUrl']);
      if (!handPoseModel || !handPoseModel['modelUrl']) log('load model failed:', config.hand.skeleton.modelPath);
      else if (config.debug) log('load model:', handPoseModel['modelUrl']);
    }
  } else {
    if (config.debug) log('cached model:', handDetectorModel['modelUrl']);
    if (config.debug) log('cached model:', handPoseModel['modelUrl']);
  }
  const handDetector = new handdetector.HandDetector(handDetectorModel);
  handPipeline = new handpipeline.HandPipeline(handDetector, handPoseModel);
  return [handDetectorModel, handPoseModel];
}
