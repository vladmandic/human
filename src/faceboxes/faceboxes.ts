import { log } from '../log';
import * as tf from '../../dist/tfjs.esm.js';
import * as profile from '../profile';

export class FaceBoxes {
  enlarge: number;
  model: any;
  config: any;

  constructor(model, config) {
    this.enlarge = 1.1;
    this.model = model;
    this.config = config;
  }

  async estimateFaces(input, config) {
    if (config) this.config = config;
    const results: Array<{ confidence: number, box: any, boxRaw: any, image: any }> = [];
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
        const crop = [boxes[i][0] / this.enlarge, boxes[i][1] / this.enlarge, boxes[i][2] * this.enlarge, boxes[i][3] * this.enlarge];
        const boxRaw = [crop[1], crop[0], (crop[3]) - (crop[1]), (crop[2]) - (crop[0])];
        const box = [
          parseInt((boxRaw[0] * input.shape[2]).toString()),
          parseInt((boxRaw[1] * input.shape[1]).toString()),
          parseInt((boxRaw[2] * input.shape[2]).toString()),
          parseInt((boxRaw[3] * input.shape[1]).toString())];
        const resized = tf.image.cropAndResize(input, [crop], [0], [this.config.face.detector.inputSize, this.config.face.detector.inputSize]);
        const image = resized.div([255]);
        resized.dispose();
        results.push({ confidence: scores[i], box, boxRaw, image });
        // add mesh, meshRaw, annotations,
      }
    }
    return results;
  }
}

export async function load(config) {
  const model = await tf.loadGraphModel(config.face.detector.modelPath);
  if (config.debug) log(`load model: ${config.face.detector.modelPath.match(/\/(.*)\./)[1]}`);
  const faceboxes = new FaceBoxes(model, config);
  if (config.face.mesh.enabled && config.debug) log(`load model: ${config.face.mesh.modelPath.match(/\/(.*)\./)[1]}`);
  if (config.face.iris.enabled && config.debug) log(`load model: ${config.face.iris.modelPath.match(/\/(.*)\./)[1]}`);
  return faceboxes;
}
