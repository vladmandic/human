const tf = require('@tensorflow/tfjs');
const hand = require('./handdetector');
const keypoints = require('./keypoints');
const pipe = require('./pipeline');

class HandPose {
  constructor(pipeline) {
    this.pipeline = pipeline;
  }

  async estimateHands(input, config) {
    this.maxContinuousChecks = config.skipFrames;
    this.detectionConfidence = config.minConfidence;
    this.maxHands = config.maxHands;
    const image = tf.tidy(() => {
      if (!(input instanceof tf.Tensor)) {
        input = tf.browser.fromPixels(input);
      }
      return input.toFloat().expandDims(0);
    });
    const predictions = await this.pipeline.estimateHands(image, config);
    image.dispose();
    const hands = [];
    if (!predictions) return hands;
    for (const prediction of predictions) {
      if (!prediction) return [];
      const annotations = {};
      for (const key of Object.keys(keypoints.MESH_ANNOTATIONS)) {
        annotations[key] = keypoints.MESH_ANNOTATIONS[key].map((index) => prediction.landmarks[index]);
      }
      hands.push({
        confidence: prediction.confidence || 0,
        box: prediction.box ? [prediction.box.topLeft[0], prediction.box.topLeft[1], prediction.box.bottomRight[0] - prediction.box.topLeft[0], prediction.box.bottomRight[1] - prediction.box.topLeft[1]] : 0,
        landmarks: prediction.landmarks,
        annotations,
      });
    }
    return hands;
  }
}
exports.HandPose = HandPose;

async function loadAnchors(url) {
  if (tf.env().features.IS_NODE) {
    // eslint-disable-next-line global-require
    const fs = require('fs');
    const data = await fs.readFileSync(url.replace('file://', ''));
    return JSON.parse(data);
  }
  return tf.util.fetch(url).then((d) => d.json());
}

async function load(config) {
  const [anchors, handDetectorModel, handPoseModel] = await Promise.all([
    loadAnchors(config.detector.anchors),
    tf.loadGraphModel(config.detector.modelPath, { fromTFHub: config.detector.modelPath.includes('tfhub.dev') }),
    tf.loadGraphModel(config.skeleton.modelPath, { fromTFHub: config.skeleton.modelPath.includes('tfhub.dev') }),
  ]);
  const detector = new hand.HandDetector(handDetectorModel, anchors, config);
  const pipeline = new pipe.HandPipeline(detector, handPoseModel, config);
  const handpose = new HandPose(pipeline);
  return handpose;
}
exports.load = load;
