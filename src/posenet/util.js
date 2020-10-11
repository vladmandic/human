const tf = require('@tensorflow/tfjs');
const kpt = require('./keypoints');

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

function scalePose(pose, scaleY, scaleX, offsetY = 0, offsetX = 0) {
  return {
    score: pose.score,
    keypoints: pose.keypoints.map(({ score, part, position }) => ({
      score,
      part,
      position: {
        x: position.x * scaleX + offsetX,
        y: position.y * scaleY + offsetY,
      },
    })),
  };
}
exports.scalePose = scalePose;

function scalePoses(poses, scaleY, scaleX, offsetY = 0, offsetX = 0) {
  if (scaleX === 1 && scaleY === 1 && offsetY === 0 && offsetX === 0) {
    return poses;
  }
  return poses.map((pose) => scalePose(pose, scaleY, scaleX, offsetY, offsetX));
}
exports.scalePoses = scalePoses;

function getInputTensorDimensions(input) {
  return input instanceof tf.Tensor ? [input.shape[0], input.shape[1]] : [input.height, input.width];
}
exports.getInputTensorDimensions = getInputTensorDimensions;

function toInputTensor(input) {
  return input instanceof tf.Tensor ? input : tf.browser.fromPixels(input);
}
exports.toInputTensor = toInputTensor;

function toResizedInputTensor(input, resizeHeight, resizeWidth) {
  return tf.tidy(() => {
    const imageTensor = toInputTensor(input);
    return imageTensor.resizeBilinear([resizeHeight, resizeWidth]);
  });
}
exports.toResizedInputTensor = toResizedInputTensor;

function padAndResizeTo(input, [targetH, targetW]) {
  const [height, width] = getInputTensorDimensions(input);
  const targetAspect = targetW / targetH;
  const aspect = width / height;
  let [padT, padB, padL, padR] = [0, 0, 0, 0];
  if (aspect < targetAspect) {
    // pads the width
    padT = 0;
    padB = 0;
    padL = Math.round(0.5 * (targetAspect * height - width));
    padR = Math.round(0.5 * (targetAspect * height - width));
  } else {
    // pads the height
    padT = Math.round(0.5 * ((1.0 / targetAspect) * width - height));
    padB = Math.round(0.5 * ((1.0 / targetAspect) * width - height));
    padL = 0;
    padR = 0;
  }
  const resized = tf.tidy(() => {
    let imageTensor = toInputTensor(input);
    imageTensor = tf.pad3d(imageTensor, [[padT, padB], [padL, padR], [0, 0]]);
    return imageTensor.resizeBilinear([targetH, targetW]);
  });
  return { resized, padding: { top: padT, left: padL, right: padR, bottom: padB } };
}
exports.padAndResizeTo = padAndResizeTo;

function scaleAndFlipPoses(poses, [height, width], [inputResolutionHeight, inputResolutionWidth], padding) {
  const scaleY = (height + padding.top + padding.bottom) / (inputResolutionHeight);
  const scaleX = (width + padding.left + padding.right) / (inputResolutionWidth);
  const scaledPoses = scalePoses(poses, scaleY, scaleX, -padding.top, -padding.left);
  return scaledPoses;
}
exports.scaleAndFlipPoses = scaleAndFlipPoses;
