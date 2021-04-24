import * as tf from '../../dist/tfjs.esm.js';
import * as keypoints from './keypoints';

export function getPointsConfidence(heatmapScores, heatMapCoords) {
  const numKeypoints = keypoints.count; // also in heatMapCoords.shape[0];
  const result:Array<number> = [];
  for (let keypoint = 0; keypoint < numKeypoints; keypoint++) {
    const y = heatMapCoords.get(keypoint, 0);
    const x = heatMapCoords.get(keypoint, 1);
    result.push(heatmapScores.get(y, x, keypoint));
  }
  return result;
}

export function getOffsetPoints(heatMapCoordsBuffer, outputStride, offsetsBuffer) {
  const getOffsetPoint = (y, x, keypoint) => ([
    offsetsBuffer.get(y, x, keypoint),
    offsetsBuffer.get(y, x, keypoint + keypoints.count),
  ]);

  const getOffsetVectors = () => {
    const result: Array<number[]> = [];
    for (let keypoint = 0; keypoint < keypoints.count; keypoint++) {
      const heatmapY = heatMapCoordsBuffer.get(keypoint, 0);
      const heatmapX = heatMapCoordsBuffer.get(keypoint, 1);
      result.push(getOffsetPoint(heatmapY, heatmapX, keypoint));
    }
    return result;
  };

  return tf.tidy(() => heatMapCoordsBuffer.toTensor().mul(tf.scalar(outputStride, 'int32')).toFloat().add(getOffsetVectors()));
}

export function argmax2d(inputs) {
  const mod = (a, b) => tf.tidy(() => {
    const floored = a.div(tf.scalar(b, 'int32'));
    return a.sub(floored.mul(tf.scalar(b, 'int32')));
  });
  const [height, width, depth] = inputs.shape;

  return tf.tidy(() => {
    const reshaped = inputs.reshape([height * width, depth]);
    const coords = reshaped.argMax(0);
    const yCoords = coords.div(tf.scalar(width, 'int32')).expandDims(1);
    const xCoords = mod(coords, width).expandDims(1);
    return tf.concat([yCoords, xCoords], 1);
  });
}
