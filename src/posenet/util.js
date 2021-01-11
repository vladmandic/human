import * as kpt from './keypoints';

function eitherPointDoesntMeetConfidence(a, b, minConfidence) {
  return (a < minConfidence || b < minConfidence);
}

function getAdjacentKeyPoints(keypoints, minConfidence) {
  return kpt.connectedPartIndices.reduce((result, [leftJoint, rightJoint]) => {
    if (eitherPointDoesntMeetConfidence(keypoints[leftJoint].score, keypoints[rightJoint].score, minConfidence)) {
      return result;
    }
    result.push([keypoints[leftJoint], keypoints[rightJoint]]);
    return result;
  }, []);
}
exports.getAdjacentKeyPoints = getAdjacentKeyPoints;

const { NEGATIVE_INFINITY, POSITIVE_INFINITY } = Number;
function getBoundingBox(keypoints) {
  return keypoints.reduce(({ maxX, maxY, minX, minY }, { position: { x, y } }) => ({
    maxX: Math.max(maxX, x),
    maxY: Math.max(maxY, y),
    minX: Math.min(minX, x),
    minY: Math.min(minY, y),
  }), {
    maxX: NEGATIVE_INFINITY,
    maxY: NEGATIVE_INFINITY,
    minX: POSITIVE_INFINITY,
    minY: POSITIVE_INFINITY,
  });
}
exports.getBoundingBox = getBoundingBox;

function getBoundingBoxPoints(keypoints) {
  const { minX, minY, maxX, maxY } = getBoundingBox(keypoints);
  return [{ x: minX, y: minY }, { x: maxX, y: minY }, { x: maxX, y: maxY }, { x: minX, y: maxY }];
}
exports.getBoundingBoxPoints = getBoundingBoxPoints;

async function toTensorBuffers3D(tensors) {
  return Promise.all(tensors.map((tensor) => tensor.buffer()));
}
exports.toTensorBuffers3D = toTensorBuffers3D;

function scalePose(pose, scaleY, scaleX) {
  return {
    score: pose.score,
    keypoints: pose.keypoints.map(({ score, part, position }) => ({
      score,
      part,
      position: { x: position.x * scaleX, y: position.y * scaleY },
    })),
  };
}
exports.scalePose = scalePose;

function resizeTo(image, [targetH, targetW]) {
  const input = image.squeeze(0);
  const resized = input.resizeBilinear([targetH, targetW]);
  input.dispose();
  return resized;
}
exports.resizeTo = resizeTo;

function scaleAndFlipPoses(poses, [height, width], [inputResolutionHeight, inputResolutionWidth]) {
  const scaledPoses = poses.map((pose) => scalePose(pose, height / inputResolutionHeight, width / inputResolutionWidth));
  return scaledPoses;
}
exports.scaleAndFlipPoses = scaleAndFlipPoses;
