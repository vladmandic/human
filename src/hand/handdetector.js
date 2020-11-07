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

  async getBoundingBoxes(input, config) {
    const batchedPrediction = this.model.predict(input);
    const prediction = batchedPrediction.squeeze();
    const scores = tf.tidy(() => tf.sigmoid(tf.slice(prediction, [0, 0], [-1, 1])).squeeze());
    const rawBoxes = tf.slice(prediction, [0, 1], [-1, 4]);
    const boxes = this.normalizeBoxes(rawBoxes);
    const boxesWithHandsTensor = await tf.image.nonMaxSuppressionAsync(boxes, scores, config.maxHands, config.iouThreshold, config.scoreThreshold);
    const boxesWithHands = boxesWithHandsTensor.arraySync();
    const toDispose = [
      batchedPrediction,
      boxesWithHandsTensor,
      prediction,
      boxes,
      rawBoxes,
      scores,
    ];
    if (boxesWithHands.length === 0) {
      toDispose.forEach((tensor) => tensor.dispose());
      return null;
    }
    const hands = [];
    for (const boxIndex of boxesWithHands) {
      const matchingBox = tf.slice(boxes, [boxIndex, 0], [1, -1]);
      const rawPalmLandmarks = tf.slice(prediction, [boxIndex, 5], [1, 14]);
      const palmLandmarks = tf.tidy(() => this.normalizeLandmarks(rawPalmLandmarks, boxIndex).reshape([-1, 2]));
      rawPalmLandmarks.dispose();
      hands.push({ boxes: matchingBox, palmLandmarks });
    }
    toDispose.forEach((tensor) => tensor.dispose());
    return hands;
  }

  async estimateHandBounds(input, config) {
    const inputHeight = input.shape[1];
    const inputWidth = input.shape[2];
    const image = tf.tidy(() => input.resizeBilinear([config.inputSize, config.inputSize]).div(127.5).sub(1));
    const predictions = await this.getBoundingBoxes(image, config);
    image.dispose();
    if (!predictions || predictions.length === 0) return null;
    const hands = [];
    for (const prediction of predictions) {
      const boundingBoxes = prediction.boxes.dataSync();
      const startPoint = boundingBoxes.slice(0, 2);
      const endPoint = boundingBoxes.slice(2, 4);
      const palmLandmarks = prediction.palmLandmarks.arraySync();
      prediction.boxes.dispose();
      prediction.palmLandmarks.dispose();
      hands.push(box.scaleBoxCoordinates({ startPoint, endPoint, palmLandmarks }, [inputWidth / config.inputSize, inputHeight / config.inputSize]));
    }
    return hands;
  }
}
exports.HandDetector = HandDetector;
