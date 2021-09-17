/**
 * FaceMesh & BlazeFace Module entry point
 */

import { log, join } from '../helpers';
import * as tf from '../../dist/tfjs.esm.js';
import * as blazeface from './blazeface';
import * as facepipeline from './facepipeline';
import * as coords from './coords';
import type { GraphModel, Tensor } from '../tfjs/types';
import type { FaceResult } from '../result';
import type { Config } from '../config';
import { env } from '../env';

let faceModels: [blazeface.BlazeFaceModel | null, GraphModel | null, GraphModel | null] = [null, null, null];
let facePipeline;

export async function predict(input: Tensor, config: Config): Promise<FaceResult[]> {
  const predictions = await facePipeline.predict(input, config);
  const results: Array<FaceResult> = [];
  let id = 0;
  for (const prediction of (predictions || [])) {
    if (!prediction || prediction.isDisposedInternal) continue; // guard against disposed tensors on long running operations such as pause in middle of processing
    const meshRaw = prediction.mesh.map((pt) => [
      pt[0] / (input.shape[2] || 0),
      pt[1] / (input.shape[1] || 0),
      pt[2] / facePipeline.meshSize,
    ]);
    const annotations = {};
    if (prediction.mesh && prediction.mesh.length > 0) {
      for (const key of Object.keys(coords.MESH_ANNOTATIONS)) annotations[key] = coords.MESH_ANNOTATIONS[key].map((index) => prediction.mesh[index]);
    }
    const clampedBox: [number, number, number, number] = prediction.box ? [
      Math.trunc(Math.max(0, prediction.box.startPoint[0])),
      Math.trunc(Math.max(0, prediction.box.startPoint[1])),
      Math.trunc(Math.min((input.shape[2] || 0), prediction.box.endPoint[0]) - Math.max(0, prediction.box.startPoint[0])),
      Math.trunc(Math.min((input.shape[1] || 0), prediction.box.endPoint[1]) - Math.max(0, prediction.box.startPoint[1])),
    ] : [0, 0, 0, 0];
    const boxRaw: [number, number, number, number] = prediction.box ? [
      prediction.box.startPoint[0] / (input.shape[2] || 0),
      prediction.box.startPoint[1] / (input.shape[1] || 0),
      (prediction.box.endPoint[0] - prediction.box.startPoint[0]) / (input.shape[2] || 0),
      (prediction.box.endPoint[1] - prediction.box.startPoint[1]) / (input.shape[1] || 0),
    ] : [0, 0, 0, 0];
    results.push({
      id: id++,
      score: Math.round(100 * prediction.faceConfidence || 100 * prediction.boxConfidence || 0) / 100,
      boxScore: Math.round(100 * prediction.boxConfidence) / 100,
      faceScore: Math.round(100 * prediction.faceConfidence) / 100,
      box: clampedBox,
      boxRaw,
      mesh: prediction.mesh,
      meshRaw,
      annotations,
      tensor: prediction.image,
    });
  }
  return results;
}

export async function load(config): Promise<[unknown, GraphModel | null, GraphModel | null]> {
  if (env.initial) faceModels = [null, null, null];
  if ((!faceModels[0] && config.face.enabled) || (!faceModels[1] && config.face.mesh.enabled) || (!faceModels[2] && config.face.iris.enabled) || env.initial) {
    faceModels = await Promise.all([
      (!faceModels[0] && config.face.enabled) ? blazeface.load(config) : null,
      (!faceModels[1] && config.face.mesh.enabled) ? tf.loadGraphModel(join(config.modelBasePath, config.face.mesh.modelPath), { fromTFHub: config.face.mesh.modelPath.includes('tfhub.dev') }) as unknown as GraphModel : null,
      (!faceModels[2] && config.face.iris.enabled) ? tf.loadGraphModel(join(config.modelBasePath, config.face.iris.modelPath), { fromTFHub: config.face.iris.modelPath.includes('tfhub.dev') }) as unknown as GraphModel : null,
    ]);
    if (config.face.mesh.enabled) {
      if (!faceModels[1] || !faceModels[1]['modelUrl']) log('load model failed:', config.face.mesh.modelPath);
      else if (config.debug) log('load model:', faceModels[1]['modelUrl']);
    }
    if (config.face.iris.enabled) {
      if (!faceModels[2] || !faceModels[2]['modelUrl']) log('load model failed:', config.face.iris.modelPath);
      else if (config.debug) log('load model:', faceModels[2]['modelUrl']);
    }
  } else if (config.debug) {
    if (faceModels[0]) log('cached model:', faceModels[0].model['modelUrl']);
    if (faceModels[1]) log('cached model:', faceModels[1]['modelUrl']);
    if (faceModels[2]) log('cached model:', faceModels[2]['modelUrl']);
  }
  facePipeline = new facepipeline.Pipeline(faceModels[0], faceModels[1], faceModels[2]);
  return faceModels;
}

export const triangulation = coords.TRI468;
export const uvmap = coords.UV468;
