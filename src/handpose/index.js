const tf = require('@tensorflow/tfjs');
const hand = require('./hand');
const keypoints = require('./keypoints');
const pipe = require('./pipeline');

// Load the bounding box detector model.
async function loadHandDetectorModel(url) {
  return tf.loadGraphModel(url, { fromTFHub: url.includes('tfhub.dev') });
}

// Load the mesh detector model.
async function loadHandPoseModel(url) {
  return tf.loadGraphModel(url, { fromTFHub: url.includes('tfhub.dev') });
}

// In single shot detector pipelines, the output space is discretized into a set
// of bounding boxes, each of which is assigned a score during prediction. The
// anchors define the coordinates of these boxes.
async function loadAnchors(url) {
  if (tf.env().features.IS_NODE) {
    // eslint-disable-next-line global-require
    const fs = require('fs');
    const data = await fs.readFileSync(url.replace('file://', ''));
    return JSON.parse(data);
  }
  return tf.util.fetch(url).then((d) => d.json());
}

/**
 * Load handpose.
 *
 * @param config A configuration object with the following properties:
 * - `maxContinuousChecks` How many frames to go without running the bounding
 * box detector. Defaults to infinity. Set to a lower value if you want a safety
 * net in case the mesh detector produces consistently flawed predictions.
 * - `detectionConfidence` Threshold for discarding a prediction. Defaults to
 * 0.8.
 * - `iouThreshold` A float representing the threshold for deciding whether
 * boxes overlap too much in non-maximum suppression. Must be between [0, 1].
 * Defaults to 0.3.
 * - `scoreThreshold` A threshold for deciding when to remove boxes based
 * on score in non-maximum suppression. Defaults to 0.75.
 */
async function load(config) {
  const [ANCHORS, handDetectorModel, handPoseModel] = await Promise.all([
    loadAnchors(config.detector.anchors),
    loadHandDetectorModel(config.detector.modelPath),
    loadHandPoseModel(config.skeleton.modelPath),
  ]);
  const detector = new hand.HandDetector(handDetectorModel, config.inputSize, config.inputSize, ANCHORS, config.iouThreshold, config.scoreThreshold);
  const pipeline = new pipe.HandPipeline(detector, handPoseModel, config.inputSize, config.inputSize, config.skipFrames, config.minConfidence);
  // eslint-disable-next-line no-use-before-define
  const handpose = new HandPose(pipeline);
  return handpose;
}
exports.load = load;

class HandPose {
  constructor(pipeline) {
    this.pipeline = pipeline;
  }

  async estimateHands(input, config) {
    const image = tf.tidy(() => {
      if (!(input instanceof tf.Tensor)) {
        input = tf.browser.fromPixels(input);
      }
      return input.toFloat().expandDims(0);
    });
    const prediction = await this.pipeline.estimateHand(image, config);
    image.dispose();
    if (!prediction) return [];
    const annotations = {};
    for (const key of Object.keys(keypoints.MESH_ANNOTATIONS)) {
      annotations[key] = keypoints.MESH_ANNOTATIONS[key].map((index) => prediction.landmarks[index]);
    }
    return [{
      confidence: prediction.confidence || 0,
      box: prediction.box ? [prediction.box.topLeft[0], prediction.box.topLeft[1], prediction.box.bottomRight[0] - prediction.box.topLeft[0], prediction.box.bottomRight[1] - prediction.box.topLeft[1]] : 0,
      landmarks: prediction.landmarks,
      annotations,
    }];
  }
}
exports.HandPose = HandPose;
