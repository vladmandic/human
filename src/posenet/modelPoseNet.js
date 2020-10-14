const tf = require('@tensorflow/tfjs');
const modelMobileNet = require('./modelMobileNet');
const decodeMultiple = require('./decodeMultiple');
const util = require('./util');

class PoseNet {
  constructor(net, inputResolution) {
    this.baseModel = net;
    this.inputResolution = inputResolution;
  }

  /**
     * Infer through PoseNet, and estimates multiple poses using the outputs.
     * This does standard ImageNet pre-processing before inferring through the
     * model. The image should pixels should have values [0-255]. It detects
     * multiple poses and finds their parts from part scores and displacement
     * vectors using a fast greedy decoding algorithm.  It returns up to
     * `config.maxDetections` object instance detections in decreasing root
     * score order.
     *
     * @param input
     * ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement) The input
     * image to feed through the network.
     *
     * @param config MultiPoseEstimationConfig object that contains parameters
     * for the PoseNet inference using multiple pose estimation.
     *
     * @return An array of poses and their scores, each containing keypoints and
     * the corresponding keypoint scores.  The positions of the keypoints are
     * in the same scale as the original image
     */
  async estimatePoses(input, config) {
    const outputStride = this.baseModel.outputStride;
    const inputResolution = this.inputResolution;
    const [height, width] = util.getInputTensorDimensions(input);
    const { resized, padding } = util.padAndResizeTo(input, [inputResolution, inputResolution]);
    const { heatmapScores, offsets, displacementFwd, displacementBwd } = this.baseModel.predict(resized);
    const allTensorBuffers = await util.toTensorBuffers3D([heatmapScores, offsets, displacementFwd, displacementBwd]);
    const scoresBuffer = allTensorBuffers[0];
    const offsetsBuffer = allTensorBuffers[1];
    const displacementsFwdBuffer = allTensorBuffers[2];
    const displacementsBwdBuffer = allTensorBuffers[3];
    const poses = await decodeMultiple.decodeMultiplePoses(scoresBuffer, offsetsBuffer, displacementsFwdBuffer, displacementsBwdBuffer, outputStride, config.maxDetections, config.scoreThreshold, config.nmsRadius);
    const resultPoses = util.scaleAndFlipPoses(poses, [height, width], [inputResolution, inputResolution], padding);
    heatmapScores.dispose();
    offsets.dispose();
    displacementFwd.dispose();
    displacementBwd.dispose();
    resized.dispose();
    return resultPoses;
  }

  dispose() {
    this.baseModel.dispose();
  }
}
exports.PoseNet = PoseNet;
async function loadMobileNet(config) {
  const outputStride = config.outputStride;
  const graphModel = await tf.loadGraphModel(config.modelPath);
  const mobilenet = new modelMobileNet.MobileNet(graphModel, outputStride);
  return new PoseNet(mobilenet, config.inputResolution);
}
/**
 * Loads the PoseNet model instance from a checkpoint, with the MobileNet architecture. The model to be loaded is configurable using the
 * config dictionary ModelConfig. Please find more details in the documentation of the ModelConfig.
 *
 * @param config ModelConfig dictionary that contains parameters for
 * the PoseNet loading process. Please find more details of each parameters
 * in the documentation of the ModelConfig interface. The predefined
 * `MOBILENET_V1_CONFIG` and `RESNET_CONFIG` can also be used as references
 * for defining your customized config.
 */
async function load(config) {
  return loadMobileNet(config);
}
exports.load = load;
