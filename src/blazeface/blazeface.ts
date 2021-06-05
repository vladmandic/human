import { log, join } from '../helpers';
import * as tf from '../../dist/tfjs.esm.js';
import * as box from './box';
import * as util from './util';
import { Config } from '../config';
import { Tensor, GraphModel } from '../tfjs/types';

const keypointsCount = 6;

function decodeBounds(boxOutputs, anchors, inputSize) {
  const boxStarts = tf.slice(boxOutputs, [0, 1], [-1, 2]);
  const centers = tf.add(boxStarts, anchors);
  const boxSizes = tf.slice(boxOutputs, [0, 3], [-1, 2]);
  const boxSizesNormalized = tf.div(boxSizes, inputSize);
  const centersNormalized = tf.div(centers, inputSize);
  const halfBoxSize = tf.div(boxSizesNormalized, 2);
  const starts = tf.sub(centersNormalized, halfBoxSize);
  const ends = tf.add(centersNormalized, halfBoxSize);
  const startNormalized = tf.mul(starts, inputSize);
  const endNormalized = tf.mul(ends, inputSize);
  const concatAxis = 1;
  return tf.concat2d([startNormalized, endNormalized], concatAxis);
}

export class BlazeFaceModel {
  model: GraphModel;
  anchorsData: [number, number][];
  anchors: Tensor;
  inputSize: number;
  config: Config;

  constructor(model, config: Config) {
    this.model = model;
    this.anchorsData = util.generateAnchors(model.inputs[0].shape[1]);
    this.anchors = tf.tensor2d(this.anchorsData);
    this.inputSize = model.inputs[0].shape[2];
    this.config = config;
  }

  async getBoundingBoxes(inputImage: Tensor) {
    // sanity check on input
    // @ts-ignore isDisposed is internal property
    if ((!inputImage) || (inputImage.isDisposedInternal) || (inputImage.shape.length !== 4) || (inputImage.shape[1] < 1) || (inputImage.shape[2] < 1)) return null;
    const [batch, boxes, scores] = tf.tidy(() => {
      const resizedImage = tf.image.resizeBilinear(inputImage, [this.inputSize, this.inputSize]);
      const normalizedImage = resizedImage.div(127.5).sub(0.5);
      const res = this.model.execute(normalizedImage);
      let batchOut;
      if (Array.isArray(res)) { // are we using tfhub or pinto converted model?
        const sorted = res.sort((a, b) => a.size - b.size);
        const concat384 = tf.concat([sorted[0], sorted[2]], 2); // dim: 384, 1 + 16
        const concat512 = tf.concat([sorted[1], sorted[3]], 2); // dim: 512, 1 + 16
        const concat = tf.concat([concat512, concat384], 1);
        batchOut = concat.squeeze(0);
      } else {
        batchOut = tf.squeeze(res); // when using tfhub model
      }
      const boxesOut = decodeBounds(batchOut, this.anchors, [this.inputSize, this.inputSize]);
      const logits = tf.slice(batchOut, [0, 0], [-1, 1]);
      const scoresOut = tf.sigmoid(logits).squeeze().dataSync();
      return [batchOut, boxesOut, scoresOut];
    });
    const nmsTensor = await tf.image.nonMaxSuppressionAsync(boxes, scores, this.config.face.detector.maxDetected, this.config.face.detector.iouThreshold, this.config.face.detector.minConfidence);
    const nms = nmsTensor.arraySync();
    nmsTensor.dispose();
    const annotatedBoxes: Array<{ box: { startPoint: Tensor, endPoint: Tensor }, landmarks: Tensor, anchor: number[], confidence: number }> = [];
    for (let i = 0; i < nms.length; i++) {
      const confidence = scores[nms[i]];
      if (confidence > this.config.face.detector.minConfidence) {
        const boundingBox = tf.slice(boxes, [nms[i], 0], [1, -1]);
        const localBox = box.createBox(boundingBox);
        boundingBox.dispose();
        const anchor = this.anchorsData[nms[i]];
        const landmarks = tf.tidy(() => tf.slice(batch, [nms[i], keypointsCount - 1], [1, -1]).squeeze().reshape([keypointsCount, -1]));
        annotatedBoxes.push({ box: localBox, landmarks, anchor, confidence });
      }
    }
    // boundingBoxes.forEach((t) => t.dispose());
    batch.dispose();
    boxes.dispose();
    // scores.dispose();
    return {
      boxes: annotatedBoxes,
      scaleFactor: [inputImage.shape[2] / this.inputSize, inputImage.shape[1] / this.inputSize],
    };
  }
}

export async function load(config: Config) {
  const model = await tf.loadGraphModel(join(config.modelBasePath, config.face.detector.modelPath), { fromTFHub: config.face.detector.modelPath.includes('tfhub.dev') });
  const blazeFace = new BlazeFaceModel(model, config);
  if (!model || !model.modelUrl) log('load model failed:', config.face.detector.modelPath);
  else if (config.debug) log('load model:', model.modelUrl);
  return blazeFace;
}
