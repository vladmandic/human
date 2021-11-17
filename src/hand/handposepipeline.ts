/**
 * HandPose model implementation
 * See `handpose.ts` for entry point
 */

import * as tf from '../../dist/tfjs.esm.js';
import * as util from './handposeutil';
import type * as detector from './handposedetector';
import { constants } from '../tfjs/constants';
import type { Tensor, GraphModel } from '../tfjs/types';
import { env } from '../util/env';
import { now } from '../util/util';
import type { Point } from '../result';

const palmBoxEnlargeFactor = 5; // default 3
const handBoxEnlargeFactor = 1.65; // default 1.65
const palmLandmarkIds = [0, 5, 9, 13, 17, 1, 2];
const palmLandmarksPalmBase = 0;
const palmLandmarksMiddleFingerBase = 2;
let lastTime = 0;

export class HandPipeline {
  handDetector: detector.HandDetector;
  handPoseModel: GraphModel;
  inputSize: number;
  storedBoxes: Array<{ startPoint: Point; endPoint: Point; palmLandmarks: Point[]; confidence: number } | null>;
  skipped: number;
  detectedHands: number;

  constructor(handDetector, handPoseModel) {
    this.handDetector = handDetector;
    this.handPoseModel = handPoseModel;
    this.inputSize = this.handPoseModel && this.handPoseModel.inputs[0].shape ? this.handPoseModel.inputs[0].shape[2] : 0;
    this.storedBoxes = [];
    this.skipped = Number.MAX_SAFE_INTEGER;
    this.detectedHands = 0;
  }

  // eslint-disable-next-line class-methods-use-this
  calculateLandmarksBoundingBox(landmarks) {
    const xs = landmarks.map((d) => d[0]);
    const ys = landmarks.map((d) => d[1]);
    const startPoint = [Math.min(...xs), Math.min(...ys)];
    const endPoint = [Math.max(...xs), Math.max(...ys)];
    return { startPoint, endPoint };
  }

  getBoxForPalmLandmarks(palmLandmarks, rotationMatrix) {
    const rotatedPalmLandmarks = palmLandmarks.map((coord) => util.rotatePoint([...coord, 1], rotationMatrix));
    const boxAroundPalm = this.calculateLandmarksBoundingBox(rotatedPalmLandmarks);
    return util.enlargeBox(util.squarifyBox(boxAroundPalm), palmBoxEnlargeFactor);
  }

  getBoxForHandLandmarks(landmarks) {
    const boundingBox = this.calculateLandmarksBoundingBox(landmarks);
    const boxAroundHand = util.enlargeBox(util.squarifyBox(boundingBox), handBoxEnlargeFactor);
    boxAroundHand.palmLandmarks = [];
    for (let i = 0; i < palmLandmarkIds.length; i++) {
      boxAroundHand.palmLandmarks.push(landmarks[palmLandmarkIds[i]].slice(0, 2));
    }
    return boxAroundHand;
  }

  transformRawCoords(rawCoords, box2, angle, rotationMatrix) {
    const boxSize = util.getBoxSize(box2);
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
    const boxCenter = [...util.getBoxCenter(box2), 1];
    const originalBoxCenter = [
      util.dot(boxCenter, inverseRotationMatrix[0]),
      util.dot(boxCenter, inverseRotationMatrix[1]),
    ];
    return coordsRotated.map((coord) => [
      Math.trunc(coord[0] + originalBoxCenter[0]),
      Math.trunc(coord[1] + originalBoxCenter[1]),
      Math.trunc(coord[2]),
    ]);
  }

  async estimateHands(image, config) {
    let useFreshBox = false;

    // run new detector every skipFrames
    let boxes;
    const skipTime = (config.hand.skipTime || 0) > (now() - lastTime);
    const skipFrame = this.skipped < (config.hand.skipFrames || 0);
    if (config.skipAllowed && skipTime && skipFrame) {
      boxes = await this.handDetector.predict(image, config);
      this.skipped = 0;
    }
    if (config.skipAllowed) this.skipped++;

    // if detector result count doesn't match current working set, use it to reset current working set
    if (boxes && (boxes.length > 0) && ((boxes.length !== this.detectedHands) && (this.detectedHands !== config.hand.maxDetected) || !config.hand.landmarks)) {
      this.detectedHands = 0;
      this.storedBoxes = [...boxes];
      // for (const possible of boxes) this.storedBoxes.push(possible);
      if (this.storedBoxes.length > 0) useFreshBox = true;
    }
    const hands: Array<{ landmarks: Point[], confidence: number, boxConfidence: number, fingerConfidence: number, box: { topLeft: Point, bottomRight: Point } }> = [];

    // go through working set of boxes
    for (let i = 0; i < this.storedBoxes.length; i++) {
      const currentBox = this.storedBoxes[i];
      if (!currentBox) continue;
      if (config.hand.landmarks) {
        const angle = config.hand.rotation ? util.computeRotation(currentBox.palmLandmarks[palmLandmarksPalmBase], currentBox.palmLandmarks[palmLandmarksMiddleFingerBase]) : 0;
        const palmCenter = util.getBoxCenter(currentBox);
        const palmCenterNormalized = [palmCenter[0] / image.shape[2], palmCenter[1] / image.shape[1]];
        const rotatedImage = config.hand.rotation && env.kernels.includes('rotatewithoffset') ? tf.image.rotateWithOffset(image, angle, 0, palmCenterNormalized) : image.clone();
        const rotationMatrix = util.buildRotationMatrix(-angle, palmCenter);
        const newBox = useFreshBox ? this.getBoxForPalmLandmarks(currentBox.palmLandmarks, rotationMatrix) : currentBox;
        const croppedInput = util.cutBoxFromImageAndResize(newBox, rotatedImage, [this.inputSize, this.inputSize]);
        const handImage = tf.div(croppedInput, constants.tf255);
        tf.dispose(croppedInput);
        tf.dispose(rotatedImage);
        const [confidenceT, keypoints] = this.handPoseModel.execute(handImage) as Array<Tensor>;
        lastTime = now();
        tf.dispose(handImage);
        const confidence = (await confidenceT.data())[0];
        tf.dispose(confidenceT);
        if (confidence >= config.hand.minConfidence / 4) {
          const keypointsReshaped = tf.reshape(keypoints, [-1, 3]);
          const rawCoords = await keypointsReshaped.array();
          tf.dispose(keypoints);
          tf.dispose(keypointsReshaped);
          const coords = this.transformRawCoords(rawCoords, newBox, angle, rotationMatrix);
          const nextBoundingBox = this.getBoxForHandLandmarks(coords);
          this.storedBoxes[i] = { ...nextBoundingBox, confidence };
          const result = {
            landmarks: coords,
            confidence,
            boxConfidence: currentBox.confidence,
            fingerConfidence: confidence,
            box: { topLeft: nextBoundingBox.startPoint, bottomRight: nextBoundingBox.endPoint },
          };
          hands.push(result);
        } else {
          this.storedBoxes[i] = null;
        }
        tf.dispose(keypoints);
      } else {
        // const enlarged = box.enlargeBox(box.squarifyBox(box.shiftBox(currentBox, HAND_BOX_SHIFT_VECTOR)), handBoxEnlargeFactor);
        const enlarged = util.enlargeBox(util.squarifyBox(currentBox), handBoxEnlargeFactor);
        const result = {
          confidence: currentBox.confidence,
          boxConfidence: currentBox.confidence,
          fingerConfidence: 0,
          box: { topLeft: enlarged.startPoint, bottomRight: enlarged.endPoint },
          landmarks: [],
        };
        hands.push(result);
      }
    }
    this.storedBoxes = this.storedBoxes.filter((a) => a !== null);
    this.detectedHands = hands.length;
    if (hands.length > config.hand.maxDetected) hands.length = config.hand.maxDetected;
    return hands;
  }
}
