import { log } from '../log.js';
import * as tf from '../../dist/tfjs.esm.js';

const NUM_LANDMARKS = 6;

function generateAnchors(inputSize) {
  const spec = { strides: [inputSize / 16, inputSize / 8], anchors: [2, 6] };
  const anchors = [];
  for (let i = 0; i < spec.strides.length; i++) {
    const stride = spec.strides[i];
    const gridRows = Math.floor((inputSize + stride - 1) / stride);
    const gridCols = Math.floor((inputSize + stride - 1) / stride);
    const anchorsNum = spec.anchors[i];
    for (let gridY = 0; gridY < gridRows; gridY++) {
      const anchorY = stride * (gridY + 0.5);
      for (let gridX = 0; gridX < gridCols; gridX++) {
        const anchorX = stride * (gridX + 0.5);
        for (let n = 0; n < anchorsNum; n++) {
          anchors.push([anchorX, anchorY]);
        }
      }
    }
  }
  return anchors;
}

const disposeBox = (box) => {
  box.startEndTensor.dispose();
  box.startPoint.dispose();
  box.endPoint.dispose();
};

const createBox = (startEndTensor) => ({
  startEndTensor,
  startPoint: tf.slice(startEndTensor, [0, 0], [-1, 2]),
  endPoint: tf.slice(startEndTensor, [0, 2], [-1, 2]),
});

const scaleBox = (box, factors) => {
  const starts = tf.mul(box.startPoint, factors);
  const ends = tf.mul(box.endPoint, factors);
  const newCoordinates = tf.concat2d([starts, ends], 1);
  return createBox(newCoordinates);
};

function decodeBounds(boxOutputs, anchors, inputSize) {
  const boxStarts = tf.slice(boxOutputs, [0, 1], [-1, 2]);
  const centers = tf.add(boxStarts, anchors);
  const boxSizes = tf.slice(boxOutputs, [0, 3], [-1, 2]);
  const boxSizesNormalized = tf.div(boxSizes, inputSize);
  const centersNormalized = tf.div(centers, inputSize);
  const halfBoxSize = tf.div(boxSizesNormalized, 2);
  const starts = tf.sub(centersNormalized, halfBoxSize);
  const ends = tf.add(centersNormalized, halfBoxSize);
  const startNormalized = tf.mul(starts, inputSize);
  const endNormalized = tf.mul(ends, inputSize);
  const concatAxis = 1;
  return tf.concat2d([startNormalized, endNormalized], concatAxis);
}

function scaleBoxFromPrediction(face, scaleFactor) {
  return tf.tidy(() => {
    const box = face['box'] ? face['box'] : face;
    return scaleBox(box, scaleFactor).startEndTensor.squeeze();
  });
}

class BlazeFaceModel {
  constructor(model, config) {
    this.blazeFaceModel = model;
    this.width = config.face.detector.inputSize;
    this.height = config.face.detector.inputSize;
    this.anchorsData = generateAnchors(config.face.detector.inputSize);
    this.anchors = tf.tensor2d(this.anchorsData);
    this.inputSize = tf.tensor1d([this.width, this.height]);
    this.config = config;
    this.scaleFaces = 0.8;
  }

  async getBoundingBoxes(inputImage) {
    // sanity check on input
    if ((!inputImage) || (inputImage.isDisposedInternal) || (inputImage.shape.length !== 4) || (inputImage.shape[1] < 1) || (inputImage.shape[2] < 1)) return null;
    const [detectedOutputs, boxes, scores] = tf.tidy(() => {
      const resizedImage = inputImage.resizeBilinear([this.width, this.height]);
      // const normalizedImage = tf.mul(tf.sub(resizedImage.div(255), 0.5), 2);
      const normalizedImage = tf.sub(resizedImage.div(127.5), 1);
      const batchedPrediction = this.blazeFaceModel.predict(normalizedImage);
      let prediction;
      // are we using tfhub or pinto converted model?
      if (Array.isArray(batchedPrediction)) {
        const sorted = batchedPrediction.sort((a, b) => a.size - b.size);
        const concat384 = tf.concat([sorted[0], sorted[2]], 2); // dim: 384, 1 + 16
        const concat512 = tf.concat([sorted[1], sorted[3]], 2); // dim: 512, 1 + 16
        const concat = tf.concat([concat512, concat384], 1);
        prediction = concat.squeeze(0);
      } else {
        prediction = batchedPrediction.squeeze(); // when using tfhub model
      }
      const decodedBounds = decodeBounds(prediction, this.anchors, this.inputSize);
      const logits = tf.slice(prediction, [0, 0], [-1, 1]);
      const scoresOut = tf.sigmoid(logits).squeeze();
      return [prediction, decodedBounds, scoresOut];
    });
    const boxIndicesTensor = await tf.image.nonMaxSuppressionAsync(boxes, scores, this.config.face.detector.maxFaces, this.config.face.detector.iouThreshold, this.config.face.detector.scoreThreshold);
    const boxIndices = boxIndicesTensor.arraySync();
    boxIndicesTensor.dispose();
    const boundingBoxesMap = boxIndices.map((boxIndex) => tf.slice(boxes, [boxIndex, 0], [1, -1]));
    const boundingBoxes = boundingBoxesMap.map((boundingBox) => {
      const vals = boundingBox.arraySync();
      boundingBox.dispose();
      return vals;
    });

    const scoresVal = scores.dataSync();
    const annotatedBoxes = [];
    for (let i = 0; i < boundingBoxes.length; i++) {
      const boxIndex = boxIndices[i];
      const confidence = scoresVal[boxIndex];
      if (confidence > this.config.face.detector.minConfidence) {
        const box = createBox(boundingBoxes[i]);
        const anchor = this.anchorsData[boxIndex];
        const landmarks = tf.tidy(() => tf.slice(detectedOutputs, [boxIndex, NUM_LANDMARKS - 1], [1, -1]).squeeze().reshape([NUM_LANDMARKS, -1]));
        annotatedBoxes.push({ box, landmarks, anchor, confidence });
      }
    }
    detectedOutputs.dispose();
    boxes.dispose();
    scores.dispose();
    detectedOutputs.dispose();
    return {
      boxes: annotatedBoxes,
      scaleFactor: [inputImage.shape[2] / this.width, inputImage.shape[1] / this.height],
    };
  }

  async estimateFaces(input) {
    // @ts-ignore
    const { boxes, scaleFactor } = await this.getBoundingBoxes(input);
    const faces = [];
    for (const face of boxes) {
      const landmarkData = face.landmarks.arraySync();
      const scaledBox = scaleBoxFromPrediction(face, scaleFactor);
      // @ts-ignore
      const boxData = scaleBox.arraySync();
      const probabilityData = face.probability.arraySync();
      const anchor = face.anchor;
      const [scaleFactorX, scaleFactorY] = scaleFactor;
      const scaledLandmarks = landmarkData
        .map((landmark) => ([
          (landmark[0] + anchor[0]) * scaleFactorX,
          (landmark[1] + anchor[1]) * scaleFactorY,
        ]));
      const normalizedFace = {
        topLeft: boxData.slice(0, 2),
        bottomRight: boxData.slice(2),
        landmarks: scaledLandmarks,
        probability: probabilityData,
      };
      disposeBox(face.box);
      face.landmarks.dispose();
      face.probability.dispose();
      scaledBox.dispose();
      faces.push(normalizedFace);
    }
    return faces;
  }
}

async function load(config) {
  const blazeface = await tf.loadGraphModel(config.face.detector.modelPath, { fromTFHub: config.face.detector.modelPath.includes('tfhub.dev') });
  const model = new BlazeFaceModel(blazeface, config);
  log(`load model: ${config.face.detector.modelPath.match(/\/(.*)\./)[1]}`);
  return model;
}

exports.load = load;
exports.BlazeFaceModel = BlazeFaceModel;
exports.disposeBox = disposeBox;
