import { log, join } from '../helpers';
import * as tf from '../../dist/tfjs.esm.js';
import * as handdetector from './handdetector';
import * as handpipeline from './handpipeline';

const meshAnnotations = {
  thumb: [1, 2, 3, 4],
  indexFinger: [5, 6, 7, 8],
  middleFinger: [9, 10, 11, 12],
  ringFinger: [13, 14, 15, 16],
  pinky: [17, 18, 19, 20],
  palmBase: [0],
};

let handDetectorModel;
let handPoseModel;
let handPipeline;

export async function predict(input, config) {
  const predictions = await handPipeline.estimateHands(input, config);
  if (!predictions) return [];
  const hands: Array<{ confidence: number, box: any, boxRaw: any, landmarks: any, annotations: any }> = [];
  for (const prediction of predictions) {
    const annotations = {};
    if (prediction.landmarks) {
      for (const key of Object.keys(meshAnnotations)) {
        annotations[key] = meshAnnotations[key].map((index) => prediction.landmarks[index]);
      }
    }
    const box = prediction.box ? [
      Math.max(0, prediction.box.topLeft[0]),
      Math.max(0, prediction.box.topLeft[1]),
      Math.min(input.shape[2], prediction.box.bottomRight[0]) - Math.max(0, prediction.box.topLeft[0]),
      Math.min(input.shape[1], prediction.box.bottomRight[1]) - Math.max(0, prediction.box.topLeft[1]),
    ] : [];
    const boxRaw = [
      (prediction.box.topLeft[0]) / input.shape[2],
      (prediction.box.topLeft[1]) / input.shape[1],
      (prediction.box.bottomRight[0] - prediction.box.topLeft[0]) / input.shape[2],
      (prediction.box.bottomRight[1] - prediction.box.topLeft[1]) / input.shape[1],
    ];
    hands.push({ confidence: Math.round(100 * prediction.confidence) / 100, box, boxRaw, landmarks: prediction.landmarks, annotations });
  }
  return hands;
}

export async function load(config): Promise<[Object, Object]> {
  if (!handDetectorModel || !handPoseModel) {
    [handDetectorModel, handPoseModel] = await Promise.all([
      config.hand.enabled ? tf.loadGraphModel(join(config.modelBasePath, config.hand.detector.modelPath), { fromTFHub: config.hand.detector.modelPath.includes('tfhub.dev') }) : null,
      config.hand.landmarks ? tf.loadGraphModel(join(config.modelBasePath, config.hand.skeleton.modelPath), { fromTFHub: config.hand.skeleton.modelPath.includes('tfhub.dev') }) : null,
    ]);
    if (config.hand.enabled) {
      if (!handDetectorModel || !handDetectorModel.modelUrl) log('load model failed:', config.hand.detector.modelPath);
      else if (config.debug) log('load model:', handDetectorModel.modelUrl);
      if (!handPoseModel || !handPoseModel.modelUrl) log('load model failed:', config.hand.skeleton.modelPath);
      else if (config.debug) log('load model:', handPoseModel.modelUrl);
    }
  } else {
    if (config.debug) log('cached model:', handDetectorModel.modelUrl);
    if (config.debug) log('cached model:', handPoseModel.modelUrl);
  }
  const handDetector = new handdetector.HandDetector(handDetectorModel);
  handPipeline = new handpipeline.HandPipeline(handDetector, handPoseModel);
  return [handDetectorModel, handPoseModel];
}
