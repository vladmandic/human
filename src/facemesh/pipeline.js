/* eslint-disable class-methods-use-this */
const tf = require('@tensorflow/tfjs');
const bounding = require('./box');
const keypoints = require('./keypoints');
const util = require('./util');

const LANDMARKS_COUNT = 468;
const UPDATE_REGION_OF_INTEREST_IOU_THRESHOLD = 0.25;
const MESH_MOUTH_INDEX = 13;
const MESH_KEYPOINTS_LINE_OF_SYMMETRY_INDICES = [MESH_MOUTH_INDEX, keypoints.MESH_ANNOTATIONS['midwayBetweenEyes'][0]];
const BLAZEFACE_MOUTH_INDEX = 3;
const BLAZEFACE_NOSE_INDEX = 2;
const BLAZEFACE_KEYPOINTS_LINE_OF_SYMMETRY_INDICES = [BLAZEFACE_MOUTH_INDEX, BLAZEFACE_NOSE_INDEX];
const LEFT_EYE_OUTLINE = keypoints.MESH_ANNOTATIONS['leftEyeLower0'];
const LEFT_EYE_BOUNDS = [LEFT_EYE_OUTLINE[0], LEFT_EYE_OUTLINE[LEFT_EYE_OUTLINE.length - 1]];
const RIGHT_EYE_OUTLINE = keypoints.MESH_ANNOTATIONS['rightEyeLower0'];
const RIGHT_EYE_BOUNDS = [RIGHT_EYE_OUTLINE[0], RIGHT_EYE_OUTLINE[RIGHT_EYE_OUTLINE.length - 1]];
const IRIS_UPPER_CENTER_INDEX = 3;
const IRIS_LOWER_CENTER_INDEX = 4;
const IRIS_IRIS_INDEX = 71;
const IRIS_NUM_COORDINATES = 76;
const ENLARGE_EYE_RATIO = 2.3; // Factor by which to enlarge the box around the eye landmarks so the input region matches the expectations of the iris model.
const IRIS_MODEL_INPUT_SIZE = 64;
const MESH_TO_IRIS_INDICES_MAP = [ // A mapping from facemesh model keypoints to iris model keypoints.
  { key: 'EyeUpper0', indices: [9, 10, 11, 12, 13, 14, 15] },
  { key: 'EyeUpper1', indices: [25, 26, 27, 28, 29, 30, 31] },
  { key: 'EyeUpper2', indices: [41, 42, 43, 44, 45, 46, 47] },
  { key: 'EyeLower0', indices: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
  { key: 'EyeLower1', indices: [16, 17, 18, 19, 20, 21, 22, 23, 24] },
  { key: 'EyeLower2', indices: [32, 33, 34, 35, 36, 37, 38, 39, 40] },
  { key: 'EyeLower3', indices: [54, 55, 56, 57, 58, 59, 60, 61, 62] },
  { key: 'EyebrowUpper', indices: [63, 64, 65, 66, 67, 68, 69, 70] },
  { key: 'EyebrowLower', indices: [48, 49, 50, 51, 52, 53] },
];
// Replace the raw coordinates returned by facemesh with refined iris model coordinates. Update the z coordinate to be an average of the original and the new. This produces the best visual effect.
function replaceRawCoordinates(rawCoords, newCoords, prefix, keys) {
  for (let i = 0; i < MESH_TO_IRIS_INDICES_MAP.length; i++) {
    const { key, indices } = MESH_TO_IRIS_INDICES_MAP[i];
    const originalIndices = keypoints.MESH_ANNOTATIONS[`${prefix}${key}`];
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
    this.regionsOfInterest = [];
    this.runsWithoutFaceDetector = 0;
    this.boundingBoxDetector = boundingBoxDetector;
    this.meshDetector = meshDetector;
    this.irisModel = irisModel;
    this.meshWidth = config.mesh.inputSize;
    this.meshHeight = config.mesh.inputSize;
    this.skipFrames = config.detector.skipFrames;
    this.maxFaces = config.detector.maxFaces;
  }

  transformRawCoords(rawCoords, box, angle, rotationMatrix) {
    const boxSize = bounding.getBoxSize({ startPoint: box.startPoint, endPoint: box.endPoint });
    const scaleFactor = [boxSize[0] / this.meshWidth, boxSize[1] / this.meshHeight];
    const coordsScaled = rawCoords.map((coord) => ([
      scaleFactor[0] * (coord[0] - this.meshWidth / 2),
      scaleFactor[1] * (coord[1] - this.meshHeight / 2), coord[2],
    ]));
    const coordsRotationMatrix = util.buildRotationMatrix(angle, [0, 0]);
    const coordsRotated = coordsScaled.map((coord) => ([...util.rotatePoint(coord, coordsRotationMatrix), coord[2]]));
    const inverseRotationMatrix = util.invertTransformMatrix(rotationMatrix);
    const boxCenter = [...bounding.getBoxCenter({ startPoint: box.startPoint, endPoint: box.endPoint }), 1];
    const originalBoxCenter = [
      util.dot(boxCenter, inverseRotationMatrix[0]),
      util.dot(boxCenter, inverseRotationMatrix[1]),
    ];
    return coordsRotated.map((coord) => ([
      coord[0] + originalBoxCenter[0],
      coord[1] + originalBoxCenter[1], coord[2],
    ]));
  }

  getLeftToRightEyeDepthDifference(rawCoords) {
    const leftEyeZ = rawCoords[LEFT_EYE_BOUNDS[0]][2];
    const rightEyeZ = rawCoords[RIGHT_EYE_BOUNDS[0]][2];
    return leftEyeZ - rightEyeZ;
  }

  // Returns a box describing a cropped region around the eye fit for passing to the iris model.
  getEyeBox(rawCoords, face, eyeInnerCornerIndex, eyeOuterCornerIndex, flip = false) {
    const box = bounding.squarifyBox(bounding.enlargeBox(this.calculateLandmarksBoundingBox([rawCoords[eyeInnerCornerIndex], rawCoords[eyeOuterCornerIndex]]), ENLARGE_EYE_RATIO));
    const boxSize = bounding.getBoxSize(box);
    let crop = tf.image.cropAndResize(face, [[
      box.startPoint[1] / this.meshHeight,
      box.startPoint[0] / this.meshWidth, box.endPoint[1] / this.meshHeight,
      box.endPoint[0] / this.meshWidth,
    ]], [0], [IRIS_MODEL_INPUT_SIZE, IRIS_MODEL_INPUT_SIZE]);
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
          ? (1 - (x / IRIS_MODEL_INPUT_SIZE))
          : (x / IRIS_MODEL_INPUT_SIZE)) * eyeBoxSize[0] + eyeBox.startPoint[0],
        (y / IRIS_MODEL_INPUT_SIZE) * eyeBoxSize[1] + eyeBox.startPoint[1], z,
      ]);
    }
    return { rawCoords: eyeRawCoords, iris: eyeRawCoords.slice(IRIS_IRIS_INDEX) };
  }

  // The z-coordinates returned for the iris are unreliable, so we take the z values from the surrounding keypoints.
  getAdjustedIrisCoords(rawCoords, irisCoords, direction) {
    const upperCenterZ = rawCoords[keypoints.MESH_ANNOTATIONS[`${direction}EyeUpper0`][IRIS_UPPER_CENTER_INDEX]][2];
    const lowerCenterZ = rawCoords[keypoints.MESH_ANNOTATIONS[`${direction}EyeLower0`][IRIS_LOWER_CENTER_INDEX]][2];
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

  async predict(input, predictIrises, predictMesh) {
    if (this.shouldUpdateRegionsOfInterest()) {
      const returnTensors = false;
      const annotateFace = true;
      const { boxes, scaleFactor } = await this.boundingBoxDetector.getBoundingBoxes(input, returnTensors, annotateFace);
      if (boxes.length === 0) {
        this.regionsOfInterest = [];
        return null;
      }
      const scaledBoxes = boxes.map((prediction) => {
        const predictionBoxCPU = {
          startPoint: prediction.box.startPoint.squeeze().arraySync(),
          endPoint: prediction.box.endPoint.squeeze().arraySync(),
        };
        const scaledBox = bounding.scaleBoxCoordinates(predictionBoxCPU, scaleFactor);
        const enlargedBox = bounding.enlargeBox(scaledBox);
        return {
          ...enlargedBox,
          landmarks: prediction.landmarks.arraySync(),
        };
      });
      boxes.forEach((box) => {
        if (box != null && box.startPoint != null) {
          box.startEndTensor.dispose();
          box.startPoint.dispose();
          box.endPoint.dispose();
        }
      });
      this.updateRegionsOfInterest(scaledBoxes);
      this.runsWithoutFaceDetector = 0;
    } else {
      this.runsWithoutFaceDetector++;
    }
    return tf.tidy(() => this.regionsOfInterest.map((box, i) => {
      let angle = 0;
      // The facial bounding box landmarks could come either from blazeface (if we are using a fresh box), or from the mesh model (if we are reusing an old box).
      const boxLandmarksFromMeshModel = box.landmarks.length >= LANDMARKS_COUNT;
      let [indexOfMouth, indexOfForehead] = MESH_KEYPOINTS_LINE_OF_SYMMETRY_INDICES;
      if (boxLandmarksFromMeshModel === false) {
        [indexOfMouth, indexOfForehead] = BLAZEFACE_KEYPOINTS_LINE_OF_SYMMETRY_INDICES;
      }
      angle = util.computeRotation(box.landmarks[indexOfMouth], box.landmarks[indexOfForehead]);
      const faceCenter = bounding.getBoxCenter({ startPoint: box.startPoint, endPoint: box.endPoint });
      const faceCenterNormalized = [faceCenter[0] / input.shape[2], faceCenter[1] / input.shape[1]];
      let rotatedImage = input;
      let rotationMatrix = util.IDENTITY_MATRIX;
      if (angle !== 0) {
        rotatedImage = tf.image.rotateWithOffset(input, angle, 0, faceCenterNormalized);
        rotationMatrix = util.buildRotationMatrix(-angle, faceCenter);
      }
      const boxCPU = { startPoint: box.startPoint, endPoint: box.endPoint };
      const face = bounding.cutBoxFromImageAndResize(boxCPU, rotatedImage, [this.meshHeight, this.meshWidth]).div(255);
      // The first returned tensor represents facial contours, which are included in the coordinates.
      const [, flag, coords] = this.meshDetector.predict(face);
      const coordsReshaped = tf.reshape(coords, [-1, 3]);
      let rawCoords = coordsReshaped.arraySync();
      if (predictIrises) {
        const { box: leftEyeBox, boxSize: leftEyeBoxSize, crop: leftEyeCrop } = this.getEyeBox(rawCoords, face, LEFT_EYE_BOUNDS[0], LEFT_EYE_BOUNDS[1], true);
        const { box: rightEyeBox, boxSize: rightEyeBoxSize, crop: rightEyeCrop } = this.getEyeBox(rawCoords, face, RIGHT_EYE_BOUNDS[0], RIGHT_EYE_BOUNDS[1]);
        const eyePredictions = (this.irisModel.predict(tf.concat([leftEyeCrop, rightEyeCrop])));
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
      tf.dispose(rawCoords);
      const landmarksBox = bounding.enlargeBox(this.calculateLandmarksBoundingBox(transformedCoordsData));
      if (predictMesh) {
        const transformedCoords = tf.tensor2d(transformedCoordsData);
        this.regionsOfInterest[i] = { ...landmarksBox, landmarks: transformedCoords.arraySync() };
        const prediction = {
          // coords: tf.tensor2d(rawCoords, [rawCoords.length, 3]),
          coords: transformedCoords,
          box: landmarksBox,
          confidence: flag.squeeze(),
          image: face,
        };
        return prediction;
      }
      const prediction = {
        coords: null,
        // scaledCoords: null,
        box: landmarksBox,
        confidence: flag.squeeze(),
        image: face,
      };
      return prediction;
    }));
  }

  // Updates regions of interest if the intersection over union between the incoming and previous regions falls below a threshold.
  updateRegionsOfInterest(boxes) {
    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i];
      const previousBox = this.regionsOfInterest[i];
      let iou = 0;
      if (previousBox && previousBox.startPoint) {
        const [boxStartX, boxStartY] = box.startPoint;
        const [boxEndX, boxEndY] = box.endPoint;
        const [previousBoxStartX, previousBoxStartY] = previousBox.startPoint;
        const [previousBoxEndX, previousBoxEndY] = previousBox.endPoint;
        const xStartMax = Math.max(boxStartX, previousBoxStartX);
        const yStartMax = Math.max(boxStartY, previousBoxStartY);
        const xEndMin = Math.min(boxEndX, previousBoxEndX);
        const yEndMin = Math.min(boxEndY, previousBoxEndY);
        const intersection = (xEndMin - xStartMax) * (yEndMin - yStartMax);
        const boxArea = (boxEndX - boxStartX) * (boxEndY - boxStartY);
        const previousBoxArea = (previousBoxEndX - previousBoxStartX) * (previousBoxEndY - boxStartY);
        iou = intersection / (boxArea + previousBoxArea - intersection);
      }
      if (iou < UPDATE_REGION_OF_INTEREST_IOU_THRESHOLD) {
        this.regionsOfInterest[i] = box;
      }
    }
    this.regionsOfInterest = this.regionsOfInterest.slice(0, boxes.length);
  }

  clearRegionOfInterest(index) {
    if (this.regionsOfInterest[index] != null) {
      this.regionsOfInterest = [
        ...this.regionsOfInterest.slice(0, index),
        ...this.regionsOfInterest.slice(index + 1),
      ];
    }
  }

  shouldUpdateRegionsOfInterest() {
    const roisCount = this.regionsOfInterest.length;
    const noROIs = roisCount === 0;
    if (this.maxFaces === 1 || noROIs) {
      return noROIs;
    }
    return roisCount !== this.maxFaces && this.runsWithoutFaceDetector >= this.skipFrames;
  }

  calculateLandmarksBoundingBox(landmarks) {
    const xs = landmarks.map((d) => d[0]);
    const ys = landmarks.map((d) => d[1]);
    const startPoint = [Math.min(...xs), Math.min(...ys)];
    const endPoint = [Math.max(...xs), Math.max(...ys)];
    return { startPoint, endPoint };
  }
}
exports.Pipeline = Pipeline;
