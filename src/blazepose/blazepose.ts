/**
 * BlazePose Module
 */

// paper: https://ai.googleblog.com/2020/08/on-device-real-time-body-pose-tracking.html

import { log, join } from '../helpers';
import * as tf from '../../dist/tfjs.esm.js';
import * as annotations from './annotations';
import type { Tensor, GraphModel } from '../tfjs/types';
import type { BodyResult } from '../result';
import type { Config } from '../config';
import { env } from '../env';

let model: GraphModel | null;

export async function load(config: Config): Promise<GraphModel> {
  if (env.initial) model = null;
  if (!model) {
    model = await tf.loadGraphModel(join(config.modelBasePath, config.body.modelPath || '')) as unknown as GraphModel;
    model['width'] = parseInt(model['signature'].inputs['input_1:0'].tensorShape.dim[2].size);
    model['height'] = parseInt(model['signature'].inputs['input_1:0'].tensorShape.dim[1].size);
    if (!model || !model['modelUrl']) log('load model failed:', config.body.modelPath);
    else if (config.debug) log('load model:', model['modelUrl']);
  } else if (config.debug) log('cached model:', model['modelUrl']);
  return model;
}

export async function predict(image: Tensor, config: Config): Promise<BodyResult[]> {
  if (!model) return [];
  if (!config.body.enabled) return [];
  const imgSize = { width: (image.shape[2] || 0), height: (image.shape[1] || 0) };
  const resize = tf.image.resizeBilinear(image, [model['width'], model['height']], false);
  const normalize = tf.div(resize, [255.0]);
  tf.dispose(resize);
  const resT = await model.predict(normalize) as Array<Tensor>;
  const findT = resT.find((t) => (t.size === 195 || t.size === 155));
  const points = await findT?.data() || []; // order of output tensors may change between models, full has 195 and upper has 155 items
  resT.forEach((t) => tf.dispose(t));
  tf.dispose(normalize);
  const keypoints: Array<{ id, part, position: [number, number, number], positionRaw: [number, number, number], score, presence }> = [];
  const labels = points?.length === 195 ? annotations.full : annotations.upper; // full model has 39 keypoints, upper has 31 keypoints
  const depth = 5; // each points has x,y,z,visibility,presence
  for (let i = 0; i < points.length / depth; i++) {
    keypoints.push({
      id: i,
      part: labels[i],
      position: [
        Math.trunc(imgSize.width * points[depth * i + 0] / 255), // return normalized x value istead of 0..255
        Math.trunc(imgSize.height * points[depth * i + 1] / 255), // return normalized y value istead of 0..255
        Math.trunc(points[depth * i + 2]) + 0, // fix negative zero
      ],
      positionRaw: [
        points[depth * i + 0] / 255, // return x value normalized to 0..1
        points[depth * i + 1] / 255, // return y value normalized to 0..1
        points[depth * i + 2] + 0, // fix negative zero
      ],
      score: (100 - Math.trunc(100 / (1 + Math.exp(points[depth * i + 3])))) / 100, // reverse sigmoid value
      presence: (100 - Math.trunc(100 / (1 + Math.exp(points[depth * i + 4])))) / 100, // reverse sigmoid value
    });
  }
  const x = keypoints.map((a) => a.position[0]);
  const y = keypoints.map((a) => a.position[1]);
  const box: [number, number, number, number] = [
    Math.min(...x),
    Math.min(...y),
    Math.max(...x) - Math.min(...x),
    Math.max(...y) - Math.min(...x),
  ];
  const boxRaw: [number, number, number, number] = [0, 0, 0, 0]; // not yet implemented
  const score = keypoints.reduce((prev, curr) => (curr.score > prev ? curr.score : prev), 0);
  return [{ id: 0, score, box, boxRaw, keypoints }];
}
