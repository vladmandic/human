import { log } from '../log.js';
import * as tf from '../../dist/tfjs.esm.js';
import * as profile from '../profile.js';

class FaceBoxes {
  constructor(model, config) {
    this.model = model;
    this.config = config;
  }

  async estimateFaces(input, config) {
    if (config) this.config = config;
    const results = [];
    const resizeT = tf.image.resizeBilinear(input, [this.config.face.detector.inputSize, this.config.face.detector.inputSize]);
    const castT = resizeT.toInt();
    let scores;
    let boxes;
    if (!config.profile) {
      const [scoresT, boxesT, numT] = await this.model.executeAsync(castT);
      scores = scoresT.dataSync();
      const squeezeT = boxesT.squeeze();
      boxes = squeezeT.arraySync();
      scoresT.dispose();
      boxesT.dispose();
      squeezeT.dispose();
      numT.dispose();
    } else {
      const profileData = await tf.profile(() => this.model.executeAsync(castT));
      scores = profileData.result[0].dataSync();
      const squeezeT = profileData.result[1].squeeze();
      boxes = squeezeT.arraySync();
      profileData.result.forEach((t) => t.dispose());
      profile.run('faceboxes', profileData);
    }
    castT.dispose();
    resizeT.dispose();
    for (const i in boxes) {
      if (scores[i] && scores[i] > this.config.face.detector.minConfidence) {
        const enlarge = 1.05;
        const crop = [boxes[i][0] / enlarge, boxes[i][1] / enlarge, boxes[i][2] * enlarge, boxes[i][3] * enlarge];
        const boxRaw = [crop[1], crop[0], (crop[3]) - (crop[1]), (crop[2]) - (crop[0])];
        const box = [parseInt(boxRaw[0] * input.shape[2]), parseInt(boxRaw[1] * input.shape[1]), parseInt(boxRaw[2] * input.shape[2]), parseInt(boxRaw[3] * input.shape[1])];
        const image = tf.image.cropAndResize(input, [crop], [0], [this.config.face.detector.inputSize, this.config.face.detector.inputSize]);
        results.push({
          confidence: scores[i],
          box,
          boxRaw,
          image,
          // mesh,
          // meshRaw,
          // annotations,
        });
      }
    }
    return results;
  }
}

async function load(config) {
  const model = await tf.loadGraphModel(config.face.detector.modelPath);
  log(`load model: ${config.face.detector.modelPath.match(/\/(.*)\./)[1]}`);
  const faceboxes = new FaceBoxes(model, config);
  if (config.face.mesh.enabled) log(`load model: ${config.face.mesh.modelPath.match(/\/(.*)\./)[1]}`);
  if (config.face.iris.enabled) log(`load model: ${config.face.iris.modelPath.match(/\/(.*)\./)[1]}`);
  return faceboxes;
}

exports.load = load;
exports.FaceBoxes = FaceBoxes;
