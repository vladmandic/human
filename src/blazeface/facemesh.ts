import { log, join } from '../helpers';
import * as tf from '../../dist/tfjs.esm.js';
import * as blazeface from './blazeface';
import * as facepipeline from './facepipeline';
import * as coords from './coords';

export class MediaPipeFaceMesh {
  facePipeline: any;
  config: any;

  constructor(blazeFace, blazeMeshModel, irisModel, config) {
    this.facePipeline = new facepipeline.Pipeline(blazeFace, blazeMeshModel, irisModel);
    this.config = config;
  }

  async estimateFaces(input, config): Promise<{ confidence, boxConfidence, faceConfidence, box, mesh, boxRaw, meshRaw, annotations, image }[]> {
    const predictions = await this.facePipeline.predict(input, config);
    const results: Array<{ confidence, boxConfidence, faceConfidence, box, mesh, boxRaw, meshRaw, annotations, image }> = [];
    for (const prediction of (predictions || [])) {
      if (prediction.isDisposedInternal) continue; // guard against disposed tensors on long running operations such as pause in middle of processing
      const mesh = prediction.coords ? prediction.coords.arraySync() : [];
      const meshRaw = mesh.map((pt) => [
        pt[0] / input.shape[2],
        pt[1] / input.shape[1],
        pt[2] / this.facePipeline.meshSize,
      ]);
      const annotations = {};
      if (mesh && mesh.length > 0) {
        for (const key of Object.keys(coords.MESH_ANNOTATIONS)) annotations[key] = coords.MESH_ANNOTATIONS[key].map((index) => mesh[index]);
      }
      const box = prediction.box ? [
        Math.max(0, prediction.box.startPoint[0]),
        Math.max(0, prediction.box.startPoint[1]),
        Math.min(input.shape[2], prediction.box.endPoint[0]) - Math.max(0, prediction.box.startPoint[0]),
        Math.min(input.shape[1], prediction.box.endPoint[1]) - Math.max(0, prediction.box.startPoint[1]),
      ] : 0;
      const boxRaw = prediction.box ? [
        prediction.box.startPoint[0] / input.shape[2],
        prediction.box.startPoint[1] / input.shape[1],
        (prediction.box.endPoint[0] - prediction.box.startPoint[0]) / input.shape[2],
        (prediction.box.endPoint[1] - prediction.box.startPoint[1]) / input.shape[1],
      ] : [];
      results.push({
        confidence: Math.round(100 * prediction.faceConfidence || 100 * prediction.boxConfidence || 0) / 100,
        boxConfidence: Math.round(100 * prediction.boxConfidence) / 100,
        faceConfidence: Math.round(100 * prediction.faceConfidence) / 100,
        box,
        boxRaw,
        mesh,
        meshRaw,
        annotations,
        image: prediction.image ? prediction.image.clone() : null,
      });
      if (prediction.coords) prediction.coords.dispose();
      if (prediction.image) prediction.image.dispose();
    }
    return results;
  }
}

let faceModels:[any, any, any] = [null, null, null];
export async function load(config): Promise<MediaPipeFaceMesh> {
  if ((!faceModels[0] && config.face.enabled) || (!faceModels[1] && config.face.mesh.enabled) || (!faceModels[2] && config.face.iris.enabled)) {
    faceModels = await Promise.all([
      (!faceModels[0] && config.face.enabled) ? blazeface.load(config) : null,
      (!faceModels[1] && config.face.mesh.enabled) ? tf.loadGraphModel(join(config.modelBasePath, config.face.mesh.modelPath), { fromTFHub: config.face.mesh.modelPath.includes('tfhub.dev') }) : null,
      (!faceModels[2] && config.face.iris.enabled) ? tf.loadGraphModel(join(config.modelBasePath, config.face.iris.modelPath), { fromTFHub: config.face.iris.modelPath.includes('tfhub.dev') }) : null,
    ]);
    if (config.face.mesh.enabled) {
      if (!faceModels[1] || !faceModels[1].modelUrl) log('load model failed:', config.face.mesh.modelPath);
      else if (config.debug) log('load model:', faceModels[1].modelUrl);
    }
    if (config.face.iris.enabled) {
      if (!faceModels[2] || !faceModels[1].modelUrl) log('load model failed:', config.face.iris.modelPath);
      else if (config.debug) log('load model:', faceModels[2].modelUrl);
    }
  } else if (config.debug) {
    log('cached model:', faceModels[0].model.modelUrl);
    log('cached model:', faceModels[1].modelUrl);
    log('cached model:', faceModels[2].modelUrl);
  }
  const faceMesh = new MediaPipeFaceMesh(faceModels[0], faceModels[1], faceModels[2], config);
  return faceMesh;
}

export const triangulation = coords.TRI468;
export const uvmap = coords.UV468;
