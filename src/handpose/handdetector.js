const tf = require('@tensorflow/tfjs');
const bounding = require('./box');

class HandDetector {
  constructor(model, anchors, config) {
    this.model = model;
    this.width = config.inputSize;
    this.height = config.inputSize;
    this.anchors = anchors.map((anchor) => [anchor.x_center, anchor.y_center]);
    this.anchorsTensor = tf.tensor2d(this.anchors);
    this.inputSizeTensor = tf.tensor1d([config.inputSize, config.inputSize]);
    this.doubleInputSizeTensor = tf.tensor1d([config.inputSize * 2, config.inputSize * 2]);
  }

  normalizeBoxes(boxes) {
    return tf.tidy(() => {
      const boxOffsets = tf.slice(boxes, [0, 0], [-1, 2]);
      const boxSizes = tf.slice(boxes, [0, 2], [-1, 2]);
      const boxCenterPoints = tf.add(tf.div(boxOffsets, this.inputSizeTensor), this.anchorsTensor);
      const halfBoxSizes = tf.div(boxSizes, this.doubleInputSizeTensor);
      const startPoints = tf.mul(tf.sub(boxCenterPoints, halfBoxSizes), this.inputSizeTensor);
      const endPoints = tf.mul(tf.add(boxCenterPoints, halfBoxSizes), this.inputSizeTensor);
      return tf.concat2d([startPoints, endPoints], 1);
    });
  }

  normalizeLandmarks(rawPalmLandmarks, index) {
    return tf.tidy(() => {
      const landmarks = tf.add(tf.div(rawPalmLandmarks.reshape([-1, 7, 2]), this.inputSizeTensor), this.anchors[index]);
      return tf.mul(landmarks, this.inputSizeTensor);
    });
  }

  async getBoundingBoxes(input) {
    const normalizedInput = tf.tidy(() => tf.mul(tf.sub(input, 0.5), 2));
    const batchedPrediction = this.model.predict(normalizedInput);
    const prediction = batchedPrediction.squeeze();
    // Regression score for each anchor point.
    const scores = tf.tidy(() => tf.sigmoid(tf.slice(prediction, [0, 0], [-1, 1])).squeeze());
    // Bounding box for each anchor point.
    const rawBoxes = tf.slice(prediction, [0, 1], [-1, 4]);
    const boxes = this.normalizeBoxes(rawBoxes);
    const boxesWithHandsTensor = await tf.image.nonMaxSuppressionAsync(boxes, scores, this.maxHands, this.iouThreshold, this.scoreThreshold);
    const boxesWithHands = await boxesWithHandsTensor.array();
    const toDispose = [
      normalizedInput, batchedPrediction, boxesWithHandsTensor, prediction,
      boxes, rawBoxes, scores,
    ];
    if (boxesWithHands.length === 0) {
      toDispose.forEach((tensor) => tensor.dispose());
      return null;
    }
    const detectedHands = tf.tidy(() => {
      const detectedBoxes = [];
      for (const i in boxesWithHands) {
        const boxIndex = boxesWithHands[i];
        const matchingBox = tf.slice(boxes, [boxIndex, 0], [1, -1]);
        const rawPalmLandmarks = tf.slice(prediction, [boxIndex, 5], [1, 14]);
        const palmLandmarks = tf.tidy(() => this.normalizeLandmarks(rawPalmLandmarks, boxIndex).reshape([-1, 2]));
        detectedBoxes.push({ boxes: matchingBox, palmLandmarks });
      }
      return detectedBoxes;
    });
    return detectedHands;
  }

  /**
     * Returns a Box identifying the bounding box of a hand within the image.
     * Returns null if there is no hand in the image.
     *
     * @param input The image to classify.
     */
  async estimateHandBounds(input, config) {
    const inputHeight = input.shape[1];
    const inputWidth = input.shape[2];
    this.iouThreshold = config.iouThreshold;
    this.scoreThreshold = config.scoreThreshold;
    this.maxHands = config.maxHands;
    const image = tf.tidy(() => input.resizeBilinear([this.width, this.height]).div(255));
    const predictions = await this.getBoundingBoxes(image);
    image.dispose();
    if (!predictions || (predictions.length === 0)) return null;
    const hands = [];
    for (const i in predictions) {
      const prediction = predictions[i];
      const boundingBoxes = await prediction.boxes.array();
      const startPoint = boundingBoxes[0].slice(0, 2);
      const endPoint = boundingBoxes[0].slice(2, 4);
      const palmLandmarks = await prediction.palmLandmarks.array();
      prediction.boxes.dispose();
      prediction.palmLandmarks.dispose();
      hands.push(bounding.scaleBoxCoordinates({ startPoint, endPoint, palmLandmarks }, [inputWidth / this.width, inputHeight / this.height]));
    }
    return hands;
  }
}
exports.HandDetector = HandDetector;
