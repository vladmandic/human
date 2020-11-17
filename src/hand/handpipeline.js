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

import { tf } from '../../dist/tfjs.esm.js';
import * as box from './box';
import * as util from './util';

const PALM_BOX_SHIFT_VECTOR = [0, -0.4];
const PALM_BOX_ENLARGE_FACTOR = 3;
const HAND_BOX_SHIFT_VECTOR = [0, -0.1]; // move detected hand box by x,y to ease landmark detection
const HAND_BOX_ENLARGE_FACTOR = 1.65; // increased from model default 1.65;
const PALM_LANDMARK_IDS = [0, 5, 9, 13, 17, 1, 2];
const PALM_LANDMARKS_INDEX_OF_PALM_BASE = 0;
const PALM_LANDMARKS_INDEX_OF_MIDDLE_FINGER_BASE = 2;

class HandPipeline {
  constructor(boundingBoxDetector, meshDetector, inputSize) {
    this.boxDetector = boundingBoxDetector;
    this.meshDetector = meshDetector;
    this.inputSize = inputSize;
    this.storedBoxes = [];
    this.skipped = 1000;
    this.detectedHands = 0;
  }

  getBoxForPalmLandmarks(palmLandmarks, rotationMatrix) {
    const rotatedPalmLandmarks = palmLandmarks.map((coord) => {
      const homogeneousCoordinate = [...coord, 1];
      return util.rotatePoint(homogeneousCoordinate, rotationMatrix);
    });
    const boxAroundPalm = this.calculateLandmarksBoundingBox(rotatedPalmLandmarks);
    return box.enlargeBox(box.squarifyBox(box.shiftBox(boxAroundPalm, PALM_BOX_SHIFT_VECTOR)), PALM_BOX_ENLARGE_FACTOR);
  }

  getBoxForHandLandmarks(landmarks) {
    const boundingBox = this.calculateLandmarksBoundingBox(landmarks);
    const boxAroundHand = box.enlargeBox(box.squarifyBox(box.shiftBox(boundingBox, HAND_BOX_SHIFT_VECTOR)), HAND_BOX_ENLARGE_FACTOR);
    const palmLandmarks = [];
    for (let i = 0; i < PALM_LANDMARK_IDS.length; i++) {
      palmLandmarks.push(landmarks[PALM_LANDMARK_IDS[i]].slice(0, 2));
    }
    boxAroundHand.palmLandmarks = palmLandmarks;
    return boxAroundHand;
  }

  transformRawCoords(rawCoords, box2, angle, rotationMatrix) {
    const boxSize = box.getBoxSize(box2);
    const scaleFactor = [boxSize[0] / this.inputSize, boxSize[1] / this.inputSize];
    const coordsScaled = rawCoords.map((coord) => [
      scaleFactor[0] * (coord[0] - this.inputSize / 2),
      scaleFactor[1] * (coord[1] - this.inputSize / 2),
      coord[2],
    ]);
    const coordsRotationMatrix = util.buildRotationMatrix(angle, [0, 0]);
    const coordsRotated = coordsScaled.map((coord) => {
      const rotated = util.rotatePoint(coord, coordsRotationMatrix);
      return [...rotated, coord[2]];
    });
    const inverseRotationMatrix = util.invertTransformMatrix(rotationMatrix);
    const boxCenter = [...box.getBoxCenter(box2), 1];
    const originalBoxCenter = [
      util.dot(boxCenter, inverseRotationMatrix[0]),
      util.dot(boxCenter, inverseRotationMatrix[1]),
    ];
    return coordsRotated.map((coord) => [
      coord[0] + originalBoxCenter[0],
      coord[1] + originalBoxCenter[1],
      coord[2],
    ]);
  }

  async estimateHands(image, config) {
    this.skipped++;
    let useFreshBox = false;

    // run new detector every skipFrames unless we only want box to start with
    let boxes;
    if ((this.skipped > config.skipFrames) || !config.landmarks || !config.videoOptimized) {
      boxes = await this.boxDetector.estimateHandBounds(image, config);
      // don't reset on test image
      if ((image.shape[1] !== 255) && (image.shape[2] !== 255)) this.skipped = 0;
    }

    // if detector result count doesn't match current working set, use it to reset current working set
    if (boxes && (boxes.length > 0) && ((boxes.length !== this.detectedHands) && (this.detectedHands !== config.maxHands) || !config.landmarks)) {
      this.storedBoxes = [];
      this.detectedHands = 0;
      for (const possible of boxes) this.storedBoxes.push(possible);
      if (this.storedBoxes.length > 0) useFreshBox = true;
    }
    const hands = [];
    // console.log(`skipped: ${this.skipped} max: ${config.maxHands} detected: ${this.detectedHands} stored: ${this.storedBoxes.length} new: ${boxes?.length}`);

    // go through working set of boxes
    for (const i in this.storedBoxes) {
      const currentBox = this.storedBoxes[i];
      if (!currentBox) continue;
      if (config.landmarks) {
        const angle = util.computeRotation(currentBox.palmLandmarks[PALM_LANDMARKS_INDEX_OF_PALM_BASE], currentBox.palmLandmarks[PALM_LANDMARKS_INDEX_OF_MIDDLE_FINGER_BASE]);
        const palmCenter = box.getBoxCenter(currentBox);
        const palmCenterNormalized = [palmCenter[0] / image.shape[2], palmCenter[1] / image.shape[1]];
        const rotatedImage = tf.image.rotateWithOffset(image, angle, 0, palmCenterNormalized);
        const rotationMatrix = util.buildRotationMatrix(-angle, palmCenter);
        const newBox = useFreshBox ? this.getBoxForPalmLandmarks(currentBox.palmLandmarks, rotationMatrix) : currentBox;
        const croppedInput = box.cutBoxFromImageAndResize(newBox, rotatedImage, [this.inputSize, this.inputSize]);
        const handImage = croppedInput.div(255);
        croppedInput.dispose();
        rotatedImage.dispose();
        const [confidence, keypoints] = await this.meshDetector.predict(handImage);
        handImage.dispose();
        const confidenceValue = confidence.dataSync()[0];
        confidence.dispose();
        if (confidenceValue >= config.minConfidence) {
          const keypointsReshaped = tf.reshape(keypoints, [-1, 3]);
          const rawCoords = keypointsReshaped.arraySync();
          keypoints.dispose();
          keypointsReshaped.dispose();
          const coords = this.transformRawCoords(rawCoords, newBox, angle, rotationMatrix);
          const nextBoundingBox = this.getBoxForHandLandmarks(coords);
          this.storedBoxes[i] = nextBoundingBox;
          const result = {
            landmarks: coords,
            confidence: confidenceValue,
            box: {
              topLeft: nextBoundingBox.startPoint,
              bottomRight: nextBoundingBox.endPoint,
            },
          };
          hands.push(result);
        } else {
          this.storedBoxes[i] = null;
        }
        keypoints.dispose();
      } else {
        const enlarged = box.enlargeBox(box.squarifyBox(box.shiftBox(currentBox, HAND_BOX_SHIFT_VECTOR)), HAND_BOX_ENLARGE_FACTOR);
        const result = {
          confidence: currentBox.confidence,
          box: {
            topLeft: enlarged.startPoint,
            bottomRight: enlarged.endPoint,
          },
        };
        hands.push(result);
      }
    }
    this.storedBoxes = this.storedBoxes.filter((a) => a !== null);
    this.detectedHands = hands.length;
    return hands;
  }

  // eslint-disable-next-line class-methods-use-this
  calculateLandmarksBoundingBox(landmarks) {
    const xs = landmarks.map((d) => d[0]);
    const ys = landmarks.map((d) => d[1]);
    const startPoint = [Math.min(...xs), Math.min(...ys)];
    const endPoint = [Math.max(...xs), Math.max(...ys)];
    return { startPoint, endPoint };
  }
}

exports.HandPipeline = HandPipeline;
