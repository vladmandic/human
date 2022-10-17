/**
 * Image segmentation for body detection model
 *
 * Based on:
 * - [**MediaPipe Meet**](https://drive.google.com/file/d/1lnP1bRi9CSqQQXUHa13159vLELYDgDu0/preview)
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
  t.squeeze = tf.squeeze(t.res, [0]);
  // t.softmax = tf.softmax(t.squeeze); // model meet has two channels for fg and bg
  [t.bgRaw, t.fgRaw] = tf.unstack(t.squeeze, 2);
  // t.bg = tf.softmax(t.bgRaw); // we can ignore bg channel
  t.fg = tf.softmax(t.fgRaw);
  t.mul = tf.mul(t.fg, constants.tf255);
  t.expand = tf.expandDims(t.mul, 2);
  t.output = tf.image.resizeBilinear(t.expand as Tensor4D, [input.shape[1] || 0, input.shape[2] || 0]);
  let rgba: Tensor;
  switch (config.segmentation.mode || 'default') {
    case 'default':
      t.input = tf.squeeze(input);
      t.concat = tf.concat([t.input, t.output], -1);
      rgba = tf.cast(t.concat, 'int32'); // combined original with alpha
      break;
    case 'alpha':
      rgba = tf.cast(t.output, 'int32'); // just get alpha value from model
      break;
    default:
      rgba = tf.tensor(0);
  }
  Object.keys(t).forEach((tensor) => tf.dispose(t[tensor]));
  return rgba;
}
