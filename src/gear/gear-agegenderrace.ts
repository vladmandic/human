/**
 * GEAR [gender/emotion/age/race] model implementation
 *
 * Based on: [**GEAR Predictor**](https://github.com/Udolf15/GEAR-Predictor)
 *
 * Obsolete and replaced by `faceres` that performs age/gender/descriptor analysis
 * Config placeholder: agegenderrace: { enabled: true, modelPath: 'gear.json' },
 */

import { log, join } from '../util/util';
import * as tf from '../../dist/tfjs.esm.js';
import type { Config } from '../config';
import type { GraphModel, Tensor } from '../tfjs/types';
import { env } from '../util/env';

let model: GraphModel | null;

let last = { age: 0 };
let skipped = Number.MAX_SAFE_INTEGER;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function load(config: Config | any) {
  if (env.initial) model = null;
  if (!model) {
    model = await tf.loadGraphModel(join(config.modelBasePath, config.face.agegenderrace.modelPath)) as unknown as GraphModel;
    if (!model || !model['modelUrl']) log('load model failed:', config.face.agegenderrace.modelPath);
    else if (config.debug) log('load model:', model['modelUrl']);
  } else if (config.debug) log('cached model:', model['modelUrl']);
  return model;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function predict(image: Tensor, config: Config) {
  if (!model) return null;
  // @ts-ignore config disabled
  if ((skipped < config.face.agegenderrace.skipFrames) && config.skipFrame && last.age && (last.age > 0)) {
    skipped++;
    return last;
  }
  skipped = 0;
  return new Promise(async (resolve) => {
    if (!model?.inputs[0].shape) return;
    const resize = tf.image.resizeBilinear(image, [model?.inputs[0].shape[2], model?.inputs[0].shape[1]], false);
    // const enhance = tf.mul(resize, [255.0]);

    let ageT;
    let genderT;
    let raceT;
    const obj = { age: 0 };

    // @ts-ignore array definition unavailable at compile time
    if (config.face.agegenderrace.enabled) [ageT, genderT, raceT] = await model.execute(resize, ['age_output', 'gender_output', 'race_output']);
    tf.dispose(resize);
    // tf.dispose(enhance);

    if (ageT) {
      // const data = await ageT.data();
      // {0: 'below_20', 1: '21-25', 2: '26-30', 3: '31-40',4: '41-50', 5: '51-60', 6: 'Above60'}
    }
    if (genderT) {
      // const data = await genderT.data();
    }
    if (raceT) {
      // const data = await raceT.data();
      // {0: 'white', 1: 'black', 2: 'asian', 3: 'indian', 4: 'others'}
    }

    tf.dispose(ageT);
    tf.dispose(genderT);
    tf.dispose(raceT);

    last = obj;
    resolve(obj);
  });
}
