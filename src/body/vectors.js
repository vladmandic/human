import * as kpt from './keypoints';

function getOffsetPoint(y, x, keypoint, offsets) {
  return {
    y: offsets.get(y, x, keypoint),
    x: offsets.get(y, x, keypoint + kpt.NUM_KEYPOINTS),
  };
}
exports.getOffsetPoint = getOffsetPoint;

function getImageCoords(part, outputStride, offsets) {
  const { heatmapY, heatmapX, id: keypoint } = part;
  const { y, x } = getOffsetPoint(heatmapY, heatmapX, keypoint, offsets);
  return {
    x: part.heatmapX * outputStride + x,
    y: part.heatmapY * outputStride + y,
  };
}
exports.getImageCoords = getImageCoords;

function fillArray(element, size) {
  const result = new Array(size);
  for (let i = 0; i < size; i++) {
    result[i] = element;
  }
  return result;
}
exports.fillArray = fillArray;

function clamp(a, min, max) {
  if (a < min) return min;
  if (a > max) return max;
  return a;
}
exports.clamp = clamp;

function squaredDistance(y1, x1, y2, x2) {
  const dy = y2 - y1;
  const dx = x2 - x1;
  return dy * dy + dx * dx;
}
exports.squaredDistance = squaredDistance;

function addVectors(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}
exports.addVectors = addVectors;

function clampVector(a, min, max) {
  return { y: clamp(a.y, min, max), x: clamp(a.x, min, max) };
}
exports.clampVector = clampVector;
