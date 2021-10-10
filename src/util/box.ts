import type { Point, Box } from '../result';

export function calc(keypoints: Array<Point>, outputSize: [number, number] = [1, 1]) {
  const coords = [keypoints.map((pt) => pt[0]), keypoints.map((pt) => pt[1])]; // all x/y coords
  const min = [Math.min(...coords[0]), Math.min(...coords[1])];
  const max = [Math.max(...coords[0]), Math.max(...coords[1])];
  const box: Box = [min[0], min[1], max[0] - min[0], max[1] - min[1]];
  const boxRaw: Box = [box[0] / outputSize[0], box[1] / outputSize[1], box[2] / outputSize[0], box[3] / outputSize[1]];
  return { box, boxRaw };
}

export function square(keypoints: Array<Point>, outputSize: [number, number] = [1, 1]) {
  const coords = [keypoints.map((pt) => pt[0]), keypoints.map((pt) => pt[1])]; // all x/y coords
  const min = [Math.min(...coords[0]), Math.min(...coords[1])];
  const max = [Math.max(...coords[0]), Math.max(...coords[1])];
  const center = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2]; // find center x and y coord of all fingers
  const dist = Math.max(center[0] - min[0], center[1] - min[1], -center[0] + max[0], -center[1] + max[1]); // largest distance from center in any direction
  const box: Box = [Math.trunc(center[0] - dist), Math.trunc(center[1] - dist), Math.trunc(2 * dist), Math.trunc(2 * dist)];
  const boxRaw: Box = [box[0] / outputSize[0], box[1] / outputSize[1], box[2] / outputSize[0], box[3] / outputSize[1]];
  return { box, boxRaw };
}

export function scale(box: Box, scaleFact: number) {
  const dist = [box[2] * scaleFact, box[3] * scaleFact];
  const newBox: Box = [
    box[0] - (dist[0] - box[2]) / 2,
    box[1] - (dist[1] - box[3]) / 2,
    dist[0],
    dist[1],
  ];
  return newBox;
}

export function crop(box: Box) { // [y1, x1, y2, x2] clamped to 0..1
  const yxBox: Box = [Math.max(0, box[1]), Math.max(0, box[0]), Math.min(1, box[3] + box[1]), Math.min(1, box[2] + box[0])];
  return yxBox;
}
