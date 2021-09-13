import { log, join, mergeDeep } from '../helpers';
import * as tf from '../../dist/tfjs.esm.js';
import * as box from './box';
import * as util from './util';
import type { Config } from '../config';
import type { Tensor, GraphModel } from '../tfjs/types';

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

  async getBoundingBoxes(inputImage: Tensor, userConfig: Config) {
    // sanity check on input
    if ((!inputImage) || (inputImage['isDisposedInternal']) || (inputImage.shape.length !== 4) || (inputImage.shape[1] < 1) || (inputImage.shape[2] < 1)) return { boxes: [] };
    const [batch, boxes, scores] = tf.tidy(() => {
      const resizedImage = tf.image.resizeBilinear(inputImage, [this.inputSize, this.inputSize]);
      const normalizedImage = tf.sub(tf.div(resizedImage, 127.5), 0.5);
      const res = this.model.execute(normalizedImage);
      let batchOut;
      if (Array.isArray(res)) { // are we using tfhub or pinto converted model?
        const sorted = res.sort((a, b) => a.size - b.size);
        const concat384 = tf.concat([sorted[0], sorted[2]], 2); // dim: 384, 1 + 16
        const concat512 = tf.concat([sorted[1], sorted[3]], 2); // dim: 512, 1 + 16
        const concat = tf.concat([concat512, concat384], 1);
        batchOut = tf.squeeze(concat, 0);
      } else {
        batchOut = tf.squeeze(res); // when using tfhub model
      }
      const boxesOut = decodeBounds(batchOut, this.anchors, [this.inputSize, this.inputSize]);
      const logits = tf.slice(batchOut, [0, 0], [-1, 1]);
      const scoresOut = tf.squeeze(tf.sigmoid(logits)); // inside tf.tidy
      return [batchOut, boxesOut, scoresOut];
    });

    this.config = mergeDeep(this.config, userConfig) as Config;

    const nmsTensor = await tf.image.nonMaxSuppressionAsync(boxes, scores, (this.config.face.detector?.maxDetected || 0), (this.config.face.detector?.iouThreshold || 0), (this.config.face.detector?.minConfidence || 0));
    const nms = await nmsTensor.array();
    tf.dispose(nmsTensor);
    const annotatedBoxes: Array<{ box: { startPoint: Tensor, endPoint: Tensor }, landmarks: Tensor, anchor: [number, number] | undefined, confidence: number }> = [];
    const scoresData = await scores.data();
    for (let i = 0; i < nms.length; i++) {
      const confidence = scoresData[nms[i]];
      if (confidence > (this.config.face.detector?.minConfidence || 0)) {
        const boundingBox = tf.slice(boxes, [nms[i], 0], [1, -1]);
        const landmarks = tf.tidy(() => tf.reshape(tf.squeeze(tf.slice(batch, [nms[i], keypointsCount - 1], [1, -1])), [keypointsCount, -1]));
        annotatedBoxes.push({ box: box.createBox(boundingBox), landmarks, anchor: this.anchorsData[nms[i]], confidence });
        tf.dispose(boundingBox);
      }
    }
    tf.dispose(batch);
    tf.dispose(boxes);
    tf.dispose(scores);

    return {
      boxes: annotatedBoxes,
      scaleFactor: [inputImage.shape[2] / this.inputSize, inputImage.shape[1] / this.inputSize],
    };
  }
}

export async function load(config: Config) {
  const model = await tf.loadGraphModel(join(config.modelBasePath, config.face.detector?.modelPath || ''), { fromTFHub: (config.face.detector?.modelPath || '').includes('tfhub.dev') });
  const blazeFace = new BlazeFaceModel(model, config);
  if (!model || !model.modelUrl) log('load model failed:', config.face.detector?.modelPath || '');
  else if (config.debug) log('load model:', model.modelUrl);
  return blazeFace;
}
