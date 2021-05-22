import { log, join } from '../helpers';
import * as tf from '../../dist/tfjs.esm.js';
import { labels } from './labels';
import { Item } from '../result';

let model;
let last: Item[] = [];
let skipped = Number.MAX_SAFE_INTEGER;

export async function load(config) {
  if (!model) {
    model = await tf.loadGraphModel(join(config.modelBasePath, config.object.modelPath));
    const inputs = Object.values(model.modelSignature['inputs']);
    model.inputSize = Array.isArray(inputs) ? parseInt(inputs[0].tensorShape.dim[2].size) : null;
    if (!model.inputSize) throw new Error(`Human: Cannot determine model inputSize: ${config.object.modelPath}`);
    if (!model || !model.modelUrl) log('load model failed:', config.object.modelPath);
    else if (config.debug) log('load model:', model.modelUrl);
  } else if (config.debug) log('cached model:', model.modelUrl);
  return model;
}

async function process(res, inputSize, outputShape, config) {
  const results: Array<{ score: number, class: number, label: string, box: number[], boxRaw: number[] }> = [];
  const detections = res.arraySync();
  const squeezeT = tf.squeeze(res);
  res.dispose();
  const arr = tf.split(squeezeT, 6, 1); // x1, y1, x2, y2, score, class
  squeezeT.dispose();
  const stackT = tf.stack([arr[1], arr[0], arr[3], arr[2]], 1); // tf.nms expects y, x
  const boxesT = stackT.squeeze();
  const scoresT = arr[4].squeeze();
  const classesT = arr[5].squeeze();
  arr.forEach((t) => t.dispose());
  // @ts-ignore boxesT type is not correctly inferred
  const nmsT = await tf.image.nonMaxSuppressionAsync(boxesT, scoresT, config.object.maxDetected, config.object.iouThreshold, config.object.minConfidence);
  boxesT.dispose();
  scoresT.dispose();
  classesT.dispose();
  const nms = nmsT.dataSync();
  nmsT.dispose();
  for (const id of nms) {
    const score = detections[0][id][4];
    const classVal = detections[0][id][5];
    const label = labels[classVal].label;
    const boxRaw = [
      detections[0][id][0] / inputSize,
      detections[0][id][1] / inputSize,
      detections[0][id][2] / inputSize,
      detections[0][id][3] / inputSize,
    ];
    const box = [
      Math.trunc(boxRaw[0] * outputShape[0]),
      Math.trunc(boxRaw[1] * outputShape[1]),
      Math.trunc(boxRaw[2] * outputShape[0]),
      Math.trunc(boxRaw[3] * outputShape[1]),
    ];
    results.push({ score, class: classVal, label, box, boxRaw });
  }
  return results;
}

export async function predict(image, config): Promise<Item[]> {
  if ((skipped < config.object.skipFrames) && config.skipFrame && (last.length > 0)) {
    skipped++;
    return last;
  }
  skipped = 0;
  return new Promise(async (resolve) => {
    const outputSize = [image.shape[2], image.shape[1]];
    const resize = tf.image.resizeBilinear(image, [model.inputSize, model.inputSize], false);

    let objectT;
    if (config.object.enabled) objectT = model.execute(resize, 'tower_0/detections');
    resize.dispose();

    const obj = await process(objectT, model.inputSize, outputSize, config);
    last = obj;
    resolve(obj);
  });
}
