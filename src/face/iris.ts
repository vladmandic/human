import * as tf from 'dist/tfjs.esm.js';
import * as coords from './facemeshcoords';
import * as util from './facemeshutil';
import type { Tensor, GraphModel } from '../tfjs/types';
import { env } from '../util/env';
import { log } from '../util/util';
import { loadModel } from '../tfjs/load';
import type { Config } from '../config';
import type { Point } from '../result';

let model: GraphModel | null;
let inputSize = 0;

const leftOutline = coords.meshAnnotations.leftEyeLower0;
const rightOutline = coords.meshAnnotations.rightEyeLower0;

const eyeLandmarks = {
  leftBounds: [leftOutline[0], leftOutline[leftOutline.length - 1]],
  rightBounds: [rightOutline[0], rightOutline[rightOutline.length - 1]],
};

const irisLandmarks = {
  upperCenter: 3,
  lowerCenter: 4,
  index: 71,
  numCoordinates: 76,
};

export async function load(config: Config): Promise<GraphModel> {
  if (env.initial) model = null;
  if (!model) model = await loadModel(config.face.iris?.modelPath);
  else if (config.debug) log('cached model:', model['modelUrl']);
  inputSize = (model?.['executor'] && model.inputs?.[0].shape) ? model.inputs[0].shape[2] : 0;
  if (inputSize === -1) inputSize = 64;
  return model;
}

// Replace the raw coordinates returned by facemesh with refined iris model coordinates and update the z coordinate to be an average of the original and the new.
export function replaceIrisCoords(rawCoords, newCoords, prefix, keys) {
  for (let i = 0; i < coords.irisIndices.length; i++) {
    const { key, indices } = coords.irisIndices[i];
    const originalIndices = coords.meshAnnotations[`${prefix}${key}`];
    if (!keys || keys.includes(key)) {
      for (let j = 0; j < indices.length; j++) {
        const index = indices[j];
        rawCoords[originalIndices[j]] = [
          newCoords[index][0],
          newCoords[index][1],
          (newCoords[index][2] + rawCoords[originalIndices[j]][2]) / 2,
        ];
      }
    }
  }
}

export const getLeftToRightEyeDepthDifference = (rawCoords) => {
  const leftEyeZ = rawCoords[eyeLandmarks.leftBounds[0]][2];
  const rightEyeZ = rawCoords[eyeLandmarks.rightBounds[0]][2];
  return leftEyeZ - rightEyeZ;
};

// Returns a box describing a cropped region around the eye fit for passing to the iris model.
export const getEyeBox = (rawCoords, face, eyeInnerCornerIndex, eyeOuterCornerIndex, meshSize, flip = false, scale = 2.3) => {
  const box = util.squarifyBox(util.enlargeBox(util.calculateLandmarksBoundingBox([rawCoords[eyeInnerCornerIndex], rawCoords[eyeOuterCornerIndex]]), scale));
  const boxSize = util.getBoxSize(box);
  let crop = tf.image.cropAndResize(face, [[
    box.startPoint[1] / meshSize,
    box.startPoint[0] / meshSize, box.endPoint[1] / meshSize,
    box.endPoint[0] / meshSize,
  ]], [0], [inputSize, inputSize]);
  if (flip && env.kernels.includes('flipleftright')) {
    const flipped = tf.image.flipLeftRight(crop); // flipLeftRight is not defined for tfjs-node
    tf.dispose(crop);
    crop = flipped;
  }
  return { box, boxSize, crop };
};

// Given a cropped image of an eye, returns the coordinates of the contours surrounding the eye and the iris.
export const getEyeCoords = (eyeData, eyeBox, eyeBoxSize, flip = false) => {
  const eyeRawCoords: Point[] = [];
  for (let i = 0; i < irisLandmarks.numCoordinates; i++) {
    const x = eyeData[i * 3];
    const y = eyeData[i * 3 + 1];
    const z = eyeData[i * 3 + 2];
    eyeRawCoords.push([
      (flip ? (1 - (x / inputSize)) : (x / inputSize)) * eyeBoxSize[0] + eyeBox.startPoint[0],
      (y / inputSize) * eyeBoxSize[1] + eyeBox.startPoint[1], z,
    ]);
  }
  return { rawCoords: eyeRawCoords, iris: eyeRawCoords.slice(irisLandmarks.index) };
};

// The z-coordinates returned for the iris are unreliable, so we take the z values from the surrounding keypoints.
export const getAdjustedIrisCoords = (rawCoords, irisCoords, direction) => {
  const upperCenterZ = rawCoords[coords.meshAnnotations[`${direction}EyeUpper0`][irisLandmarks.upperCenter]][2];
  const lowerCenterZ = rawCoords[coords.meshAnnotations[`${direction}EyeLower0`][irisLandmarks.lowerCenter]][2];
  const averageZ = (upperCenterZ + lowerCenterZ) / 2;
  // Iris indices: 0: center | 1: right | 2: above | 3: left | 4: below
  return irisCoords.map((coord, i) => {
    let z = averageZ;
    if (i === 2) {
      z = upperCenterZ;
    } else if (i === 4) {
      z = lowerCenterZ;
    }
    return [coord[0], coord[1], z];
  });
};

export async function augmentIris(rawCoords, face, meshSize, config: Config) {
  if (!model?.['executor']) return rawCoords;
  const { box: leftEyeBox, boxSize: leftEyeBoxSize, crop: leftEyeCrop } = getEyeBox(rawCoords, face, eyeLandmarks.leftBounds[0], eyeLandmarks.leftBounds[1], meshSize, true, config.face.iris?.scale || 2.3);
  const { box: rightEyeBox, boxSize: rightEyeBoxSize, crop: rightEyeCrop } = getEyeBox(rawCoords, face, eyeLandmarks.rightBounds[0], eyeLandmarks.rightBounds[1], meshSize, true, config.face.iris?.scale || 2.3);
  const combined = tf.concat([leftEyeCrop, rightEyeCrop]);
  tf.dispose(leftEyeCrop);
  tf.dispose(rightEyeCrop);
  const eyePredictions = model.execute(combined) as Tensor;
  tf.dispose(combined);
  const eyePredictionsData = await eyePredictions.data();
  tf.dispose(eyePredictions);
  const leftEyeData = eyePredictionsData.slice(0, irisLandmarks.numCoordinates * 3);
  const { rawCoords: leftEyeRawCoords, iris: leftIrisRawCoords } = getEyeCoords(leftEyeData, leftEyeBox, leftEyeBoxSize, true);
  const rightEyeData = eyePredictionsData.slice(irisLandmarks.numCoordinates * 3);
  const { rawCoords: rightEyeRawCoords, iris: rightIrisRawCoords } = getEyeCoords(rightEyeData, rightEyeBox, rightEyeBoxSize, false);
  const leftToRightEyeDepthDifference = getLeftToRightEyeDepthDifference(rawCoords);
  if (Math.abs(leftToRightEyeDepthDifference) < 30) { // User is looking straight ahead.
    replaceIrisCoords(rawCoords, leftEyeRawCoords, 'left', null);
    replaceIrisCoords(rawCoords, rightEyeRawCoords, 'right', null);
    // If the user is looking to the left or to the right, the iris coordinates tend to diverge too much from the mesh coordinates for them to be merged so we only update a single contour line above and below the eye.
  } else if (leftToRightEyeDepthDifference < 1) { // User is looking towards the right.
    replaceIrisCoords(rawCoords, leftEyeRawCoords, 'left', ['EyeUpper0', 'EyeLower0']);
  } else { // User is looking towards the left.
    replaceIrisCoords(rawCoords, rightEyeRawCoords, 'right', ['EyeUpper0', 'EyeLower0']);
  }
  const adjustedLeftIrisCoords = getAdjustedIrisCoords(rawCoords, leftIrisRawCoords, 'left');
  const adjustedRightIrisCoords = getAdjustedIrisCoords(rawCoords, rightIrisRawCoords, 'right');
  const newCoords = rawCoords.concat(adjustedLeftIrisCoords).concat(adjustedRightIrisCoords);
  return newCoords;
}
