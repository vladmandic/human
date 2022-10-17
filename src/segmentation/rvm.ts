/**
 * Image segmentation for body detection model
 *
 * Based on:
 * - [**Robust Video Matting**](https://github.com/PeterL1n/RobustVideoMatting)
 */

import * as tf from 'dist/tfjs.esm.js';
import { log } from '../util/util';
import { loadModel } from '../tfjs/load';
import { constants } from '../tfjs/constants';
import type { GraphModel, Tensor, Tensor4D } from '../tfjs/types';
import type { Config } from '../config';
import { env } from '../util/env';

let model: GraphModel;

// internal state varaibles
const outputNodes = ['fgr', 'pha', 'r1o', 'r2o', 'r3o', 'r4o'];
const t: Record<string, Tensor> = {}; // contains input tensor and recurrent states
let ratio = 0;

function init(config: Config) {
  tf.dispose([t.r1i, t.r2i, t.r3i, t.r4i, t.downsample_ratio]);
  t.r1i = tf.tensor(0.0);
  t.r2i = tf.tensor(0.0);
  t.r3i = tf.tensor(0.0);
  t.r4i = tf.tensor(0.0);
  ratio = config.segmentation.ratio || 0.5;
  t.downsample_ratio = tf.tensor(ratio); // initialize downsample ratio
}

export async function load(config: Config): Promise<GraphModel> {
  if (!model || env.initial) model = await loadModel(config.segmentation.modelPath);
  else if (config.debug) log('cached model:', model['modelUrl']);
  init(config);
  return model;
}

const normalize = (r: Tensor): Tensor => tf.tidy(() => {
  const squeeze = tf.squeeze(r, ([0]));
  const mul = tf.mul(squeeze, constants.tf255);
  const cast = tf.cast(mul, 'int32');
  return cast;
});

function getRGBA(fgr: Tensor | null, pha: Tensor | null): Tensor { // gets rgba // either fgr or pha must be present
  const rgb = fgr
    ? normalize(fgr) // normalize and use value
    : tf.fill([pha!.shape[1] || 0, pha!.shape[2] || 0, 3], 255, 'int32'); // eslint-disable-line @typescript-eslint/no-non-null-assertion
  const a = pha
    ? normalize(pha) // normalize and use value
    : tf.fill([fgr!.shape[1] || 0, fgr!.shape[2] || 0, 1], 255, 'int32'); // eslint-disable-line @typescript-eslint/no-non-null-assertion
  const rgba = tf.concat([rgb, a], -1);
  tf.dispose([rgb, a]);
  return rgba;
}

function getState(state: Tensor): Tensor { // gets internal recurrent states
  return tf.tidy(() => {
    const r: Record<string, Tensor | Tensor[]> = {};
    r.unstack = tf.unstack(state, -1);
    r.concat = tf.concat(r.unstack, 1);
    r.split = tf.split(r.concat, 4, 1);
    r.stack = tf.concat(r.split, 2);
    r.squeeze = tf.squeeze(r.stack, [0]);
    r.expand = tf.expandDims(r.squeeze, -1);
    r.add = tf.add(r.expand, 1);
    r.mul = tf.mul(r.add, 127.5);
    r.cast = tf.cast(r.mul, 'int32');
    r.tile = tf.tile(r.cast, [1, 1, 3]);
    r.alpha = tf.fill([(r.tile as Tensor).shape[0] || 0, (r.tile as Tensor).shape[1] || 0, 1], 255, 'int32'); // eslint-disable-line @typescript-eslint/no-unnecessary-type-assertion
    return tf.concat([r.tile, r.alpha], -1);
  });
}

export async function predict(input: Tensor4D, config: Config): Promise<Tensor | null> {
  if (!model) model = await load(config);
  if (!model?.['executor']) return null;
  // const expand = tf.expandDims(input, 0);
  t.src = tf.div(input, 255);
  if (ratio !== config.segmentation.ratio) init(config); // reinitialize recurrent states if requested downsample ratio changed
  const [fgr, pha, r1o, r2o, r3o, r4o] = await model.executeAsync(t, outputNodes) as Tensor[]; // execute model
  let rgba: Tensor;
  switch (config.segmentation.mode || 'default') {
    case 'default':
      rgba = getRGBA(fgr, pha);
      break;
    case 'alpha':
      rgba = getRGBA(null, pha);
      break;
    case 'foreground':
      rgba = getRGBA(fgr, null);
      break;
    case 'state':
      rgba = getState(r1o); // can view any internal recurrent state r10, r20, r3o, r4o
      break;
    default:
      rgba = tf.tensor(0);
  }
  tf.dispose([t.src, fgr, pha, t.r1i, t.r2i, t.r3i, t.r4i]);
  [t.r1i, t.r2i, t.r3i, t.r4i] = [r1o, r2o, r3o, r4o]; // update recurrent states
  return rgba;
}
