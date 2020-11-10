import * as keypoints from './keypoints';
import * as vectors from './vectors';

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
    y: vectors.clamp(Math.round(point.y / outputStride), 0, height - 1),
    x: vectors.clamp(Math.round(point.x / outputStride), 0, width - 1),
  };
}
/**
 * We get a new keypoint along the `edgeId` for the pose instance, assuming
 * that the position of the `idSource` part is already known. For this, we
 * follow the displacement vector from the source to target part (stored in
 * the `i`-t channel of the displacement tensor). The displaced keypoint
 * vector is refined using the offset vector by `offsetRefineStep` times.
 */
function traverseToTargetKeypoint(edgeId, sourceKeypoint, targetKeypointId, scoresBuffer, offsets, outputStride, displacements, offsetRefineStep = 2) {
  const [height, width] = scoresBuffer.shape;
  // Nearest neighbor interpolation for the source->target displacements.
  const sourceKeypointIndices = getStridedIndexNearPoint(sourceKeypoint.position, outputStride, height, width);
  const displacement = getDisplacement(edgeId, sourceKeypointIndices, displacements);
  const displacedPoint = vectors.addVectors(sourceKeypoint.position, displacement);
  let targetKeypoint = displacedPoint;
  for (let i = 0; i < offsetRefineStep; i++) {
    const targetKeypointIndices = getStridedIndexNearPoint(targetKeypoint, outputStride, height, width);
    const offsetPoint = vectors.getOffsetPoint(targetKeypointIndices.y, targetKeypointIndices.x, targetKeypointId, offsets);
    targetKeypoint = vectors.addVectors({
      x: targetKeypointIndices.x * outputStride,
      y: targetKeypointIndices.y * outputStride,
    }, { x: offsetPoint.x, y: offsetPoint.y });
  }
  const targetKeyPointIndices = getStridedIndexNearPoint(targetKeypoint, outputStride, height, width);
  const score = scoresBuffer.get(targetKeyPointIndices.y, targetKeyPointIndices.x, targetKeypointId);
  return { position: targetKeypoint, part: keypoints.partNames[targetKeypointId], score };
}
/**
 * Follows the displacement fields to decode the full pose of the object
 * instance given the position of a part that acts as root.
 *
 * @return An array of decoded keypoints and their scores for a single pose
 */
function decodePose(root, scores, offsets, outputStride, displacementsFwd, displacementsBwd) {
  const numParts = scores.shape[2];
  const numEdges = parentToChildEdges.length;
  const instanceKeypoints = new Array(numParts);
  // Start a new detection instance at the position of the root.
  const { part: rootPart, score: rootScore } = root;
  const rootPoint = vectors.getImageCoords(rootPart, outputStride, offsets);
  instanceKeypoints[rootPart.id] = {
    score: rootScore,
    part: keypoints.partNames[rootPart.id],
    position: rootPoint,
  };
  // Decode the part positions upwards in the tree, following the backward
  // displacements.
  for (let edge = numEdges - 1; edge >= 0; --edge) {
    const sourceKeypointId = parentToChildEdges[edge];
    const targetKeypointId = childToParentEdges[edge];
    if (instanceKeypoints[sourceKeypointId] && !instanceKeypoints[targetKeypointId]) {
      instanceKeypoints[targetKeypointId] = traverseToTargetKeypoint(edge, instanceKeypoints[sourceKeypointId], targetKeypointId, scores, offsets, outputStride, displacementsBwd);
    }
  }
  // Decode the part positions downwards in the tree, following the forward
  // displacements.
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
