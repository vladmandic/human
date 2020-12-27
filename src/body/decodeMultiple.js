import * as buildParts from './buildParts';
import * as decodePose from './decodePose';
import * as vectors from './vectors';

const kLocalMaximumRadius = 1;

function withinNmsRadiusOfCorrespondingPoint(poses, squaredNmsRadius, { x, y }, keypointId) {
  return poses.some(({ keypoints }) => {
    const correspondingKeypoint = keypoints[keypointId].position;
    // @ts-ignore
    return vectors.squaredDistance(y, x, correspondingKeypoint.y, correspondingKeypoint.x) <= squaredNmsRadius;
  });
}

function getInstanceScore(existingPoses, squaredNmsRadius, instanceKeypoints) {
  const notOverlappedKeypointScores = instanceKeypoints.reduce((result, { position, score }, keypointId) => {
    if (!withinNmsRadiusOfCorrespondingPoint(existingPoses, squaredNmsRadius, position, keypointId)) result += score;
    return result;
  }, 0.0);
  return notOverlappedKeypointScores / instanceKeypoints.length;
}

function decodeMultiplePoses(scoresBuffer, offsetsBuffer, displacementsFwdBuffer, displacementsBwdBuffer, config) {
  const poses = [];
  // @ts-ignore
  const queue = buildParts.buildPartWithScoreQueue(config.body.scoreThreshold, kLocalMaximumRadius, scoresBuffer);
  const squaredNmsRadius = config.body.nmsRadius ^ 2;
  // Generate at most maxDetections object instances per image in decreasing root part score order.
  while (poses.length < config.body.maxDetections && !queue.empty()) {
    // The top element in the queue is the next root candidate.
    const root = queue.dequeue();
    // Part-based non-maximum suppression: We reject a root candidate if it is within a disk of `nmsRadius` pixels from the corresponding part of a previously detected instance.
    // @ts-ignore
    const rootImageCoords = vectors.getImageCoords(root.part, config.body.outputStride, offsetsBuffer);
    if (withinNmsRadiusOfCorrespondingPoint(poses, squaredNmsRadius, rootImageCoords, root.part.id)) continue;
    // Else start a new detection instance at the position of the root.
    // @ts-ignore
    const keypoints = decodePose.decodePose(root, scoresBuffer, offsetsBuffer, config.body.outputStride, displacementsFwdBuffer, displacementsBwdBuffer);
    const score = getInstanceScore(poses, squaredNmsRadius, keypoints);
    if (score > config.body.scoreThreshold) poses.push({ keypoints, score });
  }
  return poses;
}
exports.decodeMultiplePoses = decodeMultiplePoses;
