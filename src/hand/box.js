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
import { tf } from '../tf.js';

function getBoxSize(box) {
  return [
    Math.abs(box.endPoint[0] - box.startPoint[0]),
    Math.abs(box.endPoint[1] - box.startPoint[1]),
  ];
}
function getBoxCenter(box) {
  return [
    box.startPoint[0] + (box.endPoint[0] - box.startPoint[0]) / 2,
    box.startPoint[1] + (box.endPoint[1] - box.startPoint[1]) / 2,
  ];
}
function cutBoxFromImageAndResize(box, image, cropSize) {
  const h = image.shape[1];
  const w = image.shape[2];
  const boxes = [[
    box.startPoint[1] / h,
    box.startPoint[0] / w,
    box.endPoint[1] / h,
    box.endPoint[0] / w,
  ]];
  return tf.image.cropAndResize(image, boxes, [0], cropSize);
}
function scaleBoxCoordinates(box, factor) {
  const startPoint = [box.startPoint[0] * factor[0], box.startPoint[1] * factor[1]];
  const endPoint = [box.endPoint[0] * factor[0], box.endPoint[1] * factor[1]];
  const palmLandmarks = box.palmLandmarks.map((coord) => {
    const scaledCoord = [coord[0] * factor[0], coord[1] * factor[1]];
    return scaledCoord;
  });
  return { startPoint, endPoint, palmLandmarks, confidence: box.confidence };
}
function enlargeBox(box, factor = 1.5) {
  const center = getBoxCenter(box);
  const size = getBoxSize(box);
  const newHalfSize = [factor * size[0] / 2, factor * size[1] / 2];
  const startPoint = [center[0] - newHalfSize[0], center[1] - newHalfSize[1]];
  const endPoint = [center[0] + newHalfSize[0], center[1] + newHalfSize[1]];
  return { startPoint, endPoint, palmLandmarks: box.palmLandmarks };
}
function squarifyBox(box) {
  const centers = getBoxCenter(box);
  const size = getBoxSize(box);
  const maxEdge = Math.max(...size);
  const halfSize = maxEdge / 2;
  const startPoint = [centers[0] - halfSize, centers[1] - halfSize];
  const endPoint = [centers[0] + halfSize, centers[1] + halfSize];
  return { startPoint, endPoint, palmLandmarks: box.palmLandmarks };
}
function shiftBox(box, shiftFactor) {
  const boxSize = [
    box.endPoint[0] - box.startPoint[0],
    box.endPoint[1] - box.startPoint[1],
  ];
  const shiftVector = [boxSize[0] * shiftFactor[0], boxSize[1] * shiftFactor[1]];
  const startPoint = [box.startPoint[0] + shiftVector[0], box.startPoint[1] + shiftVector[1]];
  const endPoint = [box.endPoint[0] + shiftVector[0], box.endPoint[1] + shiftVector[1]];
  return { startPoint, endPoint, palmLandmarks: box.palmLandmarks };
}
export {
  cutBoxFromImageAndResize,
  enlargeBox,
  getBoxCenter,
  getBoxSize,
  scaleBoxCoordinates,
  shiftBox,
  squarifyBox,
};
