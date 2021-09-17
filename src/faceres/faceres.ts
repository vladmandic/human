/**
 * HSE-FaceRes Module
 * Returns Age, Gender, Descriptor
 * Implements Face simmilarity function
 */

import { log, join } from '../helpers';
import * as tf from '../../dist/tfjs.esm.js';
import type { Tensor, GraphModel } from '../tfjs/types';
import type { Config } from '../config';
import { env } from '../env';

let model: GraphModel | null;
const last: Array<{
  age: number,
  gender: string,
  genderScore: number,
  descriptor: number[],
}> = [];

let lastCount = 0;
let skipped = Number.MAX_SAFE_INTEGER;

type DB = Array<{ name: string, source: string, embedding: number[] }>;

export async function load(config: Config): Promise<GraphModel> {
  const modelUrl = join(config.modelBasePath, config.face.description?.modelPath || '');
  if (env.initial) model = null;
  if (!model) {
    model = await tf.loadGraphModel(modelUrl) as unknown as GraphModel;
    if (!model) log('load model failed:', config.face.description?.modelPath || '');
    else if (config.debug) log('load model:', modelUrl);
  } else if (config.debug) log('cached model:', modelUrl);
  return model;
}

export function similarity(embedding1: Array<number>, embedding2: Array<number>, order = 2): number {
  if (!embedding1 || !embedding2) return 0;
  if (embedding1?.length === 0 || embedding2?.length === 0) return 0;
  if (embedding1?.length !== embedding2?.length) return 0;
  // general minkowski distance, euclidean distance is limited case where order is 2
  const distance = 5.0 * embedding1
    .map((_val, i) => (Math.abs(embedding1[i] - embedding2[i]) ** order)) // distance squared
    .reduce((sum, now) => (sum + now), 0) // sum all distances
    ** (1 / order); // get root of
  const res = Math.max(0, 100 - distance) / 100.0;
  return res;
}

export function match(embedding: Array<number>, db: DB, threshold = 0) {
  let best = { similarity: 0, name: '', source: '', embedding: [] as number[] };
  if (!embedding || !db || !Array.isArray(embedding) || !Array.isArray(db)) return best;
  for (const f of db) {
    if (f.embedding && f.name) {
      const perc = similarity(embedding, f.embedding);
      if (perc > threshold && perc > best.similarity) best = { ...f, similarity: perc };
    }
  }
  return best;
}

export function enhance(input): Tensor {
  const image = tf.tidy(() => {
    // input received from detector is already normalized to 0..1
    // input is also assumed to be straightened
    const tensor = input.image || input.tensor || input;
    if (!(tensor instanceof tf.Tensor)) return null;
    // do a tight crop of image and resize it to fit the model
    const box = [[0.05, 0.15, 0.85, 0.85]]; // empyrical values for top, left, bottom, right
    // const box = [[0.0, 0.0, 1.0, 1.0]]; // basically no crop for test
    if (!model?.inputs[0].shape) return null; // model has no shape so no point continuing
    const crop = (tensor.shape.length === 3)
      ? tf.image.cropAndResize(tf.expandDims(tensor, 0), box, [0], [model.inputs[0].shape[2], model.inputs[0].shape[1]]) // add batch dimension if missing
      : tf.image.cropAndResize(tensor, box, [0], [model.inputs[0].shape[2], model.inputs[0].shape[1]]);

    /*
    // just resize to fit the embedding model instead of cropping
    const crop = tf.image.resizeBilinear(tensor, [model.inputs[0].shape[2], model.inputs[0].shape[1]], false);
    */

    /*
    // convert to black&white to avoid colorization impact
    const rgb = [0.2989, 0.5870, 0.1140]; // factors for red/green/blue colors when converting to grayscale: https://www.mathworks.com/help/matlab/ref/rgb2gray.html
    const [red, green, blue] = tf.split(crop, 3, 3);
    const redNorm = tf.mul(red, rgb[0]);
    const greenNorm = tf.mul(green, rgb[1]);
    const blueNorm = tf.mul(blue, rgb[2]);
    const grayscale = tf.addN([redNorm, greenNorm, blueNorm]);
    const merge = tf.stack([grayscale, grayscale, grayscale], 3).squeeze(4);
    */

    /*
    // increase image pseudo-contrast 100%
    // (or do it per-channel so mean is done on each channel)
    // (or calculate histogram and do it based on histogram)
    const mean = merge.mean();
    const factor = 2;
    const contrast = merge.sub(mean).mul(factor).add(mean);
    */

    /*
    // normalize brightness from 0..1
    // silly way of creating pseudo-hdr of image
    const darken = crop.sub(crop.min());
    const lighten = darken.div(darken.max());
    */

    const norm = tf.mul(crop, 255);

    return norm;
  });
  return image;
}

export async function predict(image: Tensor, config: Config, idx, count) {
  if (!model) return null;
  if ((skipped < (config.face.description?.skipFrames || 0)) && config.skipFrame && (lastCount === count) && last[idx]?.age && (last[idx]?.age > 0)) {
    skipped++;
    return last[idx];
  }
  skipped = 0;
  return new Promise(async (resolve) => {
    const enhanced = enhance(image);

    let resT;
    const obj = {
      age: <number>0,
      gender: <string>'unknown',
      genderScore: <number>0,
      descriptor: <number[]>[],
    };

    if (config.face.description?.enabled) resT = await model?.predict(enhanced);
    tf.dispose(enhanced);

    if (resT) {
      const gender = await resT.find((t) => t.shape[1] === 1).data();
      const confidence = Math.trunc(200 * Math.abs((gender[0] - 0.5))) / 100;
      if (confidence > (config.face.description?.minConfidence || 0)) {
        obj.gender = gender[0] <= 0.5 ? 'female' : 'male';
        obj.genderScore = Math.min(0.99, confidence);
      }
      const argmax = tf.argMax(resT.find((t) => t.shape[1] === 100), 1);
      const age = (await argmax.data())[0];
      tf.dispose(argmax);
      const all = await resT.find((t) => t.shape[1] === 100).data();
      obj.age = Math.round(all[age - 1] > all[age + 1] ? 10 * age - 100 * all[age - 1] : 10 * age + 100 * all[age + 1]) / 10;

      const desc = resT.find((t) => t.shape[1] === 1024);
      // const reshape = desc.reshape([128, 8]); // reshape large 1024-element descriptor to 128 x 8
      // const reduce = reshape.logSumExp(1); // reduce 2nd dimension by calculating logSumExp on it which leaves us with 128-element descriptor

      const descriptor = await desc.data();
      obj.descriptor = [...descriptor];
      resT.forEach((t) => tf.dispose(t));
    }
    last[idx] = obj;
    lastCount = count;
    resolve(obj);
  });
}
