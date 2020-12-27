import { log } from '../log.js';
import * as tf from '../../dist/tfjs.esm.js';
import * as profile from '../profile.js';

// based on https://github.com/sirius-ai/MobileFaceNet_TF
// model converted from https://github.com/sirius-ai/MobileFaceNet_TF/files/3551493/FaceMobileNet192_train_false.zip

const models = {};

async function load(config) {
  if (!models.embedding) {
    models.embedding = await tf.loadGraphModel(config.face.embedding.modelPath);
    log(`load model: ${config.face.embedding.modelPath.match(/\/(.*)\./)[1]}`);
  }
  return models.embedding;
}

function simmilarity(embedding1, embedding2) {
  if (embedding1?.length !== embedding2?.length) return 0;
  // general minkowski distance
  // euclidean distance is limited case where order is 2
  const order = 2;
  const distance = 10.0 * ((embedding1.map((val, i) => (val - embedding2[i])).reduce((dist, diff) => dist + (diff ** order), 0) ** (1 / order)));
  return (Math.trunc(1000 * (1 - distance)) / 1000);
}

async function predict(image, config) {
  if (!models.embedding) return null;
  return new Promise(async (resolve) => {
    const resize = tf.image.resizeBilinear(image, [config.face.embedding.inputSize, config.face.embedding.inputSize], false);
    // const normalize = tf.tidy(() => resize.div(127.5).sub(0.5)); // this is -0.5...0.5 ???
    let data = [];
    if (config.face.embedding.enabled) {
      if (!config.profile) {
        const embeddingT = await models.embedding.predict({ img_inputs: resize });
        data = [...embeddingT.dataSync()]; // convert object array to standard array
        tf.dispose(embeddingT);
      } else {
        const profileData = await tf.profile(() => models.embedding.predict({ img_inputs: resize }));
        data = [...profileData.result.dataSync()];
        profileData.result.dispose();
        // @ts-ignore
        profile.run('emotion', profileData);
      }
    }
    resize.dispose();
    // normalize.dispose();
    resolve(data);
  });
}

exports.predict = predict;
exports.simmilarity = simmilarity;
exports.load = load;
