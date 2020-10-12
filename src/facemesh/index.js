const tf = require('@tensorflow/tfjs');
const blazeface = require('../blazeface');
const keypoints = require('./keypoints');
const pipe = require('./pipeline');
const uv_coords = require('./uvcoords');
const triangulation = require('./triangulation').default;

exports.uv_coords = uv_coords;
exports.triangulation = triangulation;

async function loadDetectorModel(config) {
  return blazeface.load(config);
}
async function loadMeshModel(modelUrl) {
  return tf.loadGraphModel(modelUrl, { fromTFHub: modelUrl.includes('tfhub.dev') });
}
async function loadIrisModel(modelUrl) {
  return tf.loadGraphModel(modelUrl, { fromTFHub: modelUrl.includes('tfhub.dev') });
}

async function load(config) {
  const models = await Promise.all([
    loadDetectorModel(config),
    loadMeshModel(config.mesh.modelPath),
    loadIrisModel(config.iris.modelPath),
  ]);
  // eslint-disable-next-line no-use-before-define
  const faceMesh = new MediaPipeFaceMesh(models[0], models[1], models[2], config);
  return faceMesh;
}
exports.load = load;

class MediaPipeFaceMesh {
  constructor(blazeFace, blazeMeshModel, irisModel, config) {
    this.pipeline = new pipe.Pipeline(blazeFace, blazeMeshModel, irisModel, config);
    this.config = config;
  }

  async estimateFaces(input, config) {
    if (config) this.config = config;
    const image = tf.tidy(() => {
      if (!(input instanceof tf.Tensor)) {
        input = tf.browser.fromPixels(input);
      }
      return input.toFloat().expandDims(0);
    });
    const results = [];
    const predictions = await this.pipeline.predict(image, this.config.iris.enabled, this.config.mesh.enabled);
    image.dispose();
    if (!predictions) return results;
    for (const prediction of predictions) {
      const confidence = prediction.confidence.arraySync();
      if (confidence >= this.config.detector.minConfidence) {
        const result = {
          confidence: confidence || 0,
          box: prediction.box ? [prediction.box.startPoint[0], prediction.box.startPoint[1], prediction.box.endPoint[0] - prediction.box.startPoint[0], prediction.box.endPoint[1] - prediction.box.startPoint[1]] : 0,
          mesh: prediction.coords ? prediction.coords.arraySync() : null,
          image: prediction.image ? tf.clone(prediction.image) : null,
          // mesh: prediction.coords.arraySync(),
        };
        const annotations = {};
        if (result.mesh && result.mesh.length > 0) {
          for (const key in keypoints.MESH_ANNOTATIONS) {
            if (this.config.iris.enabled || key.includes('Iris') === false) {
              annotations[key] = keypoints.MESH_ANNOTATIONS[key].map((index) => result.mesh[index]);
            }
          }
        }
        result['annotations'] = annotations;
        results.push(result);
      }
      tf.dispose(prediction.confidence);
      tf.dispose(prediction.image);
      tf.dispose(prediction.coords);
      tf.dispose(prediction);
    }
    tf.dispose(predictions);
    return results;
  }
}
exports.MediaPipeFaceMesh = MediaPipeFaceMesh;
