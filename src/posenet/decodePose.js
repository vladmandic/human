import * as keypoints from './keypoints';
import * as vectors from './vectors';
import * as decoders from './decoders';

const parentChildrenTuples = keypoints.poseChain.map(([parentJoinName, childJoinName]) => ([keypoints.partIds[parentJoinName], keypoints.partIds[childJoinName]]));
const parentToChildEdges = parentChildrenTuples.map(([, childJointId]) => childJointId);
const childToParentEdges = parentChildrenTuples.map(([parentJointId]) => parentJointId);
function getDisplacement(edgeId, point, displacements) {
  const numEdges = displacements.shape[2] / 2;
  return {
    y: displacements.get(point.y, point.x, edgeId),
    x: displacements.get(point.y, point.x, numEdges + edgeId),
  };
}
function getStridedIndexNearPoint(point, outputStride, height, width) {
  return {
    // @ts-ignore
    y: vectors.clamp(Math.round(point.y / outputStride), 0, height - 1),
    // @ts-ignore
    x: vectors.clamp(Math.round(point.x / outputStride), 0, width - 1),
  };
}

function traverseToTargetKeypoint(edgeId, sourceKeypoint, targetKeypointId, scoresBuffer, offsets, outputStride, displacements, offsetRefineStep = 2) {
  const [height, width] = scoresBuffer.shape;
  // Nearest neighbor interpolation for the source->target displacements.
  const sourceKeypointIndices = getStridedIndexNearPoint(sourceKeypoint.position, outputStride, height, width);
  const displacement = getDisplacement(edgeId, sourceKeypointIndices, displacements);
  // @ts-ignore
  const displacedPoint = vectors.addVectors(sourceKeypoint.position, displacement);
  let targetKeypoint = displacedPoint;
  for (let i = 0; i < offsetRefineStep; i++) {
    const targetKeypointIndices = getStridedIndexNearPoint(targetKeypoint, outputStride, height, width);
    // @ts-ignore
    const offsetPoint = vectors.getOffsetPoint(targetKeypointIndices.y, targetKeypointIndices.x, targetKeypointId, offsets);
    // @ts-ignore
    targetKeypoint = vectors.addVectors({
      x: targetKeypointIndices.x * outputStride,
      y: targetKeypointIndices.y * outputStride,
    }, { x: offsetPoint.x, y: offsetPoint.y });
  }
  const targetKeyPointIndices = getStridedIndexNearPoint(targetKeypoint, outputStride, height, width);
  const score = scoresBuffer.get(targetKeyPointIndices.y, targetKeyPointIndices.x, targetKeypointId);
  return { position: targetKeypoint, part: keypoints.partNames[targetKeypointId], score };
}

function decodePose(root, scores, offsets, outputStride, displacementsFwd, displacementsBwd) {
  const numParts = scores.shape[2];
  const numEdges = parentToChildEdges.length;
  const instanceKeypoints = new Array(numParts);
  // Start a new detection instance at the position of the root.
  const { part: rootPart, score: rootScore } = root;
  // @ts-ignore
  const rootPoint = vectors.getImageCoords(rootPart, outputStride, offsets);
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
exports.decodePose = decodePose;

async function decodeSinglePose(heatmapScores, offsets, config) {
  let totalScore = 0.0;
  // @ts-ignore
  const heatmapValues = decoders.argmax2d(heatmapScores);
  const allTensorBuffers = await Promise.all([heatmapScores.buffer(), offsets.buffer(), heatmapValues.buffer()]);
  const scoresBuffer = allTensorBuffers[0];
  const offsetsBuffer = allTensorBuffers[1];
  const heatmapValuesBuffer = allTensorBuffers[2];
  // @ts-ignore
  const offsetPoints = decoders.getOffsetPoints(heatmapValuesBuffer, config.body.outputStride, offsetsBuffer);
  const offsetPointsBuffer = await offsetPoints.buffer();
  // @ts-ignore
  const keypointConfidence = Array.from(decoders.getPointsConfidence(scoresBuffer, heatmapValuesBuffer));
  const instanceKeypoints = keypointConfidence.map((score, i) => {
    totalScore += score;
    return {
      position: {
        y: offsetPointsBuffer.get(i, 0),
        x: offsetPointsBuffer.get(i, 1),
      },
      part: keypoints.partNames[i],
      score,
    };
  });
  const filteredKeypoints = instanceKeypoints.filter((kpt) => kpt.score > config.body.scoreThreshold);
  heatmapValues.dispose();
  offsetPoints.dispose();
  return { keypoints: filteredKeypoints, score: totalScore / instanceKeypoints.length };
}
exports.decodeSinglePose = decodeSinglePose;
