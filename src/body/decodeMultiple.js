import * as buildParts from './buildParts';
import * as decodePose from './decodePose';
import * as vectors from './vectors';

function withinNmsRadiusOfCorrespondingPoint(poses, squaredNmsRadius, { x, y }, keypointId) {
  return poses.some(({ keypoints }) => {
    const correspondingKeypoint = keypoints[keypointId].position;
    return vectors.squaredDistance(y, x, correspondingKeypoint.y, correspondingKeypoint.x) <= squaredNmsRadius;
  });
}
/* Score the newly proposed object instance without taking into account
 * the scores of the parts that overlap with any previously detected
 * instance.
 */
function getInstanceScore(existingPoses, squaredNmsRadius, instanceKeypoints) {
  const notOverlappedKeypointScores = instanceKeypoints.reduce((result, { position, score }, keypointId) => {
    if (!withinNmsRadiusOfCorrespondingPoint(existingPoses, squaredNmsRadius, position, keypointId)) {
      result += score;
    }
    return result;
  }, 0.0);
  return notOverlappedKeypointScores / instanceKeypoints.length;
}
// A point (y, x) is considered as root part candidate if its score is a
// maximum in a window |y - y'| <= kLocalMaximumRadius, |x - x'| <=
// kLocalMaximumRadius.
const kLocalMaximumRadius = 1;
/**
 * Detects multiple poses and finds their parts from part scores and
 * displacement vectors. It returns up to `maxDetections` object instance
 * detections in decreasing root score order. It works as follows: We first
 * create a priority queue with local part score maxima above
 * `scoreThreshold`, considering all parts at the same time. Then we
 * iteratively pull the top  element of the queue (in decreasing score order)
 * and treat it as a root candidate for a new object instance. To avoid
 * duplicate detections, we reject the root candidate if it is within a disk
 * of `nmsRadius` pixels from the corresponding part of a previously detected
 * instance, which is a form of part-based non-maximum suppression (NMS). If
 * the root candidate passes the NMS check, we start a new object instance
 * detection, treating the corresponding part as root and finding the
 * positions of the remaining parts by following the displacement vectors
 * along the tree-structured part graph. We assign to the newly detected
 * instance a score equal to the sum of scores of its parts which have not
 * been claimed by a previous instance (i.e., those at least `nmsRadius`
 * pixels away from the corresponding part of all previously detected
 * instances), divided by the total number of parts `numParts`.
 *
 * @param heatmapScores 3-D tensor with shape `[height, width, numParts]`.
 * The value of heatmapScores[y, x, k]` is the score of placing the `k`-th
 * object part at position `(y, x)`.
 *
 * @param offsets 3-D tensor with shape `[height, width, numParts * 2]`.
 * The value of [offsets[y, x, k], offsets[y, x, k + numParts]]` is the
 * short range offset vector of the `k`-th  object part at heatmap
 * position `(y, x)`.
 *
 * @param displacementsFwd 3-D tensor of shape
 * `[height, width, 2 * num_edges]`, where `num_edges = num_parts - 1` is the
 * number of edges (parent-child pairs) in the tree. It contains the forward
 * displacements between consecutive part from the root towards the leaves.
 *
 * @param displacementsBwd 3-D tensor of shape
 * `[height, width, 2 * num_edges]`, where `num_edges = num_parts - 1` is the
 * number of edges (parent-child pairs) in the tree. It contains the backward
 * displacements between consecutive part from the root towards the leaves.
 *
 * @param outputStride The output stride that was used when feed-forwarding
 * through the PoseNet model.  Must be 32, 16, or 8.
 *
 * @param maxPoseDetections Maximum number of returned instance detections per
 * image.
 *
 * @param scoreThreshold Only return instance detections that have root part
 * score greater or equal to this value. Defaults to 0.5.
 *
 * @param nmsRadius Non-maximum suppression part distance. It needs to be
 * strictly positive. Two parts suppress each other if they are less than
 * `nmsRadius` pixels away. Defaults to 20.
 *
 * @return An array of poses and their scores, each containing keypoints and
 * the corresponding keypoint scores.
 */
function decodeMultiplePoses(scoresBuffer, offsetsBuffer, displacementsFwdBuffer, displacementsBwdBuffer, outputStride, maxPoseDetections, scoreThreshold = 0.5, nmsRadius = 20) {
  const poses = [];
  const queue = buildParts.buildPartWithScoreQueue(scoreThreshold, kLocalMaximumRadius, scoresBuffer);
  const squaredNmsRadius = nmsRadius * nmsRadius;
  // Generate at most maxDetections object instances per image in
  // decreasing root part score order.
  while (poses.length < maxPoseDetections && !queue.empty()) {
    // The top element in the queue is the next root candidate.
    const root = queue.dequeue();
    // Part-based non-maximum suppression: We reject a root candidate if it
    // is within a disk of `nmsRadius` pixels from the corresponding part of
    // a previously detected instance.
    const rootImageCoords = vectors.getImageCoords(root.part, outputStride, offsetsBuffer);
    if (withinNmsRadiusOfCorrespondingPoint(poses, squaredNmsRadius, rootImageCoords, root.part.id)) continue;
    // Start a new detection instance at the position of the root.
    const keypoints = decodePose.decodePose(root, scoresBuffer, offsetsBuffer, outputStride, displacementsFwdBuffer, displacementsBwdBuffer);
    const score = getInstanceScore(poses, squaredNmsRadius, keypoints);
    poses.push({ keypoints, score });
  }
  return poses;
}
exports.decodeMultiplePoses = decodeMultiplePoses;
