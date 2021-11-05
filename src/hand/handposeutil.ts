import * as tf from '../../dist/tfjs.esm.js';
import type { Point } from '../result';

export function getBoxSize(box) {
  return [
    Math.abs(box.endPoint[0] - box.startPoint[0]),
    Math.abs(box.endPoint[1] - box.startPoint[1]),
  ];
}

export function getBoxCenter(box) {
  return [
    box.startPoint[0] + (box.endPoint[0] - box.startPoint[0]) / 2,
    box.startPoint[1] + (box.endPoint[1] - box.startPoint[1]) / 2,
  ];
}

export function cutBoxFromImageAndResize(box, image, cropSize) {
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

export function scaleBoxCoordinates(box, factor) {
  const startPoint = [box.startPoint[0] * factor[0], box.startPoint[1] * factor[1]] as Point;
  const endPoint = [box.endPoint[0] * factor[0], box.endPoint[1] * factor[1]] as Point;
  const palmLandmarks = box.palmLandmarks.map((coord) => {
    const scaledCoord = [coord[0] * factor[0], coord[1] * factor[1]];
    return scaledCoord;
  });
  return { startPoint, endPoint, palmLandmarks, confidence: box.confidence };
}

export function enlargeBox(box, factor = 1.5) {
  const center = getBoxCenter(box);
  const size = getBoxSize(box);
  const newHalfSize = [factor * size[0] / 2, factor * size[1] / 2];
  const startPoint = [center[0] - newHalfSize[0], center[1] - newHalfSize[1]] as Point;
  const endPoint = [center[0] + newHalfSize[0], center[1] + newHalfSize[1]] as Point;
  return { startPoint, endPoint, palmLandmarks: box.palmLandmarks };
}

export function squarifyBox(box) {
  const centers = getBoxCenter(box);
  const size = getBoxSize(box);
  const maxEdge = Math.max(...size);
  const halfSize = maxEdge / 2;
  const startPoint = [centers[0] - halfSize, centers[1] - halfSize] as Point;
  const endPoint = [centers[0] + halfSize, centers[1] + halfSize] as Point;
  return { startPoint, endPoint, palmLandmarks: box.palmLandmarks };
}

export function shiftBox(box, shiftFactor) {
  const boxSize = [
    box.endPoint[0] - box.startPoint[0],
    box.endPoint[1] - box.startPoint[1],
  ];
  const shiftVector = [boxSize[0] * shiftFactor[0], boxSize[1] * shiftFactor[1]];
  const startPoint = [box.startPoint[0] + shiftVector[0], box.startPoint[1] + shiftVector[1]] as Point;
  const endPoint = [box.endPoint[0] + shiftVector[0], box.endPoint[1] + shiftVector[1]] as Point;
  return { startPoint, endPoint, palmLandmarks: box.palmLandmarks };
}

export function normalizeRadians(angle) {
  return angle - 2 * Math.PI * Math.floor((angle + Math.PI) / (2 * Math.PI));
}

export function computeRotation(point1, point2) {
  const radians = Math.PI / 2 - Math.atan2(-(point2[1] - point1[1]), point2[0] - point1[0]);
  return normalizeRadians(radians);
}

export const buildTranslationMatrix = (x, y) => [[1, 0, x], [0, 1, y], [0, 0, 1]];

export function dot(v1, v2) {
  let product = 0;
  for (let i = 0; i < v1.length; i++) {
    product += v1[i] * v2[i];
  }
  return product;
}

export function getColumnFrom2DArr(arr, columnIndex) {
  const column: Array<number> = [];
  for (let i = 0; i < arr.length; i++) {
    column.push(arr[i][columnIndex]);
  }
  return column;
}

export function multiplyTransformMatrices(mat1, mat2) {
  const product: Array<number[]> = [];
  const size = mat1.length;
  for (let row = 0; row < size; row++) {
    product.push([]);
    for (let col = 0; col < size; col++) {
      product[row].push(dot(mat1[row], getColumnFrom2DArr(mat2, col)));
    }
  }
  return product;
}

export function buildRotationMatrix(rotation, center) {
  const cosA = Math.cos(rotation);
  const sinA = Math.sin(rotation);
  const rotationMatrix = [[cosA, -sinA, 0], [sinA, cosA, 0], [0, 0, 1]];
  const translationMatrix = buildTranslationMatrix(center[0], center[1]);
  const translationTimesRotation = multiplyTransformMatrices(translationMatrix, rotationMatrix);
  const negativeTranslationMatrix = buildTranslationMatrix(-center[0], -center[1]);
  return multiplyTransformMatrices(translationTimesRotation, negativeTranslationMatrix);
}

export function invertTransformMatrix(matrix) {
  const rotationComponent = [[matrix[0][0], matrix[1][0]], [matrix[0][1], matrix[1][1]]];
  const translationComponent = [matrix[0][2], matrix[1][2]];
  const invertedTranslation = [
    -dot(rotationComponent[0], translationComponent),
    -dot(rotationComponent[1], translationComponent),
  ];
  return [
    rotationComponent[0].concat(invertedTranslation[0]),
    rotationComponent[1].concat(invertedTranslation[1]),
    [0, 0, 1],
  ];
}

export function rotatePoint(homogeneousCoordinate, rotationMatrix) {
  return [
    dot(homogeneousCoordinate, rotationMatrix[0]),
    dot(homogeneousCoordinate, rotationMatrix[1]),
  ];
}
