import { log } from '../log';
import * as tf from '../../dist/tfjs.esm.js';
import * as profile from '../profile';

// original: https://github.com/sirius-ai/MobileFaceNet_TF
// modified: https://github.com/sirius-ai/MobileFaceNet_TF/issues/46
// download: https://github.com/sirius-ai/MobileFaceNet_TF/files/3551493/FaceMobileNet192_train_false.zip

let model;

export async function load(config) {
  if (!model) {
    model = await tf.loadGraphModel(config.face.embedding.modelPath);
    if (config.debug) log(`load model: ${config.face.embedding.modelPath.match(/\/(.*)\./)[1]}`);
  }
  return model;
}

export function simmilarity(embedding1, embedding2, order = 2) {
  if (!embedding1 || !embedding2) return 0;
  if (embedding1?.length === 0 || embedding2?.length === 0) return 0;
  if (embedding1?.length !== embedding2?.length) return 0;
  // general minkowski distance
  // euclidean distance is limited case where order is 2
  const distance = embedding1
    .map((val, i) => (Math.abs(embedding1[i] - embedding2[i]) ** order)) // distance squared
    .reduce((sum, now) => (sum + now), 0) // sum all distances
    ** (1 / order); // get root of
  const res = Math.trunc(1000 * (1 - (20 * distance))) / 1000;
  return res;
}

export async function predict(input, config) {
  if (!model) return null;
  return new Promise(async (resolve) => {
    const image = tf.tidy(() => {
      const data = tf.image.resizeBilinear(input, [model.inputs[0].shape[2], model.inputs[0].shape[1]], false); // input is already normalized to 0..1
      // const box = [[0.05, 0.10, 0.85, 0.90]]; // top, left, bottom, right
      // const crop = tf.image.cropAndResize(data, box, [0], [model.inputs[0].shape[2], model.inputs[0].shape[1]]); // optionally do a tight box crop
      const norm = data.sub(data.mean()); // trick to normalize around image mean value
      return norm;
    });
    let data: Array<[]> = [];
    if (config.face.embedding.enabled) {
      if (!config.profile) {
        const res = await model.predict({ img_inputs: image });
        const scaled = tf.tidy(() => {
          const l2 = res.norm('euclidean');
          const scale = res.div(l2);
          return scale;
        });
        data = [...scaled.dataSync()]; // convert object array to standard array
        tf.dispose(scaled);
        tf.dispose(res);
      } else {
        const profileData = await tf.profile(() => model.predict({ img_inputs: image }));
        data = [...profileData.result.dataSync()];
        profileData.result.dispose();
        profile.run('emotion', profileData);
      }
    }
    image.dispose();
    resolve(data);
  });
}
