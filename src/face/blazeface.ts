/**
 * BlazeFace, FaceMesh & Iris model implementation
 * See `facemesh.ts` for entry point
 */

import { log, join } from '../util/util';
import * as tf from '../../dist/tfjs.esm.js';
import * as util from './facemeshutil';
import type { Config } from '../config';
import type { Tensor, GraphModel } from '../tfjs/types';
import { env } from '../util/env';

const keypointsCount = 6;
let model: GraphModel | null;
let anchorsData: [number, number][] = [];
let anchors: Tensor | null = null;
let inputSize = 0;

// export const size = () => (model && model.inputs[0].shape ? model.inputs[0].shape[2] : 0);
export const size = () => inputSize;

export async function load(config: Config): Promise<GraphModel> {
  if (env.initial) model = null;
  if (!model) {
    model = await tf.loadGraphModel(join(config.modelBasePath, config.face.detector?.modelPath || '')) as unknown as GraphModel;
    if (!model || !model['modelUrl']) log('load model failed:', config.body.modelPath);
    else if (config.debug) log('load model:', model['modelUrl']);
  } else if (config.debug) log('cached model:', model['modelUrl']);
  inputSize = model.inputs[0].shape ? model.inputs[0].shape[2] : 0;
  if (inputSize === -1) inputSize = 64;
  anchorsData = util.generateAnchors(inputSize);
  anchors = tf.tensor2d(anchorsData);
  return model;
}

function decodeBounds(boxOutputs) {
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

export async function getBoxes(inputImage: Tensor, config: Config) {
  // sanity check on input
  if ((!inputImage) || (inputImage['isDisposedInternal']) || (inputImage.shape.length !== 4) || (inputImage.shape[1] < 1) || (inputImage.shape[2] < 1)) return { boxes: [] };
  const [batch, boxes, scores] = tf.tidy(() => {
    const resizedImage = tf.image.resizeBilinear(inputImage, [inputSize, inputSize]);
    const normalizedImage = tf.sub(tf.div(resizedImage, 127.5), 0.5);
    const res = model?.execute(normalizedImage);
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
    const boxesOut = decodeBounds(batchOut);
    const logits = tf.slice(batchOut, [0, 0], [-1, 1]);
    const scoresOut = tf.squeeze(tf.sigmoid(logits)); // inside tf.tidy
    return [batchOut, boxesOut, scoresOut];
  });

  const nmsTensor = await tf.image.nonMaxSuppressionAsync(boxes, scores, (config.face.detector?.maxDetected || 0), (config.face.detector?.iouThreshold || 0), (config.face.detector?.minConfidence || 0));
  const nms = await nmsTensor.array();
  tf.dispose(nmsTensor);
  const annotatedBoxes: Array<{ box: { startPoint: Tensor, endPoint: Tensor }, landmarks: Tensor, anchor: [number, number] | undefined, confidence: number }> = [];
  const scoresData = await scores.data();
  for (let i = 0; i < nms.length; i++) {
    const confidence = scoresData[nms[i]];
    if (confidence > (config.face.detector?.minConfidence || 0)) {
      const boundingBox = tf.slice(boxes, [nms[i], 0], [1, -1]);
      const landmarks = tf.tidy(() => tf.reshape(tf.squeeze(tf.slice(batch, [nms[i], keypointsCount - 1], [1, -1])), [keypointsCount, -1]));
      annotatedBoxes.push({ box: util.createBox(boundingBox), landmarks, anchor: anchorsData[nms[i]], confidence });
      tf.dispose(boundingBox);
    }
  }
  tf.dispose(batch);
  tf.dispose(boxes);
  tf.dispose(scores);

  return {
    boxes: annotatedBoxes,
    scaleFactor: [inputImage.shape[2] / inputSize, inputImage.shape[1] / inputSize],
  };
}
