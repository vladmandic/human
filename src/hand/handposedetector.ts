/**
 * HandPose model implementation
 * See `handpose.ts` for entry point
 */

import * as tf from '../../dist/tfjs.esm.js';
import * as util from './handposeutil';
import * as anchors from './handposeanchors';
import { constants } from '../tfjs/constants';
import type { Tensor, GraphModel } from '../tfjs/types';
import type { Point } from '../result';

export class HandDetector {
  model: GraphModel;
  anchors: number[][];
  anchorsTensor: Tensor;
  inputSize: number;
  inputSizeTensor: Tensor;
  doubleInputSizeTensor: Tensor;

  constructor(model) {
    this.model = model;
    this.anchors = anchors.anchors.map((anchor) => [anchor.x, anchor.y]);
    this.anchorsTensor = tf.tensor2d(this.anchors);
    this.inputSize = (this.model && this.model.inputs && this.model.inputs[0].shape) ? this.model.inputs[0].shape[2] : 0;
    this.inputSizeTensor = tf.tensor1d([this.inputSize, this.inputSize]);
    this.doubleInputSizeTensor = tf.tensor1d([this.inputSize * 2, this.inputSize * 2]);
  }

  normalizeBoxes(boxes) {
    const t: Record<string, Tensor> = {};
    t.boxOffsets = tf.slice(boxes, [0, 0], [-1, 2]);
    t.boxSizes = tf.slice(boxes, [0, 2], [-1, 2]);
    t.div = tf.div(t.boxOffsets, this.inputSizeTensor);
    t.boxCenterPoints = tf.add(t.div, this.anchorsTensor);
    t.halfBoxSizes = tf.div(t.boxSizes, this.doubleInputSizeTensor);
    t.sub = tf.sub(t.boxCenterPoints, t.halfBoxSizes);
    t.startPoints = tf.mul(t.sub, this.inputSizeTensor);
    t.add = tf.add(t.boxCenterPoints, t.halfBoxSizes);
    t.endPoints = tf.mul(t.add, this.inputSizeTensor);
    const res = tf.concat2d([t.startPoints, t.endPoints], 1);
    Object.keys(t).forEach((tensor) => tf.dispose(t[tensor]));
    return res;
  }

  normalizeLandmarks(rawPalmLandmarks, index) {
    const t: Record<string, Tensor> = {};
    t.reshape = tf.reshape(rawPalmLandmarks, [-1, 7, 2]);
    t.div = tf.div(t.reshape, this.inputSizeTensor);
    t.landmarks = tf.add(t.div, this.anchors[index]);
    const res = tf.mul(t.landmarks, this.inputSizeTensor);
    Object.keys(t).forEach((tensor) => tf.dispose(t[tensor]));
    return res;
  }

  async predict(input, config): Promise<{ startPoint: Point; endPoint: Point, palmLandmarks: Point[]; confidence: number }[]> {
    const t: Record<string, Tensor> = {};
    t.resize = tf.image.resizeBilinear(input, [this.inputSize, this.inputSize]);
    t.div = tf.div(t.resize, constants.tf127);
    t.image = tf.sub(t.div, constants.tf1);
    t.batched = this.model.execute(t.image) as Tensor;
    t.predictions = tf.squeeze(t.batched);
    t.slice = tf.slice(t.predictions, [0, 0], [-1, 1]);
    t.sigmoid = tf.sigmoid(t.slice);
    t.scores = tf.squeeze(t.sigmoid);
    const scores = await t.scores.data();
    t.boxes = tf.slice(t.predictions, [0, 1], [-1, 4]);
    t.norm = this.normalizeBoxes(t.boxes);
    // box detection is flaky so we look for 3x boxes than we need results
    t.nms = await tf.image.nonMaxSuppressionAsync(t.norm, t.scores, 3 * config.hand.maxDetected, config.hand.iouThreshold, config.hand.minConfidence);
    const nms = await t.nms.array() as Array<number>;
    const hands: Array<{ startPoint: Point; endPoint: Point; palmLandmarks: Point[]; confidence: number }> = [];
    for (const index of nms) {
      const p: Record<string, Tensor> = {};
      p.box = tf.slice(t.norm, [index, 0], [1, -1]);
      p.slice = tf.slice(t.predictions, [index, 5], [1, 14]);
      p.norm = this.normalizeLandmarks(p.slice, index);
      p.palmLandmarks = tf.reshape(p.norm, [-1, 2]);
      const box = await p.box.data();
      const startPoint = box.slice(0, 2) as unknown as Point;
      const endPoint = box.slice(2, 4) as unknown as Point;
      const palmLandmarks = await p.palmLandmarks.array();
      const hand = { startPoint, endPoint, palmLandmarks, confidence: scores[index] };
      const scaled = util.scaleBoxCoordinates(hand, [input.shape[2] / this.inputSize, input.shape[1] / this.inputSize]);
      hands.push(scaled);
      Object.keys(p).forEach((tensor) => tf.dispose(p[tensor]));
    }
    Object.keys(t).forEach((tensor) => tf.dispose(t[tensor]));
    return hands;
  }
}
