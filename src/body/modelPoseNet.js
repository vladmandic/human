import * as tf from '../../dist/tfjs.esm.js';
import * as modelMobileNet from './modelMobileNet';
import * as decodeMultiple from './decodeMultiple';
import * as util from './util';

class PoseNet {
  constructor(net) {
    this.baseModel = net;
    this.outputStride = 16;
  }

  async estimatePoses(input, config) {
    return new Promise(async (resolve) => {
      const height = input.shape[1];
      const width = input.shape[2];
      const resized = util.resizeTo(input, [config.body.inputSize, config.body.inputSize]);
      const res = this.baseModel.predict(resized);
      const allTensorBuffers = await util.toTensorBuffers3D([res.heatmapScores, res.offsets, res.displacementFwd, res.displacementBwd]);
      const scoresBuffer = allTensorBuffers[0];
      const offsetsBuffer = allTensorBuffers[1];
      const displacementsFwdBuffer = allTensorBuffers[2];
      const displacementsBwdBuffer = allTensorBuffers[3];
      const poses = await decodeMultiple.decodeMultiplePoses(scoresBuffer, offsetsBuffer, displacementsFwdBuffer, displacementsBwdBuffer, this.outputStride, config.body.maxDetections, config.body.scoreThreshold, config.body.nmsRadius);
      const resultPoses = util.scaleAndFlipPoses(poses, [height, width], [config.body.inputSize, config.body.inputSize]);
      res.heatmapScores.dispose();
      res.offsets.dispose();
      res.displacementFwd.dispose();
      res.displacementBwd.dispose();
      resized.dispose();
      resolve(resultPoses);
    });
  }

  dispose() {
    this.baseModel.dispose();
  }
}
exports.PoseNet = PoseNet;

async function load(config) {
  const graphModel = await tf.loadGraphModel(config.body.modelPath);
  const mobilenet = new modelMobileNet.MobileNet(graphModel, this.outputStride);
  // eslint-disable-next-line no-console
  console.log(`Human: load model: ${config.body.modelPath.match(/\/(.*)\./)[1]}`);
  return new PoseNet(mobilenet);
}
exports.load = load;
