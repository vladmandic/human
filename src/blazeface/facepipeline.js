/* eslint-disable class-methods-use-this */
import * as tf from '../../dist/tfjs.esm.js';
import * as bounding from './box';
import * as util from './util';
import * as coords from './coords.js';
// eslint-disable-next-line no-unused-vars
import { log } from '../log.js';

const LANDMARKS_COUNT = 468;
const MESH_MOUTH_INDEX = 13;
const MESH_KEYPOINTS_LINE_OF_SYMMETRY_INDICES = [MESH_MOUTH_INDEX, coords.MESH_ANNOTATIONS['midwayBetweenEyes'][0]];
const BLAZEFACE_MOUTH_INDEX = 3;
const BLAZEFACE_NOSE_INDEX = 2;
const BLAZEFACE_KEYPOINTS_LINE_OF_SYMMETRY_INDICES = [BLAZEFACE_MOUTH_INDEX, BLAZEFACE_NOSE_INDEX];
const LEFT_EYE_OUTLINE = coords.MESH_ANNOTATIONS['leftEyeLower0'];
const LEFT_EYE_BOUNDS = [LEFT_EYE_OUTLINE[0], LEFT_EYE_OUTLINE[LEFT_EYE_OUTLINE.length - 1]];
const RIGHT_EYE_OUTLINE = coords.MESH_ANNOTATIONS['rightEyeLower0'];
const RIGHT_EYE_BOUNDS = [RIGHT_EYE_OUTLINE[0], RIGHT_EYE_OUTLINE[RIGHT_EYE_OUTLINE.length - 1]];
const IRIS_UPPER_CENTER_INDEX = 3;
const IRIS_LOWER_CENTER_INDEX = 4;
const IRIS_IRIS_INDEX = 71;
const IRIS_NUM_COORDINATES = 76;

// Replace the raw coordinates returned by facemesh with refined iris model coordinates. Update the z coordinate to be an average of the original and the new. This produces the best visual effect.
function replaceRawCoordinates(rawCoords, newCoords, prefix, keys) {
  for (let i = 0; i < coords.MESH_TO_IRIS_INDICES_MAP.length; i++) {
    const { key, indices } = coords.MESH_TO_IRIS_INDICES_MAP[i];
    const originalIndices = coords.MESH_ANNOTATIONS[`${prefix}${key}`];
    const shouldReplaceAllKeys = keys == null;
    if (shouldReplaceAllKeys || keys.includes(key)) {
      for (let j = 0; j < indices.length; j++) {
        const index = indices[j];
        rawCoords[originalIndices[j]] = [
          newCoords[index][0], newCoords[index][1],
          (newCoords[index][2] + rawCoords[originalIndices[j]][2]) / 2,
        ];
      }
    }
  }
}
// The Pipeline coordinates between the bounding box and skeleton models.
class Pipeline {
  constructor(boundingBoxDetector, meshDetector, irisModel, config) {
    // An array of facial bounding boxes.
    this.storedBoxes = [];
    this.runsWithoutFaceDetector = 0;
    this.boundingBoxDetector = boundingBoxDetector;
    this.meshDetector = meshDetector;
    this.irisModel = irisModel;
    this.meshWidth = config.face.mesh.inputSize;
    this.meshHeight = config.face.mesh.inputSize;
    this.irisSize = config.face.iris.inputSize;
    this.irisEnlarge = 2.3;
    this.skipped = 0;
    this.detectedFaces = 0;
  }

  transformRawCoords(rawCoords, box, angle, rotationMatrix) {
    // @ts-ignore
    const boxSize = bounding.getBoxSize({ startPoint: box.startPoint, endPoint: box.endPoint });
    const scaleFactor = [boxSize[0] / this.meshWidth, boxSize[1] / this.meshHeight];
    const coordsScaled = rawCoords.map((coord) => ([
      scaleFactor[0] * (coord[0] - this.meshWidth / 2),
      scaleFactor[1] * (coord[1] - this.meshHeight / 2), coord[2],
    ]));
    const coordsRotationMatrix = (angle !== 0) ? util.buildRotationMatrix(angle, [0, 0]) : util.IDENTITY_MATRIX;
    const coordsRotated = (angle !== 0) ? coordsScaled.map((coord) => ([...util.rotatePoint(coord, coordsRotationMatrix), coord[2]])) : coordsScaled;
    const inverseRotationMatrix = (angle !== 0) ? util.invertTransformMatrix(rotationMatrix) : util.IDENTITY_MATRIX;
    // @ts-ignore
    const boxCenter = [...bounding.getBoxCenter({ startPoint: box.startPoint, endPoint: box.endPoint }), 1];
    return coordsRotated.map((coord) => ([
      coord[0] + util.dot(boxCenter, inverseRotationMatrix[0]),
      coord[1] + util.dot(boxCenter, inverseRotationMatrix[1]),
      coord[2],
    ]));
  }

  getLeftToRightEyeDepthDifference(rawCoords) {
    const leftEyeZ = rawCoords[LEFT_EYE_BOUNDS[0]][2];
    const rightEyeZ = rawCoords[RIGHT_EYE_BOUNDS[0]][2];
    return leftEyeZ - rightEyeZ;
  }

  // Returns a box describing a cropped region around the eye fit for passing to the iris model.
  getEyeBox(rawCoords, face, eyeInnerCornerIndex, eyeOuterCornerIndex, flip = false) {
    // @ts-ignore
    const box = bounding.squarifyBox(bounding.enlargeBox(this.calculateLandmarksBoundingBox([rawCoords[eyeInnerCornerIndex], rawCoords[eyeOuterCornerIndex]]), this.irisEnlarge));
    // @ts-ignore
    const boxSize = bounding.getBoxSize(box);
    let crop = tf.image.cropAndResize(face, [[
      box.startPoint[1] / this.meshHeight,
      box.startPoint[0] / this.meshWidth, box.endPoint[1] / this.meshHeight,
      box.endPoint[0] / this.meshWidth,
    ]], [0], [this.irisSize, this.irisSize]);
    if (flip) {
      crop = tf.image.flipLeftRight(crop);
    }
    return { box, boxSize, crop };
  }

  // Given a cropped image of an eye, returns the coordinates of the contours surrounding the eye and the iris.
  getEyeCoords(eyeData, eyeBox, eyeBoxSize, flip = false) {
    const eyeRawCoords = [];
    for (let i = 0; i < IRIS_NUM_COORDINATES; i++) {
      const x = eyeData[i * 3];
      const y = eyeData[i * 3 + 1];
      const z = eyeData[i * 3 + 2];
      eyeRawCoords.push([
        (flip
          ? (1 - (x / this.irisSize))
          : (x / this.irisSize)) * eyeBoxSize[0] + eyeBox.startPoint[0],
        (y / this.irisSize) * eyeBoxSize[1] + eyeBox.startPoint[1], z,
      ]);
    }
    return { rawCoords: eyeRawCoords, iris: eyeRawCoords.slice(IRIS_IRIS_INDEX) };
  }

  // The z-coordinates returned for the iris are unreliable, so we take the z values from the surrounding keypoints.
  getAdjustedIrisCoords(rawCoords, irisCoords, direction) {
    const upperCenterZ = rawCoords[coords.MESH_ANNOTATIONS[`${direction}EyeUpper0`][IRIS_UPPER_CENTER_INDEX]][2];
    const lowerCenterZ = rawCoords[coords.MESH_ANNOTATIONS[`${direction}EyeLower0`][IRIS_LOWER_CENTER_INDEX]][2];
    const averageZ = (upperCenterZ + lowerCenterZ) / 2;
    // Iris indices: 0: center | 1: right | 2: above | 3: left | 4: below
    return irisCoords.map((coord, i) => {
      let z = averageZ;
      if (i === 2) {
        z = upperCenterZ;
      } else if (i === 4) {
        z = lowerCenterZ;
      }
      return [coord[0], coord[1], z];
    });
  }

  async predict(input, config) {
    let useFreshBox = false;
    // run new detector every skipFrames unless we only want box to start with
    let detector;
    if ((this.skipped === 0) || (this.skipped > config.face.detector.skipFrames) || !config.face.mesh.enabled || !config.videoOptimized) {
      detector = await this.boundingBoxDetector.getBoundingBoxes(input);
      this.skipped = 0;
    }
    if (config.videoOptimized) this.skipped++;

    // if detector result count doesn't match current working set, use it to reset current working set
    if (detector && detector.boxes && (!config.face.mesh.enabled || (detector.boxes.length !== this.detectedFaces) && (this.detectedFaces !== config.face.detector.maxFaces))) {
      this.storedBoxes = [];
      this.detectedFaces = 0;
      for (const possible of detector.boxes) {
        this.storedBoxes.push({ startPoint: possible.box.startPoint.dataSync(), endPoint: possible.box.endPoint.dataSync(), landmarks: possible.landmarks, confidence: possible.confidence });
      }
      if (this.storedBoxes.length > 0) useFreshBox = true;
    }

    if (useFreshBox) {
      if (!detector || !detector.boxes || (detector.boxes.length === 0)) {
        this.storedBoxes = [];
        this.detectedFaces = 0;
        return null;
      }
      for (let i = 0; i < this.storedBoxes.length; i++) {
        // @ts-ignore
        const scaledBox = bounding.scaleBoxCoordinates({ startPoint: this.storedBoxes[i].startPoint, endPoint: this.storedBoxes[i].endPoint }, detector.scaleFactor);
        // @ts-ignore
        const enlargedBox = bounding.enlargeBox(scaledBox);
        // @ts-ignore
        const squarifiedBox = bounding.squarifyBox(enlargedBox);
        const landmarks = this.storedBoxes[i].landmarks.arraySync();
        const confidence = this.storedBoxes[i].confidence;
        this.storedBoxes[i] = { ...squarifiedBox, confidence, landmarks };
      }
      this.runsWithoutFaceDetector = 0;
    }
    if (detector && detector.boxes) {
      detector.boxes.forEach((prediction) => {
        prediction.box.startPoint.dispose();
        prediction.box.endPoint.dispose();
        prediction.landmarks.dispose();
      });
    }

    // log('face', `skipped: ${this.skipped} max: ${config.face.detector.maxFaces} detected: ${this.detectedFaces} stored: ${this.storedBoxes.length} new: ${detector?.boxes?.length}`);
    let results = tf.tidy(() => this.storedBoxes.map((box, i) => {
      // The facial bounding box landmarks could come either from blazeface (if we are using a fresh box), or from the mesh model (if we are reusing an old box).
      let face;
      let angle = 0;
      let rotationMatrix;
      if (config.face.detector.rotation) {
        const [indexOfMouth, indexOfForehead] = (box.landmarks.length >= LANDMARKS_COUNT) ? MESH_KEYPOINTS_LINE_OF_SYMMETRY_INDICES : BLAZEFACE_KEYPOINTS_LINE_OF_SYMMETRY_INDICES;
        angle = util.computeRotation(box.landmarks[indexOfMouth], box.landmarks[indexOfForehead]);
        // @ts-ignore
        const faceCenter = bounding.getBoxCenter({ startPoint: box.startPoint, endPoint: box.endPoint });
        const faceCenterNormalized = [faceCenter[0] / input.shape[2], faceCenter[1] / input.shape[1]];
        const rotatedImage = tf.image.rotateWithOffset(input, angle, 0, faceCenterNormalized);
        rotationMatrix = util.buildRotationMatrix(-angle, faceCenter);
        // @ts-ignore
        face = bounding.cutBoxFromImageAndResize({ startPoint: box.startPoint, endPoint: box.endPoint }, rotatedImage, [this.meshHeight, this.meshWidth]).div(255);
      } else {
        rotationMatrix = util.IDENTITY_MATRIX;
        const cloned = input.clone();
        // @ts-ignore
        face = bounding.cutBoxFromImageAndResize({ startPoint: box.startPoint, endPoint: box.endPoint }, cloned, [this.meshHeight, this.meshWidth]).div(255);
      }

      // if we're not going to produce mesh, don't spend time with further processing
      if (!config.face.mesh.enabled) {
        const prediction = {
          coords: null,
          box,
          faceConfidence: null,
          confidence: box.confidence,
          image: face,
        };
        return prediction;
      }

      const [, confidence, contourCoords] = this.meshDetector.predict(face); // The first returned tensor represents facial contours, which are included in the coordinates.
      const confidenceVal = confidence.dataSync()[0];
      if (confidenceVal < config.face.detector.minConfidence) return null; // if below confidence just exit
      const coordsReshaped = tf.reshape(contourCoords, [-1, 3]);
      let rawCoords = coordsReshaped.arraySync();

      if (config.face.iris.enabled) {
        const { box: leftEyeBox, boxSize: leftEyeBoxSize, crop: leftEyeCrop } = this.getEyeBox(rawCoords, face, LEFT_EYE_BOUNDS[0], LEFT_EYE_BOUNDS[1], true);
        const { box: rightEyeBox, boxSize: rightEyeBoxSize, crop: rightEyeCrop } = this.getEyeBox(rawCoords, face, RIGHT_EYE_BOUNDS[0], RIGHT_EYE_BOUNDS[1]);
        const eyePredictions = this.irisModel.predict(tf.concat([leftEyeCrop, rightEyeCrop]));
        const eyePredictionsData = eyePredictions.dataSync();
        const leftEyeData = eyePredictionsData.slice(0, IRIS_NUM_COORDINATES * 3);
        const { rawCoords: leftEyeRawCoords, iris: leftIrisRawCoords } = this.getEyeCoords(leftEyeData, leftEyeBox, leftEyeBoxSize, true);
        const rightEyeData = eyePredictionsData.slice(IRIS_NUM_COORDINATES * 3);
        const { rawCoords: rightEyeRawCoords, iris: rightIrisRawCoords } = this.getEyeCoords(rightEyeData, rightEyeBox, rightEyeBoxSize);
        const leftToRightEyeDepthDifference = this.getLeftToRightEyeDepthDifference(rawCoords);
        if (Math.abs(leftToRightEyeDepthDifference) < 30) { // User is looking straight ahead.
          replaceRawCoordinates(rawCoords, leftEyeRawCoords, 'left');
          replaceRawCoordinates(rawCoords, rightEyeRawCoords, 'right');
          // If the user is looking to the left or to the right, the iris coordinates tend to diverge too much from the mesh coordinates for them to be merged. So we only update a single contour line above and below the eye.
        } else if (leftToRightEyeDepthDifference < 1) { // User is looking towards the right.
          replaceRawCoordinates(rawCoords, leftEyeRawCoords, 'left', ['EyeUpper0', 'EyeLower0']);
        } else { // User is looking towards the left.
          replaceRawCoordinates(rawCoords, rightEyeRawCoords, 'right', ['EyeUpper0', 'EyeLower0']);
        }
        const adjustedLeftIrisCoords = this.getAdjustedIrisCoords(rawCoords, leftIrisRawCoords, 'left');
        const adjustedRightIrisCoords = this.getAdjustedIrisCoords(rawCoords, rightIrisRawCoords, 'right');
        rawCoords = rawCoords.concat(adjustedLeftIrisCoords).concat(adjustedRightIrisCoords);
      }

      const transformedCoordsData = this.transformRawCoords(rawCoords, box, angle, rotationMatrix);
      // @ts-ignore
      const landmarksBox = bounding.enlargeBox(this.calculateLandmarksBoundingBox(transformedCoordsData));
      // @ts-ignore
      const squarifiedLandmarksBox = bounding.squarifyBox(landmarksBox);
      const transformedCoords = tf.tensor2d(transformedCoordsData);
      const prediction = {
        coords: transformedCoords,
        box: landmarksBox,
        faceConfidence: confidenceVal,
        confidence: box.confidence,
        image: face,
      };
      if (config.face.mesh.returnRawData) prediction.rawCoords = rawCoords;
      this.storedBoxes[i] = { ...squarifiedLandmarksBox, landmarks: transformedCoords.arraySync(), confidence: box.confidence, faceConfidence: confidenceVal };

      return prediction;
    }));
    results = results.filter((a) => a !== null);
    this.detectedFaces = results.length;
    return results;
  }

  calculateLandmarksBoundingBox(landmarks) {
    const xs = landmarks.map((d) => d[0]);
    const ys = landmarks.map((d) => d[1]);
    const startPoint = [Math.min(...xs), Math.min(...ys)];
    const endPoint = [Math.max(...xs), Math.max(...ys)];
    return { startPoint, endPoint, landmarks };
  }
}
exports.Pipeline = Pipeline;
