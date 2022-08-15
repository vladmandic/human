import * as tf from '../../dist/tfjs.esm.js';
import type { Tensor } from '../tfjs/types';
import type { Box } from '../result';
import type { Config } from '../config';

interface DetectedBox { box: Box, boxRaw: Box, score: number }

const inputSize = 224;
let anchorTensor: { x, y };
const numLayers = 5;
const strides = [8, 16, 32, 32, 32];

export async function createAnchors() {
  const anchors: Array<{ x: number, y: number }> = [];
  let layerId = 0;
  while (layerId < numLayers) {
    let anchorCount = 0;
    let lastSameStrideLayer = layerId;
    while (lastSameStrideLayer < strides.length && strides[lastSameStrideLayer] === strides[layerId]) {
      anchorCount += 2;
      lastSameStrideLayer++;
    }
    const stride = strides[layerId];
    const featureMapHeight = Math.ceil(inputSize / stride);
    const featureMapWidth = Math.ceil(inputSize / stride);
    for (let y = 0; y < featureMapHeight; ++y) {
      for (let x = 0; x < featureMapWidth; ++x) {
        for (let anchorId = 0; anchorId < anchorCount; ++anchorId) {
          anchors.push({ x: (x + 0.5) / featureMapWidth, y: (y + 0.5) / featureMapHeight });
        }
      }
    }
    layerId = lastSameStrideLayer;
  }
  anchorTensor = { x: tf.tensor1d(anchors.map((a) => a.x)), y: tf.tensor1d(anchors.map((a) => a.y)) };
}

const cropFactor = [5.0, 5.0];
function decodeBoxes(boxesTensor, anchor): Tensor {
  return tf.tidy(() => {
    const split = tf.split(boxesTensor, 12, 1); // first 4 are box data [x,y,w,h] and 4 are keypoints data [x,y] for total of 12
    let xCenter = tf.squeeze(split[0]);
    let yCenter = tf.squeeze(split[1]);
    let width = tf.squeeze(split[2]);
    let height = tf.squeeze(split[3]);
    xCenter = tf.add(tf.div(xCenter, inputSize), anchor.x);
    yCenter = tf.add(tf.div(yCenter, inputSize), anchor.y);
    width = tf.mul(tf.div(width, inputSize), cropFactor[0]);
    height = tf.mul(tf.div(height, inputSize), cropFactor[1]);
    const xMin = tf.sub(xCenter, tf.div(width, 2));
    const yMin = tf.sub(yCenter, tf.div(height, 2));
    const boxes = tf.stack([xMin, yMin, width, height], 1);
    return boxes;
  });
}

export async function decode(boxesTensor: Tensor, logitsTensor: Tensor, config: Config, outputSize: [number, number]): Promise<DetectedBox[]> {
  const t: Record<string, Tensor> = {};
  t.boxes = decodeBoxes(boxesTensor, anchorTensor);
  t.scores = tf.sigmoid(logitsTensor);
  t.argmax = tf.argMax(t.scores);
  const i = (await t.argmax.data())[0] as number;
  const scores = await t.scores.data();
  const detected: Array<{ box: Box, boxRaw: Box, score: number }> = [];
  const minScore = (config.body['detector'] && config.body['detector']['minConfidence']) ? config.body['detector']['minConfidence'] : 0;
  if (scores[i] >= minScore) {
    const boxes = await t.boxes.array();
    const boxRaw: Box = boxes[i];
    const box: Box = [boxRaw[0] * outputSize[0], boxRaw[1] * outputSize[1], boxRaw[2] * outputSize[0], boxRaw[3] * outputSize[1]];
    // console.log(box);
    detected.push({ box, boxRaw, score: scores[i] });
  }
  /*
  t.nms = await tf.image.nonMaxSuppressionAsync(t.boxes, t.scores, 1, config.body.detector?.minConfidence || 0.1, config.body.detector?.iouThreshold || 0.1);
  const boxes = t.boxes.arraySync();
  const scores = t.scores.dataSync();
  const nms = t.nms.dataSync();
  const detected: Array<DetectedBox> = [];
  for (const i of Array.from(nms)) {
    const boxRaw: Box = boxes[i];
    const box: Box = [boxRaw[0] * outputSize[0], boxRaw[0] * outputSize[1], boxRaw[3] * outputSize[0], boxRaw[2] * outputSize[1]];
    detected.push({ box, boxRaw, score: scores[i] });
  }
  */
  Object.keys(t).forEach((tensor) => tf.dispose(t[tensor]));
  return detected;
}
