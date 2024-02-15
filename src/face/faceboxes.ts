// https://github.com/TropComplique/FaceBoxes-tensorflow

import * as tf from 'dist/tfjs.esm.js';
import { log } from '../util/util';
import { loadModel } from '../tfjs/load';
import type { GraphModel, Tensor } from '../tfjs/types';
import type { Config } from '../config';

type Box = [number, number, number, number];

export class FaceBoxes {
  model: GraphModel;
  config: Config;
  inputSize: 0;

  constructor(model, config: Config) {
    this.model = model;
    this.config = config;
    this.inputSize = model.inputs[0].shape ? model.inputs[0].shape[2] : 0;
  }

  async estimateFaces(input, config) {
    if (config) this.config = config;
    const enlarge = this.config.face.detector?.minConfidence || 0.1;
    const results: { confidence: number, box: Box, boxRaw: Box, image: Tensor }[] = [];
    const resizeT = tf.image.resizeBilinear(input, [this.inputSize, this.inputSize]);
    const castT = resizeT.toInt();
    const [scoresT, boxesT, numT] = await this.model.executeAsync(castT) as Tensor[];
    const scores = await scoresT.data();
    const squeezeT = tf.squeeze(boxesT);
    const boxes = squeezeT.arraySync() as number[][];
    scoresT.dispose();
    boxesT.dispose();
    squeezeT.dispose();
    numT.dispose();
    castT.dispose();
    resizeT.dispose();
    for (let i = 0; i < boxes.length; i++) {
      if (scores[i] && scores[i] > (this.config.face.detector?.minConfidence || 0.1)) {
        const crop = [boxes[i][0] / enlarge, boxes[i][1] / enlarge, boxes[i][2] * enlarge, boxes[i][3] * enlarge];
        const boxRaw: Box = [crop[1], crop[0], (crop[3]) - (crop[1]), (crop[2]) - (crop[0])];
        const box: Box = [
          parseInt((boxRaw[0] * input.shape[2]).toString()),
          parseInt((boxRaw[1] * input.shape[1]).toString()),
          parseInt((boxRaw[2] * input.shape[2]).toString()),
          parseInt((boxRaw[3] * input.shape[1]).toString())];
        const resized = tf.image.cropAndResize(input, [crop], [0], [this.inputSize, this.inputSize]);
        const image = tf.div(resized, [255]);
        resized.dispose();
        results.push({ confidence: scores[i], box, boxRaw, image });
        // add mesh, meshRaw, annotations,
      }
    }
    return results;
  }
}

export async function load(config: Config) {
  const model = await loadModel(config.face.detector?.modelPath);
  if (config.face.detector?.modelPath && config.debug) log(`load model: ${config.face.detector.modelPath?.match(/\/(.*)\./)?.[1] || ''}`);
  const faceboxes = new FaceBoxes(model, config);
  if (config.face.mesh?.enabled && config.face.mesh?.modelPath && config.debug) log(`load model: ${config.face.mesh.modelPath.match(/\/(.*)\./)?.[1] || ''}`);
  if (config.face.iris?.enabled && config.face.iris?.modelPath && config.debug) log(`load model: ${config.face.iris.modelPath?.match(/\/(.*)\./)?.[1] || ''}`);
  return faceboxes;
}
