import { log } from '../log';
import * as tf from '../../dist/tfjs.esm.js';
import * as profile from '../profile';

let model;
const labels = [
  'nose',
  'leftEyeInside',
  'leftEye',
  'leftEyeOutside',
  'rightEyeInside',
  'rightEye',
  'rightEyeOutside',
  'leftEar',
  'rightEar',
  'leftMouth',
  'rightMouth',
  'leftShoulder',
  'rightShoulder',
  'leftElbow',
  'rightElbow',
  'leftWrist',
  'rightWrist',
  'leftPalm',
  'rightPalm',
  'leftIndex',
  'rightIndex',
  'leftPinky',
  'rightPinky',
  'leftHip',
  'rightHip',
  'leftKnee',
  'rightKnee',
  'leftAnkle',
  'rightAnkle',
  'leftHeel',
  'rightHeel',
  'leftFoot',
  'rightFoot',
  'midHip',
  'forehead',
  'leftThumb',
  'leftHand',
  'rightThumb',
  'rightHand',
];

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
  for (let i = 0; i < points.length / 5; i++) {
    keypoints.push({
      id: i,
      part: labels[i],
      position: {
        x: Math.trunc(imgSize.width * points[5 * i + 0] / 255),
        y: Math.trunc(imgSize.height * points[5 * i + 1] / 255),
        z: Math.trunc(points[5 * i + 2]) + 0, // fix negative zero
      },
      score: (100 - Math.trunc(100 / (1 + Math.exp(points[5 * i + 3])))) / 100, // reverse sigmoid value
      presence: (100 - Math.trunc(100 / (1 + Math.exp(points[5 * i + 4])))) / 100, // reverse sigmoid value
    });
  }
  // console.log('POINTS', imgSize, pts.length, pts);
  return [{ keypoints }];
}

/*
Model card: https://drive.google.com/file/d/10IU-DRP2ioSNjKFdiGbmmQX81xAYj88s/view
Download: https://github.com/PINTO0309/PINTO_model_zoo/tree/main/058_BlazePose_Full_Keypoints
*/
