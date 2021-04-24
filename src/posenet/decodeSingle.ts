import * as keypoints from './keypoints';
import * as decoders from './decodeParts';
import * as utils from './utils';

const parentChildrenTuples = keypoints.poseChain.map(([parentJoinName, childJoinName]) => ([keypoints.partIds[parentJoinName], keypoints.partIds[childJoinName]]));
const parentToChildEdges = parentChildrenTuples.map(([, childJointId]) => childJointId);
const childToParentEdges = parentChildrenTuples.map(([parentJointId]) => parentJointId);

const defaultOutputStride = 16;

function getDisplacement(edgeId, point, displacements) {
  const numEdges = displacements.shape[2] / 2;
  return {
    y: displacements.get(point.y, point.x, edgeId),
    x: displacements.get(point.y, point.x, numEdges + edgeId),
  };
}

function getStridedIndexNearPoint(point, outputStride, height, width) {
  return {
    y: utils.clamp(Math.round(point.y / outputStride), 0, height - 1),
    x: utils.clamp(Math.round(point.x / outputStride), 0, width - 1),
  };
}

function traverseToTargetKeypoint(edgeId, sourceKeypoint, targetKeypointId, scoresBuffer, offsets, outputStride, displacements, offsetRefineStep = 2) {
  const [height, width] = scoresBuffer.shape;
  // Nearest neighbor interpolation for the source->target displacements.
  const sourceKeypointIndices = getStridedIndexNearPoint(sourceKeypoint.position, outputStride, height, width);
  const displacement = getDisplacement(edgeId, sourceKeypointIndices, displacements);
  const displacedPoint = utils.addVectors(sourceKeypoint.position, displacement);
  let targetKeypoint = displacedPoint;
  for (let i = 0; i < offsetRefineStep; i++) {
    const targetKeypointIndices = getStridedIndexNearPoint(targetKeypoint, outputStride, height, width);
    const offsetPoint = utils.getOffsetPoint(targetKeypointIndices.y, targetKeypointIndices.x, targetKeypointId, offsets);
    targetKeypoint = utils.addVectors({
      x: targetKeypointIndices.x * outputStride,
      y: targetKeypointIndices.y * outputStride,
    }, { x: offsetPoint.x, y: offsetPoint.y });
  }
  const targetKeyPointIndices = getStridedIndexNearPoint(targetKeypoint, outputStride, height, width);
  const score = scoresBuffer.get(targetKeyPointIndices.y, targetKeyPointIndices.x, targetKeypointId);
  return { position: targetKeypoint, part: keypoints.partNames[targetKeypointId], score };
}

export function decodePose(root, scores, offsets, outputStride, displacementsFwd, displacementsBwd) {
  const numParts = scores.shape[2];
  const numEdges = parentToChildEdges.length;
  const instanceKeypoints = new Array(numParts);
  // Start a new detection instance at the position of the root.
  const { part: rootPart, score: rootScore } = root;
  const rootPoint = utils.getImageCoords(rootPart, outputStride, offsets);
  instanceKeypoints[rootPart.id] = {
    score: rootScore,
    part: keypoints.partNames[rootPart.id],
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

export async function decodeSinglePose(heatmapScores, offsets, minScore) {
  const heatmapValues = decoders.argmax2d(heatmapScores);
  const allTensorBuffers = await Promise.all([heatmapScores.buffer(), offsets.buffer(), heatmapValues.buffer()]);
  const scoresBuffer = allTensorBuffers[0];
  const offsetsBuffer = allTensorBuffers[1];
  const heatmapValuesBuffer = allTensorBuffers[2];
  const offsetPoints = decoders.getOffsetPoints(heatmapValuesBuffer, defaultOutputStride, offsetsBuffer);
  const offsetPointsData = offsetPoints.dataSync();
  const keypointConfidence = decoders.getPointsConfidence(scoresBuffer, heatmapValuesBuffer);
  let avgScore = 0.0;
  const filteredKeypoints = keypointConfidence
    .filter((score) => score > minScore)
    .map((score, i) => {
      avgScore += score;
      return {
        position: {
          y: offsetPointsData[2 * i + 0], // offsetPointsBuffer.get(i, 0),
          x: offsetPointsData[2 * i + 1], // offsetPointsBuffer.get(i, 1),
        },
        part: keypoints.partNames[i],
        score,
      };
    });
  heatmapValues.dispose();
  offsetPoints.dispose();
  const box = utils.getBoundingBox(filteredKeypoints);
  return { keypoints: filteredKeypoints, box, score: Math.round(100 * avgScore / filteredKeypoints.length) / 100 };
}
