import { log } from '../log';
import * as tf from '../../dist/tfjs.esm.js';
import * as profile from '../profile';

// original: https://github.com/sirius-ai/MobileFaceNet_TF
// modified: https://github.com/sirius-ai/MobileFaceNet_TF/issues/46
// download: https://github.com/sirius-ai/MobileFaceNet_TF/files/3551493/FaceMobileNet192_train_false.zip

/* WiP

- Should input box be tightly cropped?
- What is the best input range? (adjust distance scale accordingly)
- How to best normalize output
*/

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
  const distance = 50.0 * ((embedding1.map((val, i) => (val - embedding2[i])).reduce((dist, diff) => dist + (diff ** order), 0) ** (1 / order)));
  const res = (Math.trunc(1000 * (1 - (isNaN(distance) ? 1 : distance))) / 1000);
  console.log(distance, res);
  return res;
}

export async function predict(image, config) {
  if (!model) return null;
  return new Promise(async (resolve) => {
    const resize = tf.image.resizeBilinear(image, [model.inputs[0].shape[2], model.inputs[0].shape[1]], false); // input is already normalized to 0..1
    // optionally do a tight box crop
    /*
    const box = [[0, 0.2, 0.9, 0.8]]; // top, left, bottom, right
    const resize = tf.image.cropAndResize(image, box, [0], [model.inputs[0].shape[2], model.inputs[0].shape[1]]);
    */
    // debug visualize box
    // const canvas = document.getElementById('compare-canvas');
    // await tf.browser.toPixels(resize.squeeze(), canvas);
    const norm = resize.sub(0.5);
    // optionally normalizes with mean value being at point 0, better than fixed range -0.5..0.5
    /*
    const mean = resize.mean();
    const norm = resize.sub(mean);
    */
    resize.dispose();
    let data: Array<[]> = [];
    if (config.face.embedding.enabled) {
      if (!config.profile) {
        const res = await model.predict({ img_inputs: norm });
        /*
        const scaled = tf.tidy(() => {
          // run l2 normalization on output
          const sqr = res.square();
          const sum = sqr.sum();
          const sqrt = sum.sqrt();
          const l2 = res.div(sqrt);
          // scale outputs
          const range = l2.max().sub(l2.min());
          const scale = l2.mul(2).div(range);
          return scale;
        });
        */
        data = [...res.dataSync()]; // convert object array to standard array
        tf.dispose(res);
      } else {
        const profileData = await tf.profile(() => model.predict({ img_inputs: norm }));
        data = [...profileData.result.dataSync()];
        profileData.result.dispose();
        profile.run('emotion', profileData);
      }
    }
    norm.dispose();
    resolve(data);
  });
}
