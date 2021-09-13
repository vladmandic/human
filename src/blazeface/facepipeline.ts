import * as tf from '../../dist/tfjs.esm.js';
import * as bounding from './box';
import * as util from './util';
import * as coords from './coords';
import type { Tensor, GraphModel } from '../tfjs/types';
import type { BlazeFaceModel } from './blazeface';
import { env } from '../env';

const leftOutline = coords.MESH_ANNOTATIONS['leftEyeLower0'];
const rightOutline = coords.MESH_ANNOTATIONS['rightEyeLower0'];

const eyeLandmarks = {
  leftBounds: [leftOutline[0], leftOutline[leftOutline.length - 1]],
  rightBounds: [rightOutline[0], rightOutline[rightOutline.length - 1]],
};

const meshLandmarks = {
  count: 468,
  mouth: 13,
  symmetryLine: [13, coords.MESH_ANNOTATIONS['midwayBetweenEyes'][0]],
};

const blazeFaceLandmarks = {
  leftEye: 0,
  rightEye: 1,
  nose: 2,
  mouth: 3,
  leftEar: 4,
  rightEar: 5,
  symmetryLine: [3, 2],
};

const irisLandmarks = {
  upperCenter: 3,
  lowerCenter: 4,
  index: 71,
  numCoordinates: 76,
};

// Replace the raw coordinates returned by facemesh with refined iris model coordinates
// Update the z coordinate to be an average of the original and the new.
function replaceRawCoordinates(rawCoords, newCoords, prefix, keys) {
  for (let i = 0; i < coords.MESH_TO_IRIS_INDICES_MAP.length; i++) {
    const { key, indices } = coords.MESH_TO_IRIS_INDICES_MAP[i];
    const originalIndices = coords.MESH_ANNOTATIONS[`${prefix}${key}`];
    if (!keys || keys.includes(key)) {
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
export class Pipeline {
  storedBoxes: Array<{ startPoint: number[], endPoint: number[], landmarks: Array<number>, confidence: number, faceConfidence?: number | undefined }>;
  boundingBoxDetector: BlazeFaceModel; // tf.GraphModel
  meshDetector: GraphModel; // tf.GraphModel
  irisModel: GraphModel; // tf.GraphModel
  boxSize: number;
  meshSize: number;
  irisSize: number;
  irisEnlarge: number;
  skipped: number;
  detectedFaces: number;

  constructor(boundingBoxDetector, meshDetector, irisModel) {
    // An array of facial bounding boxes.
    this.storedBoxes = [];
    this.boundingBoxDetector = boundingBoxDetector;
    this.meshDetector = meshDetector;
    this.irisModel = irisModel;
    this.boxSize = boundingBoxDetector?.model?.inputs[0].shape[2] || 0;
    this.meshSize = meshDetector?.inputs[0].shape[2] || boundingBoxDetector?.model?.inputs[0].shape[2];
    this.irisSize = irisModel?.inputs[0].shape[1] || 0;
    this.irisEnlarge = 2.3;
    this.skipped = 0;
    this.detectedFaces = 0;
  }

  transformRawCoords(rawCoords, box, angle, rotationMatrix) {
    const boxSize = bounding.getBoxSize({ startPoint: box.startPoint, endPoint: box.endPoint });
    const coordsScaled = rawCoords.map((coord) => ([
      boxSize[0] / this.meshSize * (coord[0] - this.meshSize / 2),
      boxSize[1] / this.meshSize * (coord[1] - this.meshSize / 2),
      coord[2],
    ]));
    const coordsRotationMatrix = (angle !== 0) ? util.buildRotationMatrix(angle, [0, 0]) : util.IDENTITY_MATRIX;
    const coordsRotated = (angle !== 0) ? coordsScaled.map((coord) => ([...util.rotatePoint(coord, coordsRotationMatrix), coord[2]])) : coordsScaled;
    const inverseRotationMatrix = (angle !== 0) ? util.invertTransformMatrix(rotationMatrix) : util.IDENTITY_MATRIX;
    const boxCenter = [...bounding.getBoxCenter({ startPoint: box.startPoint, endPoint: box.endPoint }), 1];
    return coordsRotated.map((coord) => ([
      Math.round(coord[0] + util.dot(boxCenter, inverseRotationMatrix[0])),
      Math.round(coord[1] + util.dot(boxCenter, inverseRotationMatrix[1])),
      Math.round(coord[2]),
    ]));
  }

  // eslint-disable-next-line class-methods-use-this
  getLeftToRightEyeDepthDifference(rawCoords) {
    const leftEyeZ = rawCoords[eyeLandmarks.leftBounds[0]][2];
    const rightEyeZ = rawCoords[eyeLandmarks.rightBounds[0]][2];
    return leftEyeZ - rightEyeZ;
  }

  // Returns a box describing a cropped region around the eye fit for passing to the iris model.
  getEyeBox(rawCoords, face, eyeInnerCornerIndex, eyeOuterCornerIndex, flip = false) {
    const box = bounding.squarifyBox(bounding.enlargeBox(bounding.calculateLandmarksBoundingBox([rawCoords[eyeInnerCornerIndex], rawCoords[eyeOuterCornerIndex]]), this.irisEnlarge));
    const boxSize = bounding.getBoxSize(box);
    let crop = tf.image.cropAndResize(face, [[
      box.startPoint[1] / this.meshSize,
      box.startPoint[0] / this.meshSize, box.endPoint[1] / this.meshSize,
      box.endPoint[0] / this.meshSize,
    ]], [0], [this.irisSize, this.irisSize]);
    if (flip && env.kernels.includes('flipleftright')) {
      const flipped = tf.image.flipLeftRight(crop); // flipLeftRight is not defined for tfjs-node
      tf.dispose(crop);
      crop = flipped;
    }
    return { box, boxSize, crop };
  }

  // Given a cropped image of an eye, returns the coordinates of the contours surrounding the eye and the iris.
  getEyeCoords(eyeData, eyeBox, eyeBoxSize, flip = false) {
    const eyeRawCoords: Array<[number, number, number]> = [];
    for (let i = 0; i < irisLandmarks.numCoordinates; i++) {
      const x = eyeData[i * 3];
      const y = eyeData[i * 3 + 1];
      const z = eyeData[i * 3 + 2];
      eyeRawCoords.push([
        (flip ? (1 - (x / this.irisSize)) : (x / this.irisSize)) * eyeBoxSize[0] + eyeBox.startPoint[0],
        (y / this.irisSize) * eyeBoxSize[1] + eyeBox.startPoint[1], z,
      ]);
    }
    return { rawCoords: eyeRawCoords, iris: eyeRawCoords.slice(irisLandmarks.index) };
  }

  // The z-coordinates returned for the iris are unreliable, so we take the z values from the surrounding keypoints.
  // eslint-disable-next-line class-methods-use-this
  getAdjustedIrisCoords(rawCoords, irisCoords, direction) {
    const upperCenterZ = rawCoords[coords.MESH_ANNOTATIONS[`${direction}EyeUpper0`][irisLandmarks.upperCenter]][2];
    const lowerCenterZ = rawCoords[coords.MESH_ANNOTATIONS[`${direction}EyeLower0`][irisLandmarks.lowerCenter]][2];
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

  correctFaceRotation(config, box, input) {
    const [indexOfMouth, indexOfForehead] = (box.landmarks.length >= meshLandmarks.count) ? meshLandmarks.symmetryLine : blazeFaceLandmarks.symmetryLine;
    const angle: number = util.computeRotation(box.landmarks[indexOfMouth], box.landmarks[indexOfForehead]);
    const faceCenter: [number, number] = bounding.getBoxCenter({ startPoint: box.startPoint, endPoint: box.endPoint });
    const faceCenterNormalized: [number, number] = [faceCenter[0] / input.shape[2], faceCenter[1] / input.shape[1]];
    const rotated = tf.image.rotateWithOffset(input, angle, 0, faceCenterNormalized); // rotateWithOffset is not defined for tfjs-node
    const rotationMatrix = util.buildRotationMatrix(-angle, faceCenter);
    const cut = config.face.mesh.enabled
      ? bounding.cutBoxFromImageAndResize({ startPoint: box.startPoint, endPoint: box.endPoint }, rotated, [this.meshSize, this.meshSize])
      : bounding.cutBoxFromImageAndResize({ startPoint: box.startPoint, endPoint: box.endPoint }, rotated, [this.boxSize, this.boxSize]);
    const face = tf.div(cut, 255);
    tf.dispose(cut);
    tf.dispose(rotated);
    return [angle, rotationMatrix, face];
  }

  async augmentIris(rawCoords, face) {
    const { box: leftEyeBox, boxSize: leftEyeBoxSize, crop: leftEyeCrop } = this.getEyeBox(rawCoords, face, eyeLandmarks.leftBounds[0], eyeLandmarks.leftBounds[1], true);
    const { box: rightEyeBox, boxSize: rightEyeBoxSize, crop: rightEyeCrop } = this.getEyeBox(rawCoords, face, eyeLandmarks.rightBounds[0], eyeLandmarks.rightBounds[1]);
    const combined = tf.concat([leftEyeCrop, rightEyeCrop]);
    tf.dispose(leftEyeCrop);
    tf.dispose(rightEyeCrop);
    const eyePredictions = this.irisModel.predict(combined) as Tensor;
    tf.dispose(combined);
    const eyePredictionsData = await eyePredictions.data(); // inside tf.tidy
    tf.dispose(eyePredictions);
    const leftEyeData = eyePredictionsData.slice(0, irisLandmarks.numCoordinates * 3);
    const { rawCoords: leftEyeRawCoords, iris: leftIrisRawCoords } = this.getEyeCoords(leftEyeData, leftEyeBox, leftEyeBoxSize, true);
    const rightEyeData = eyePredictionsData.slice(irisLandmarks.numCoordinates * 3);
    const { rawCoords: rightEyeRawCoords, iris: rightIrisRawCoords } = this.getEyeCoords(rightEyeData, rightEyeBox, rightEyeBoxSize);
    const leftToRightEyeDepthDifference = this.getLeftToRightEyeDepthDifference(rawCoords);
    if (Math.abs(leftToRightEyeDepthDifference) < 30) { // User is looking straight ahead.
      replaceRawCoordinates(rawCoords, leftEyeRawCoords, 'left', null);
      replaceRawCoordinates(rawCoords, rightEyeRawCoords, 'right', null);
      // If the user is looking to the left or to the right, the iris coordinates tend to diverge too much from the mesh coordinates for them to be merged
      // So we only update a single contour line above and below the eye.
    } else if (leftToRightEyeDepthDifference < 1) { // User is looking towards the right.
      replaceRawCoordinates(rawCoords, leftEyeRawCoords, 'left', ['EyeUpper0', 'EyeLower0']);
    } else { // User is looking towards the left.
      replaceRawCoordinates(rawCoords, rightEyeRawCoords, 'right', ['EyeUpper0', 'EyeLower0']);
    }
    const adjustedLeftIrisCoords = this.getAdjustedIrisCoords(rawCoords, leftIrisRawCoords, 'left');
    const adjustedRightIrisCoords = this.getAdjustedIrisCoords(rawCoords, rightIrisRawCoords, 'right');
    const newCoords = rawCoords.concat(adjustedLeftIrisCoords).concat(adjustedRightIrisCoords);
    return newCoords;
  }

  async predict(input, config) {
    let useFreshBox = false;
    // run new detector every skipFrames unless we only want box to start with
    let detector;
    if ((this.skipped === 0) || (this.skipped > config.face.detector.skipFrames) || !config.face.mesh.enabled || !config.skipFrame) {
      detector = await this.boundingBoxDetector.getBoundingBoxes(input, config);
      this.skipped = 0;
    }
    if (config.skipFrame) this.skipped++;

    // if detector result count doesn't match current working set, use it to reset current working set
    if (!config.skipFrame || (detector && detector.boxes && (!config.face.mesh.enabled || (detector.boxes.length !== this.detectedFaces) && (this.detectedFaces !== config.face.detector.maxDetected)))) {
      this.storedBoxes = [];
      this.detectedFaces = 0;
      for (const possible of detector.boxes) {
        const startPoint = await possible.box.startPoint.data();
        const endPoint = await possible.box.endPoint.data();
        const landmarks = await possible.landmarks.array();
        this.storedBoxes.push({ startPoint, endPoint, landmarks, confidence: possible.confidence });
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
        const scaledBox = bounding.scaleBoxCoordinates({ startPoint: this.storedBoxes[i].startPoint, endPoint: this.storedBoxes[i].endPoint }, detector.scaleFactor);
        const enlargedBox = bounding.enlargeBox(scaledBox);
        const squarifiedBox = bounding.squarifyBox(enlargedBox);
        const landmarks = this.storedBoxes[i].landmarks;
        const confidence = this.storedBoxes[i].confidence;
        this.storedBoxes[i] = { ...squarifiedBox, confidence, landmarks };
      }
    }
    if (detector && detector.boxes) {
      detector.boxes.forEach((prediction) => {
        tf.dispose(prediction.box.startPoint);
        tf.dispose(prediction.box.endPoint);
        tf.dispose(prediction.landmarks);
      });
    }

    const results: Array<{ mesh, box, faceConfidence, boxConfidence, confidence, image }> = [];
    // for (let i = 0; i < this.storedBoxes.length; i++) {
    const newBoxes: Array<{ startPoint: number[]; endPoint: number[]; landmarks: number[]; confidence: number; faceConfidence?: number | undefined; }> = [];
    for (let box of this.storedBoxes) {
      // let box = this.storedBoxes[i]; // The facial bounding box landmarks could come either from blazeface (if we are using a fresh box), or from the mesh model (if we are reusing an old box).
      let face;
      let angle = 0;
      let rotationMatrix;

      if (config.face.detector.rotation && config.face.mesh.enabled && env.kernels.includes('rotatewithoffset')) {
        [angle, rotationMatrix, face] = this.correctFaceRotation(config, box, input);
      } else {
        rotationMatrix = util.IDENTITY_MATRIX;
        const cloned = input.clone();
        const cut = config.face.mesh.enabled
          ? bounding.cutBoxFromImageAndResize({ startPoint: box.startPoint, endPoint: box.endPoint }, cloned, [this.meshSize, this.meshSize])
          : bounding.cutBoxFromImageAndResize({ startPoint: box.startPoint, endPoint: box.endPoint }, cloned, [this.boxSize, this.boxSize]);
        face = tf.div(cut, 255);
        tf.dispose(cut);
        tf.dispose(cloned);
      }
      // if we're not going to produce mesh, don't spend time with further processing
      if (!config.face.mesh.enabled) {
        results.push({
          mesh: [],
          box,
          faceConfidence: null,
          boxConfidence: box.confidence,
          confidence: box.confidence,
          image: face,
        });
      } else {
        const [contours, confidence, contourCoords] = this.meshDetector.execute(face) as Array<Tensor>; // The first returned tensor represents facial contours which are already included in the coordinates.
        tf.dispose(contours);
        const faceConfidence = (await confidence.data())[0] as number; // inside tf.tidy
        tf.dispose(confidence);
        const coordsReshaped = tf.reshape(contourCoords, [-1, 3]);
        let rawCoords = await coordsReshaped.array();
        tf.dispose(contourCoords);
        tf.dispose(coordsReshaped);
        if (faceConfidence < config.face.detector.minConfidence) {
          // if (!this.storedBoxes[i]) console.log('2', i, this.storedBoxes.length, this.storedBoxes[i], box, this.storedBoxes);
          // this.storedBoxes[i].confidence = faceConfidence; // reset confidence of cached box
          box.confidence = faceConfidence; // reset confidence of cached box
          tf.dispose(face);
        } else {
          if (config.face.iris.enabled) rawCoords = await this.augmentIris(rawCoords, face);

          // override box from detection with one calculated from mesh
          const mesh = this.transformRawCoords(rawCoords, box, angle, rotationMatrix);
          box = { ...bounding.enlargeBox(bounding.calculateLandmarksBoundingBox(mesh), 1.5), confidence: box.confidence }; // redefine box with mesh calculated one

          // do rotation one more time with mesh keypoints if we want to return perfect image
          if (config.face.detector.rotation && config.face.mesh.enabled && config.face.description.enabled && env.kernels.includes('rotatewithoffset')) {
            tf.dispose(face); // we'll overwrite original face
            [angle, rotationMatrix, face] = this.correctFaceRotation(config, box, input);
          }
          results.push({
            mesh,
            box,
            faceConfidence,
            boxConfidence: box.confidence,
            confidence: faceConfidence,
            image: face,
          });

          // updated stored cache values
          // this.storedBoxes[i] = { ...bounding.squarifyBox(box), confidence: box.confidence, faceConfidence };
          box = { ...bounding.squarifyBox(box), confidence: box.confidence, faceConfidence };
        }
      }
      newBoxes.push(box);
    }

    // results = results.filter((a) => a !== null);
    // remove cache entries for detected boxes on low confidence
    if (config.face.mesh.enabled) this.storedBoxes = newBoxes.filter((a) => a.confidence > config.face.detector.minConfidence);
    this.detectedFaces = results.length;

    return results;
  }
}
