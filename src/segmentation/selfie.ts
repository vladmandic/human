/**
 * Image segmentation for body detection model
 *
 * Based on:
 * - [**MediaPipe Selfie**](https://drive.google.com/file/d/1dCfozqknMa068vVsO2j_1FgZkW_e3VWv/preview)
 */

import * as tf from 'dist/tfjs.esm.js';
import { log } from '../util/util';
import { loadModel } from '../tfjs/load';
import { constants } from '../tfjs/constants';
import type { GraphModel, Tensor, Tensor4D } from '../tfjs/types';
import type { Config } from '../config';
import { env } from '../util/env';

let model: GraphModel;

export async function load(config: Config): Promise<GraphModel> {
  if (!model || env.initial) model = await loadModel(config.segmentation.modelPath);
  else if (config.debug) log('cached model:', model['modelUrl']);
  return model;
}

export async function predict(input: Tensor4D, config: Config): Promise<Tensor | null> {
  if (!model) model = await load(config);
  if (!model?.['executor'] || !model?.inputs?.[0].shape) return null; // something is wrong with the model
  const t: Record<string, Tensor> = {};
  t.resize = tf.image.resizeBilinear(input, [model.inputs[0].shape ? model.inputs[0].shape[1] : 0, model.inputs[0].shape ? model.inputs[0].shape[2] : 0], false);
  t.norm = tf.div(t.resize, constants.tf255);
  t.res = model.execute(t.norm) as Tensor;
  t.squeeze = tf.squeeze(t.res, [0]); // meet.shape:[1,256,256,1], selfie.shape:[1,144,256,2]
  t.alpha = tf.image.resizeBilinear(t.squeeze as Tensor4D, [input.shape[1] || 0, input.shape[2] || 0]); // model selfie has a single channel that we can use directly
  t.mul = tf.mul(t.alpha, constants.tf255);
  let rgba: Tensor;
  switch (config.segmentation.mode || 'default') {
    case 'default':
      t.input = tf.squeeze(input);
      t.concat = tf.concat([t.input, t.mul], -1);
      rgba = tf.cast(t.concat, 'int32'); // combined original with alpha
      break;
    case 'alpha':
      rgba = tf.cast(t.mul, 'int32'); // just get alpha value from model
      break;
    default:
      rgba = tf.tensor(0);
  }
  Object.keys(t).forEach((tensor) => tf.dispose(t[tensor]));
  return rgba;
}
