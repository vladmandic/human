import * as tf from '../../dist/tfjs.esm.js';
import * as kpt from './keypoints';

function getPointsConfidence(heatmapScores, heatMapCoords) {
  const numKeypoints = heatMapCoords.shape[0];
  const result = new Float32Array(numKeypoints);
  for (let keypoint = 0; keypoint < numKeypoints; keypoint++) {
    const y = heatMapCoords.get(keypoint, 0);
    const x = heatMapCoords.get(keypoint, 1);
    result[keypoint] = heatmapScores.get(y, x, keypoint);
  }
  return result;
}
exports.getPointsConfidence = getPointsConfidence;

function getOffsetPoint(y, x, keypoint, offsetsBuffer) {
  return {
    y: offsetsBuffer.get(y, x, keypoint),
    x: offsetsBuffer.get(y, x, keypoint + kpt.NUM_KEYPOINTS),
  };
}

function getOffsetVectors(heatMapCoordsBuffer, offsetsBuffer) {
  const result = [];
  for (let keypoint = 0; keypoint < kpt.NUM_KEYPOINTS; keypoint++) {
    const heatmapY = heatMapCoordsBuffer.get(keypoint, 0).valueOf();
    const heatmapX = heatMapCoordsBuffer.get(keypoint, 1).valueOf();
    const { x, y } = getOffsetPoint(heatmapY, heatmapX, keypoint, offsetsBuffer);
    result.push(y);
    result.push(x);
  }
  return tf.tensor2d(result, [kpt.NUM_KEYPOINTS, 2]);
}
exports.getOffsetVectors = getOffsetVectors;

function getOffsetPoints(heatMapCoordsBuffer, outputStride, offsetsBuffer) {
  return tf.tidy(() => heatMapCoordsBuffer.toTensor().mul(tf.scalar(outputStride, 'int32')).toFloat().add(getOffsetVectors(heatMapCoordsBuffer, offsetsBuffer)));
}
exports.getOffsetPoints = getOffsetPoints;

function mod(a, b) {
  return tf.tidy(() => {
    const floored = a.div(tf.scalar(b, 'int32'));
    return a.sub(floored.mul(tf.scalar(b, 'int32')));
  });
}

function argmax2d(inputs) {
  const [height, width, depth] = inputs.shape;
  return tf.tidy(() => {
    const reshaped = inputs.reshape([height * width, depth]);
    const coords = reshaped.argMax(0);
    const yCoords = coords.div(tf.scalar(width, 'int32')).expandDims(1);
    const xCoords = mod(coords, width).expandDims(1);
    return tf.concat([yCoords, xCoords], 1);
  });
}
exports.argmax2d = argmax2d;
