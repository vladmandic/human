import { log, join } from '../helpers';
import * as tf from '../../dist/tfjs.esm.js';
import * as handdetector from './handdetector';
import * as handpipeline from './handpipeline';
import { Hand } from '../result';

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

export async function predict(input, config): Promise<Hand[]> {
  const predictions = await handPipeline.estimateHands(input, config);
  if (!predictions) return [];
  const hands: Array<Hand> = [];
  for (let i = 0; i < predictions.length; i++) {
    const annotations = {};
    if (predictions[i].landmarks) {
      for (const key of Object.keys(meshAnnotations)) {
        annotations[key] = meshAnnotations[key].map((index) => predictions[i].landmarks[index]);
      }
    }
    const box: [number, number, number, number] = predictions[i].box ? [
      Math.max(0, predictions[i].box.topLeft[0]),
      Math.max(0, predictions[i].box.topLeft[1]),
      Math.min(input.shape[2], predictions[i].box.bottomRight[0]) - Math.max(0, predictions[i].box.topLeft[0]),
      Math.min(input.shape[1], predictions[i].box.bottomRight[1]) - Math.max(0, predictions[i].box.topLeft[1]),
    ] : [0, 0, 0, 0];
    const boxRaw: [number, number, number, number] = [
      (predictions[i].box.topLeft[0]) / input.shape[2],
      (predictions[i].box.topLeft[1]) / input.shape[1],
      (predictions[i].box.bottomRight[0] - predictions[i].box.topLeft[0]) / input.shape[2],
      (predictions[i].box.bottomRight[1] - predictions[i].box.topLeft[1]) / input.shape[1],
    ];
    hands.push({ id: i, confidence: Math.round(100 * predictions[i].confidence) / 100, box, boxRaw, landmarks: predictions[i].landmarks, annotations });
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
