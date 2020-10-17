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

// Replace the raw coordinates returned by facemesh with refined iris model coordinates. Update the z coordinate to be an average of the original and the new. This produces the best visual effect.
function replaceRawCoordinates(rawCoords, newCoords, prefix, keys) {
  for (let i = 0; i < keypoints.MESH_TO_IRIS_INDICES_MAP.length; i++) {
    const { key, indices } = keypoints.MESH_TO_IRIS_INDICES_MAP[i];
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
    this.irisSize = config.iris.inputSize;
    this.irisEnlarge = config.iris.enlargeFactor;
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
    const box = bounding.squarifyBox(bounding.enlargeBox(this.calculateLandmarksBoundingBox([rawCoords[eyeInnerCornerIndex], rawCoords[eyeOuterCornerIndex]]), this.irisEnlarge));
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

  async predict(input, config) {
    this.skipFrames = config.detector.skipFrames;
    this.maxFaces = config.detector.maxFaces;
    if (this.shouldUpdateRegionsOfInterest()) {
      // const { boxes, scaleFactor } = await this.boundingBoxDetector.getBoundingBoxes(input);
      const detector = await this.boundingBoxDetector.getBoundingBoxes(input);
      if (detector.boxes.length === 0) {
        this.regionsOfInterest = [];
        return null;
      }
      const scaledBoxes = detector.boxes.map((prediction) => {
        const startPoint = prediction.box.startPoint.squeeze();
        const endPoint = prediction.box.endPoint.squeeze();
        const predictionBox = {
          startPoint: startPoint.arraySync(),
          endPoint: endPoint.arraySync(),
        };
        startPoint.dispose();
        endPoint.dispose();
        const scaledBox = bounding.scaleBoxCoordinates(predictionBox, detector.scaleFactor);
        const enlargedBox = bounding.enlargeBox(scaledBox);
        const landmarks = prediction.landmarks.arraySync();
        prediction.box.startPoint.dispose();
        prediction.box.endPoint.dispose();
        prediction.landmarks.dispose();
        prediction.probability.dispose();
        return { ...enlargedBox, landmarks };
      });
      this.updateRegionsOfInterest(scaledBoxes);
      this.runsWithoutFaceDetector = 0;
    } else {
      this.runsWithoutFaceDetector++;
    }
    const results = tf.tidy(() => this.regionsOfInterest.map((box, i) => {
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
      if (config.iris.enabled) {
        const { box: leftEyeBox, boxSize: leftEyeBoxSize, crop: leftEyeCrop } = this.getEyeBox(rawCoords, face, LEFT_EYE_BOUNDS[0], LEFT_EYE_BOUNDS[1], true);
        const { box: rightEyeBox, boxSize: rightEyeBoxSize, crop: rightEyeCrop } = this.getEyeBox(rawCoords, face, RIGHT_EYE_BOUNDS[0], RIGHT_EYE_BOUNDS[1]);
        const eyePredictions = (this.irisModel.predict(tf.concat([leftEyeCrop, rightEyeCrop])));
        const eyePredictionsData = eyePredictions.dataSync();
        eyePredictions.dispose();
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
      const confidence = flag.squeeze();
      tf.dispose(flag);
      if (config.mesh.enabled) {
        const transformedCoords = tf.tensor2d(transformedCoordsData);
        this.regionsOfInterest[i] = { ...landmarksBox, landmarks: transformedCoords.arraySync() };
        const prediction = {
          coords: transformedCoords,
          box: landmarksBox,
          confidence,
          image: face,
        };
        return prediction;
      }
      const prediction = {
        coords: null,
        box: landmarksBox,
        confidence,
        image: face,
      };
      return prediction;
    }));
    return results;
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
    return { startPoint, endPoint, landmarks };
  }
}
exports.Pipeline = Pipeline;
