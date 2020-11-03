const tf = require('@tensorflow/tfjs');
const hand = require('./handdetector');
const keypoints = require('./keypoints');
const pipe = require('./pipeline');
const anchors = require('./anchors.js');

class HandPose {
  constructor(pipeline) {
    this.pipeline = pipeline;
  }

  async estimateHands(input, config) {
    this.skipFrames = config.skipFrames;
    this.detectionConfidence = config.minConfidence;
    this.maxHands = config.maxHands;
    const predictions = await this.pipeline.estimateHands(input, config);
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

async function load(config) {
  const [handDetectorModel, handPoseModel] = await Promise.all([
    tf.loadGraphModel(config.detector.modelPath, { fromTFHub: config.detector.modelPath.includes('tfhub.dev') }),
    tf.loadGraphModel(config.skeleton.modelPath, { fromTFHub: config.skeleton.modelPath.includes('tfhub.dev') }),
  ]);
  const detector = new hand.HandDetector(handDetectorModel, anchors.anchors, config);
  const pipeline = new pipe.HandPipeline(detector, handPoseModel, config);
  const handpose = new HandPose(pipeline);
  return handpose;
}
exports.load = load;
