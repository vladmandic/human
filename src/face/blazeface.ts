/**
 * BlazeFace, FaceMesh & Iris model implementation
 * See `facemesh.ts` for entry point
 */

import { log, join } from '../util/util';
import * as tf from '../../dist/tfjs.esm.js';
import * as util from './facemeshutil';
import type { Config } from '../config';
import type { Tensor, GraphModel } from '../tfjs/types';
import { env } from '../util/env';
import type { Point } from '../result';

const keypointsCount = 6;
let model: GraphModel | null;
let anchorsData: [number, number][] = [];
let anchors: Tensor | null = null;
let inputSize = 0;

export const size = () => inputSize;

export async function load(config: Config): Promise<GraphModel> {
  if (env.initial) model = null;
  if (!model) {
    model = await tf.loadGraphModel(join(config.modelBasePath, config.face.detector?.modelPath || '')) as unknown as GraphModel;
    if (!model || !model['modelUrl']) log('load model failed:', config.face.detector?.modelPath);
    else if (config.debug) log('load model:', model['modelUrl']);
  } else if (config.debug) log('cached model:', model['modelUrl']);
  inputSize = model.inputs[0].shape ? model.inputs[0].shape[2] : 0;
  if (inputSize === -1) inputSize = 64;
  anchorsData = util.generateAnchors(inputSize);
  anchors = tf.tensor2d(anchorsData);
  return model;
}

function decodeBounds(boxOutputs) {
  const t: Record<string, Tensor> = {};
  t.boxStarts = tf.slice(boxOutputs, [0, 1], [-1, 2]);
  t.centers = tf.add(t.boxStarts, anchors);
  t.boxSizes = tf.slice(boxOutputs, [0, 3], [-1, 2]);
  t.boxSizesNormalized = tf.div(t.boxSizes, inputSize);
  t.centersNormalized = tf.div(t.centers, inputSize);
  t.halfBoxSize = tf.div(t.boxSizesNormalized, 2);
  t.starts = tf.sub(t.centersNormalized, t.halfBoxSize);
  t.ends = tf.add(t.centersNormalized, t.halfBoxSize);
  t.startNormalized = tf.mul(t.starts, inputSize);
  t.endNormalized = tf.mul(t.ends, inputSize);
  const boxes = tf.concat2d([t.startNormalized, t.endNormalized], 1);
  Object.keys(t).forEach((tensor) => tf.dispose(t[tensor]));
  return boxes;
}

export async function getBoxes(inputImage: Tensor, config: Config) {
  // sanity check on input
  if ((!inputImage) || (inputImage['isDisposedInternal']) || (inputImage.shape.length !== 4) || (inputImage.shape[1] < 1) || (inputImage.shape[2] < 1)) return { boxes: [] };
  const t: Record<string, Tensor> = {};

  t.resized = tf.image.resizeBilinear(inputImage, [inputSize, inputSize]);
  t.div = tf.div(t.resized, 127.5);
  t.normalized = tf.sub(t.div, 0.5);
  const res = model?.execute(t.normalized) as Tensor[];
  if (Array.isArray(res)) { // are we using tfhub or pinto converted model?
    const sorted = res.sort((a, b) => a.size - b.size);
    t.concat384 = tf.concat([sorted[0], sorted[2]], 2); // dim: 384, 1 + 16
    t.concat512 = tf.concat([sorted[1], sorted[3]], 2); // dim: 512, 1 + 16
    t.concat = tf.concat([t.concat512, t.concat384], 1);
    t.batch = tf.squeeze(t.concat, 0);
  } else {
    t.batch = tf.squeeze(res); // when using tfhub model
  }
  tf.dispose(res);
  t.boxes = decodeBounds(t.batch);
  t.logits = tf.slice(t.batch, [0, 0], [-1, 1]);
  t.sigmoid = tf.sigmoid(t.logits);
  t.scores = tf.squeeze(t.sigmoid);

  t.nms = await tf.image.nonMaxSuppressionAsync(t.boxes, t.scores, (config.face.detector?.maxDetected || 0), (config.face.detector?.iouThreshold || 0), (config.face.detector?.minConfidence || 0));
  const nms = await t.nms.array() as number[];
  const boxes: Array<{ box: { startPoint: Point, endPoint: Point }, landmarks: Point[], confidence: number }> = [];
  const scores = await t.scores.data();
  for (let i = 0; i < nms.length; i++) {
    const confidence = scores[nms[i]];
    if (confidence > (config.face.detector?.minConfidence || 0)) {
      const b: Record<string, Tensor> = {};
      b.bbox = tf.slice(t.boxes, [nms[i], 0], [1, -1]);
      b.slice = tf.slice(t.batch, [nms[i], keypointsCount - 1], [1, -1]);
      b.squeeze = tf.squeeze(b.slice);
      b.landmarks = tf.reshape(b.squeeze, [keypointsCount, -1]);
      b.startPoint = tf.slice(b.bbox, [0, 0], [-1, 2]);
      b.endPoint = tf.slice(b.bbox, [0, 2], [-1, 2]);
      boxes.push({
        box: {
          startPoint: (await b.startPoint.data()) as unknown as Point,
          endPoint: (await b.endPoint.data()) as unknown as Point,
        },
        landmarks: (await b.landmarks.array()) as Point[],
        confidence,
      });
      Object.keys(b).forEach((tensor) => tf.dispose(b[tensor]));
    }
  }

  Object.keys(t).forEach((tensor) => tf.dispose(t[tensor]));
  return { boxes, scaleFactor: [inputImage.shape[2] / inputSize, inputImage.shape[1] / inputSize] };
}
