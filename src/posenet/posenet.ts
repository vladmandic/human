/**
 * PoseNet module entry point
 */

import { log, join } from '../helpers';
import * as tf from '../../dist/tfjs.esm.js';
import * as poses from './poses';
import * as util from './utils';
import { Body } from '../result';
import { Tensor, GraphModel } from '../tfjs/types';
import { Config } from '../config';

let model: GraphModel;
const poseNetOutputs = ['MobilenetV1/offset_2/BiasAdd'/* offsets */, 'MobilenetV1/heatmap_2/BiasAdd'/* heatmapScores */, 'MobilenetV1/displacement_fwd_2/BiasAdd'/* displacementFwd */, 'MobilenetV1/displacement_bwd_2/BiasAdd'/* displacementBwd */];

export async function predict(input: Tensor, config: Config): Promise<Body[]> {
  const res = tf.tidy(() => {
    if (!model.inputs[0].shape) return [];
    const resized = tf.image.resizeBilinear(input, [model.inputs[0].shape[2], model.inputs[0].shape[1]]);
    const normalized = resized.toFloat().div(127.5).sub(1.0);
    const results: Array<Tensor> = model.execute(normalized, poseNetOutputs) as Array<Tensor>;
    const results3d = results.map((y) => tf.squeeze(y, [0]));
    results3d[1] = results3d[1].sigmoid(); // apply sigmoid on scores
    return results3d;
  });

  const buffers = await Promise.all(res.map((tensor) => tensor.buffer()));
  for (const t of res) t.dispose();

  const decoded = await poses.decode(buffers[0], buffers[1], buffers[2], buffers[3], config.body.maxDetected, config.body.minConfidence);
  if (!model.inputs[0].shape) return [];
  const scaled = util.scalePoses(decoded, [input.shape[1], input.shape[2]], [model.inputs[0].shape[2], model.inputs[0].shape[1]]) as Body[];
  return scaled;
}

export async function load(config: Config): Promise<GraphModel> {
  if (!model) {
    // @ts-ignore type mismatch for GraphModel
    model = await tf.loadGraphModel(join(config.modelBasePath, config.body.modelPath));
    if (!model || !model['modelUrl']) log('load model failed:', config.body.modelPath);
    else if (config.debug) log('load model:', model['modelUrl']);
  } else if (config.debug) log('cached model:', model['modelUrl']);
  return model;
}
