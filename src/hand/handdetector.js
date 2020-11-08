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

const tf = require('@tensorflow/tfjs');
const box = require('./box');

class HandDetector {
  constructor(model, inputSize, anchorsAnnotated) {
    this.model = model;
    this.anchors = anchorsAnnotated.map((anchor) => [anchor.x_center, anchor.y_center]);
    this.anchorsTensor = tf.tensor2d(this.anchors);
    this.inputSizeTensor = tf.tensor1d([inputSize, inputSize]);
    this.doubleInputSizeTensor = tf.tensor1d([inputSize * 2, inputSize * 2]);
  }

  normalizeBoxes(boxes) {
    return tf.tidy(() => {
      const boxOffsets = tf.slice(boxes, [0, 0], [-1, 2]);
      const boxSizes = tf.slice(boxes, [0, 2], [-1, 2]);
      const boxCenterPoints = tf.add(tf.div(boxOffsets, this.inputSizeTensor), this.anchorsTensor);
      const halfBoxSizes = tf.div(boxSizes, this.doubleInputSizeTensor);
      const startPoints = tf.mul(tf.sub(boxCenterPoints, halfBoxSizes), this.inputSizeTensor);
      const endPoints = tf.mul(tf.add(boxCenterPoints, halfBoxSizes), this.inputSizeTensor);
      return tf.concat2d([startPoints, endPoints], 1);
    });
  }

  normalizeLandmarks(rawPalmLandmarks, index) {
    return tf.tidy(() => {
      const landmarks = tf.add(tf.div(rawPalmLandmarks.reshape([-1, 7, 2]), this.inputSizeTensor), this.anchors[index]);
      return tf.mul(landmarks, this.inputSizeTensor);
    });
  }

  async getBoxes(input, config) {
    const batched = this.model.predict(input);
    const predictions = batched.squeeze();
    batched.dispose();
    const scores = tf.tidy(() => tf.sigmoid(tf.slice(predictions, [0, 0], [-1, 1])).squeeze());
    const scoresVal = scores.dataSync();
    const rawBoxes = tf.slice(predictions, [0, 1], [-1, 4]);
    const boxes = this.normalizeBoxes(rawBoxes);
    rawBoxes.dispose();
    const filteredT = await tf.image.nonMaxSuppressionAsync(boxes, scores, config.maxHands, config.iouThreshold, config.scoreThreshold);
    const filtered = filteredT.arraySync();

    scores.dispose();
    filteredT.dispose();
    const hands = [];
    for (const boxIndex of filtered) {
      if (scoresVal[boxIndex] >= config.minConfidence) {
        const matchingBox = tf.slice(boxes, [boxIndex, 0], [1, -1]);
        const rawPalmLandmarks = tf.slice(predictions, [boxIndex, 5], [1, 14]);
        const palmLandmarks = tf.tidy(() => this.normalizeLandmarks(rawPalmLandmarks, boxIndex).reshape([-1, 2]));
        rawPalmLandmarks.dispose();
        hands.push({ box: matchingBox, palmLandmarks, confidence: scoresVal[boxIndex] });
      }
    }
    predictions.dispose();
    boxes.dispose();
    return hands;
  }

  async estimateHandBounds(input, config) {
    const inputHeight = input.shape[1];
    const inputWidth = input.shape[2];
    const image = tf.tidy(() => input.resizeBilinear([config.inputSize, config.inputSize]).div(127.5).sub(1));
    const predictions = await this.getBoxes(image, config);
    image.dispose();
    if (!predictions || predictions.length === 0) return null;
    const hands = [];
    for (const prediction of predictions) {
      const boxes = prediction.box.dataSync();
      const startPoint = boxes.slice(0, 2);
      const endPoint = boxes.slice(2, 4);
      const palmLandmarks = prediction.palmLandmarks.arraySync();
      prediction.box.dispose();
      prediction.palmLandmarks.dispose();
      hands.push(box.scaleBoxCoordinates({ startPoint, endPoint, palmLandmarks, confidence: prediction.confidence }, [inputWidth / config.inputSize, inputHeight / config.inputSize]));
    }
    return hands;
  }
}
exports.HandDetector = HandDetector;
