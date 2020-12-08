/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
// https://storage.googleapis.com/tfjs-models/demos/handpose/index.html

import { log } from '../log.js';
import * as tf from '../../dist/tfjs.esm.js';
import * as handdetector from './handdetector';
import * as pipeline from './handpipeline';
import * as anchors from './anchors';

const MESH_ANNOTATIONS = {
  thumb: [1, 2, 3, 4],
  indexFinger: [5, 6, 7, 8],
  middleFinger: [9, 10, 11, 12],
  ringFinger: [13, 14, 15, 16],
  pinky: [17, 18, 19, 20],
  palmBase: [0],
};

class HandPose {
  constructor(pipe) {
    this.pipeline = pipe;
  }

  static getAnnotations() {
    return MESH_ANNOTATIONS;
  }

  async estimateHands(input, config) {
    const predictions = await this.pipeline.estimateHands(input, config);
    if (!predictions) return [];
    const hands = [];
    for (const prediction of predictions) {
      const annotations = {};
      if (prediction.landmarks) {
        for (const key of Object.keys(MESH_ANNOTATIONS)) {
          annotations[key] = MESH_ANNOTATIONS[key].map((index) => prediction.landmarks[index]);
        }
      }
      const box = prediction.box ? [
        Math.max(0, prediction.box.topLeft[0]),
        Math.max(0, prediction.box.topLeft[1]),
        Math.min(input.shape[2], prediction.box.bottomRight[0]) - prediction.box.topLeft[0],
        Math.min(input.shape[1], prediction.box.bottomRight[1]) - prediction.box.topLeft[1],
      ] : 0;
      hands.push({
        confidence: prediction.confidence,
        box,
        landmarks: prediction.landmarks,
        annotations,
      });
    }
    return hands;
  }
}
exports.HandPose = HandPose;

async function load(config) {
  const [handDetectorModel, handPoseModel] = await Promise.all([
    config.hand.enabled ? tf.loadGraphModel(config.hand.detector.modelPath, { fromTFHub: config.hand.detector.modelPath.includes('tfhub.dev') }) : null,
    config.hand.landmarks ? tf.loadGraphModel(config.hand.skeleton.modelPath, { fromTFHub: config.hand.skeleton.modelPath.includes('tfhub.dev') }) : null,
  ]);
  const detector = new handdetector.HandDetector(handDetectorModel, config.hand.inputSize, anchors.anchors);
  const pipe = new pipeline.HandPipeline(detector, handPoseModel, config.hand.inputSize);
  const handpose = new HandPose(pipe);
  if (config.hand.enabled) log(`load model: ${config.hand.detector.modelPath.match(/\/(.*)\./)[1]}`);
  if (config.hand.landmarks) log(`load model: ${config.hand.skeleton.modelPath.match(/\/(.*)\./)[1]}`);
  return handpose;
}
exports.load = load;
