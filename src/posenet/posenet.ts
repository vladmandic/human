import { log } from '../log';
import * as tf from '../../dist/tfjs.esm.js';
import * as modelBase from './modelBase';
import * as decodeMultiple from './decodeMultiple';
import * as decodePose from './decodePose';
import * as util from './util';

async function estimateMultiple(input, res, config, inputSize) {
  return new Promise(async (resolve) => {
    const allTensorBuffers = await util.toTensorBuffers3D([res.heatmapScores, res.offsets, res.displacementFwd, res.displacementBwd]);
    const scoresBuffer = allTensorBuffers[0];
    const offsetsBuffer = allTensorBuffers[1];
    const displacementsFwdBuffer = allTensorBuffers[2];
    const displacementsBwdBuffer = allTensorBuffers[3];
    const poses = await decodeMultiple.decodeMultiplePoses(scoresBuffer, offsetsBuffer, displacementsFwdBuffer, displacementsBwdBuffer, config.body.nmsRadius, config.body.maxDetections, config.body.scoreThreshold);
    const scaled = util.scaleAndFlipPoses(poses, [input.shape[1], input.shape[2]], [inputSize, inputSize]);
    resolve(scaled);
  });
}

async function estimateSingle(input, res, config, inputSize) {
  return new Promise(async (resolve) => {
    const pose = await decodePose.decodeSinglePose(res.heatmapScores, res.offsets, config.body.scoreThreshold);
    const scaled = util.scaleAndFlipPoses([pose], [input.shape[1], input.shape[2]], [inputSize, inputSize]);
    resolve(scaled);
  });
}

export class PoseNet {
  baseModel: any;
  inputSize: number
  constructor(model) {
    this.baseModel = model;
    this.inputSize = model.model.inputs[0].shape[1];
    if (this.inputSize < 128) this.inputSize = 257;
  }

  async estimatePoses(input, config) {
    const resized = util.resizeTo(input, [this.inputSize, this.inputSize]);
    const res = this.baseModel.predict(resized, config);

    const poses = (config.body.maxDetections < 2)
      ? await estimateSingle(input, res, config, this.inputSize)
      : await estimateMultiple(input, res, config, this.inputSize);

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

export async function load(config) {
  const model = await tf.loadGraphModel(config.body.modelPath);
  const mobilenet = new modelBase.BaseModel(model);
  if (config.debug) log(`load model: ${config.body.modelPath.match(/\/(.*)\./)[1]}`);
  return new PoseNet(mobilenet);
}
