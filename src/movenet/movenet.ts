/**
 * EfficientPose Module
 */

import { log, join } from '../helpers';
import * as tf from '../../dist/tfjs.esm.js';
import type { BodyResult } from '../result';
import type { GraphModel, Tensor } from '../tfjs/types';
import type { Config } from '../config';
import { env } from '../env';

let model: GraphModel | null;

type Keypoints = { score: number, part: string, position: [number, number], positionRaw: [number, number] };
const keypoints: Array<Keypoints> = [];
type Person = { id: number, score: number, box: [number, number, number, number], boxRaw: [number, number, number, number], keypoints: Array<Keypoints> }

let box: [number, number, number, number] = [0, 0, 0, 0];
let boxRaw: [number, number, number, number] = [0, 0, 0, 0];
let score = 0;
let skipped = Number.MAX_SAFE_INTEGER;

const bodyParts = ['nose', 'leftEye', 'rightEye', 'leftEar', 'rightEar', 'leftShoulder', 'rightShoulder', 'leftElbow', 'rightElbow', 'leftWrist', 'rightWrist', 'leftHip', 'rightHip', 'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle'];

export async function load(config: Config): Promise<GraphModel> {
  if (env.initial) model = null;
  if (!model) {
    model = await tf.loadGraphModel(join(config.modelBasePath, config.body.modelPath || '')) as unknown as GraphModel;
    if (!model || !model['modelUrl']) log('load model failed:', config.body.modelPath);
    else if (config.debug) log('load model:', model['modelUrl']);
  } else if (config.debug) log('cached model:', model['modelUrl']);
  return model;
}

async function parseSinglePose(res, config, image) {
  keypoints.length = 0;
  const kpt = res[0][0];
  for (let id = 0; id < kpt.length; id++) {
    score = kpt[id][2];
    if (score > config.body.minConfidence) {
      keypoints.push({
        score: Math.round(100 * score) / 100,
        part: bodyParts[id],
        positionRaw: [ // normalized to 0..1
          kpt[id][1],
          kpt[id][0],
        ],
        position: [ // normalized to input image size
          Math.round((image.shape[2] || 0) * kpt[id][1]),
          Math.round((image.shape[1] || 0) * kpt[id][0]),
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
  const persons: Array<Person> = [];
  persons.push({ id: 0, score, box, boxRaw, keypoints });
  return persons;
}

async function parseMultiPose(res, config, image) {
  const persons: Array<Person> = [];
  for (let p = 0; p < res[0].length; p++) {
    const kpt = res[0][p];
    score = Math.round(100 * kpt[51 + 4]) / 100;
    // eslint-disable-next-line no-continue
    if (score < config.body.minConfidence) continue;
    keypoints.length = 0;
    for (let i = 0; i < 17; i++) {
      const partScore = Math.round(100 * kpt[3 * i + 2]) / 100;
      if (partScore > config.body.minConfidence) {
        keypoints.push({
          part: bodyParts[i],
          score: partScore,
          positionRaw: [
            kpt[3 * i + 1],
            kpt[3 * i + 0],
          ],
          position: [
            Math.trunc(kpt[3 * i + 1] * (image.shape[2] || 0)),
            Math.trunc(kpt[3 * i + 0] * (image.shape[1] || 0)),
          ],
        });
      }
    }
    boxRaw = [kpt[51 + 1], kpt[51 + 0], kpt[51 + 3] - kpt[51 + 1], kpt[51 + 2] - kpt[51 + 0]];
    persons.push({
      id: p,
      score,
      boxRaw,
      box: [
        Math.trunc(boxRaw[0] * (image.shape[2] || 0)),
        Math.trunc(boxRaw[1] * (image.shape[1] || 0)),
        Math.trunc(boxRaw[2] * (image.shape[2] || 0)),
        Math.trunc(boxRaw[3] * (image.shape[1] || 0)),
      ],
      keypoints,
    });
  }
  return persons;
}

export async function predict(image: Tensor, config: Config): Promise<BodyResult[]> {
  if ((skipped < (config.body.skipFrames || 0)) && config.skipFrame && Object.keys(keypoints).length > 0) {
    skipped++;
    return [{ id: 0, score, box, boxRaw, keypoints }];
  }
  skipped = 0;
  return new Promise(async (resolve) => {
    const tensor = tf.tidy(() => {
      if (!model?.inputs[0].shape) return null;
      let inputSize = model.inputs[0].shape[2];
      if (inputSize === -1) inputSize = 256;
      const resize = tf.image.resizeBilinear(image, [inputSize, inputSize], false);
      const cast = tf.cast(resize, 'int32');
      return cast;
    });

    let resT;
    if (config.body.enabled) resT = await model?.predict(tensor);
    tf.dispose(tensor);

    if (!resT) resolve([]);
    const res = await resT.array();
    let persons;
    if (resT.shape[2] === 17) persons = await parseSinglePose(res, config, image);
    else if (resT.shape[2] === 56) persons = await parseMultiPose(res, config, image);
    tf.dispose(resT);

    resolve(persons);
  });
}
