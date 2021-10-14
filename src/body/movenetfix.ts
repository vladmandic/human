import type { BodyKeypoint, BodyResult } from '../result';
import * as box from '../util/box';
import * as coords from './movenetcoords';
import * as tf from '../../dist/tfjs.esm.js';
import type { Tensor } from '../tfjs/types';

const maxJitter = 0.005; // default allowed jitter is within 0.5%

const cache: {
  keypoints: Array<BodyKeypoint>,
  padding: [number, number][];
} = {
  keypoints: [],
  padding: [[0, 0], [0, 0], [0, 0], [0, 0]],
};

export function bodyParts(body: BodyResult) { // model sometimes mixes up left vs right keypoints so we fix them
  for (const pair of coords.horizontal) { // fix body parts left vs right
    const left = body.keypoints.findIndex((kp) => kp.part === pair[0]);
    const right = body.keypoints.findIndex((kp) => kp.part === pair[1]);
    if (body.keypoints[left] && body.keypoints[right]) {
      if (body.keypoints[left].position[0] < body.keypoints[right].position[0]) {
        const tmp = body.keypoints[left];
        body.keypoints[left] = body.keypoints[right];
        body.keypoints[right] = tmp;
      }
    }
  }
  for (const pair of coords.vertical) { // remove body parts with improbable vertical position
    const lower = body.keypoints.findIndex((kp) => (kp && kp.part === pair[0]));
    const higher = body.keypoints.findIndex((kp) => (kp && kp.part === pair[1]));
    if (body.keypoints[lower] && body.keypoints[higher]) {
      if (body.keypoints[lower].position[1] < body.keypoints[higher].position[1]) {
        body.keypoints.splice(lower, 1);
      }
    }
  }
  for (const [pair, compare] of coords.relative) { // rearrange body parts according to their relative position
    const left = body.keypoints.findIndex((kp) => (kp && kp.part === pair[0]));
    const right = body.keypoints.findIndex((kp) => (kp && kp.part === pair[1]));
    const leftTo = body.keypoints.findIndex((kp) => (kp && kp.part === compare[0]));
    const rightTo = body.keypoints.findIndex((kp) => (kp && kp.part === compare[1]));
    if (!body.keypoints[leftTo] || !body.keypoints[rightTo]) continue; // only if we have both compare points
    const distanceLeft = body.keypoints[left] ? [
      Math.abs(body.keypoints[leftTo].position[0] - body.keypoints[left].position[0]),
      Math.abs(body.keypoints[rightTo].position[0] - body.keypoints[left].position[0]),
    ] : [0, 0];
    const distanceRight = body.keypoints[right] ? [
      Math.abs(body.keypoints[rightTo].position[0] - body.keypoints[right].position[0]),
      Math.abs(body.keypoints[leftTo].position[0] - body.keypoints[right].position[0]),
    ] : [0, 0];
    if (distanceLeft[0] > distanceLeft[1] || distanceRight[0] > distanceRight[1]) { // should flip keypoints
      const tmp = body.keypoints[left];
      body.keypoints[left] = body.keypoints[right];
      body.keypoints[right] = tmp;
    }
  }
}

export function jitter(keypoints: Array<BodyKeypoint>): Array<BodyKeypoint> {
  for (let i = 0; i < keypoints.length; i++) {
    if (keypoints[i] && cache.keypoints[i]) {
      const diff = [Math.abs(keypoints[i].positionRaw[0] - cache.keypoints[i].positionRaw[0]), Math.abs(keypoints[i].positionRaw[1] - cache.keypoints[i].positionRaw[1])];
      if (diff[0] < maxJitter && diff[1] < maxJitter) {
        keypoints[i] = cache.keypoints[i]; // below jitter so replace keypoint
      } else {
        cache.keypoints[i] = keypoints[i]; // above jitter so update cache
      }
    } else {
      cache.keypoints[i] = keypoints[i]; // cache for keypoint doesnt exist so create it here
    }
  }
  return keypoints;
}

export function padInput(input: Tensor, inputSize: number): Tensor {
  const t: Record<string, Tensor> = {};
  if (!input.shape || !input.shape[1] || !input.shape[2]) return input;
  cache.padding = [
    [0, 0], // dont touch batch
    [input.shape[2] > input.shape[1] ? Math.trunc((input.shape[2] - input.shape[1]) / 2) : 0, input.shape[2] > input.shape[1] ? Math.trunc((input.shape[2] - input.shape[1]) / 2) : 0], // height before&after
    [input.shape[1] > input.shape[2] ? Math.trunc((input.shape[1] - input.shape[2]) / 2) : 0, input.shape[1] > input.shape[2] ? Math.trunc((input.shape[1] - input.shape[2]) / 2) : 0], // width before&after
    [0, 0], // dont touch rbg
  ];
  t.pad = tf.pad(input, cache.padding);
  t.resize = tf.image.resizeBilinear(t.pad, [inputSize, inputSize]);
  const final = tf.cast(t.resize, 'int32');
  Object.keys(t).forEach((tensor) => tf.dispose(t[tensor]));
  return final;
}

export function rescaleBody(body: BodyResult, outputSize: [number, number]): BodyResult {
  body.keypoints = body.keypoints.filter((kpt) => kpt && kpt.position); // filter invalid keypoints
  for (const kpt of body.keypoints) {
    kpt.position = [
      kpt.position[0] * (outputSize[0] + cache.padding[2][0] + cache.padding[2][1]) / outputSize[0] - cache.padding[2][0],
      kpt.position[1] * (outputSize[1] + cache.padding[1][0] + cache.padding[1][1]) / outputSize[1] - cache.padding[1][0],
    ];
    kpt.positionRaw = [
      kpt.position[0] / outputSize[0], kpt.position[1] / outputSize[1],
    ];
  }
  const rescaledBoxes = box.calc(body.keypoints.map((pt) => pt.position), outputSize);
  body.box = rescaledBoxes.box;
  body.boxRaw = rescaledBoxes.boxRaw;
  return body;
}
