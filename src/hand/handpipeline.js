import * as tf from '../../dist/tfjs.esm.js';
import * as box from './box';
import * as util from './util';
// eslint-disable-next-line no-unused-vars
import { log } from '../log.js';

// const PALM_BOX_SHIFT_VECTOR = [0, -0.4];
const PALM_BOX_ENLARGE_FACTOR = 5; // default 3
// const HAND_BOX_SHIFT_VECTOR = [0, -0.1]; // move detected hand box by x,y to ease landmark detection
const HAND_BOX_ENLARGE_FACTOR = 1.65; // default 1.65
const PALM_LANDMARK_IDS = [0, 5, 9, 13, 17, 1, 2];
const PALM_LANDMARKS_INDEX_OF_PALM_BASE = 0;
const PALM_LANDMARKS_INDEX_OF_MIDDLE_FINGER_BASE = 2;

class HandPipeline {
  constructor(handDetector, landmarkDetector, inputSize) {
    this.handDetector = handDetector;
    this.landmarkDetector = landmarkDetector;
    this.inputSize = inputSize;
    this.storedBoxes = [];
    this.skipped = 0;
    this.detectedHands = 0;
  }

  getBoxForPalmLandmarks(palmLandmarks, rotationMatrix) {
    const rotatedPalmLandmarks = palmLandmarks.map((coord) => util.rotatePoint([...coord, 1], rotationMatrix));
    const boxAroundPalm = this.calculateLandmarksBoundingBox(rotatedPalmLandmarks);
    // return box.enlargeBox(box.squarifyBox(box.shiftBox(boxAroundPalm, PALM_BOX_SHIFT_VECTOR)), PALM_BOX_ENLARGE_FACTOR);
    return box.enlargeBox(box.squarifyBox(boxAroundPalm), PALM_BOX_ENLARGE_FACTOR);
  }

  getBoxForHandLandmarks(landmarks) {
    const boundingBox = this.calculateLandmarksBoundingBox(landmarks);
    // const boxAroundHand = box.enlargeBox(box.squarifyBox(box.shiftBox(boundingBox, HAND_BOX_SHIFT_VECTOR)), HAND_BOX_ENLARGE_FACTOR);
    const boxAroundHand = box.enlargeBox(box.squarifyBox(boundingBox), HAND_BOX_ENLARGE_FACTOR);
    boxAroundHand.palmLandmarks = [];
    for (let i = 0; i < PALM_LANDMARK_IDS.length; i++) {
      boxAroundHand.palmLandmarks.push(landmarks[PALM_LANDMARK_IDS[i]].slice(0, 2));
    }
    return boxAroundHand;
  }

  transformRawCoords(rawCoords, box2, angle, rotationMatrix) {
    const boxSize = box.getBoxSize(box2);
    const scaleFactor = [boxSize[0] / this.inputSize, boxSize[1] / this.inputSize, (boxSize[0] + boxSize[1]) / this.inputSize / 2];
    const coordsScaled = rawCoords.map((coord) => [
      scaleFactor[0] * (coord[0] - this.inputSize / 2),
      scaleFactor[1] * (coord[1] - this.inputSize / 2),
      scaleFactor[2] * coord[2],
    ]);
    const coordsRotationMatrix = util.buildRotationMatrix(angle, [0, 0]);
    const coordsRotated = coordsScaled.map((coord) => {
      const rotated = util.rotatePoint(coord, coordsRotationMatrix);
      return [...rotated, coord[2]];
    });
    const inverseRotationMatrix = util.invertTransformMatrix(rotationMatrix);
    const boxCenter = [...box.getBoxCenter(box2), 1];
    const originalBoxCenter = [
      util.dot(boxCenter, inverseRotationMatrix[0]),
      util.dot(boxCenter, inverseRotationMatrix[1]),
    ];
    return coordsRotated.map((coord) => [
      coord[0] + originalBoxCenter[0],
      coord[1] + originalBoxCenter[1],
      coord[2],
    ]);
  }

  async estimateHands(image, config) {
    let useFreshBox = false;

    // run new detector every skipFrames unless we only want box to start with
    let boxes;
    if ((this.skipped === 0) || (this.skipped > config.hand.skipFrames) || !config.hand.landmarks || !config.videoOptimized) {
      boxes = await this.handDetector.estimateHandBounds(image, config);
      this.skipped = 0;
    }
    if (config.videoOptimized) this.skipped++;

    // if detector result count doesn't match current working set, use it to reset current working set
    if (boxes && (boxes.length > 0) && ((boxes.length !== this.detectedHands) && (this.detectedHands !== config.hand.maxHands) || !config.hand.landmarks)) {
      this.detectedHands = 0;
      this.storedBoxes = [...boxes];
      // for (const possible of boxes) this.storedBoxes.push(possible);
      if (this.storedBoxes.length > 0) useFreshBox = true;
    }
    const hands = [];
    // log('hand', `skipped: ${this.skipped} max: ${config.hand.maxHands} detected: ${this.detectedHands} stored: ${this.storedBoxes.length} new: ${boxes?.length}`);

    // go through working set of boxes
    for (let i = 0; i < this.storedBoxes.length; i++) {
      const currentBox = this.storedBoxes[i];
      if (!currentBox) continue;
      if (config.hand.landmarks) {
        const angle = config.hand.rotation ? util.computeRotation(currentBox.palmLandmarks[PALM_LANDMARKS_INDEX_OF_PALM_BASE], currentBox.palmLandmarks[PALM_LANDMARKS_INDEX_OF_MIDDLE_FINGER_BASE]) : 0;
        const palmCenter = box.getBoxCenter(currentBox);
        const palmCenterNormalized = [palmCenter[0] / image.shape[2], palmCenter[1] / image.shape[1]];
        const rotatedImage = config.hand.rotation ? tf.image.rotateWithOffset(image, angle, 0, palmCenterNormalized) : image.clone();
        const rotationMatrix = util.buildRotationMatrix(-angle, palmCenter);
        const newBox = useFreshBox ? this.getBoxForPalmLandmarks(currentBox.palmLandmarks, rotationMatrix) : currentBox;
        const croppedInput = box.cutBoxFromImageAndResize(newBox, rotatedImage, [this.inputSize, this.inputSize]);
        const handImage = croppedInput.div(255);
        croppedInput.dispose();
        rotatedImage.dispose();
        const [confidenceT, keypoints] = await this.landmarkDetector.predict(handImage);
        handImage.dispose();
        const confidence = confidenceT.dataSync()[0];
        confidenceT.dispose();
        if (confidence >= config.hand.minConfidence) {
          const keypointsReshaped = tf.reshape(keypoints, [-1, 3]);
          const rawCoords = keypointsReshaped.arraySync();
          keypoints.dispose();
          keypointsReshaped.dispose();
          const coords = this.transformRawCoords(rawCoords, newBox, angle, rotationMatrix);
          const nextBoundingBox = this.getBoxForHandLandmarks(coords);
          this.storedBoxes[i] = nextBoundingBox;
          const result = {
            landmarks: coords,
            confidence,
            box: {
              topLeft: nextBoundingBox.startPoint,
              bottomRight: nextBoundingBox.endPoint,
            },
          };
          hands.push(result);
        } else {
          this.storedBoxes[i] = null;
        }
        keypoints.dispose();
      } else {
        // const enlarged = box.enlargeBox(box.squarifyBox(box.shiftBox(currentBox, HAND_BOX_SHIFT_VECTOR)), HAND_BOX_ENLARGE_FACTOR);
        const enlarged = box.enlargeBox(box.squarifyBox(currentBox), HAND_BOX_ENLARGE_FACTOR);
        const result = {
          confidence: currentBox.confidence,
          box: {
            topLeft: enlarged.startPoint,
            bottomRight: enlarged.endPoint,
          },
        };
        hands.push(result);
      }
    }
    this.storedBoxes = this.storedBoxes.filter((a) => a !== null);
    this.detectedHands = hands.length;
    return hands;
  }

  // eslint-disable-next-line class-methods-use-this
  calculateLandmarksBoundingBox(landmarks) {
    const xs = landmarks.map((d) => d[0]);
    const ys = landmarks.map((d) => d[1]);
    const startPoint = [Math.min(...xs), Math.min(...ys)];
    const endPoint = [Math.max(...xs), Math.max(...ys)];
    return { startPoint, endPoint };
  }
}

exports.HandPipeline = HandPipeline;
