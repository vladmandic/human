// paper: https://ai.googleblog.com/2020/08/on-device-real-time-body-pose-tracking.html

import { log, join } from '../helpers';
import * as tf from '../../dist/tfjs.esm.js';
import * as profile from '../profile';
import * as annotations from './annotations';

let model;

export async function load(config) {
  if (!model) {
    model = await tf.loadGraphModel(join(config.modelBasePath, config.body.modelPath));
    model.width = parseInt(model.signature.inputs['input_1:0'].tensorShape.dim[2].size);
    model.height = parseInt(model.signature.inputs['input_1:0'].tensorShape.dim[1].size);
    if (!model || !model.modelUrl) log('load model failed:', config.body.modelPath);
    else if (config.debug) log('load model:', model.modelUrl);
  } else if (config.debug) log('cached model:', model.modelUrl);
  return model;
}

export async function predict(image, config) {
  if (!model) return null;
  if (!config.body.enabled) return null;
  const imgSize = { width: image.shape[2], height: image.shape[1] };
  const resize = tf.image.resizeBilinear(image, [model.width, model.height], false);
  const normalize = tf.div(resize, [255.0]);
  resize.dispose();
  let points;
  if (!config.profile) { // run through profiler or just execute
    const resT = await model.predict(normalize);
    points = resT.find((t) => (t.size === 195 || t.size === 155)).dataSync(); // order of output tensors may change between models, full has 195 and upper has 155 items
    resT.forEach((t) => t.dispose());
  } else {
    const profileData = await tf.profile(() => model.predict(normalize));
    points = profileData.result.find((t) => (t.size === 195 || t.size === 155)).dataSync();
    profileData.result.forEach((t) => t.dispose());
    profile.run('blazepose', profileData);
  }
  normalize.dispose();
  const keypoints: Array<{ id, part, position: { x, y, z }, score, presence }> = [];
  const labels = points.length === 195 ? annotations.full : annotations.upper; // full model has 39 keypoints, upper has 31 keypoints
  const depth = 5; // each points has x,y,z,visibility,presence
  for (let i = 0; i < points.length / depth; i++) {
    keypoints.push({
      id: i,
      part: labels[i],
      position: {
        x: Math.trunc(imgSize.width * points[depth * i + 0] / 255), // return normalized x value istead of 0..255
        y: Math.trunc(imgSize.height * points[depth * i + 1] / 255), // return normalized y value istead of 0..255
        z: Math.trunc(points[depth * i + 2]) + 0, // fix negative zero
      },
      score: (100 - Math.trunc(100 / (1 + Math.exp(points[depth * i + 3])))) / 100, // reverse sigmoid value
      presence: (100 - Math.trunc(100 / (1 + Math.exp(points[depth * i + 4])))) / 100, // reverse sigmoid value
    });
  }
  const score = keypoints.reduce((prev, curr) => (curr.score > prev ? curr.score : prev), 0);
  return [{ score, keypoints }];
}
