import { log } from '../log.js';
import * as tf from '../../dist/tfjs.esm.js';
import * as modelBase from './modelBase';
import * as decodeMultiple from './decodeMultiple';
import * as decodePose from './decodePose';
import * as util from './util';

async function estimateMultiple(input, res, config) {
  return new Promise(async (resolve) => {
    const height = input.shape[1];
    const width = input.shape[2];
    // @ts-ignore
    const allTensorBuffers = await util.toTensorBuffers3D([res.heatmapScores, res.offsets, res.displacementFwd, res.displacementBwd]);
    const scoresBuffer = allTensorBuffers[0];
    const offsetsBuffer = allTensorBuffers[1];
    const displacementsFwdBuffer = allTensorBuffers[2];
    const displacementsBwdBuffer = allTensorBuffers[3];
    // @ts-ignore
    const poses = await decodeMultiple.decodeMultiplePoses(scoresBuffer, offsetsBuffer, displacementsFwdBuffer, displacementsBwdBuffer, config);
    // @ts-ignore
    const scaled = util.scaleAndFlipPoses(poses, [height, width], [config.body.inputSize, config.body.inputSize]);
    resolve(scaled);
  });
}

async function estimateSingle(input, res, config) {
  return new Promise(async (resolve) => {
    const height = input.shape[1];
    const width = input.shape[2];
    // @ts-ignore
    const pose = await decodePose.decodeSinglePose(res.heatmapScores, res.offsets, config);
    const poses = [pose];
    // @ts-ignore
    const scaled = util.scaleAndFlipPoses(poses, [height, width], [config.body.inputSize, config.body.inputSize]);
    resolve(scaled);
  });
}

class PoseNet {
  constructor(model) {
    this.baseModel = model;
  }

  async estimatePoses(input, config) {
    // @ts-ignore
    const resized = util.resizeTo(input, [config.body.inputSize, config.body.inputSize]);
    const res = this.baseModel.predict(resized, config);

    const poses = (config.body.maxDetections < 2) ? await estimateSingle(input, res, config) : await estimateMultiple(input, res, config);

    res.heatmapScores.dispose();
    res.offsets.dispose();
    res.displacementFwd.dispose();
    res.displacementBwd.dispose();
    resized.dispose();

    return poses;
  }

  dispose() {
    this.baseModel.dispose();
  }
}
exports.PoseNet = PoseNet;

async function load(config) {
  const model = await tf.loadGraphModel(config.body.modelPath);
  // @ts-ignore
  const mobilenet = new modelBase.BaseModel(model);
  log(`load model: ${config.body.modelPath.match(/\/(.*)\./)[1]}`);
  return new PoseNet(mobilenet);
}
exports.load = load;
