import * as tf from '../../dist/tfjs.esm.js';

export function scaleBoxCoordinates(box, factor) {
  const startPoint = [box.startPoint[0] * factor[0], box.startPoint[1] * factor[1]];
  const endPoint = [box.endPoint[0] * factor[0], box.endPoint[1] * factor[1]];
  return { startPoint, endPoint };
}

export function getBoxSize(box): [number, number] {
  return [
    Math.abs(box.endPoint[0] - box.startPoint[0]),
    Math.abs(box.endPoint[1] - box.startPoint[1]),
  ];
}

export function getBoxCenter(box): [number, number] {
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

export function enlargeBox(box, factor = 1.5) {
  const center = getBoxCenter(box);
  const size = getBoxSize(box);
  const newHalfSize: [number, number] = [factor * size[0] / 2, factor * size[1] / 2];
  const startPoint = [center[0] - newHalfSize[0], center[1] - newHalfSize[1]];
  const endPoint = [center[0] + newHalfSize[0], center[1] + newHalfSize[1]];
  return { startPoint, endPoint, landmarks: box.landmarks };
}

export function squarifyBox(box) {
  const centers = getBoxCenter(box);
  const size = getBoxSize(box);
  const maxEdge = Math.max(...size);
  const halfSize = maxEdge / 2;
  const startPoint = [Math.round(centers[0] - halfSize), Math.round(centers[1] - halfSize)];
  const endPoint = [Math.round(centers[0] + halfSize), Math.round(centers[1] + halfSize)];
  return { startPoint, endPoint, landmarks: box.landmarks };
}

export function calculateLandmarksBoundingBox(landmarks) {
  const xs = landmarks.map((d) => d[0]);
  const ys = landmarks.map((d) => d[1]);
  const startPoint = [Math.min(...xs), Math.min(...ys)];
  const endPoint = [Math.max(...xs), Math.max(...ys)];
  return { startPoint, endPoint, landmarks };
}

export const disposeBox = (t) => {
  tf.dispose(t.startPoint);
  tf.dispose(t.endPoint);
};

export const createBox = (startEndTensor) => ({
  startPoint: tf.slice(startEndTensor, [0, 0], [-1, 2]),
  endPoint: tf.slice(startEndTensor, [0, 2], [-1, 2]),
});
