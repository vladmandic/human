/**
 * CenterNet object detection model implementation
 *
 * Based on: [**NanoDet**](https://github.com/RangiLyu/nanodet)
 */

import { log, now } from '../util/util';
import * as tf from '../../dist/tfjs.esm.js';
import { loadModel } from '../tfjs/load';
import { labels } from './labels';
import type { ObjectResult, ObjectType, Box } from '../result';
import type { GraphModel, Tensor } from '../tfjs/types';
import type { Config } from '../config';
import { env } from '../util/env';

let model: GraphModel | null;
let inputSize = 0;
let last: ObjectResult[] = [];
let lastTime = 0;
let skipped = Number.MAX_SAFE_INTEGER;

export async function load(config: Config): Promise<GraphModel> {
  if (env.initial) model = null;
  if (!model) {
    // fakeOps(['floormod'], config);
    model = await loadModel(config.object.modelPath);
    const inputs = Object.values(model.modelSignature['inputs']);
    inputSize = Array.isArray(inputs) ? parseInt(inputs[0].tensorShape.dim[2].size) : 0;
  } else if (config.debug) log('cached model:', model['modelUrl']);
  return model;
}

async function process(res: Tensor | null, outputShape: [number, number], config: Config) {
  if (!res) return [];
  const t: Record<string, Tensor> = {};
  const results: Array<ObjectResult> = [];
  const detections = await res.array() as number[][][];
  t.squeeze = tf.squeeze(res);
  const arr = tf.split(t.squeeze, 6, 1) as Tensor[]; // x1, y1, x2, y2, score, class
  t.stack = tf.stack([arr[1], arr[0], arr[3], arr[2]], 1); // reorder dims as tf.nms expects y, x
  t.boxes = tf.squeeze(t.stack);
  t.scores = tf.squeeze(arr[4]);
  t.classes = tf.squeeze(arr[5]);
  tf.dispose([res, ...arr]);
  t.nms = await tf.image.nonMaxSuppressionAsync(t.boxes, t.scores, config.object.maxDetected, config.object.iouThreshold, (config.object.minConfidence || 0));
  const nms = await t.nms.data();
  let i = 0;
  for (const id of Array.from(nms)) {
    const score = Math.trunc(100 * detections[0][id][4]) / 100;
    const classVal = detections[0][id][5];
    const label = labels[classVal].label as ObjectType;
    const [x, y] = [
      detections[0][id][0] / inputSize,
      detections[0][id][1] / inputSize,
    ];
    const boxRaw: Box = [
      x,
      y,
      detections[0][id][2] / inputSize - x,
      detections[0][id][3] / inputSize - y,
    ];
    const box: Box = [
      Math.trunc(boxRaw[0] * outputShape[0]),
      Math.trunc(boxRaw[1] * outputShape[1]),
      Math.trunc(boxRaw[2] * outputShape[0]),
      Math.trunc(boxRaw[3] * outputShape[1]),
    ];
    results.push({ id: i++, score, class: classVal, label, box, boxRaw });
  }
  Object.keys(t).forEach((tensor) => tf.dispose(t[tensor]));
  return results;
}

export async function predict(input: Tensor, config: Config): Promise<ObjectResult[]> {
  const skipTime = (config.object.skipTime || 0) > (now() - lastTime);
  const skipFrame = skipped < (config.object.skipFrames || 0);
  if (config.skipAllowed && skipTime && skipFrame && (last.length > 0)) {
    skipped++;
    return last;
  }
  skipped = 0;
  return new Promise(async (resolve) => {
    const outputSize = [input.shape[2] || 0, input.shape[1] || 0] as [number, number];
    const resize = tf.image.resizeBilinear(input, [inputSize, inputSize]);
    const objectT = config.object.enabled ? model?.execute(resize, ['tower_0/detections']) as Tensor : null;
    lastTime = now();
    tf.dispose(resize);

    const obj = await process(objectT, outputSize, config);
    last = obj;

    resolve(obj);
  });
}
