import { log } from '../log';
import * as tf from '../../dist/tfjs.esm.js';
import * as profile from '../profile';

let model;
let last: Array<{}> = [];
let skipped = Number.MAX_SAFE_INTEGER;

const scaleBox = 2.5; // increase box size
// eslint-disable-next-line max-len
const labels = ['person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'vehicle', 'boat', 'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'animal', 'animal', 'animal', 'animal', 'animal', 'animal', 'animal', 'bear', 'animal', 'animal', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket', 'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'pastry', 'cake', 'chair', 'couch', 'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink', 'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'];

export async function load(config) {
  if (!model) {
    model = await tf.loadGraphModel(config.object.modelPath);
    // @ts-ignore
    model.inputSize = parseInt(Object.values(model.modelSignature['inputs'])[0].tensorShape.dim[2].size);
    if (config.debug) log(`load model: ${config.object.modelPath.match(/\/(.*)\./)[1]}`);
  }
  return model;
}

async function process(res, inputSize, outputShape, config) {
  let results: Array<{ score: Number, strideSize: Number, class: Number, label: String, center: Number[], centerRaw: Number[], box: Number[], boxRaw: Number[] }> = [];
  for (const strideSize of [1, 2, 4]) { // try each stride size as it detects large/medium/small objects
    // find scores, boxes, classes
    tf.tidy(() => { // wrap in tidy to automatically deallocate temp tensors
      const baseSize = strideSize * 13; // 13x13=169, 26x26=676, 52x52=2704
      // find boxes and scores output depending on stride
      // log.info('Variation:', strideSize, 'strides', baseSize, 'baseSize');
      const scores = res.find((a) => (a.shape[1] === (baseSize ** 2) && a.shape[2] === 80))?.squeeze();
      const features = res.find((a) => (a.shape[1] === (baseSize ** 2) && a.shape[2] === 32))?.squeeze();
      // log.state('Found features tensor:', features?.shape);
      // log.state('Found scores tensor:', scores?.shape);
      const scoreIdx = scores.argMax(1).dataSync(); // location of highest scores
      const scoresMax = scores.max(1).dataSync(); // values of highest scores
      const boxesMax = features.reshape([-1, 4, 8]); // reshape [32] to [4,8] where 8 is change of different features inside stride
      const boxIdx = boxesMax.argMax(2).arraySync(); // what we need is indexes of features with highest scores, not values itself
      for (let i = 0; i < scores.shape[0]; i++) {
        if (scoreIdx[i] !== 0 && scoresMax[i] > config.object.minConfidence) {
          const cx = (0.5 + Math.trunc(i % baseSize)) / baseSize; // center.x normalized to range 0..1
          const cy = (0.5 + Math.trunc(i / baseSize)) / baseSize; // center.y normalized to range 0..1
          const boxOffset = boxIdx[i].map((a) => a * (baseSize / strideSize / inputSize)); // just grab indexes of features with highest scores
          let boxRaw = [ // results normalized to range 0..1
            cx - (scaleBox / strideSize * boxOffset[0]),
            cy - (scaleBox / strideSize * boxOffset[1]),
            cx + (scaleBox / strideSize * boxOffset[2]),
            cy + (scaleBox / strideSize * boxOffset[3]),
          ];
          boxRaw = boxRaw.map((a) => Math.max(0, Math.min(a, 1))); // fix out-of-bounds coords
          const box = [ // results normalized to input image pixels
            Math.max(0, (boxRaw[0] * outputShape[0])),
            Math.max(0, (boxRaw[1] * outputShape[1])),
            Math.min(1, (boxRaw[2] * outputShape[0]) - (boxRaw[0] * outputShape[0])),
            Math.min(1, (boxRaw[3] * outputShape[1]) - (boxRaw[1] * outputShape[1])),
          ];
          const result = {
            score: scoresMax[i],
            strideSize,
            class: scoreIdx[i] + 1,
            label: labels[scoreIdx[i]],
            center: [Math.trunc(outputShape[0] * cx), Math.trunc(outputShape[1] * cy)],
            centerRaw: [cx, cy],
            box: box.map((a) => Math.trunc(a)),
            boxRaw,
          };
          results.push(result);
        }
      }
    });
  }
  // deallocate tensors
  res.forEach((t) => tf.dispose(t));

  // normally nms is run on raw results, but since boxes need to be calculated this way we skip calulcation of
  // unnecessary boxes and run nms only on good candidates (basically it just does IOU analysis as scores are already filtered)
  const nmsBoxes = results.map((a) => a.boxRaw);
  const nmsScores = results.map((a) => a.score);
  const nms = await tf.image.nonMaxSuppressionAsync(nmsBoxes, nmsScores, config.object.maxResults, config.object.iouThreshold, config.object.minConfidence);
  const nmsIdx = nms.dataSync();
  tf.dispose(nms);

  // filter & sort results
  results = results
    .filter((a, idx) => nmsIdx.includes(idx))
    // @ts-ignore
    .sort((a, b) => (b.score - a.score));

  return results;
}

export async function predict(image, config) {
  if (!model) return null;
  // console.log(skipped, config.object.skipFrames, config.videoOptimized, ((skipped < config.object.skipFrames) && config.videoOptimized && (last.length > 0)));
  if ((skipped < config.object.skipFrames) && config.videoOptimized && (last.length > 0)) {
    skipped++;
    return last;
  }
  if (config.videoOptimized) skipped = 0;
  else skipped = Number.MAX_SAFE_INTEGER;
  return new Promise(async (resolve) => {
    const outputSize = [image.shape[2], image.shape[1]];
    const resize = tf.image.resizeBilinear(image, [model.inputSize, model.inputSize], false);
    const norm = resize.div(255);
    resize.dispose();
    const transpose = norm.transpose([0, 3, 1, 2]);
    norm.dispose();

    let objectT;
    if (!config.profile) {
      if (config.object.enabled) objectT = await model.predict(transpose);
    } else {
      const profileObject = config.object.enabled ? await tf.profile(() => model.predict(transpose)) : {};
      objectT = profileObject.result.clone();
      profileObject.result.dispose();
      profile.run('object', profileObject);
    }
    transpose.dispose();

    const obj = await process(objectT, model.inputSize, outputSize, config);
    last = obj;
    resolve(obj);
  });
}
