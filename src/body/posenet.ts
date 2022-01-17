/**
 * PoseNet body detection model implementation
 *
 * Based on: [**PoseNet**](https://medium.com/tensorflow/real-time-human-pose-estimation-in-the-browser-with-tensorflow-js-7dd0bc881cd5)
 */

import { log } from '../util/util';
import * as tf from '../../dist/tfjs.esm.js';
import { loadModel } from '../tfjs/load';
import type { BodyResult, BodyLandmark, Box } from '../result';
import type { Tensor, GraphModel } from '../tfjs/types';
import type { Config } from '../config';
import { env } from '../util/env';
import * as utils from './posenetutils';

let model: GraphModel;
const poseNetOutputs = ['MobilenetV1/offset_2/BiasAdd'/* offsets */, 'MobilenetV1/heatmap_2/BiasAdd'/* heatmapScores */, 'MobilenetV1/displacement_fwd_2/BiasAdd'/* displacementFwd */, 'MobilenetV1/displacement_bwd_2/BiasAdd'/* displacementBwd */];
const localMaximumRadius = 1;
const outputStride = 16;
const squaredNmsRadius = 50 ** 2;

function traverse(edgeId, sourceKeypoint, targetId, scores, offsets, displacements, offsetRefineStep = 2) {
  const getDisplacement = (point) => ({
    y: displacements.get(point.y, point.x, edgeId),
    x: displacements.get(point.y, point.x, (displacements.shape[2] / 2) + edgeId),
  });
  const getStridedIndexNearPoint = (point, height, width) => ({
    y: utils.clamp(Math.round(point.y / outputStride), 0, height - 1),
    x: utils.clamp(Math.round(point.x / outputStride), 0, width - 1),
  });

  const [height, width] = scores.shape;
  // Nearest neighbor interpolation for the source->target displacements.
  const sourceKeypointIndices = getStridedIndexNearPoint(sourceKeypoint.position, height, width);
  const displacement = getDisplacement(sourceKeypointIndices);
  const displacedPoint = utils.addVectors(sourceKeypoint.position, displacement);
  let targetKeypoint = displacedPoint;
  for (let i = 0; i < offsetRefineStep; i++) {
    const targetKeypointIndices = getStridedIndexNearPoint(targetKeypoint, height, width);
    const offsetPoint = utils.getOffsetPoint(targetKeypointIndices.y, targetKeypointIndices.x, targetId, offsets);
    targetKeypoint = utils.addVectors(
      { x: targetKeypointIndices.x * outputStride, y: targetKeypointIndices.y * outputStride },
      { x: offsetPoint.x, y: offsetPoint.y },
    );
  }
  const targetKeyPointIndices = getStridedIndexNearPoint(targetKeypoint, height, width);
  const score = scores.get(targetKeyPointIndices.y, targetKeyPointIndices.x, targetId);
  return { position: targetKeypoint, part: utils.partNames[targetId], score };
}

export function decodePose(root, scores, offsets, displacementsFwd, displacementsBwd) {
  const tuples = utils.poseChain.map(([parentJoinName, childJoinName]) => ([utils.partIds[parentJoinName], utils.partIds[childJoinName]]));
  const edgesFwd = tuples.map(([, childJointId]) => childJointId);
  const edgesBwd = tuples.map(([parentJointId]) => parentJointId);
  const numParts = scores.shape[2]; // [21,21,17]
  const numEdges = edgesFwd.length;
  const keypoints = new Array(numParts);
  // Start a new detection instance at the position of the root.
  const rootPoint = utils.getImageCoords(root.part, outputStride, offsets);
  keypoints[root.part.id] = {
    score: root.score,
    part: utils.partNames[root.part.id] as BodyLandmark,
    position: rootPoint,
  };
  // Decode the part positions upwards in the tree, following the backward displacements.
  for (let edge = numEdges - 1; edge >= 0; --edge) {
    const sourceId = edgesFwd[edge];
    const targetId = edgesBwd[edge];
    if (keypoints[sourceId] && !keypoints[targetId]) {
      keypoints[targetId] = traverse(edge, keypoints[sourceId], targetId, scores, offsets, displacementsBwd);
    }
  }
  // Decode the part positions downwards in the tree, following the forward displacements.
  for (let edge = 0; edge < numEdges; ++edge) {
    const sourceId = edgesBwd[edge];
    const targetId = edgesFwd[edge];
    if (keypoints[sourceId] && !keypoints[targetId]) {
      keypoints[targetId] = traverse(edge, keypoints[sourceId], targetId, scores, offsets, displacementsFwd);
    }
  }
  return keypoints;
}

function scoreIsMaximumInLocalWindow(keypointId, score, heatmapY, heatmapX, scores) {
  const [height, width] = scores.shape;
  let localMaximum = true;
  const yStart = Math.max(heatmapY - localMaximumRadius, 0);
  const yEnd = Math.min(heatmapY + localMaximumRadius + 1, height);
  for (let yCurrent = yStart; yCurrent < yEnd; ++yCurrent) {
    const xStart = Math.max(heatmapX - localMaximumRadius, 0);
    const xEnd = Math.min(heatmapX + localMaximumRadius + 1, width);
    for (let xCurrent = xStart; xCurrent < xEnd; ++xCurrent) {
      if (scores.get(yCurrent, xCurrent, keypointId) > score) {
        localMaximum = false;
        break;
      }
    }
    if (!localMaximum) break;
  }
  return localMaximum;
}

export function buildPartWithScoreQueue(minConfidence, scores) {
  const [height, width, numKeypoints] = scores.shape;
  const queue = new utils.MaxHeap(height * width * numKeypoints, ({ score }) => score);
  for (let heatmapY = 0; heatmapY < height; ++heatmapY) {
    for (let heatmapX = 0; heatmapX < width; ++heatmapX) {
      for (let keypointId = 0; keypointId < numKeypoints; ++keypointId) {
        const score = scores.get(heatmapY, heatmapX, keypointId);
        // Only consider parts with score greater or equal to threshold as root candidates.
        if (score < minConfidence) continue;
        // Only consider keypoints whose score is maximum in a local window.
        if (scoreIsMaximumInLocalWindow(keypointId, score, heatmapY, heatmapX, scores)) queue.enqueue({ score, part: { heatmapY, heatmapX, id: keypointId } });
      }
    }
  }
  return queue;
}

function withinRadius(poses, { x, y }, keypointId) {
  return poses.some(({ keypoints }) => {
    const correspondingKeypoint = keypoints[keypointId]?.position;
    if (!correspondingKeypoint) return false;
    return utils.squaredDistance(y, x, correspondingKeypoint.y, correspondingKeypoint.x) <= squaredNmsRadius;
  });
}

function getInstanceScore(existingPoses, keypoints) {
  const notOverlappedKeypointScores = keypoints.reduce((result, { position, score }, keypointId) => {
    if (!withinRadius(existingPoses, position, keypointId)) result += score;
    return result;
  }, 0.0);
  return notOverlappedKeypointScores / keypoints.length;
}

export function decode(offsets, scores, displacementsFwd, displacementsBwd, maxDetected, minConfidence) {
  const poses: Array<{ keypoints, box: Box, score: number }> = [];
  const queue = buildPartWithScoreQueue(minConfidence, scores);
  // Generate at most maxDetected object instances per image in decreasing root part score order.
  while (poses.length < maxDetected && !queue.empty()) {
    // The top element in the queue is the next root candidate.
    const root = queue.dequeue();
    // Part-based non-maximum suppression: We reject a root candidate if it is within a disk of `nmsRadius` pixels from the corresponding part of a previously detected instance.
    // @ts-ignore this one is tree walk
    const rootImageCoords = utils.getImageCoords(root.part, outputStride, offsets);
    // @ts-ignore this one is tree walk
    if (withinRadius(poses, rootImageCoords, root.part.id)) continue;
    // Else start a new detection instance at the position of the root.
    let keypoints = decodePose(root, scores, offsets, displacementsFwd, displacementsBwd);
    keypoints = keypoints.filter((a) => a.score > minConfidence);
    const score = getInstanceScore(poses, keypoints);
    const box = utils.getBoundingBox(keypoints);
    if (score > minConfidence) poses.push({ keypoints, box, score: Math.round(100 * score) / 100 });
  }
  return poses;
}

export async function predict(input: Tensor, config: Config): Promise<BodyResult[]> {
  /** posenet is mostly obsolete
   * caching is not implemented
   */
  const res = tf.tidy(() => {
    if (!model.inputs[0].shape) return [];
    const resized = tf.image.resizeBilinear(input, [model.inputs[0].shape[2], model.inputs[0].shape[1]]);
    const normalized = tf.sub(tf.div(tf.cast(resized, 'float32'), 127.5), 1.0);
    const results: Array<Tensor> = model.execute(normalized, poseNetOutputs) as Array<Tensor>;
    const results3d = results.map((y) => tf.squeeze(y, [0]));
    results3d[1] = tf.sigmoid(results3d[1]); // apply sigmoid on scores
    return results3d;
  });

  const buffers = await Promise.all(res.map((tensor: Tensor) => tensor.buffer()));
  for (const t of res) tf.dispose(t);

  const decoded = await decode(buffers[0], buffers[1], buffers[2], buffers[3], config.body.maxDetected, config.body.minConfidence);
  if (!model.inputs[0].shape) return [];
  const scaled = utils.scalePoses(decoded, [input.shape[1], input.shape[2]], [model.inputs[0].shape[2], model.inputs[0].shape[1]]) as BodyResult[];
  return scaled;
}

export async function load(config: Config): Promise<GraphModel> {
  if (!model || env.initial) model = await loadModel(config.body.modelPath);
  else if (config.debug) log('cached model:', model['modelUrl']);
  return model;
}
