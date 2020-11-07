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

const tf = require('@tensorflow/tfjs');
const handdetector = require('./handdetector');
const pipeline = require('./handpipeline');
const anchors = require('./anchors');

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
      hands.push({
        confidence: prediction.handInViewConfidence,
        box: prediction.boundingBox ? [
          prediction.boundingBox.topLeft[0],
          prediction.boundingBox.topLeft[1],
          prediction.boundingBox.bottomRight[0] - prediction.boundingBox.topLeft[0],
          prediction.boundingBox.bottomRight[1] - prediction.boundingBox.topLeft[1],
        ] : 0,
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
    tf.loadGraphModel(config.detector.modelPath, { fromTFHub: config.detector.modelPath.includes('tfhub.dev') }),
    tf.loadGraphModel(config.skeleton.modelPath, { fromTFHub: config.skeleton.modelPath.includes('tfhub.dev') }),
  ]);
  const detector = new handdetector.HandDetector(handDetectorModel, config.inputSize, anchors.anchors);
  const pipe = new pipeline.HandPipeline(detector, handPoseModel, config.inputSize);
  const handpose = new HandPose(pipe);
  // eslint-disable-next-line no-console
  console.log(`Human: load model: ${config.detector.modelPath.match(/\/(.*)\./)[1]}`);
  // eslint-disable-next-line no-console
  console.log(`Human: load model: ${config.skeleton.modelPath.match(/\/(.*)\./)[1]}`);
  return handpose;
}
exports.load = load;
