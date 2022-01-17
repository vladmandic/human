/**
 * FaceRes model implementation
 *
 * Returns Age, Gender, Descriptor
 * Implements Face simmilarity function
 *
 * Based on: [**HSE-FaceRes**](https://github.com/HSE-asavchenko/HSE_FaceRec_tf)
 */

import { log, now } from '../util/util';
import { env } from '../util/env';
import * as tf from '../../dist/tfjs.esm.js';
import { loadModel } from '../tfjs/load';
import { constants } from '../tfjs/constants';
import type { Tensor, GraphModel } from '../tfjs/types';
import type { Config } from '../config';
import type { Gender, Race } from '../result';

export type FaceRes = { age: number, gender: Gender, genderScore: number, descriptor: number[], race?: { score: number, race: Race }[] };

let model: GraphModel | null;
const last: Array<{
  age: number,
  gender: Gender,
  genderScore: number,
  descriptor: number[],
}> = [];

let lastTime = 0;
let lastCount = 0;
let skipped = Number.MAX_SAFE_INTEGER;

export async function load(config: Config): Promise<GraphModel> {
  if (env.initial) model = null;
  if (!model) model = await loadModel(config.face.description?.modelPath);
  else if (config.debug) log('cached model:', model['modelUrl']);
  return model;
}

export function enhance(input): Tensor {
  const tensor = (input.image || input.tensor || input) as Tensor; // input received from detector is already normalized to 0..1, input is also assumed to be straightened
  if (!model?.inputs[0].shape) return tensor; // model has no shape so no point continuing
  const crop = tf.image.resizeBilinear(tensor, [model.inputs[0].shape[2], model.inputs[0].shape[1]], false);
  const norm = tf.mul(crop, constants.tf255);
  tf.dispose(crop);
  return norm;
  /*
  // do a tight crop of image and resize it to fit the model
  const box = [[0.05, 0.15, 0.85, 0.85]]; // empyrical values for top, left, bottom, right
  const crop = (tensor.shape.length === 3)
    ? tf.image.cropAndResize(tf.expandDims(tensor, 0), box, [0], [model.inputs[0].shape[2], model.inputs[0].shape[1]]) // add batch dimension if missing
    : tf.image.cropAndResize(tensor, box, [0], [model.inputs[0].shape[2], model.inputs[0].shape[1]]);
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
}

export async function predict(image: Tensor, config: Config, idx: number, count: number): Promise<FaceRes> {
  if (!model) return { age: 0, gender: 'unknown', genderScore: 0, descriptor: [] };
  const skipFrame = skipped < (config.face.description?.skipFrames || 0);
  const skipTime = (config.face.description?.skipTime || 0) > (now() - lastTime);
  if (config.skipAllowed && skipFrame && skipTime && (lastCount === count) && last[idx]?.age && (last[idx]?.age > 0)) {
    skipped++;
    return last[idx];
  }
  skipped = 0;
  return new Promise(async (resolve) => {
    const obj = {
      age: <number>0,
      gender: <Gender>'unknown',
      genderScore: <number>0,
      descriptor: <number[]>[],
    };

    if (config.face.description?.enabled) {
      const enhanced = enhance(image);
      const resT = model?.execute(enhanced) as Tensor[];
      lastTime = now();
      tf.dispose(enhanced);
      const genderT = await resT.find((t) => t.shape[1] === 1) as Tensor;
      const gender = await genderT.data();
      const confidence = Math.trunc(200 * Math.abs((gender[0] - 0.5))) / 100;
      if (confidence > (config.face.description?.minConfidence || 0)) {
        obj.gender = gender[0] <= 0.5 ? 'female' : 'male';
        obj.genderScore = Math.min(0.99, confidence);
      }
      const argmax = tf.argMax(resT.find((t) => t.shape[1] === 100), 1);
      const age = (await argmax.data())[0];
      tf.dispose(argmax);
      const ageT = resT.find((t) => t.shape[1] === 100) as Tensor;
      const all = await ageT.data();
      obj.age = Math.round(all[age - 1] > all[age + 1] ? 10 * age - 100 * all[age - 1] : 10 * age + 100 * all[age + 1]) / 10;

      const desc = resT.find((t) => t.shape[1] === 1024);
      // const reshape = desc.reshape([128, 8]); // reshape large 1024-element descriptor to 128 x 8
      // const reduce = reshape.logSumExp(1); // reduce 2nd dimension by calculating logSumExp on it which leaves us with 128-element descriptor
      const descriptor = desc ? await desc.data() : <number[]>[];
      obj.descriptor = Array.from(descriptor);
      resT.forEach((t) => tf.dispose(t));
    }
    last[idx] = obj;
    lastCount = count;
    resolve(obj);
  });
}
