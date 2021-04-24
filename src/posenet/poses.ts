import * as utils from './utils';
import * as kpt from './keypoints';

const localMaximumRadius = 1;
const defaultOutputStride = 16;

function traverseToTargetKeypoint(edgeId, sourceKeypoint, targetKeypointId, scoresBuffer, offsets, outputStride, displacements, offsetRefineStep = 2) {
  const getDisplacement = (point) => ({
    y: displacements.get(point.y, point.x, edgeId),
    x: displacements.get(point.y, point.x, (displacements.shape[2] / 2) + edgeId),
  });
  const getStridedIndexNearPoint = (point, height, width) => ({
    y: utils.clamp(Math.round(point.y / outputStride), 0, height - 1),
    x: utils.clamp(Math.round(point.x / outputStride), 0, width - 1),
  });

  const [height, width] = scoresBuffer.shape;
  // Nearest neighbor interpolation for the source->target displacements.
  const sourceKeypointIndices = getStridedIndexNearPoint(sourceKeypoint.position, height, width);
  const displacement = getDisplacement(sourceKeypointIndices);
  const displacedPoint = utils.addVectors(sourceKeypoint.position, displacement);
  let targetKeypoint = displacedPoint;
  for (let i = 0; i < offsetRefineStep; i++) {
    const targetKeypointIndices = getStridedIndexNearPoint(targetKeypoint, height, width);
    const offsetPoint = utils.getOffsetPoint(targetKeypointIndices.y, targetKeypointIndices.x, targetKeypointId, offsets);
    targetKeypoint = utils.addVectors({
      x: targetKeypointIndices.x * outputStride,
      y: targetKeypointIndices.y * outputStride,
    }, { x: offsetPoint.x, y: offsetPoint.y });
  }
  const targetKeyPointIndices = getStridedIndexNearPoint(targetKeypoint, height, width);
  const score = scoresBuffer.get(targetKeyPointIndices.y, targetKeyPointIndices.x, targetKeypointId);
  return { position: targetKeypoint, part: kpt.partNames[targetKeypointId], score };
}

export function decodePose(root, scores, offsets, outputStride, displacementsFwd, displacementsBwd) {
  const parentChildrenTuples = kpt.poseChain.map(([parentJoinName, childJoinName]) => ([kpt.partIds[parentJoinName], kpt.partIds[childJoinName]]));
  const parentToChildEdges = parentChildrenTuples.map(([, childJointId]) => childJointId);
  const childToParentEdges = parentChildrenTuples.map(([parentJointId]) => parentJointId);
  const numParts = scores.shape[2];
  const numEdges = parentToChildEdges.length;
  const instanceKeypoints = new Array(numParts);
  // Start a new detection instance at the position of the root.
  const { part: rootPart, score: rootScore } = root;
  const rootPoint = utils.getImageCoords(rootPart, outputStride, offsets);
  instanceKeypoints[rootPart.id] = {
    score: rootScore,
    part: kpt.partNames[rootPart.id],
    position: rootPoint,
  };
  // Decode the part positions upwards in the tree, following the backward displacements.
  for (let edge = numEdges - 1; edge >= 0; --edge) {
    const sourceKeypointId = parentToChildEdges[edge];
    const targetKeypointId = childToParentEdges[edge];
    if (instanceKeypoints[sourceKeypointId] && !instanceKeypoints[targetKeypointId]) {
      instanceKeypoints[targetKeypointId] = traverseToTargetKeypoint(edge, instanceKeypoints[sourceKeypointId], targetKeypointId, scores, offsets, outputStride, displacementsBwd);
    }
  }
  // Decode the part positions downwards in the tree, following the forward displacements.
  for (let edge = 0; edge < numEdges; ++edge) {
    const sourceKeypointId = childToParentEdges[edge];
    const targetKeypointId = parentToChildEdges[edge];
    if (instanceKeypoints[sourceKeypointId] && !instanceKeypoints[targetKeypointId]) {
      instanceKeypoints[targetKeypointId] = traverseToTargetKeypoint(edge, instanceKeypoints[sourceKeypointId], targetKeypointId, scores, offsets, outputStride, displacementsFwd);
    }
  }
  return instanceKeypoints;
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

export function buildPartWithScoreQueue(scoreThreshold, scores) {
  const [height, width, numKeypoints] = scores.shape;
  const queue = new utils.MaxHeap(height * width * numKeypoints, ({ score }) => score);
  for (let heatmapY = 0; heatmapY < height; ++heatmapY) {
    for (let heatmapX = 0; heatmapX < width; ++heatmapX) {
      for (let keypointId = 0; keypointId < numKeypoints; ++keypointId) {
        const score = scores.get(heatmapY, heatmapX, keypointId);
        // Only consider parts with score greater or equal to threshold as root candidates.
        if (score < scoreThreshold) continue;
        // Only consider keypoints whose score is maximum in a local window.
        if (scoreIsMaximumInLocalWindow(keypointId, score, heatmapY, heatmapX, scores)) queue.enqueue({ score, part: { heatmapY, heatmapX, id: keypointId } });
      }
    }
  }
  return queue;
}

function withinRadius(poses, squaredNmsRadius, { x, y }, keypointId) {
  return poses.some(({ keypoints }) => {
    const correspondingKeypoint = keypoints[keypointId].position;
    return utils.squaredDistance(y, x, correspondingKeypoint.y, correspondingKeypoint.x) <= squaredNmsRadius;
  });
}

function getInstanceScore(existingPoses, squaredNmsRadius, instanceKeypoints) {
  const notOverlappedKeypointScores = instanceKeypoints.reduce((result, { position, score }, keypointId) => {
    if (!withinRadius(existingPoses, squaredNmsRadius, position, keypointId)) result += score;
    return result;
  }, 0.0);
  return notOverlappedKeypointScores / instanceKeypoints.length;
}

export function decode(offsetsBuffer, scoresBuffer, displacementsFwdBuffer, displacementsBwdBuffer, nmsRadius, maxDetections, scoreThreshold) {
  const poses: Array<{ keypoints: any, box: any, score: number }> = [];
  const queue = buildPartWithScoreQueue(scoreThreshold, scoresBuffer);
  const squaredNmsRadius = nmsRadius ** 2;
  // Generate at most maxDetections object instances per image in decreasing root part score order.
  while (poses.length < maxDetections && !queue.empty()) {
    // The top element in the queue is the next root candidate.
    const root = queue.dequeue();
    // Part-based non-maximum suppression: We reject a root candidate if it is within a disk of `nmsRadius` pixels from the corresponding part of a previously detected instance.
    const rootImageCoords = utils.getImageCoords(root.part, defaultOutputStride, offsetsBuffer);
    if (withinRadius(poses, squaredNmsRadius, rootImageCoords, root.part.id)) continue;
    // Else start a new detection instance at the position of the root.
    const allKeypoints = decodePose(root, scoresBuffer, offsetsBuffer, defaultOutputStride, displacementsFwdBuffer, displacementsBwdBuffer);
    const keypoints = allKeypoints.filter((a) => a.score > scoreThreshold);
    const score = getInstanceScore(poses, squaredNmsRadius, keypoints);
    const box = utils.getBoundingBox(keypoints);
    if (score > scoreThreshold) poses.push({ keypoints, box, score: Math.round(100 * score) / 100 });
  }
  return poses;
}
