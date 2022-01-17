/**
 * GEAR [gender/emotion/age/race] model implementation
 *
 * Based on: [**GEAR Predictor**](https://github.com/Udolf15/GEAR-Predictor)
 */

import { log, now } from '../util/util';
import * as tf from '../../dist/tfjs.esm.js';
import { loadModel } from '../tfjs/load';
import type { Gender, Race } from '../result';
import type { Config } from '../config';
import type { GraphModel, Tensor } from '../tfjs/types';
import { env } from '../util/env';

export type GearType = { age: number, gender: Gender, genderScore: number, race: Array<{ score: number, race: Race }> }
let model: GraphModel | null;
const last: Array<GearType> = [];
const raceNames = ['white', 'black', 'asian', 'indian', 'other'];
const ageWeights = [15, 23, 28, 35.5, 45.5, 55.5, 65];
let lastCount = 0;
let lastTime = 0;
let skipped = Number.MAX_SAFE_INTEGER;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function load(config: Config) {
  if (env.initial) model = null;
  if (!model) model = await loadModel(config.face['gear']);
  else if (config.debug) log('cached model:', model['modelUrl']);
  return model;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function predict(image: Tensor, config: Config, idx: number, count: number): Promise<GearType> {
  if (!model) return { age: 0, gender: 'unknown', genderScore: 0, race: [] };
  const skipFrame = skipped < (config.face['gear']?.skipFrames || 0);
  const skipTime = (config.face['gear']?.skipTime || 0) > (now() - lastTime);
  if (config.skipAllowed && skipTime && skipFrame && (lastCount === count) && last[idx]) {
    skipped++;
    return last[idx];
  }
  skipped = 0;
  return new Promise(async (resolve) => {
    if (!model?.inputs[0].shape) return;
    const t: Record<string, Tensor> = {};
    // t.resize = tf.image.resizeBilinear(image, [model?.inputs[0].shape[2], model?.inputs[0].shape[1]], false);
    const box = [[0.0, 0.10, 0.90, 0.90]]; // empyrical values for top, left, bottom, right
    t.resize = tf.image.cropAndResize(image, box, [0], [model.inputs[0].shape[2], model.inputs[0].shape[1]]);
    const obj: GearType = { age: 0, gender: 'unknown', genderScore: 0, race: [] };
    if (config.face['gear']?.enabled) [t.age, t.gender, t.race] = model.execute(t.resize, ['age_output', 'gender_output', 'race_output']) as Tensor[];
    const gender = await t.gender.data();
    obj.gender = gender[0] > gender[1] ? 'male' : 'female';
    obj.genderScore = Math.round(100 * (gender[0] > gender[1] ? gender[0] : gender[1])) / 100;
    const race = await t.race.data();
    for (let i = 0; i < race.length; i++) {
      if (race[i] > (config.face['gear']?.minConfidence || 0.2)) obj.race.push({ score: Math.round(100 * race[i]) / 100, race: raceNames[i] as Race });
    }
    obj.race.sort((a, b) => b.score - a.score);
    // {0: 'Below20', 1: '21-25', 2: '26-30', 3: '31-40',4: '41-50', 5: '51-60', 6: 'Above60'}
    const ageDistribution = Array.from(await t.age.data());
    const ageSorted = ageDistribution.map((a, i) => [ageWeights[i], a]).sort((a, b) => b[1] - a[1]);
    let age = ageSorted[0][0]; // pick best starting point
    for (let i = 1; i < ageSorted.length; i++) age += ageSorted[i][1] * (ageSorted[i][0] - age); // adjust with each other choice by weight
    obj.age = Math.round(10 * age) / 10;
    Object.keys(t).forEach((tensor) => tf.dispose(t[tensor]));
    last[idx] = obj;
    lastCount = count;
    lastTime = now();
    resolve(obj);
  });
}
