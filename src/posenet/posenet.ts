import { log, join } from '../helpers';
import * as tf from '../../dist/tfjs.esm.js';
import * as posenetModel from './posenetModel';
import * as decodeMultiple from './decodeMultiple';
import * as decodeSingle from './decodeSingle';
import * as util from './utils';

let model;

async function estimateMultiple(input, res, config, inputSize) {
  const toTensorBuffers3D = (tensors) => Promise.all(tensors.map((tensor) => tensor.buffer()));

  return new Promise(async (resolve) => {
    const allTensorBuffers = await toTensorBuffers3D([res.heatmapScores, res.offsets, res.displacementFwd, res.displacementBwd]);
    const scoresBuffer = allTensorBuffers[0];
    const offsetsBuffer = allTensorBuffers[1];
    const displacementsFwdBuffer = allTensorBuffers[2];
    const displacementsBwdBuffer = allTensorBuffers[3];
    const poses = await decodeMultiple.decodeMultiplePoses(scoresBuffer, offsetsBuffer, displacementsFwdBuffer, displacementsBwdBuffer, config.body.nmsRadius, config.body.maxDetections, config.body.scoreThreshold);
    const scaled = util.scalePoses(poses, [input.shape[1], input.shape[2]], [inputSize, inputSize]);
    resolve(scaled);
  });
}

async function estimateSingle(input, res, config, inputSize) {
  return new Promise(async (resolve) => {
    const pose = await decodeSingle.decodeSinglePose(res.heatmapScores, res.offsets, config.body.scoreThreshold);
    const scaled = util.scalePoses([pose], [input.shape[1], input.shape[2]], [inputSize, inputSize]);
    resolve(scaled);
  });
}

export class PoseNet {
  baseModel: any;
  inputSize: number
  constructor(baseModel) {
    this.baseModel = baseModel;
    this.inputSize = baseModel.model.inputs[0].shape[1];
  }

  async estimatePoses(input, config) {
    const res = this.baseModel.predict(input, config);

    const poses = (config.body.maxDetections < 2)
      ? await estimateSingle(input, res, config, this.inputSize)
      : await estimateMultiple(input, res, config, this.inputSize);

    res.heatmapScores.dispose();
    res.offsets.dispose();
    res.displacementFwd.dispose();
    res.displacementBwd.dispose();

    return poses;
  }

  dispose() {
    this.baseModel.dispose();
  }
}

export async function load(config) {
  if (!model) {
    model = await tf.loadGraphModel(join(config.modelBasePath, config.body.modelPath));
    if (!model || !model.modelUrl) log('load model failed:', config.body.modelPath);
    else if (config.debug) log('load model:', model.modelUrl);
  } else if (config.debug) log('cached model:', model.modelUrl);
  const mobilenet = new posenetModel.BaseModel(model);
  const poseNet = new PoseNet(mobilenet);
  return poseNet;
}
