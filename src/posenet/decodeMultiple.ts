import * as decodeSingle from './decodeSingle';
import * as utils from './utils';

const kLocalMaximumRadius = 1;
const defaultOutputStride = 16;

function scoreIsMaximumInLocalWindow(keypointId, score, heatmapY, heatmapX, localMaximumRadius, scores) {
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

export function buildPartWithScoreQueue(scoreThreshold, localMaximumRadius, scores) {
  const [height, width, numKeypoints] = scores.shape;
  const queue = new utils.MaxHeap(height * width * numKeypoints, ({ score }) => score);
  for (let heatmapY = 0; heatmapY < height; ++heatmapY) {
    for (let heatmapX = 0; heatmapX < width; ++heatmapX) {
      for (let keypointId = 0; keypointId < numKeypoints; ++keypointId) {
        const score = scores.get(heatmapY, heatmapX, keypointId);
        // Only consider parts with score greater or equal to threshold as root candidates.
        if (score < scoreThreshold) continue;
        // Only consider keypoints whose score is maximum in a local window.
        if (scoreIsMaximumInLocalWindow(keypointId, score, heatmapY, heatmapX, localMaximumRadius, scores)) {
          queue.enqueue({ score, part: { heatmapY, heatmapX, id: keypointId } });
        }
      }
    }
  }
  return queue;
}

function withinNmsRadiusOfCorrespondingPoint(poses, squaredNmsRadius, { x, y }, keypointId) {
  return poses.some(({ keypoints }) => {
    const correspondingKeypoint = keypoints[keypointId].position;
    return utils.squaredDistance(y, x, correspondingKeypoint.y, correspondingKeypoint.x) <= squaredNmsRadius;
  });
}

function getInstanceScore(existingPoses, squaredNmsRadius, instanceKeypoints) {
  const notOverlappedKeypointScores = instanceKeypoints.reduce((result, { position, score }, keypointId) => {
    if (!withinNmsRadiusOfCorrespondingPoint(existingPoses, squaredNmsRadius, position, keypointId)) result += score;
    return result;
  }, 0.0);
  return notOverlappedKeypointScores / instanceKeypoints.length;
}

export function decodeMultiplePoses(scoresBuffer, offsetsBuffer, displacementsFwdBuffer, displacementsBwdBuffer, nmsRadius, maxDetections, scoreThreshold) {
  const poses: Array<{ keypoints: any, box: any, score: number }> = [];
  const queue = buildPartWithScoreQueue(scoreThreshold, kLocalMaximumRadius, scoresBuffer);
  const squaredNmsRadius = nmsRadius ^ 2;
  // Generate at most maxDetections object instances per image in decreasing root part score order.
  while (poses.length < maxDetections && !queue.empty()) {
    // The top element in the queue is the next root candidate.
    const root = queue.dequeue();
    // Part-based non-maximum suppression: We reject a root candidate if it is within a disk of `nmsRadius` pixels from the corresponding part of a previously detected instance.
    const rootImageCoords = utils.getImageCoords(root.part, defaultOutputStride, offsetsBuffer);
    if (withinNmsRadiusOfCorrespondingPoint(poses, squaredNmsRadius, rootImageCoords, root.part.id)) continue;
    // Else start a new detection instance at the position of the root.
    const keypoints = decodeSingle.decodePose(root, scoresBuffer, offsetsBuffer, defaultOutputStride, displacementsFwdBuffer, displacementsBwdBuffer);
    const score = getInstanceScore(poses, squaredNmsRadius, keypoints);
    const box = utils.getBoundingBox(keypoints);
    if (score > scoreThreshold) poses.push({ keypoints, box, score: Math.round(100 * score) / 100 });
  }
  return poses;
}
