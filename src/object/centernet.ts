/**
 * CenterNet object detection module
 */

import { log, join } from '../helpers';
import * as tf from '../../dist/tfjs.esm.js';
import { labels } from './labels';
import type { ObjectResult } from '../result';
import type { GraphModel, Tensor } from '../tfjs/types';
import type { Config } from '../config';
import { env } from '../env';

let model: GraphModel | null;
let inputSize = 0;
let last: ObjectResult[] = [];
let skipped = Number.MAX_SAFE_INTEGER;

export async function load(config: Config): Promise<GraphModel> {
  if (env.initial) model = null;
  if (!model) {
    model = await tf.loadGraphModel(join(config.modelBasePath, config.object.modelPath || '')) as unknown as GraphModel;
    const inputs = Object.values(model.modelSignature['inputs']);
    inputSize = Array.isArray(inputs) ? parseInt(inputs[0].tensorShape.dim[2].size) : 0;
    if (!model || !model['modelUrl']) log('load model failed:', config.object.modelPath);
    else if (config.debug) log('load model:', model['modelUrl']);
  } else if (config.debug) log('cached model:', model['modelUrl']);
  return model;
}

async function process(res: Tensor | null, outputShape, config: Config) {
  if (!res) return [];
  const results: Array<ObjectResult> = [];
  const detections = await res.array();
  const squeezeT = tf.squeeze(res);
  tf.dispose(res);
  const arr = tf.split(squeezeT, 6, 1); // x1, y1, x2, y2, score, class
  tf.dispose(squeezeT);
  const stackT = tf.stack([arr[1], arr[0], arr[3], arr[2]], 1); // reorder dims as tf.nms expects y, x
  const boxesT = tf.squeeze(stackT);
  tf.dispose(stackT);
  const scoresT = tf.squeeze(arr[4]);
  const classesT = tf.squeeze(arr[5]);
  arr.forEach((t) => tf.dispose(t));
  const nmsT = await tf.image.nonMaxSuppressionAsync(boxesT, scoresT, config.object.maxDetected, config.object.iouThreshold, config.object.minConfidence);
  tf.dispose(boxesT);
  tf.dispose(scoresT);
  tf.dispose(classesT);
  const nms = await nmsT.data();
  tf.dispose(nmsT);
  let i = 0;
  for (const id of nms) {
    const score = Math.trunc(100 * detections[0][id][4]) / 100;
    const classVal = detections[0][id][5];
    const label = labels[classVal].label;
    const [x, y] = [
      detections[0][id][0] / inputSize,
      detections[0][id][1] / inputSize,
    ];
    const boxRaw = [
      x,
      y,
      detections[0][id][2] / inputSize - x,
      detections[0][id][3] / inputSize - y,
    ] as [number, number, number, number];
    const box = [
      Math.trunc(boxRaw[0] * outputShape[0]),
      Math.trunc(boxRaw[1] * outputShape[1]),
      Math.trunc(boxRaw[2] * outputShape[0]),
      Math.trunc(boxRaw[3] * outputShape[1]),
    ] as [number, number, number, number];
    results.push({ id: i++, score, class: classVal, label, box, boxRaw });
  }
  return results;
}

export async function predict(input: Tensor, config: Config): Promise<ObjectResult[]> {
  if ((skipped < (config.object.skipFrames || 0)) && config.skipFrame && (last.length > 0)) {
    skipped++;
    return last;
  }
  skipped = 0;
  if (!env.kernels.includes('mod') || !env.kernels.includes('sparsetodense')) return last;
  return new Promise(async (resolve) => {
    const outputSize = [input.shape[2], input.shape[1]];
    const resize = tf.image.resizeBilinear(input, [inputSize, inputSize]);
    const objectT = config.object.enabled ? model?.execute(resize, ['tower_0/detections']) as Tensor : null;
    tf.dispose(resize);

    const obj = await process(objectT, outputSize, config);
    last = obj;

    resolve(obj);
  });
}
