/**
 * Module that analyzes face descriptors/embedding
 * Obsolete
 */

import { log, join } from '../helpers';
import * as tf from '../../dist/tfjs.esm.js';
import type { Tensor, GraphModel } from '../tfjs/types';
import { env } from '../env';

type DB = Array<{ name: string, source: string, embedding: number[] }>;
let model: GraphModel | null;

export async function load(config) {
  const modelUrl = join(config.modelBasePath, config.face.embedding.modelPath);
  if (env.initial) model = null;
  if (!model) {
    model = await tf.loadGraphModel(modelUrl) as unknown as GraphModel;
    if (!model) log('load model failed:', config.face.embedding.modelPath);
    else if (config.debug) log('load model:', modelUrl);
  } else if (config.debug) log('cached model:', modelUrl);
  return model;
}

export function similarity(embedding1, embedding2, order = 2): number {
  if (!embedding1 || !embedding2) return 0;
  if (embedding1?.length === 0 || embedding2?.length === 0) return 0;
  if (embedding1?.length !== embedding2?.length) return 0;
  // general minkowski distance, euclidean distance is limited case where order is 2
  const distance = embedding1
    .map((_val, i) => (Math.abs(embedding1[i] - embedding2[i]) ** order)) // distance squared
    .reduce((sum, now) => (sum + now), 0) // sum all distances into total
    ** (1 / order); // get root of total distances
  const res = Math.max(Math.trunc(1000 * (1 - distance)) / 1000, 0);
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
    // const data = tf.image.resizeBilinear(input, [model.inputs[0].shape[2], model.inputs[0].shape[1]], false); // just resize to fit the embedding model
    // do a tight crop of image and resize it to fit the model
    const box = [[0.05, 0.15, 0.85, 0.85]]; // empyrical values for top, left, bottom, right
    const tensor = input.image || input.tensor;
    if (!(tensor instanceof tf.Tensor)) return null;
    if (!model || !model.inputs || !model.inputs[0].shape) return null;
    const crop = (tensor.shape.length === 3)
      ? tf.image.cropAndResize(tf.expandDims(tensor, 0), box, [0], [model.inputs[0].shape[2], model.inputs[0].shape[1]]) // add batch dimension if missing
      : tf.image.cropAndResize(tensor, box, [0], [model.inputs[0].shape[2], model.inputs[0].shape[1]]);

    // convert to black&white to avoid colorization impact
    const rgb = [0.2989, 0.5870, 0.1140]; // factors for red/green/blue colors when converting to grayscale: https://www.mathworks.com/help/matlab/ref/rgb2gray.html
    const [red, green, blue] = tf.split(crop, 3, 3);
    const redNorm = tf.mul(red, rgb[0]);
    const greenNorm = tf.mul(green, rgb[1]);
    const blueNorm = tf.mul(blue, rgb[2]);
    const grayscale = tf.addN([redNorm, greenNorm, blueNorm]);
    const merge = tf.stack([grayscale, grayscale, grayscale], 3).squeeze(4);

    /*
    // optional increase image contrast
    // or do it per-channel so mean is done on each channel
    // or do it based on histogram
    const mean = merge.mean();
    const factor = 5;
    const contrast = merge.sub(mean).mul(factor).add(mean);
    */

    // normalize brightness from 0..1
    const darken = tf.sub(merge, merge.min());
    const lighten = tf.div(darken, darken.max());

    return lighten;
  });
  return image;
}

export async function predict(input, config): Promise<number[]> {
  if (!model) return [];
  return new Promise(async (resolve) => {
    // let data: Array<[]> = [];
    let data: Array<number> = [];
    if (config.face.embedding.enabled) {
      const image = enhance(input);
      const dataT = tf.tidy(() => {
        /*
        // if needed convert from NHWC to NCHW
        const nchw = image.transpose([3, 0, 1, 2]);
        */

        const res = model?.predict(image);

        /*
        // optionally do it twice with flipped image and average results
        const res1 = model.predict(image);
        const flipped = tf.image.flipLeftRight(image);
        const res2 = model.predict(flipped);
        const merge = tf.stack([res1, res2], 2).squeeze();
        const res = reshape.logSumExp(1);
        */

        /*
        // optional normalize outputs with l2 normalization
        const scaled = tf.tidy(() => {
          const l2 = res.norm('euclidean');
          const scale = res.div(l2);
          return scale;
        });
        */

        // optional reduce feature vector complexity
        const reshape = tf.reshape(res, [128, 2]); // split 256 vectors into 128 x 2
        const reduce = reshape.logSumExp(1); // reduce 2nd dimension by calculating logSumExp on it

        return reduce;
      });
      const output: Array<number> = await dataT.data();
      data = [...output]; // convert typed array to simple array
      tf.dispose(dataT);
      tf.dispose(image);
    }
    resolve(data);
  });
}

/*
git clone https://github.com/becauseofAI/MobileFace
cd MobileFace/MobileFace_Identification
mmconvert --srcFramework mxnet --inputWeight MobileFace_Identification_V3-0000.params --inputNetwork MobileFace_Identification_V3-symbol.json --inputShape 3,112,112 --dstFramework tensorflow --outputModel saved
saved_model_cli show --dir saved/
tensorflowjs_converter --input_format tf_saved_model --output_format tfjs_graph_model --saved_model_tags train saved/ graph/
~/dev/detector/signature.js graph/
2021-03-12 08:25:12 DATA:  created on: 2021-03-12T13:17:11.960Z
2021-03-12 08:25:12 INFO:  graph model: /home/vlado/dev/face/MobileFace/MobileFace_Identification/graph/model.json
2021-03-12 08:25:12 INFO:  size: { unreliable: true, numTensors: 75, numDataBuffers: 75, numBytes: 2183192 }
2021-03-12 08:25:12 INFO:  model inputs based on signature
2021-03-12 08:25:12 INFO:  model outputs based on signature
2021-03-12 08:25:12 DATA:  inputs: [ { name: 'data:0', dtype: 'DT_FLOAT', shape: [ -1, 112, 112, 3, [length]: 4 ] }, [length]: 1 ]
2021-03-12 08:25:12 DATA:  outputs: [ { id: 0, name: 'batchnorm0/add_1:0', dytpe: 'DT_FLOAT', shape: [ -1, 256, [length]: 2 ] }, [length]: 1 ]
*/
