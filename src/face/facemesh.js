import { log } from '../log.js';
import * as tf from '../../dist/tfjs.esm.js';
import * as blazeface from './blazeface.js';
import * as facepipeline from './facepipeline.js';
import * as coords from './coords.js';

class MediaPipeFaceMesh {
  constructor(blazeFace, blazeMeshModel, irisModel, config) {
    // @ts-ignore
    this.facePipeline = new facepipeline.Pipeline(blazeFace, blazeMeshModel, irisModel, config);
    this.config = config;
  }

  async estimateFaces(input, config) {
    const predictions = await this.facePipeline.predict(input, config);
    const results = [];
    for (const prediction of (predictions || [])) {
      if (prediction.isDisposedInternal) continue; // guard against disposed tensors on long running operations such as pause in middle of processing
      const mesh = prediction.coords ? prediction.coords.arraySync() : null;
      const meshRaw = prediction.rawCoords;
      const annotations = {};
      if (mesh && mesh.length > 0) {
        for (const key of Object.keys(coords.MESH_ANNOTATIONS)) {
          annotations[key] = coords.MESH_ANNOTATIONS[key].map((index) => mesh[index]);
        }
      }
      const boxRaw = (config.face.mesh.returnRawData && prediction.box) ? { topLeft: prediction.box.startPoint, bottomRight: prediction.box.endPoint } : null;
      const box = prediction.box ? [
        Math.max(0, prediction.box.startPoint[0]),
        Math.max(0, prediction.box.startPoint[1]),
        Math.min(input.shape[2], prediction.box.endPoint[0]) - prediction.box.startPoint[0],
        Math.min(input.shape[1], prediction.box.endPoint[1]) - prediction.box.startPoint[1],
      ] : 0;
      results.push({
        confidence: prediction.confidence || 0,
        box,
        mesh,
        boxRaw,
        meshRaw,
        annotations,
        image: prediction.image ? tf.clone(prediction.image) : null,
      });
      if (prediction.coords) prediction.coords.dispose();
      if (prediction.image) prediction.image.dispose();
    }
    return results;
  }
}

let faceModels = [null, null, null];
async function load(config) {
  faceModels = await Promise.all([
    // @ts-ignore
    (!faceModels[0] && config.face.enabled) ? blazeface.load(config) : null,
    (!faceModels[1] && config.face.mesh.enabled) ? tf.loadGraphModel(config.face.mesh.modelPath, { fromTFHub: config.face.mesh.modelPath.includes('tfhub.dev') }) : null,
    (!faceModels[2] && config.face.iris.enabled) ? tf.loadGraphModel(config.face.iris.modelPath, { fromTFHub: config.face.iris.modelPath.includes('tfhub.dev') }) : null,
  ]);
  const faceMesh = new MediaPipeFaceMesh(faceModels[0], faceModels[1], faceModels[2], config);
  if (config.face.mesh.enabled) log(`load model: ${config.face.mesh.modelPath.match(/\/(.*)\./)[1]}`);
  if (config.face.iris.enabled) log(`load model: ${config.face.iris.modelPath.match(/\/(.*)\./)[1]}`);
  return faceMesh;
}

exports.load = load;
exports.MediaPipeFaceMesh = MediaPipeFaceMesh;
exports.triangulation = coords.TRI468;
