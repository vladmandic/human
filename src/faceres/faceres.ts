import { log } from '../helpers';
import * as tf from '../../dist/tfjs.esm.js';
import * as profile from '../profile';

let model;
let last = { age: 0 };
let skipped = Number.MAX_SAFE_INTEGER;

type Tensor = typeof tf.Tensor;
type DB = Array<{ name: string, source: string, embedding: number[] }>;

export async function load(config) {
  if (!model) {
    model = await tf.loadGraphModel(config.face.description.modelPath);
    if (config.debug) log(`load model: ${config.face.description.modelPath.match(/\/(.*)\./)[1]}`);
  }
  return model;
}

export function similarity(embedding1, embedding2, order = 2): number {
  if (!embedding1 || !embedding2) return 0;
  if (embedding1?.length === 0 || embedding2?.length === 0) return 0;
  if (embedding1?.length !== embedding2?.length) return 0;
  // general minkowski distance, euclidean distance is limited case where order is 2
  const distance = 4.0 * embedding1
    .map((val, i) => (Math.abs(embedding1[i] - embedding2[i]) ** order)) // distance squared
    .reduce((sum, now) => (sum + now), 0) // sum all distances
    ** (1 / order); // get root of
  const res = Math.max(0, 100 - distance) / 100.0;
  return res;
}

export function match(embedding: Array<number>, db: DB, threshold = 0) {
  let best = { similarity: 0, name: '', source: '', embedding: [] as number[] };
  if (!embedding || !db || !Array.isArray(embedding) || !Array.isArray(db)) return best;
  for (const f of db) {
    if (f.embedding && f.name) {
      const perc = similarity(embedding, f.embedding);
      if (perc > threshold && perc > best.similarity) best = { ...f, similarity: perc };
    }
  }
  return best;
}

export function enhance(input): Tensor {
  const image = tf.tidy(() => {
    // input received from detector is already normalized to 0..1
    // input is also assumed to be straightened
    const tensor = input.image || input.tensor || input;
    if (!(tensor instanceof tf.Tensor)) return null;
    // do a tight crop of image and resize it to fit the model
    const box = [[0.05, 0.15, 0.85, 0.85]]; // empyrical values for top, left, bottom, right
    const crop = (tensor.shape.length === 3)
      ? tf.image.cropAndResize(tf.expandDims(tensor, 0), box, [0], [model.inputs[0].shape[2], model.inputs[0].shape[1]]) // add batch dimension if missing
      : tf.image.cropAndResize(tensor, box, [0], [model.inputs[0].shape[2], model.inputs[0].shape[1]]);
    // const crop = tf.image.resizeBilinear(tensor, [model.inputs[0].shape[2], model.inputs[0].shape[1]], false); // just resize to fit the embedding model

    /*
    // convert to black&white to avoid colorization impact
    const rgb = [0.2989, 0.5870, 0.1140]; // factors for red/green/blue colors when converting to grayscale: https://www.mathworks.com/help/matlab/ref/rgb2gray.html
    const [red, green, blue] = tf.split(crop, 3, 3);
    const redNorm = tf.mul(red, rgb[0]);
    const greenNorm = tf.mul(green, rgb[1]);
    const blueNorm = tf.mul(blue, rgb[2]);
    const grayscale = tf.addN([redNorm, greenNorm, blueNorm]);
    const merge = tf.stack([grayscale, grayscale, grayscale], 3).squeeze(4);
    */

    /*
    // optional increase image contrast
    // or do it per-channel so mean is done on each channel
    // or do it based on histogram
    const mean = merge.mean();
    const factor = 5;
    const contrast = merge.sub(mean).mul(factor).add(mean);
    */
    /*
    // normalize brightness from 0..1
    const darken = crop.sub(crop.min());
    const lighten = darken.div(darken.max());
    */
    const norm = crop.mul(255);

    return norm;
  });
  return image;
}

export async function predict(image, config) {
  if (!model) return null;
  if ((skipped < config.face.description.skipFrames) && config.videoOptimized && last.age && (last.age > 0)) {
    skipped++;
    return last;
  }
  if (config.videoOptimized) skipped = 0;
  else skipped = Number.MAX_SAFE_INTEGER;
  return new Promise(async (resolve) => {
    // const resize = tf.image.resizeBilinear(image, [model.inputs[0].shape[2], model.inputs[0].shape[1]], false);
    // const enhanced = tf.mul(resize, [255.0]);
    // tf.dispose(resize);
    const enhanced = enhance(image);

    let resT;
    const obj = {
      age: <number>0,
      gender: <string>'unknown',
      genderConfidence: <number>0,
      descriptor: <number[]>[] };

    if (!config.profile) {
      if (config.face.description.enabled) resT = await model.predict(enhanced);
    } else {
      const profileDesc = config.face.description.enabled ? await tf.profile(() => model.predict(enhanced)) : {};
      resT = profileDesc.result;
      profile.run('faceres', profileDesc);
    }
    tf.dispose(enhanced);

    if (resT) {
      tf.tidy(() => {
        const gender = resT.find((t) => t.shape[1] === 1).dataSync();
        const confidence = Math.trunc(200 * Math.abs((gender[0] - 0.5))) / 100;
        if (confidence > config.face.gender.minConfidence) {
          obj.gender = gender[0] <= 0.5 ? 'female' : 'male';
          obj.genderConfidence = Math.min(0.99, confidence);
        }
        const age = resT.find((t) => t.shape[1] === 100).argMax(1).dataSync()[0];
        const all = resT.find((t) => t.shape[1] === 100).dataSync();
        obj.age = Math.round(all[age - 1] > all[age + 1] ? 10 * age - 100 * all[age - 1] : 10 * age + 100 * all[age + 1]) / 10;

        const desc = resT.find((t) => t.shape[1] === 1024);
        // const reshape = desc.reshape([128, 8]);
        // const reduce = reshape.logSumExp(1); // reduce 2nd dimension by calculating logSumExp on it

        obj.descriptor = [...desc.dataSync()];
      });
      resT.forEach((t) => tf.dispose(t));
    }

    last = obj;
    resolve(obj);
  });
}
