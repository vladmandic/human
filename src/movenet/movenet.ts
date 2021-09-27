/**
 * MoveNet model implementation
 *
 * Based on: [**MoveNet**](https://blog.tensorflow.org/2021/05/next-generation-pose-detection-with-movenet-and-tensorflowjs.html)
 */

import { log, join, scaleBox } from '../util';
import * as tf from '../../dist/tfjs.esm.js';
import type { BodyResult } from '../result';
import type { GraphModel, Tensor } from '../tfjs/types';
import type { Config } from '../config';
import { fakeOps } from '../tfjs/backend';
import { env } from '../env';

let model: GraphModel | null;
let inputSize = 0;
const cachedBoxes: Array<[number, number, number, number]> = [];

type Keypoints = { score: number, part: string, position: [number, number], positionRaw: [number, number] };
type Body = { id: number, score: number, box: [number, number, number, number], boxRaw: [number, number, number, number], keypoints: Array<Keypoints> }

let box: [number, number, number, number] = [0, 0, 0, 0];
let boxRaw: [number, number, number, number] = [0, 0, 0, 0];
let score = 0;
let skipped = Number.MAX_SAFE_INTEGER;
const keypoints: Array<Keypoints> = [];

const bodyParts = ['nose', 'leftEye', 'rightEye', 'leftEar', 'rightEar', 'leftShoulder', 'rightShoulder', 'leftElbow', 'rightElbow', 'leftWrist', 'rightWrist', 'leftHip', 'rightHip', 'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle'];

export async function load(config: Config): Promise<GraphModel> {
  if (env.initial) model = null;
  if (!model) {
    fakeOps(['size'], config);
    model = await tf.loadGraphModel(join(config.modelBasePath, config.body.modelPath || '')) as unknown as GraphModel;
    if (!model || !model['modelUrl']) log('load model failed:', config.body.modelPath);
    else if (config.debug) log('load model:', model['modelUrl']);
  } else if (config.debug) log('cached model:', model['modelUrl']);
  inputSize = model.inputs[0].shape ? model.inputs[0].shape[2] : 0;
  if (inputSize === -1) inputSize = 256;
  return model;
}

async function parseSinglePose(res, config, image, inputBox) {
  const kpt = res[0][0];
  keypoints.length = 0;
  for (let id = 0; id < kpt.length; id++) {
    score = kpt[id][2];
    if (score > config.body.minConfidence) {
      const positionRaw: [number, number] = [
        (inputBox[3] - inputBox[1]) * kpt[id][1] + inputBox[1],
        (inputBox[2] - inputBox[0]) * kpt[id][0] + inputBox[0],
      ];
      keypoints.push({
        score: Math.round(100 * score) / 100,
        part: bodyParts[id],
        positionRaw,
        position: [ // normalized to input image size
          Math.round((image.shape[2] || 0) * positionRaw[0]),
          Math.round((image.shape[1] || 0) * positionRaw[1]),
        ],
      });
    }
  }
  score = keypoints.reduce((prev, curr) => (curr.score > prev ? curr.score : prev), 0);
  const x = keypoints.map((a) => a.position[0]);
  const y = keypoints.map((a) => a.position[1]);
  box = [
    Math.min(...x),
    Math.min(...y),
    Math.max(...x) - Math.min(...x),
    Math.max(...y) - Math.min(...y),
  ];
  const xRaw = keypoints.map((a) => a.positionRaw[0]);
  const yRaw = keypoints.map((a) => a.positionRaw[1]);
  boxRaw = [
    Math.min(...xRaw),
    Math.min(...yRaw),
    Math.max(...xRaw) - Math.min(...xRaw),
    Math.max(...yRaw) - Math.min(...yRaw),
  ];
  const bodies: Array<Body> = [];
  bodies.push({ id: 0, score, box, boxRaw, keypoints });
  return bodies;
}

async function parseMultiPose(res, config, image, inputBox) {
  const bodies: Array<Body> = [];
  for (let id = 0; id < res[0].length; id++) {
    const kpt = res[0][id];
    score = Math.round(100 * kpt[51 + 4]) / 100;
    // eslint-disable-next-line no-continue
    if (score < config.body.minConfidence) continue;
    keypoints.length = 0;
    for (let i = 0; i < 17; i++) {
      const partScore = Math.round(100 * kpt[3 * i + 2]) / 100;
      if (partScore > config.body.minConfidence) {
        const positionRaw: [number, number] = [
          (inputBox[3] - inputBox[1]) * kpt[3 * i + 1] + inputBox[1],
          (inputBox[2] - inputBox[0]) * kpt[3 * i + 0] + inputBox[0],
        ];
        keypoints.push({
          part: bodyParts[i],
          score: partScore,
          positionRaw,
          position: [Math.trunc(positionRaw[0] * (image.shape[2] || 0)), Math.trunc(positionRaw[0] * (image.shape[1] || 0))],
        });
      }
    }
    boxRaw = [kpt[51 + 1], kpt[51 + 0], kpt[51 + 3] - kpt[51 + 1], kpt[51 + 2] - kpt[51 + 0]];
    bodies.push({
      id,
      score,
      boxRaw,
      box: [
        Math.trunc(boxRaw[0] * (image.shape[2] || 0)),
        Math.trunc(boxRaw[1] * (image.shape[1] || 0)),
        Math.trunc(boxRaw[2] * (image.shape[2] || 0)),
        Math.trunc(boxRaw[3] * (image.shape[1] || 0)),
      ],
      keypoints: [...keypoints],
    });
  }
  return bodies;
}

export async function predict(input: Tensor, config: Config): Promise<BodyResult[]> {
  if (!model || !model?.inputs[0].shape) return [];
  return new Promise(async (resolve) => {
    const t: Record<string, Tensor> = {};

    let bodies: Array<Body> = [];

    if (!config.skipFrame) cachedBoxes.length = 0; // allowed to use cache or not
    skipped++;

    for (let i = 0; i < cachedBoxes.length; i++) { // run detection based on cached boxes
      t.crop = tf.image.cropAndResize(input, [cachedBoxes[i]], [0], [inputSize, inputSize], 'bilinear');
      t.cast = tf.cast(t.crop, 'int32');
      t.res = await model?.predict(t.cast) as Tensor;
      const res = await t.res.array();
      const newBodies = (t.res.shape[2] === 17) ? await parseSinglePose(res, config, input, cachedBoxes[i]) : await parseMultiPose(res, config, input, cachedBoxes[i]);
      bodies = bodies.concat(newBodies);
      Object.keys(t).forEach((tensor) => tf.dispose(t[tensor]));
    }

    if ((bodies.length !== config.body.maxDetected) && (skipped > (config.body.skipFrames || 0))) { // run detection on full frame
      t.resized = tf.image.resizeBilinear(input, [inputSize, inputSize], false);
      t.cast = tf.cast(t.resized, 'int32');
      t.res = await model?.predict(t.cast) as Tensor;
      const res = await t.res.array();
      bodies = (t.res.shape[2] === 17) ? await parseSinglePose(res, config, input, [0, 0, 1, 1]) : await parseMultiPose(res, config, input, [0, 0, 1, 1]);
      Object.keys(t).forEach((tensor) => tf.dispose(t[tensor]));
      cachedBoxes.length = 0; // reset cache
      skipped = 0;
    }

    if (config.skipFrame) { // create box cache based on last detections
      cachedBoxes.length = 0;
      for (let i = 0; i < bodies.length; i++) {
        if (bodies[i].keypoints.length > 10) { // only update cache if we detected sufficient number of keypoints
          const kpts = bodies[i].keypoints.map((kpt) => kpt.position);
          const newBox = scaleBox(kpts, 1.5, [input.shape[2], input.shape[1]]);
          cachedBoxes.push([...newBox.yxBox]);
        }
      }
    }
    resolve(bodies);
  });
}
