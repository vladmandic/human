/**
 * BlazeFace, FaceMesh & Iris model implementation
 * See `facemesh.ts` for entry point
 */

import * as tf from 'dist/tfjs.esm.js';
import { log } from '../util/util';
import * as util from './facemeshutil';
import { loadModel } from '../tfjs/load';
import { constants } from '../tfjs/constants';
import type { Config } from '../config';
import type { Tensor, GraphModel, Tensor1D, Tensor2D, Tensor4D } from '../tfjs/types';
import { env } from '../util/env';
import type { Point } from '../result';

const keypointsCount = 6;
let model: GraphModel | null;
let anchors: Tensor | null = null;
let inputSize = 0;
let inputSizeT: Tensor | null = null;

export interface DetectBox { startPoint: Point, endPoint: Point, landmarks: Point[], confidence: number, size: [number, number] }

export const size = () => inputSize;

export async function load(config: Config): Promise<GraphModel> {
  if (env.initial) model = null;
  if (!model) model = await loadModel(config.face.detector?.modelPath);
  else if (config.debug) log('cached model:', model['modelUrl']);
  inputSize = (model['executor'] && model.inputs[0].shape) ? model.inputs[0].shape[2] : 256;
  inputSizeT = tf.scalar(inputSize, 'int32') as Tensor;
  anchors = tf.tensor2d(util.generateAnchors(inputSize)) as Tensor;
  return model;
}

function decodeBoxes(boxOutputs: Tensor) {
  if (!anchors || !inputSizeT) return tf.zeros([0, 0]);
  const t: Record<string, Tensor> = {};
  t.boxStarts = tf.slice(boxOutputs, [0, 1], [-1, 2]);
  t.centers = tf.add(t.boxStarts, anchors);
  t.boxSizes = tf.slice(boxOutputs, [0, 3], [-1, 2]);
  t.boxSizesNormalized = tf.div(t.boxSizes, inputSizeT);
  t.centersNormalized = tf.div(t.centers, inputSizeT);
  t.halfBoxSize = tf.div(t.boxSizesNormalized, constants.tf2);
  t.starts = tf.sub(t.centersNormalized, t.halfBoxSize);
  t.ends = tf.add(t.centersNormalized, t.halfBoxSize);
  t.startNormalized = tf.mul(t.starts, inputSizeT);
  t.endNormalized = tf.mul(t.ends, inputSizeT);
  const boxes = tf.concat2d([t.startNormalized as Tensor2D, t.endNormalized as Tensor2D], 1);
  Object.keys(t).forEach((tensor) => tf.dispose(t[tensor]));
  return boxes;
}

export async function getBoxes(inputImage: Tensor4D, config: Config): Promise<DetectBox[]> {
  // sanity check on input
  if ((!inputImage) || (inputImage['isDisposedInternal']) || (inputImage.shape.length !== 4) || (inputImage.shape[1] < 1) || (inputImage.shape[2] < 1)) return [];
  const t: Record<string, Tensor> = {};
  let pad = [0, 0];
  let scale = [1, 1];
  if (config?.face?.detector?.square) {
    const xy = Math.max(inputImage.shape[2], inputImage.shape[1]);
    pad = [Math.floor((xy - inputImage.shape[2]) / 2), Math.floor((xy - inputImage.shape[1]) / 2)];
    t.padded = tf.pad(inputImage, [[0, 0], [pad[1], pad[1]], [pad[0], pad[0]], [0, 0]]);
    scale = [inputImage.shape[2] / xy, inputImage.shape[1] / xy];
    pad = [pad[0] / inputSize, pad[1] / inputSize];
  } else {
    t.padded = inputImage.clone();
  }
  t.resized = tf.image.resizeBilinear(t.padded as Tensor4D, [inputSize, inputSize]);
  t.div = tf.div(t.resized, constants.tf127);
  t.normalized = tf.sub(t.div, constants.tf1);
  const res = model?.execute(t.normalized) as Tensor[];
  if (Array.isArray(res) && res.length > 2) { // pinto converted model?
    const sorted = res.sort((a, b) => a.size - b.size);
    t.concat384 = tf.concat([sorted[0], sorted[2]], 2); // dim: 384, 1 + 16
    t.concat512 = tf.concat([sorted[1], sorted[3]], 2); // dim: 512, 1 + 16
    t.concat = tf.concat([t.concat512, t.concat384], 1);
    t.batch = tf.squeeze(t.concat, [0]);
  } else if (Array.isArray(res)) { // new facemesh-detection tfhub model
    t.batch = tf.squeeze(res[0]);
  } else { // original blazeface tfhub model
    t.batch = tf.squeeze(res);
  }
  tf.dispose(res);
  t.boxes = decodeBoxes(t.batch);
  t.logits = tf.slice(t.batch, [0, 0], [-1, 1]);
  t.sigmoid = tf.sigmoid(t.logits);
  t.scores = tf.squeeze(t.sigmoid);
  t.nms = await tf.image.nonMaxSuppressionAsync(t.boxes as Tensor2D, t.scores as Tensor1D, (config.face.detector?.maxDetected || 0), (config.face.detector?.iouThreshold || 0), (config.face.detector?.minConfidence || 0));
  const nms = await t.nms.array() as number[];
  const boxes: DetectBox[] = [];
  const scores = await t.scores.data();
  for (let i = 0; i < nms.length; i++) {
    const confidence = scores[nms[i]];
    if (confidence > (config.face.detector?.minConfidence || 0)) {
      const b: Record<string, Tensor> = {};
      b.bbox = tf.slice(t.boxes, [nms[i], 0], [1, -1]);
      b.slice = tf.slice(t.batch, [nms[i], keypointsCount - 1], [1, -1]);
      b.squeeze = tf.squeeze(b.slice);
      b.landmarks = tf.reshape(b.squeeze, [keypointsCount, -1]);
      const points = await b.bbox.data();
      const unpadded = [ // TODO fix this math
        points[0] * scale[0] - pad[0],
        points[1] * scale[1] - pad[1],
        points[2] * scale[0] - pad[0],
        points[3] * scale[1] - pad[1],
      ];
      const rawBox = {
        startPoint: [unpadded[0], unpadded[1]] as Point,
        endPoint: [unpadded[2], unpadded[3]] as Point,
        landmarks: (await b.landmarks.array()) as Point[],
        confidence,
      };
      b.anchor = tf.slice(anchors as Tensor, [nms[i], 0], [1, 2]);
      const anchor = await b.anchor.data();
      const scaledBox = util.scaleBoxCoordinates(rawBox, [(inputImage.shape[2] || 0) / inputSize, (inputImage.shape[1] || 0) / inputSize], anchor);
      const enlargedBox = util.enlargeBox(scaledBox, config.face.detector?.scale || 1.4);
      const squaredBox = util.squarifyBox(enlargedBox);
      if (squaredBox.size[0] > (config.face.detector?.['minSize'] || 0) && squaredBox.size[1] > (config.face.detector?.['minSize'] || 0)) boxes.push(squaredBox);
      Object.keys(b).forEach((tensor) => tf.dispose(b[tensor]));
    }
  }
  Object.keys(t).forEach((tensor) => tf.dispose(t[tensor]));
  return boxes;
}
