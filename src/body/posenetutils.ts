/**
 * PoseNet body detection model implementation constants
 * See `posenet.ts` for entry point
 */

import type { Point, BodyResult, BodyAnnotation, BodyLandmark } from '../result';

export const partNames = [
  'nose', 'leftEye', 'rightEye', 'leftEar', 'rightEar', 'leftShoulder',
  'rightShoulder', 'leftElbow', 'rightElbow', 'leftWrist', 'rightWrist',
  'leftHip', 'rightHip', 'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle',
];

export const count = partNames.length; // 17 keypoints

export const partIds = partNames.reduce((result, jointName, i) => {
  result[jointName] = i;
  return result;
}, {});

const connectedPartNames = [
  ['leftHip', 'leftShoulder'], ['leftElbow', 'leftShoulder'],
  ['leftElbow', 'leftWrist'], ['leftHip', 'leftKnee'],
  ['leftKnee', 'leftAnkle'], ['rightHip', 'rightShoulder'],
  ['rightElbow', 'rightShoulder'], ['rightElbow', 'rightWrist'],
  ['rightHip', 'rightKnee'], ['rightKnee', 'rightAnkle'],
  ['leftShoulder', 'rightShoulder'], ['leftHip', 'rightHip'],
];
export const connectedPartIndices = connectedPartNames.map(([jointNameA, jointNameB]) => ([partIds[jointNameA], partIds[jointNameB]]));

export const poseChain = [
  ['nose', 'leftEye'], ['leftEye', 'leftEar'], ['nose', 'rightEye'],
  ['rightEye', 'rightEar'], ['nose', 'leftShoulder'],
  ['leftShoulder', 'leftElbow'], ['leftElbow', 'leftWrist'],
  ['leftShoulder', 'leftHip'], ['leftHip', 'leftKnee'],
  ['leftKnee', 'leftAnkle'], ['nose', 'rightShoulder'],
  ['rightShoulder', 'rightElbow'], ['rightElbow', 'rightWrist'],
  ['rightShoulder', 'rightHip'], ['rightHip', 'rightKnee'],
  ['rightKnee', 'rightAnkle'],
];

export function eitherPointDoesntMeetConfidence(a: number, b: number, minConfidence: number) {
  return (a < minConfidence || b < minConfidence);
}

export function getAdjacentKeyPoints(keypoints, minConfidence: number) {
  return connectedPartIndices.reduce((result, [leftJoint, rightJoint]) => {
    if (eitherPointDoesntMeetConfidence(keypoints[leftJoint].score, keypoints[rightJoint].score, minConfidence)) {
      return result;
    }
    result.push([keypoints[leftJoint], keypoints[rightJoint]]);
    return result;
  }, []);
}

export function getBoundingBox(keypoints): [number, number, number, number] {
  const coord = keypoints.reduce(({ maxX, maxY, minX, minY }, { position: { x, y } }) => ({
    maxX: Math.max(maxX, x),
    maxY: Math.max(maxY, y),
    minX: Math.min(minX, x),
    minY: Math.min(minY, y),
  }), {
    maxX: Number.NEGATIVE_INFINITY,
    maxY: Number.NEGATIVE_INFINITY,
    minX: Number.POSITIVE_INFINITY,
    minY: Number.POSITIVE_INFINITY,
  });
  return [coord.minX, coord.minY, coord.maxX - coord.minX, coord.maxY - coord.minY];
}

export function scalePoses(poses, [height, width], [inputResolutionHeight, inputResolutionWidth]): Array<BodyResult> {
  const scaleY = height / inputResolutionHeight;
  const scaleX = width / inputResolutionWidth;
  const scalePose = (pose, i): BodyResult => ({
    id: i,
    score: pose.score,
    boxRaw: [pose.box[0] / inputResolutionWidth, pose.box[1] / inputResolutionHeight, pose.box[2] / inputResolutionWidth, pose.box[3] / inputResolutionHeight],
    box: [Math.trunc(pose.box[0] * scaleX), Math.trunc(pose.box[1] * scaleY), Math.trunc(pose.box[2] * scaleX), Math.trunc(pose.box[3] * scaleY)],
    keypoints: pose.keypoints.map(({ score, part, position }) => ({
      score: score as number,
      part: part as BodyLandmark,
      position: [Math.trunc(position.x * scaleX), Math.trunc(position.y * scaleY)] as Point,
      positionRaw: [position.x / inputResolutionHeight, position.y / inputResolutionHeight] as Point,
    })),
    annotations: {} as Record<BodyAnnotation, Point[][]>,
  });
  const scaledPoses = poses.map((pose, i) => scalePose(pose, i));
  return scaledPoses;
}

// algorithm based on Coursera Lecture from Algorithms, Part 1: https://www.coursera.org/learn/algorithms-part1/lecture/ZjoSM/heapsort
export class MaxHeap {
  priorityQueue: Array<unknown>; // don't touch
  numberOfElements: number;
  getElementValue: unknown; // function call

  constructor(maxSize, getElementValue) {
    this.priorityQueue = new Array(maxSize);
    this.numberOfElements = -1;
    this.getElementValue = getElementValue;
  }

  enqueue(x) {
    this.priorityQueue[++this.numberOfElements] = x;
    this.swim(this.numberOfElements);
  }

  dequeue() {
    const max = this.priorityQueue[0];
    this.exchange(0, this.numberOfElements--);
    this.sink(0);
    this.priorityQueue[this.numberOfElements + 1] = null;
    return max;
  }

  empty() { return this.numberOfElements === -1; }

  size() { return this.numberOfElements + 1; }

  all() { return this.priorityQueue.slice(0, this.numberOfElements + 1); }

  max() { return this.priorityQueue[0]; }

  swim(k) {
    while (k > 0 && this.less(Math.floor(k / 2), k)) {
      this.exchange(k, Math.floor(k / 2));
      k = Math.floor(k / 2);
    }
  }

  sink(k) {
    while (2 * k <= this.numberOfElements) {
      let j = 2 * k;
      if (j < this.numberOfElements && this.less(j, j + 1)) j++;
      if (!this.less(k, j)) break;
      this.exchange(k, j);
      k = j;
    }
  }

  getValueAt(i) {
    // @ts-ignore getter is of unknown type
    return this.getElementValue(this.priorityQueue[i]);
  }

  less(i, j) {
    return this.getValueAt(i) < this.getValueAt(j);
  }

  exchange(i, j) {
    const t = this.priorityQueue[i];
    this.priorityQueue[i] = this.priorityQueue[j];
    this.priorityQueue[j] = t;
  }
}

export function getOffsetPoint(y, x, keypoint, offsets) {
  return {
    y: offsets.get(y, x, keypoint),
    x: offsets.get(y, x, keypoint + count),
  };
}

export function getImageCoords(part, outputStride, offsets) {
  const { heatmapY, heatmapX, id: keypoint } = part;
  const { y, x } = getOffsetPoint(heatmapY, heatmapX, keypoint, offsets);
  return {
    x: part.heatmapX * outputStride + x,
    y: part.heatmapY * outputStride + y,
  };
}

export function fillArray(element, size) {
  const result = new Array(size);
  for (let i = 0; i < size; i++) {
    result[i] = element;
  }
  return result;
}

export function clamp(a, min, max) {
  if (a < min) return min;
  if (a > max) return max;
  return a;
}

export function squaredDistance(y1, x1, y2, x2) {
  const dy = y2 - y1;
  const dx = x2 - x1;
  return dy * dy + dx * dx;
}

export function addVectors(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function clampVector(a, min, max) {
  return { y: clamp(a.y, min, max), x: clamp(a.x, min, max) };
}
