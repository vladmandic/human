import * as tf from 'dist/tfjs.esm.js';
import { log } from '../util/util';
import { env } from '../util/env';
import { loadModel } from '../tfjs/load';
import type { Box } from '../result';
import type { Config } from '../config';
import type { GraphModel, Tensor, Tensor1D, Tensor2D } from '../tfjs/types';

export interface DetectedBox { box: Box, boxRaw: Box, score: number }

let model: GraphModel | null;
let inputSize = 224;
let anchorTensor: { x, y };
const numLayers = 5;
const strides = [8, 16, 32, 32, 32];

export function createAnchors() {
  const anchors: { x: number, y: number }[] = [];
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

export async function loadDetector(config: Config): Promise<GraphModel> {
  if (env.initial) model = null;
  if (!model && config.body['detector'] && config.body['detector'].modelPath || '') {
    model = await loadModel(config.body['detector'].modelPath);
    const inputs = model?.['executor'] ? Object.values(model.modelSignature['inputs']) : undefined;
    // @ts-ignore model signature properties are not typed and inputs are unreliable for this model
    inputSize = Array.isArray(inputs) ? parseInt(inputs[0].tensorShape.dim[1].size) : 0;
  } else if (config.debug && model) log('cached model:', model['modelUrl']);
  createAnchors();
  return model as GraphModel;
}

const cropFactor = [5.0, 5.0];
export function decodeBoxes(boxesTensor, anchor) {
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
    const xMax = tf.add(xMin, width);
    const yMax = tf.add(yMin, height);
    const boxes = tf.stack([xMin, yMin, xMax, yMax], 1);
    return boxes;
  });
}

async function decodeResults(boxesTensor: Tensor, logitsTensor: Tensor, config: Config, outputSize: [number, number]): Promise<DetectedBox[]> {
  const detectedBoxes: DetectedBox[] = [];
  const t: Record<string, Tensor> = {};
  t.boxes = decodeBoxes(boxesTensor, anchorTensor);
  t.scores = tf.sigmoid(logitsTensor);
  t.nms = await tf.image.nonMaxSuppressionAsync(t.boxes as Tensor2D, t.scores as Tensor1D, 1, config.body['detector']?.minConfidence || 0.1, config.body['detector']?.iouThreshold || 0.1);
  const nms = await t.nms.data();
  const scores = await t.scores.data();
  const boxes = await t.boxes.array();
  for (const i of Array.from(nms)) {
    const score = scores[i];
    const boxRaw: Box = boxes[i];
    const box: Box = [Math.round(boxRaw[0] * outputSize[0]), Math.round(boxRaw[1] * outputSize[1]), Math.round(boxRaw[2] * outputSize[0]), Math.round(boxRaw[3] * outputSize[1])];
    const detectedBox: DetectedBox = { score, boxRaw, box };
    detectedBoxes.push(detectedBox);
  }
  Object.keys(t).forEach((tensor) => tf.dispose(t[tensor]));
  return detectedBoxes;
}

export async function detectBoxes(input: Tensor, config: Config, outputSize: [number, number]) {
  const t: Record<string, Tensor> = {};
  t.res = model?.execute(input, ['Identity']) as Tensor; //
  t.logitsRaw = tf.slice(t.res, [0, 0, 0], [1, -1, 1]);
  t.boxesRaw = tf.slice(t.res, [0, 0, 1], [1, -1, -1]);
  t.logits = tf.squeeze(t.logitsRaw);
  t.boxes = tf.squeeze(t.boxesRaw);
  const boxes = await decodeResults(t.boxes, t.logits, config, outputSize);
  Object.keys(t).forEach((tensor) => tf.dispose(t[tensor]));
  return boxes;
}
