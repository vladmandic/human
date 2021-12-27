/**
 * BlazeFace, FaceMesh & Iris model implementation
 * See `facemesh.ts` for entry point
 */

import * as tf from '../../dist/tfjs.esm.js';
import * as coords from './facemeshcoords';
import { constants } from '../tfjs/constants';
import type { Box, Point } from '../result';
import { env } from '../util/env';

export const createBox = (startEndTensor) => ({ startPoint: tf.slice(startEndTensor, [0, 0], [-1, 2]), endPoint: tf.slice(startEndTensor, [0, 2], [-1, 2]) });

export const disposeBox = (t) => tf.dispose([t.startPoint, t.endPoint]);

export const getBoxSize = (box): [number, number] => [Math.abs(box.endPoint[0] - box.startPoint[0]), Math.abs(box.endPoint[1] - box.startPoint[1])];

export const getBoxCenter = (box): [number, number, number] => [box.startPoint[0] + (box.endPoint[0] - box.startPoint[0]) / 2, box.startPoint[1] + (box.endPoint[1] - box.startPoint[1]) / 2, 1];

export const clampBox = (box, input): Box => (box ? [
  Math.trunc(Math.max(0, box.startPoint[0])),
  Math.trunc(Math.max(0, box.startPoint[1])),
  Math.trunc(Math.min((input.shape[2] || 0), box.endPoint[0]) - Math.max(0, box.startPoint[0])),
  Math.trunc(Math.min((input.shape[1] || 0), box.endPoint[1]) - Math.max(0, box.startPoint[1])),
] : [0, 0, 0, 0]);

export const getRawBox = (box, input): Box => (box ? [
  box.startPoint[0] / (input.shape[2] || 0),
  box.startPoint[1] / (input.shape[1] || 0),
  (box.endPoint[0] - box.startPoint[0]) / (input.shape[2] || 0),
  (box.endPoint[1] - box.startPoint[1]) / (input.shape[1] || 0),
] : [0, 0, 0, 0]);

export const scaleBoxCoordinates = (box, factor) => {
  const startPoint: Point = [box.startPoint[0] * factor[0], box.startPoint[1] * factor[1]];
  const endPoint: Point = [box.endPoint[0] * factor[0], box.endPoint[1] * factor[1]];
  return { startPoint, endPoint, landmarks: box.landmarks, confidence: box.confidence };
};

export const cutAndResize = (box, image, cropSize) => {
  const h = image.shape[1];
  const w = image.shape[2];
  const cutBox = [box.startPoint[1] / h, box.startPoint[0] / w, box.endPoint[1] / h, box.endPoint[0] / w];
  const crop = tf.image.cropAndResize(image, [cutBox], [0], cropSize);
  const norm = tf.div(crop, constants.tf255);
  tf.dispose(crop);
  return norm;
};

export const enlargeBox = (box, factor) => {
  const center = getBoxCenter(box);
  const size = getBoxSize(box);
  const halfSize: [number, number] = [factor * size[0] / 2, factor * size[1] / 2];
  return { startPoint: [center[0] - halfSize[0], center[1] - halfSize[1]] as Point, endPoint: [center[0] + halfSize[0], center[1] + halfSize[1]] as Point, landmarks: box.landmarks, confidence: box.confidence };
};

export const squarifyBox = (box) => {
  const centers = getBoxCenter(box);
  const size = getBoxSize(box);
  const halfSize = Math.max(...size) / 2;
  return { startPoint: [Math.round(centers[0] - halfSize), Math.round(centers[1] - halfSize)] as Point, endPoint: [Math.round(centers[0] + halfSize), Math.round(centers[1] + halfSize)] as Point, landmarks: box.landmarks, confidence: box.confidence };
};

export const calculateLandmarksBoundingBox = (landmarks) => {
  const x = landmarks.map((d) => d[0]);
  const y = landmarks.map((d) => d[1]);
  return { startPoint: [Math.min(...x), Math.min(...y)] as Point, endPoint: [Math.max(...x), Math.max(...y)] as Point, landmarks };
};

export const fixedRotationMatrix = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];

export const normalizeRadians = (angle) => angle - 2 * Math.PI * Math.floor((angle + Math.PI) / (2 * Math.PI));

export const computeRotation = (point1, point2) => normalizeRadians(Math.PI / 2 - Math.atan2(-(point2[1] - point1[1]), point2[0] - point1[0]));

export const radToDegrees = (rad) => rad * 180 / Math.PI;

export const buildTranslationMatrix = (x, y) => [[1, 0, x], [0, 1, y], [0, 0, 1]];

export const dot = (v1: number[], v2: number[]) => {
  let product = 0;
  for (let i = 0; i < v1.length; i++) product += v1[i] * v2[i];
  return product;
};

export const getColumnFrom2DArr = (arr, columnIndex) => {
  const column: Array<number> = [];
  for (let i = 0; i < arr.length; i++) column.push(arr[i][columnIndex]);
  return column;
};

export const multiplyTransformMatrices = (mat1, mat2) => {
  const product: Array<number[]> = [];
  const size = mat1.length;
  for (let row = 0; row < size; row++) {
    product.push([]);
    for (let col = 0; col < size; col++) product[row].push(dot(mat1[row], getColumnFrom2DArr(mat2, col)));
  }
  return product;
};

export const buildRotationMatrix = (rotation, center) => {
  const cosA = Math.cos(rotation);
  const sinA = Math.sin(rotation);
  const rotationMatrix = [[cosA, -sinA, 0], [sinA, cosA, 0], [0, 0, 1]];
  const translationMatrix = buildTranslationMatrix(center[0], center[1]);
  const translationTimesRotation = multiplyTransformMatrices(translationMatrix, rotationMatrix);
  const negativeTranslationMatrix = buildTranslationMatrix(-center[0], -center[1]);
  return multiplyTransformMatrices(translationTimesRotation, negativeTranslationMatrix);
};

export const invertTransformMatrix = (matrix) => {
  const rotationComponent = [[matrix[0][0], matrix[1][0]], [matrix[0][1], matrix[1][1]]];
  const translationComponent = [matrix[0][2], matrix[1][2]];
  const invertedTranslation = [-dot(rotationComponent[0], translationComponent), -dot(rotationComponent[1], translationComponent)];
  return [rotationComponent[0].concat(invertedTranslation[0]), rotationComponent[1].concat(invertedTranslation[1]), [0, 0, 1]];
};

export const rotatePoint = (homogeneousCoordinate, rotationMatrix) => [dot(homogeneousCoordinate, rotationMatrix[0]), dot(homogeneousCoordinate, rotationMatrix[1])];

export const xyDistanceBetweenPoints = (a, b) => Math.sqrt(((a[0] - b[0]) ** 2) + ((a[1] - b[1]) ** 2));

export function generateAnchors(inputSize) {
  const spec = { strides: [inputSize / 16, inputSize / 8], anchors: [2, 6] };
  const anchors: Array<[number, number]> = [];
  for (let i = 0; i < spec.strides.length; i++) {
    const stride = spec.strides[i];
    const gridRows = Math.floor((inputSize + stride - 1) / stride);
    const gridCols = Math.floor((inputSize + stride - 1) / stride);
    const anchorsNum = spec.anchors[i];
    for (let gridY = 0; gridY < gridRows; gridY++) {
      const anchorY = stride * (gridY + 0.5);
      for (let gridX = 0; gridX < gridCols; gridX++) {
        const anchorX = stride * (gridX + 0.5);
        for (let n = 0; n < anchorsNum; n++) anchors.push([anchorX, anchorY]);
      }
    }
  }
  return anchors;
}

export function transformRawCoords(coordsRaw, box, angle, rotationMatrix, inputSize) {
  const boxSize = getBoxSize(box);
  const coordsScaled = coordsRaw.map((coord) => ([ // scaled around zero-point
    (boxSize[0] / inputSize) * (coord[0] - (inputSize / 2)),
    (boxSize[1] / inputSize) * (coord[1] - (inputSize / 2)),
    (coord[2] || 0),
  ]));
  const largeAngle = angle && (angle !== 0) && (Math.abs(angle) > 0.2);
  const coordsRotationMatrix = largeAngle ? buildRotationMatrix(angle, [0, 0]) : fixedRotationMatrix;
  const coordsRotated = largeAngle ? coordsScaled.map((coord) => ([...rotatePoint(coord, coordsRotationMatrix), coord[2]])) : coordsScaled;
  const inverseRotationMatrix = largeAngle ? invertTransformMatrix(rotationMatrix) : fixedRotationMatrix;
  const boxCenter = getBoxCenter(box);
  const offsets = [dot(boxCenter, inverseRotationMatrix[0]), dot(boxCenter, inverseRotationMatrix[1])];
  return coordsRotated.map((coord) => ([
    Math.trunc(coord[0] + offsets[0]),
    Math.trunc(coord[1] + offsets[1]),
    Math.trunc(coord[2] || 0),
  ]));
}

export function correctFaceRotation(rotate, box, input, inputSize) {
  const symmetryLine = (box.landmarks.length >= coords.meshLandmarks.count)
    ? coords.meshLandmarks.symmetryLine
    : coords.blazeFaceLandmarks.symmetryLine;
  let angle = 0; // default
  let rotationMatrix = fixedRotationMatrix; // default
  let face; // default

  if (rotate && env.kernels.includes('rotatewithoffset')) { // rotateWithOffset is not defined for tfjs-node
    angle = computeRotation(box.landmarks[symmetryLine[0]], box.landmarks[symmetryLine[1]]);
    const largeAngle = angle && (angle !== 0) && (Math.abs(angle) > 0.2);
    if (largeAngle) { // perform rotation only if angle is sufficiently high
      const center: Point = getBoxCenter(box);
      const centerRaw: Point = [center[0] / input.shape[2], center[1] / input.shape[1]];
      const rotated = tf.image.rotateWithOffset(input, angle, 0, centerRaw);
      rotationMatrix = buildRotationMatrix(-angle, center);
      face = cutAndResize(box, rotated, [inputSize, inputSize]);
      tf.dispose(rotated);
    } else {
      face = cutAndResize(box, input, [inputSize, inputSize]);
    }
  } else {
    face = cutAndResize(box, input, [inputSize, inputSize]);
  }
  return [angle, rotationMatrix, face];
}

export const findFaceCenter = (mesh) => {
  const x = mesh.map((m) => m[0]);
  const y = mesh.map((m) => m[1]);
  // weighted center
  /*
  const sum = (arr: number[]) => arr.reduce((prev, curr) => prev + curr, 0);
  return [sum(x) / mesh.length, sum(y) / mesh.length];
  */
  // absolute center
  return [Math.min(...x) + (Math.max(...x) - Math.min(...x)) / 2, Math.min(...y) + (Math.max(...y) - Math.min(...y)) / 2];
};

export const calculateFaceBox = (mesh, previousBox) => {
  const center = findFaceCenter(mesh);
  const boxSize = getBoxSize(previousBox);
  const calculatedBox = {
    startPoint: [center[0] - boxSize[0] / 2, center[1] - boxSize[1] / 2] as Point,
    endPoint: [center[0] + boxSize[0] / 2, center[1] + boxSize[1] / 2] as Point,
  };
  return calculatedBox;
};
