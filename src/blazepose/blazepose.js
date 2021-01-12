import { log } from '../log.js';
import * as tf from '../../dist/tfjs.esm.js';
// import * as profile from '../profile.js';

const models = {};

export async function load(config) {
  if (!models.blazepose) {
    models.blazepose = await tf.loadGraphModel(config.pose.modelPath);
    log(`load model: ${config.pose.modelPath.match(/\/(.*)\./)[1]}`);
  }
  return models.blazepose;
}

export async function predict(image, config) {
  if (!models.blazepose) return null;
  return new Promise(async (resolve) => {
    const resize = tf.image.resizeBilinear(image, [config.pose.inputSize, config.pose.inputSize], false);
    const enhance = tf.div(resize, 127.5).sub(1);
    tf.dispose(resize);
    const logits = await models.blazepose.predict(enhance);
    //
    tf.dispose(enhance);
    logits.map((logit) => logit.dispose());
    resolve(logits);
  });
}
