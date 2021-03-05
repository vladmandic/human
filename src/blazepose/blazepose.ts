import { log } from '../log';
import * as tf from '../../dist/tfjs.esm.js';
import * as profile from '../profile';
import * as annotations from './annotations';

let model;

export async function load(config) {
  if (!model) {
    model = await tf.loadGraphModel(config.body.modelPath);
    model.width = parseInt(model.signature.inputs['input_1:0'].tensorShape.dim[2].size);
    model.height = parseInt(model.signature.inputs['input_1:0'].tensorShape.dim[1].size);
    if (config.debug) log(`load model: ${config.body.modelPath.match(/\/(.*)\./)[1]}`);
  }
  return model;
}

export async function predict(image, config) {
  if (!model) return null;
  if (!config.body.enabled) return null;
  const imgSize = { width: image.shape[2], height: image.shape[1] };
  const resize = tf.image.resizeBilinear(image, [model.width || config.body.inputSize, model.height || config.body.inputSize], false);
  const normalize = tf.div(resize, [255.0]);
  resize.dispose();
  // let segmentation; // not used right now since we have keypoints and don't need to go through matrix using strides
  // let poseflag; // irrelevant
  let points;
  if (!config.profile) {
    const resT = await model.predict(normalize);
    // segmentation = resT[0].dataSync();
    // poseflag = resT[1].dataSync();
    points = resT.find((t) => (t.size === 195 || t.size === 155)).dataSync();
    resT.forEach((t) => t.dispose());
  } else {
    const profileData = await tf.profile(() => model.predict(normalize));
    // segmentation = profileData.result[0].dataSync();
    // poseflag = profileData.result[1].dataSync();
    points = profileData.result.find((t) => t.size === 195).dataSync(); // find a tensor with 195 items which is 39 points with 5 properties
    profileData.result.forEach((t) => t.dispose());
    profile.run('blazepose', profileData);
  }
  normalize.dispose();
  const keypoints: Array<{ id, part, position: { x, y, z }, score, presence }> = [];
  const labels = points.length === 195 ? annotations.full : annotations.upper;
  const depth = 5;
  for (let i = 0; i < points.length / depth; i++) {
    keypoints.push({
      id: i,
      part: labels[i],
      position: {
        x: Math.trunc(imgSize.width * points[depth * i + 0] / 255),
        y: Math.trunc(imgSize.height * points[depth * i + 1] / 255),
        z: Math.trunc(points[depth * i + 2]) + 0, // fix negative zero
      },
      score: (100 - Math.trunc(100 / (1 + Math.exp(points[depth * i + 3])))) / 100, // reverse sigmoid value
      presence: (100 - Math.trunc(100 / (1 + Math.exp(points[depth * i + 4])))) / 100, // reverse sigmoid value
    });
  }
  // console.log('POINTS', imgSize, pts.length, pts);
  return [{ keypoints }];
}

/*
Model card: https://drive.google.com/file/d/10IU-DRP2ioSNjKFdiGbmmQX81xAYj88s/view
Download: https://github.com/PINTO0309/PINTO_model_zoo/tree/main/058_BlazePose_Full_Keypoints
*/
