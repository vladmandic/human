/**
 * FaceRes model implementation
 *
 * Returns Age, Gender, Descriptor
 * Implements Face similarity function
 *
 * Based on: [**HSE-FaceRes**](https://github.com/HSE-asavchenko/HSE_FaceRec_tf)
 */

import * as tf from 'dist/tfjs.esm.js';
import { log, now } from '../util/util';
import { env } from '../util/env';
import { loadModel } from '../tfjs/load';
import { constants } from '../tfjs/constants';
import type { Tensor, GraphModel, Tensor4D, Tensor1D } from '../tfjs/types';
import type { Config } from '../config';
import type { Gender, Race } from '../result';

export interface FaceRes { age: number, gender: Gender, genderScore: number, descriptor: number[], race?: { score: number, race: Race }[] }

let model: GraphModel | null;
const last: FaceRes[] = [];

let lastTime = 0;
let lastCount = 0;
let skipped = Number.MAX_SAFE_INTEGER;

export async function load(config: Config): Promise<GraphModel> {
  if (env.initial) model = null;
  if (!model) model = await loadModel(config.face.description?.modelPath);
  else if (config.debug) log('cached model:', model['modelUrl']);
  return model;
}

export function enhance(input, config: Config): Tensor {
  const tensor = (input.image || input.tensor || input) as Tensor4D; // input received from detector is already normalized to 0..1, input is also assumed to be straightened
  if (!model?.inputs[0].shape) return tensor; // model has no shape so no point continuing
  let crop: Tensor;
  if (config.face.description?.['crop'] > 0) { // optional crop
    const cropval = config.face.description?.['crop'];
    const box = [[cropval, cropval, 1 - cropval, 1 - cropval]];
    crop = tf.image.cropAndResize(tensor, box, [0], [model.inputs[0].shape[2], model.inputs[0].shape[1]]);
  } else {
    crop = tf.image.resizeBilinear(tensor, [model.inputs[0].shape[2], model.inputs[0].shape[1]], false);
  }
  const norm: Tensor = tf.mul(crop, constants.tf255);
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

export async function predict(image: Tensor4D, config: Config, idx: number, count: number): Promise<FaceRes> {
  const obj: FaceRes = {
    age: 0 as number,
    gender: 'unknown' as Gender,
    genderScore: 0 as number,
    descriptor: [] as number[],
  };
  if (!model?.['executor']) return obj;
  const skipFrame = skipped < (config.face.description?.skipFrames || 0);
  const skipTime = (config.face.description?.skipTime || 0) > (now() - lastTime);
  if (config.skipAllowed && skipFrame && skipTime && (lastCount === count) && (last?.[idx]?.age > 0) && (last?.[idx]?.genderScore > 0)) {
    skipped++;
    return last[idx];
  }
  skipped = 0;
  return new Promise(async (resolve) => {
    if (config.face.description?.enabled) {
      const enhanced = enhance(image, config);
      const resT = model?.execute(enhanced) as Tensor[];
      lastTime = now();
      tf.dispose(enhanced);
      const genderT = resT.find((t) => t.shape[1] === 1) as Tensor;
      const gender = await genderT.data();
      const confidence = Math.trunc(200 * Math.abs((gender[0] - 0.5))) / 100;
      if (confidence > (config.face.description.minConfidence || 0)) {
        obj.gender = gender[0] <= 0.5 ? 'female' : 'male';
        obj.genderScore = Math.min(0.99, confidence);
      }
      const argmax = tf.argMax(resT.find((t) => t.shape[1] === 100) as Tensor1D, 1);
      const ageIdx: number = (await argmax.data())[0];
      tf.dispose(argmax);
      const ageT = resT.find((t) => t.shape[1] === 100) as Tensor;
      const all = await ageT.data();
      obj.age = Math.round(all[ageIdx - 1] > all[ageIdx + 1] ? 10 * ageIdx - 100 * all[ageIdx - 1] : 10 * ageIdx + 100 * all[ageIdx + 1]) / 10;

      if (Number.isNaN(gender[0]) || Number.isNaN(all[0])) log('faceres error:', { model, result: resT });

      const desc = resT.find((t) => t.shape[1] === 1024);
      // const reshape = desc.reshape([128, 8]); // reshape large 1024-element descriptor to 128 x 8
      // const reduce = reshape.logSumExp(1); // reduce 2nd dimension by calculating logSumExp on it which leaves us with 128-element descriptor
      const descriptor = desc ? await desc.data() : [] as number[];
      obj.descriptor = Array.from(descriptor);
      resT.forEach((t) => tf.dispose(t));
    }
    last[idx] = obj;
    lastCount = count;
    resolve(obj);
  });
}
