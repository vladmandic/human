/**
 * BlazeFace, FaceMesh & Iris model implementation
 * See `facemesh.ts` for entry point
 */

import * as tf from '../../dist/tfjs.esm.js';
import * as coords from './facemeshcoords';
import type { Box, Point } from '../result';

export const createBox = (startEndTensor) => ({ startPoint: tf.slice(startEndTensor, [0, 0], [-1, 2]), endPoint: tf.slice(startEndTensor, [0, 2], [-1, 2]) });

export const disposeBox = (t) => tf.dispose([t.startPoint, t.endPoint]);

export const getBoxSize = (box): [number, number] => [Math.abs(box.endPoint[0] - box.startPoint[0]), Math.abs(box.endPoint[1] - box.startPoint[1])];

export const getBoxCenter = (box): [number, number] => [box.startPoint[0] + (box.endPoint[0] - box.startPoint[0]) / 2, box.startPoint[1] + (box.endPoint[1] - box.startPoint[1]) / 2];

export const getClampedBox = (box, input): Box => (box ? [
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
  const startPoint = [box.startPoint[0] * factor[0], box.startPoint[1] * factor[1]];
  const endPoint = [box.endPoint[0] * factor[0], box.endPoint[1] * factor[1]];
  return { startPoint, endPoint };
};

export const cutBoxFromImageAndResize = (box, image, cropSize) => {
  const h = image.shape[1];
  const w = image.shape[2];
  return tf.image.cropAndResize(image, [[box.startPoint[1] / h, box.startPoint[0] / w, box.endPoint[1] / h, box.endPoint[0] / w]], [0], cropSize);
};

export const enlargeBox = (box, factor = 1.5) => {
  const center = getBoxCenter(box);
  const size = getBoxSize(box);
  const halfSize: [number, number] = [factor * size[0] / 2, factor * size[1] / 2];
  return { startPoint: [center[0] - halfSize[0], center[1] - halfSize[1]] as Point, endPoint: [center[0] + halfSize[0], center[1] + halfSize[1]] as Point, landmarks: box.landmarks };
};

export const squarifyBox = (box) => {
  const centers = getBoxCenter(box);
  const size = getBoxSize(box);
  const halfSize = Math.max(...size) / 2;
  return { startPoint: [Math.round(centers[0] - halfSize), Math.round(centers[1] - halfSize)] as Point, endPoint: [Math.round(centers[0] + halfSize), Math.round(centers[1] + halfSize)] as Point, landmarks: box.landmarks };
};

export const calculateLandmarksBoundingBox = (landmarks) => {
  const xs = landmarks.map((d) => d[0]);
  const ys = landmarks.map((d) => d[1]);
  return { startPoint: [Math.min(...xs), Math.min(...ys)], endPoint: [Math.max(...xs), Math.max(...ys)], landmarks };
};

export const IDENTITY_MATRIX = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];

export const normalizeRadians = (angle) => angle - 2 * Math.PI * Math.floor((angle + Math.PI) / (2 * Math.PI));

export const computeRotation = (point1, point2) => normalizeRadians(Math.PI / 2 - Math.atan2(-(point2[1] - point1[1]), point2[0] - point1[0]));

export const radToDegrees = (rad) => rad * 180 / Math.PI;

export const buildTranslationMatrix = (x, y) => [[1, 0, x], [0, 1, y], [0, 0, 1]];

export const dot = (v1, v2) => {
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

export function transformRawCoords(rawCoords, box, angle, rotationMatrix, inputSize) {
  const boxSize = getBoxSize({ startPoint: box.startPoint, endPoint: box.endPoint });
  const coordsScaled = rawCoords.map((coord) => ([
    boxSize[0] / inputSize * (coord[0] - inputSize / 2),
    boxSize[1] / inputSize * (coord[1] - inputSize / 2),
    coord[2] || 0,
  ]));
  const coordsRotationMatrix = (angle !== 0) ? buildRotationMatrix(angle, [0, 0]) : IDENTITY_MATRIX;
  const coordsRotated = (angle !== 0) ? coordsScaled.map((coord) => ([...rotatePoint(coord, coordsRotationMatrix), coord[2]])) : coordsScaled;
  const inverseRotationMatrix = (angle !== 0) ? invertTransformMatrix(rotationMatrix) : IDENTITY_MATRIX;
  const boxCenter = [...getBoxCenter({ startPoint: box.startPoint, endPoint: box.endPoint }), 1];
  return coordsRotated.map((coord) => ([
    Math.round(coord[0] + dot(boxCenter, inverseRotationMatrix[0])),
    Math.round(coord[1] + dot(boxCenter, inverseRotationMatrix[1])),
    Math.round(coord[2] || 0),
  ]));
}

export function correctFaceRotation(box, input, inputSize) {
  const symmetryLine = (box.landmarks.length >= coords.meshLandmarks.count) ? coords.meshLandmarks.symmetryLine : coords.blazeFaceLandmarks.symmetryLine;
  const angle: number = computeRotation(box.landmarks[symmetryLine[0]], box.landmarks[symmetryLine[1]]);
  const faceCenter: Point = getBoxCenter({ startPoint: box.startPoint, endPoint: box.endPoint });
  const faceCenterNormalized: Point = [faceCenter[0] / input.shape[2], faceCenter[1] / input.shape[1]];
  const rotated = tf.image.rotateWithOffset(input, angle, 0, faceCenterNormalized); // rotateWithOffset is not defined for tfjs-node
  const rotationMatrix = buildRotationMatrix(-angle, faceCenter);
  const cut = cutBoxFromImageAndResize({ startPoint: box.startPoint, endPoint: box.endPoint }, rotated, [inputSize, inputSize]);
  const face = tf.div(cut, 255);
  tf.dispose(cut);
  tf.dispose(rotated);
  return [angle, rotationMatrix, face];
}
