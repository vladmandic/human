var __defProp = Object.defineProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __commonJS = (callback, module) => () => {
  if (!module) {
    module = {exports: {}};
    callback(module.exports, module);
  }
  return module.exports;
};
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, {get: all[name], enumerable: true});
};

// src/facemesh/blazeface.js
var require_blazeface = __commonJS((exports) => {
  const tf2 = require("@tensorflow/tfjs");
  const NUM_LANDMARKS = 6;
  function generateAnchors(inputSize) {
    const spec = {strides: [inputSize / 16, inputSize / 8], anchors: [2, 6]};
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
    startPoint: tf2.slice(startEndTensor, [0, 0], [-1, 2]),
    endPoint: tf2.slice(startEndTensor, [0, 2], [-1, 2])
  });
  const scaleBox = (box, factors) => {
    const starts = tf2.mul(box.startPoint, factors);
    const ends = tf2.mul(box.endPoint, factors);
    const newCoordinates = tf2.concat2d([starts, ends], 1);
    return createBox(newCoordinates);
  };
  function decodeBounds(boxOutputs, anchors, inputSize) {
    const boxStarts = tf2.slice(boxOutputs, [0, 1], [-1, 2]);
    const centers = tf2.add(boxStarts, anchors);
    const boxSizes = tf2.slice(boxOutputs, [0, 3], [-1, 2]);
    const boxSizesNormalized = tf2.div(boxSizes, inputSize);
    const centersNormalized = tf2.div(centers, inputSize);
    const halfBoxSize = tf2.div(boxSizesNormalized, 2);
    const starts = tf2.sub(centersNormalized, halfBoxSize);
    const ends = tf2.add(centersNormalized, halfBoxSize);
    const startNormalized = tf2.mul(starts, inputSize);
    const endNormalized = tf2.mul(ends, inputSize);
    const concatAxis = 1;
    return tf2.concat2d([startNormalized, endNormalized], concatAxis);
  }
  function scaleBoxFromPrediction(face, scaleFactor) {
    return tf2.tidy(() => {
      const box = face["box"] ? face["box"] : face;
      return scaleBox(box, scaleFactor).startEndTensor.squeeze();
    });
  }
  class BlazeFaceModel {
    constructor(model, config) {
      this.blazeFaceModel = model;
      this.width = config.detector.inputSize;
      this.height = config.detector.inputSize;
      this.maxFaces = config.detector.maxFaces;
      this.anchorsData = generateAnchors(config.detector.inputSize);
      this.anchors = tf2.tensor2d(this.anchorsData);
      this.inputSize = tf2.tensor1d([this.width, this.height]);
      this.iouThreshold = config.detector.iouThreshold;
      this.scaleFaces = 0.8;
      this.scoreThreshold = config.detector.scoreThreshold;
    }
    async getBoundingBoxes(inputImage) {
      if (!inputImage || inputImage.isDisposedInternal || inputImage.shape.length !== 4 || inputImage.shape[1] < 1 || inputImage.shape[2] < 1)
        return null;
      const [detectedOutputs, boxes, scores] = tf2.tidy(() => {
        const resizedImage = inputImage.resizeBilinear([this.width, this.height]);
        const normalizedImage = tf2.mul(tf2.sub(resizedImage.div(255), 0.5), 2);
        const batchedPrediction = this.blazeFaceModel.predict(normalizedImage);
        let prediction;
        if (Array.isArray(batchedPrediction)) {
          const sorted = batchedPrediction.sort((a, b) => a.size - b.size);
          const concat384 = tf2.concat([sorted[0], sorted[2]], 2);
          const concat512 = tf2.concat([sorted[1], sorted[3]], 2);
          const concat = tf2.concat([concat512, concat384], 1);
          prediction = concat.squeeze(0);
        } else {
          prediction = batchedPrediction.squeeze();
        }
        const decodedBounds = decodeBounds(prediction, this.anchors, this.inputSize);
        const logits = tf2.slice(prediction, [0, 0], [-1, 1]);
        const scoresOut = tf2.sigmoid(logits).squeeze();
        return [prediction, decodedBounds, scoresOut];
      });
      const boxIndicesTensor = await tf2.image.nonMaxSuppressionAsync(boxes, scores, this.maxFaces, this.iouThreshold, this.scoreThreshold);
      const boxIndices = await boxIndicesTensor.array();
      boxIndicesTensor.dispose();
      const boundingBoxesMap = boxIndices.map((boxIndex) => tf2.slice(boxes, [boxIndex, 0], [1, -1]));
      const boundingBoxes = await Promise.all(boundingBoxesMap.map(async (boundingBox) => {
        const vals = await boundingBox.array();
        boundingBox.dispose();
        return vals;
      }));
      const annotatedBoxes = [];
      for (let i = 0; i < boundingBoxes.length; i++) {
        const boundingBox = boundingBoxes[i];
        const box = createBox(boundingBox);
        const boxIndex = boxIndices[i];
        const anchor = this.anchorsData[boxIndex];
        const sliced = tf2.slice(detectedOutputs, [boxIndex, NUM_LANDMARKS - 1], [1, -1]);
        const squeezed = sliced.squeeze();
        const landmarks = squeezed.reshape([NUM_LANDMARKS, -1]);
        const probability = tf2.slice(scores, [boxIndex], [1]);
        const annotatedBox = {box, landmarks, probability, anchor};
        annotatedBoxes.push(annotatedBox);
        sliced.dispose();
        squeezed.dispose();
      }
      detectedOutputs.dispose();
      boxes.dispose();
      scores.dispose();
      detectedOutputs.dispose();
      return {
        boxes: annotatedBoxes,
        scaleFactor: [inputImage.shape[2] / this.width, inputImage.shape[1] / this.height]
      };
    }
    async estimateFaces(input) {
      const {boxes, scaleFactor} = await this.getBoundingBoxes(input);
      return Promise.all(boxes.map(async (face) => {
        const scaledBox = scaleBoxFromPrediction(face, scaleFactor);
        const [landmarkData, boxData, probabilityData] = await Promise.all([face.landmarks, scaledBox, face.probability].map(async (d) => d.array()));
        const anchor = face.anchor;
        const [scaleFactorX, scaleFactorY] = scaleFactor;
        const scaledLandmarks = landmarkData.map((landmark) => [
          (landmark[0] + anchor[0]) * scaleFactorX,
          (landmark[1] + anchor[1]) * scaleFactorY
        ]);
        const normalizedFace = {
          topLeft: boxData.slice(0, 2),
          bottomRight: boxData.slice(2),
          landmarks: scaledLandmarks,
          probability: probabilityData
        };
        disposeBox(face.box);
        face.landmarks.dispose();
        face.probability.dispose();
        scaledBox.dispose();
        return normalizedFace;
      }));
    }
  }
  async function load(config) {
    const blazeface = await tf2.loadGraphModel(config.detector.modelPath, {fromTFHub: config.detector.modelPath.includes("tfhub.dev")});
    const model = new BlazeFaceModel(blazeface, config);
    return model;
  }
  exports.load = load;
  exports.BlazeFaceModel = BlazeFaceModel;
  exports.disposeBox = disposeBox;
});

// src/facemesh/keypoints.js
var require_keypoints = __commonJS((exports) => {
  exports.MESH_ANNOTATIONS = {
    silhouette: [
      10,
      338,
      297,
      332,
      284,
      251,
      389,
      356,
      454,
      323,
      361,
      288,
      397,
      365,
      379,
      378,
      400,
      377,
      152,
      148,
      176,
      149,
      150,
      136,
      172,
      58,
      132,
      93,
      234,
      127,
      162,
      21,
      54,
      103,
      67,
      109
    ],
    lipsUpperOuter: [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291],
    lipsLowerOuter: [146, 91, 181, 84, 17, 314, 405, 321, 375, 291],
    lipsUpperInner: [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308],
    lipsLowerInner: [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308],
    rightEyeUpper0: [246, 161, 160, 159, 158, 157, 173],
    rightEyeLower0: [33, 7, 163, 144, 145, 153, 154, 155, 133],
    rightEyeUpper1: [247, 30, 29, 27, 28, 56, 190],
    rightEyeLower1: [130, 25, 110, 24, 23, 22, 26, 112, 243],
    rightEyeUpper2: [113, 225, 224, 223, 222, 221, 189],
    rightEyeLower2: [226, 31, 228, 229, 230, 231, 232, 233, 244],
    rightEyeLower3: [143, 111, 117, 118, 119, 120, 121, 128, 245],
    rightEyebrowUpper: [156, 70, 63, 105, 66, 107, 55, 193],
    rightEyebrowLower: [35, 124, 46, 53, 52, 65],
    rightEyeIris: [473, 474, 475, 476, 477],
    leftEyeUpper0: [466, 388, 387, 386, 385, 384, 398],
    leftEyeLower0: [263, 249, 390, 373, 374, 380, 381, 382, 362],
    leftEyeUpper1: [467, 260, 259, 257, 258, 286, 414],
    leftEyeLower1: [359, 255, 339, 254, 253, 252, 256, 341, 463],
    leftEyeUpper2: [342, 445, 444, 443, 442, 441, 413],
    leftEyeLower2: [446, 261, 448, 449, 450, 451, 452, 453, 464],
    leftEyeLower3: [372, 340, 346, 347, 348, 349, 350, 357, 465],
    leftEyebrowUpper: [383, 300, 293, 334, 296, 336, 285, 417],
    leftEyebrowLower: [265, 353, 276, 283, 282, 295],
    leftEyeIris: [468, 469, 470, 471, 472],
    midwayBetweenEyes: [168],
    noseTip: [1],
    noseBottom: [2],
    noseRightCorner: [98],
    noseLeftCorner: [327],
    rightCheek: [205],
    leftCheek: [425]
  };
  exports.MESH_TO_IRIS_INDICES_MAP = [
    {key: "EyeUpper0", indices: [9, 10, 11, 12, 13, 14, 15]},
    {key: "EyeUpper1", indices: [25, 26, 27, 28, 29, 30, 31]},
    {key: "EyeUpper2", indices: [41, 42, 43, 44, 45, 46, 47]},
    {key: "EyeLower0", indices: [0, 1, 2, 3, 4, 5, 6, 7, 8]},
    {key: "EyeLower1", indices: [16, 17, 18, 19, 20, 21, 22, 23, 24]},
    {key: "EyeLower2", indices: [32, 33, 34, 35, 36, 37, 38, 39, 40]},
    {key: "EyeLower3", indices: [54, 55, 56, 57, 58, 59, 60, 61, 62]},
    {key: "EyebrowUpper", indices: [63, 64, 65, 66, 67, 68, 69, 70]},
    {key: "EyebrowLower", indices: [48, 49, 50, 51, 52, 53]}
  ];
});

// src/facemesh/box.js
var require_box = __commonJS((exports) => {
  const tf2 = require("@tensorflow/tfjs");
  function scaleBoxCoordinates(box, factor) {
    const startPoint = [box.startPoint[0] * factor[0], box.startPoint[1] * factor[1]];
    const endPoint = [box.endPoint[0] * factor[0], box.endPoint[1] * factor[1]];
    return {startPoint, endPoint};
  }
  exports.scaleBoxCoordinates = scaleBoxCoordinates;
  function getBoxSize(box) {
    return [
      Math.abs(box.endPoint[0] - box.startPoint[0]),
      Math.abs(box.endPoint[1] - box.startPoint[1])
    ];
  }
  exports.getBoxSize = getBoxSize;
  function getBoxCenter(box) {
    return [
      box.startPoint[0] + (box.endPoint[0] - box.startPoint[0]) / 2,
      box.startPoint[1] + (box.endPoint[1] - box.startPoint[1]) / 2
    ];
  }
  exports.getBoxCenter = getBoxCenter;
  function cutBoxFromImageAndResize(box, image, cropSize) {
    const h = image.shape[1];
    const w = image.shape[2];
    const boxes = [[
      box.startPoint[1] / h,
      box.startPoint[0] / w,
      box.endPoint[1] / h,
      box.endPoint[0] / w
    ]];
    return tf2.image.cropAndResize(image, boxes, [0], cropSize);
  }
  exports.cutBoxFromImageAndResize = cutBoxFromImageAndResize;
  function enlargeBox(box, factor = 1.5) {
    const center = getBoxCenter(box);
    const size = getBoxSize(box);
    const newHalfSize = [factor * size[0] / 2, factor * size[1] / 2];
    const startPoint = [center[0] - newHalfSize[0], center[1] - newHalfSize[1]];
    const endPoint = [center[0] + newHalfSize[0], center[1] + newHalfSize[1]];
    return {startPoint, endPoint, landmarks: box.landmarks};
  }
  exports.enlargeBox = enlargeBox;
  function squarifyBox(box) {
    const centers = getBoxCenter(box);
    const size = getBoxSize(box);
    const maxEdge = Math.max(...size);
    const halfSize = maxEdge / 2;
    const startPoint = [centers[0] - halfSize, centers[1] - halfSize];
    const endPoint = [centers[0] + halfSize, centers[1] + halfSize];
    return {startPoint, endPoint, landmarks: box.landmarks};
  }
  exports.squarifyBox = squarifyBox;
});

// src/facemesh/util.js
var require_util = __commonJS((exports) => {
  exports.IDENTITY_MATRIX = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  function normalizeRadians(angle) {
    return angle - 2 * Math.PI * Math.floor((angle + Math.PI) / (2 * Math.PI));
  }
  exports.normalizeRadians = normalizeRadians;
  function computeRotation(point1, point2) {
    const radians = Math.PI / 2 - Math.atan2(-(point2[1] - point1[1]), point2[0] - point1[0]);
    return normalizeRadians(radians);
  }
  exports.computeRotation = computeRotation;
  function radToDegrees(rad) {
    return rad * 180 / Math.PI;
  }
  exports.radToDegrees = radToDegrees;
  function buildTranslationMatrix(x, y) {
    return [[1, 0, x], [0, 1, y], [0, 0, 1]];
  }
  function dot(v1, v2) {
    let product = 0;
    for (let i = 0; i < v1.length; i++) {
      product += v1[i] * v2[i];
    }
    return product;
  }
  exports.dot = dot;
  function getColumnFrom2DArr(arr, columnIndex) {
    const column = [];
    for (let i = 0; i < arr.length; i++) {
      column.push(arr[i][columnIndex]);
    }
    return column;
  }
  exports.getColumnFrom2DArr = getColumnFrom2DArr;
  function multiplyTransformMatrices(mat1, mat2) {
    const product = [];
    const size = mat1.length;
    for (let row = 0; row < size; row++) {
      product.push([]);
      for (let col = 0; col < size; col++) {
        product[row].push(dot(mat1[row], getColumnFrom2DArr(mat2, col)));
      }
    }
    return product;
  }
  function buildRotationMatrix(rotation, center) {
    const cosA = Math.cos(rotation);
    const sinA = Math.sin(rotation);
    const rotationMatrix = [[cosA, -sinA, 0], [sinA, cosA, 0], [0, 0, 1]];
    const translationMatrix = buildTranslationMatrix(center[0], center[1]);
    const translationTimesRotation = multiplyTransformMatrices(translationMatrix, rotationMatrix);
    const negativeTranslationMatrix = buildTranslationMatrix(-center[0], -center[1]);
    return multiplyTransformMatrices(translationTimesRotation, negativeTranslationMatrix);
  }
  exports.buildRotationMatrix = buildRotationMatrix;
  function invertTransformMatrix(matrix) {
    const rotationComponent = [[matrix[0][0], matrix[1][0]], [matrix[0][1], matrix[1][1]]];
    const translationComponent = [matrix[0][2], matrix[1][2]];
    const invertedTranslation = [
      -dot(rotationComponent[0], translationComponent),
      -dot(rotationComponent[1], translationComponent)
    ];
    return [
      rotationComponent[0].concat(invertedTranslation[0]),
      rotationComponent[1].concat(invertedTranslation[1]),
      [0, 0, 1]
    ];
  }
  exports.invertTransformMatrix = invertTransformMatrix;
  function rotatePoint(homogeneousCoordinate, rotationMatrix) {
    return [
      dot(homogeneousCoordinate, rotationMatrix[0]),
      dot(homogeneousCoordinate, rotationMatrix[1])
    ];
  }
  exports.rotatePoint = rotatePoint;
  function xyDistanceBetweenPoints(a, b) {
    return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
  }
  exports.xyDistanceBetweenPoints = xyDistanceBetweenPoints;
});

// src/facemesh/pipeline.js
var require_pipeline = __commonJS((exports) => {
  const tf2 = require("@tensorflow/tfjs");
  const bounding = require_box();
  const keypoints = require_keypoints();
  const util = require_util();
  const LANDMARKS_COUNT = 468;
  const UPDATE_REGION_OF_INTEREST_IOU_THRESHOLD = 0.25;
  const MESH_MOUTH_INDEX = 13;
  const MESH_KEYPOINTS_LINE_OF_SYMMETRY_INDICES = [MESH_MOUTH_INDEX, keypoints.MESH_ANNOTATIONS["midwayBetweenEyes"][0]];
  const BLAZEFACE_MOUTH_INDEX = 3;
  const BLAZEFACE_NOSE_INDEX = 2;
  const BLAZEFACE_KEYPOINTS_LINE_OF_SYMMETRY_INDICES = [BLAZEFACE_MOUTH_INDEX, BLAZEFACE_NOSE_INDEX];
  const LEFT_EYE_OUTLINE = keypoints.MESH_ANNOTATIONS["leftEyeLower0"];
  const LEFT_EYE_BOUNDS = [LEFT_EYE_OUTLINE[0], LEFT_EYE_OUTLINE[LEFT_EYE_OUTLINE.length - 1]];
  const RIGHT_EYE_OUTLINE = keypoints.MESH_ANNOTATIONS["rightEyeLower0"];
  const RIGHT_EYE_BOUNDS = [RIGHT_EYE_OUTLINE[0], RIGHT_EYE_OUTLINE[RIGHT_EYE_OUTLINE.length - 1]];
  const IRIS_UPPER_CENTER_INDEX = 3;
  const IRIS_LOWER_CENTER_INDEX = 4;
  const IRIS_IRIS_INDEX = 71;
  const IRIS_NUM_COORDINATES = 76;
  function replaceRawCoordinates(rawCoords, newCoords, prefix, keys) {
    for (let i = 0; i < keypoints.MESH_TO_IRIS_INDICES_MAP.length; i++) {
      const {key, indices} = keypoints.MESH_TO_IRIS_INDICES_MAP[i];
      const originalIndices = keypoints.MESH_ANNOTATIONS[`${prefix}${key}`];
      const shouldReplaceAllKeys = keys == null;
      if (shouldReplaceAllKeys || keys.includes(key)) {
        for (let j = 0; j < indices.length; j++) {
          const index = indices[j];
          rawCoords[originalIndices[j]] = [
            newCoords[index][0],
            newCoords[index][1],
            (newCoords[index][2] + rawCoords[originalIndices[j]][2]) / 2
          ];
        }
      }
    }
  }
  class Pipeline {
    constructor(boundingBoxDetector, meshDetector, irisModel, config) {
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
      const boxSize = bounding.getBoxSize({startPoint: box.startPoint, endPoint: box.endPoint});
      const scaleFactor = [boxSize[0] / this.meshWidth, boxSize[1] / this.meshHeight];
      const coordsScaled = rawCoords.map((coord) => [
        scaleFactor[0] * (coord[0] - this.meshWidth / 2),
        scaleFactor[1] * (coord[1] - this.meshHeight / 2),
        coord[2]
      ]);
      const coordsRotationMatrix = util.buildRotationMatrix(angle, [0, 0]);
      const coordsRotated = coordsScaled.map((coord) => [...util.rotatePoint(coord, coordsRotationMatrix), coord[2]]);
      const inverseRotationMatrix = util.invertTransformMatrix(rotationMatrix);
      const boxCenter = [...bounding.getBoxCenter({startPoint: box.startPoint, endPoint: box.endPoint}), 1];
      const originalBoxCenter = [
        util.dot(boxCenter, inverseRotationMatrix[0]),
        util.dot(boxCenter, inverseRotationMatrix[1])
      ];
      return coordsRotated.map((coord) => [
        coord[0] + originalBoxCenter[0],
        coord[1] + originalBoxCenter[1],
        coord[2]
      ]);
    }
    getLeftToRightEyeDepthDifference(rawCoords) {
      const leftEyeZ = rawCoords[LEFT_EYE_BOUNDS[0]][2];
      const rightEyeZ = rawCoords[RIGHT_EYE_BOUNDS[0]][2];
      return leftEyeZ - rightEyeZ;
    }
    getEyeBox(rawCoords, face, eyeInnerCornerIndex, eyeOuterCornerIndex, flip = false) {
      const box = bounding.squarifyBox(bounding.enlargeBox(this.calculateLandmarksBoundingBox([rawCoords[eyeInnerCornerIndex], rawCoords[eyeOuterCornerIndex]]), this.irisEnlarge));
      const boxSize = bounding.getBoxSize(box);
      let crop = tf2.image.cropAndResize(face, [[
        box.startPoint[1] / this.meshHeight,
        box.startPoint[0] / this.meshWidth,
        box.endPoint[1] / this.meshHeight,
        box.endPoint[0] / this.meshWidth
      ]], [0], [this.irisSize, this.irisSize]);
      if (flip) {
        crop = tf2.image.flipLeftRight(crop);
      }
      return {box, boxSize, crop};
    }
    getEyeCoords(eyeData, eyeBox, eyeBoxSize, flip = false) {
      const eyeRawCoords = [];
      for (let i = 0; i < IRIS_NUM_COORDINATES; i++) {
        const x = eyeData[i * 3];
        const y = eyeData[i * 3 + 1];
        const z = eyeData[i * 3 + 2];
        eyeRawCoords.push([
          (flip ? 1 - x / this.irisSize : x / this.irisSize) * eyeBoxSize[0] + eyeBox.startPoint[0],
          y / this.irisSize * eyeBoxSize[1] + eyeBox.startPoint[1],
          z
        ]);
      }
      return {rawCoords: eyeRawCoords, iris: eyeRawCoords.slice(IRIS_IRIS_INDEX)};
    }
    getAdjustedIrisCoords(rawCoords, irisCoords, direction) {
      const upperCenterZ = rawCoords[keypoints.MESH_ANNOTATIONS[`${direction}EyeUpper0`][IRIS_UPPER_CENTER_INDEX]][2];
      const lowerCenterZ = rawCoords[keypoints.MESH_ANNOTATIONS[`${direction}EyeLower0`][IRIS_LOWER_CENTER_INDEX]][2];
      const averageZ = (upperCenterZ + lowerCenterZ) / 2;
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
      this.runsWithoutFaceDetector++;
      if (this.shouldUpdateRegionsOfInterest()) {
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
            endPoint: endPoint.arraySync()
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
          return {...enlargedBox, landmarks};
        });
        this.updateRegionsOfInterest(scaledBoxes);
        this.runsWithoutFaceDetector = 0;
      }
      const results = tf2.tidy(() => this.regionsOfInterest.map((box, i) => {
        let angle = 0;
        const boxLandmarksFromMeshModel = box.landmarks.length >= LANDMARKS_COUNT;
        let [indexOfMouth, indexOfForehead] = MESH_KEYPOINTS_LINE_OF_SYMMETRY_INDICES;
        if (boxLandmarksFromMeshModel === false) {
          [indexOfMouth, indexOfForehead] = BLAZEFACE_KEYPOINTS_LINE_OF_SYMMETRY_INDICES;
        }
        angle = util.computeRotation(box.landmarks[indexOfMouth], box.landmarks[indexOfForehead]);
        const faceCenter = bounding.getBoxCenter({startPoint: box.startPoint, endPoint: box.endPoint});
        const faceCenterNormalized = [faceCenter[0] / input.shape[2], faceCenter[1] / input.shape[1]];
        let rotatedImage = input;
        let rotationMatrix = util.IDENTITY_MATRIX;
        if (angle !== 0) {
          rotatedImage = tf2.image.rotateWithOffset(input, angle, 0, faceCenterNormalized);
          rotationMatrix = util.buildRotationMatrix(-angle, faceCenter);
        }
        const boxCPU = {startPoint: box.startPoint, endPoint: box.endPoint};
        const face = bounding.cutBoxFromImageAndResize(boxCPU, rotatedImage, [this.meshHeight, this.meshWidth]).div(255);
        const [, flag, coords] = this.meshDetector.predict(face);
        const coordsReshaped = tf2.reshape(coords, [-1, 3]);
        let rawCoords = coordsReshaped.arraySync();
        if (config.iris.enabled) {
          const {box: leftEyeBox, boxSize: leftEyeBoxSize, crop: leftEyeCrop} = this.getEyeBox(rawCoords, face, LEFT_EYE_BOUNDS[0], LEFT_EYE_BOUNDS[1], true);
          const {box: rightEyeBox, boxSize: rightEyeBoxSize, crop: rightEyeCrop} = this.getEyeBox(rawCoords, face, RIGHT_EYE_BOUNDS[0], RIGHT_EYE_BOUNDS[1]);
          const eyePredictions = this.irisModel.predict(tf2.concat([leftEyeCrop, rightEyeCrop]));
          const eyePredictionsData = eyePredictions.dataSync();
          eyePredictions.dispose();
          const leftEyeData = eyePredictionsData.slice(0, IRIS_NUM_COORDINATES * 3);
          const {rawCoords: leftEyeRawCoords, iris: leftIrisRawCoords} = this.getEyeCoords(leftEyeData, leftEyeBox, leftEyeBoxSize, true);
          const rightEyeData = eyePredictionsData.slice(IRIS_NUM_COORDINATES * 3);
          const {rawCoords: rightEyeRawCoords, iris: rightIrisRawCoords} = this.getEyeCoords(rightEyeData, rightEyeBox, rightEyeBoxSize);
          const leftToRightEyeDepthDifference = this.getLeftToRightEyeDepthDifference(rawCoords);
          if (Math.abs(leftToRightEyeDepthDifference) < 30) {
            replaceRawCoordinates(rawCoords, leftEyeRawCoords, "left");
            replaceRawCoordinates(rawCoords, rightEyeRawCoords, "right");
          } else if (leftToRightEyeDepthDifference < 1) {
            replaceRawCoordinates(rawCoords, leftEyeRawCoords, "left", ["EyeUpper0", "EyeLower0"]);
          } else {
            replaceRawCoordinates(rawCoords, rightEyeRawCoords, "right", ["EyeUpper0", "EyeLower0"]);
          }
          const adjustedLeftIrisCoords = this.getAdjustedIrisCoords(rawCoords, leftIrisRawCoords, "left");
          const adjustedRightIrisCoords = this.getAdjustedIrisCoords(rawCoords, rightIrisRawCoords, "right");
          rawCoords = rawCoords.concat(adjustedLeftIrisCoords).concat(adjustedRightIrisCoords);
        }
        const transformedCoordsData = this.transformRawCoords(rawCoords, box, angle, rotationMatrix);
        tf2.dispose(rawCoords);
        const landmarksBox = bounding.enlargeBox(this.calculateLandmarksBoundingBox(transformedCoordsData));
        const confidence = flag.squeeze();
        tf2.dispose(flag);
        if (config.mesh.enabled) {
          const transformedCoords = tf2.tensor2d(transformedCoordsData);
          this.regionsOfInterest[i] = {...landmarksBox, landmarks: transformedCoords.arraySync()};
          const prediction2 = {
            coords: transformedCoords,
            box: landmarksBox,
            confidence,
            image: face
          };
          return prediction2;
        }
        const prediction = {
          coords: null,
          box: landmarksBox,
          confidence,
          image: face
        };
        return prediction;
      }));
      return results;
    }
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
          ...this.regionsOfInterest.slice(index + 1)
        ];
      }
    }
    shouldUpdateRegionsOfInterest() {
      if (this.regionsOfInterest.length === 0)
        return true;
      return this.regionsOfInterest.length !== this.maxFaces && this.runsWithoutFaceDetector >= this.skipFrames;
    }
    calculateLandmarksBoundingBox(landmarks) {
      const xs = landmarks.map((d) => d[0]);
      const ys = landmarks.map((d) => d[1]);
      const startPoint = [Math.min(...xs), Math.min(...ys)];
      const endPoint = [Math.max(...xs), Math.max(...ys)];
      return {startPoint, endPoint, landmarks};
    }
  }
  exports.Pipeline = Pipeline;
});

// src/facemesh/uvcoords.js
var require_uvcoords = __commonJS((exports) => {
  exports.UV_COORDS = [
    [0.499976992607117, 0.652534008026123],
    [0.500025987625122, 0.547487020492554],
    [0.499974012374878, 0.602371990680695],
    [0.482113003730774, 0.471979022026062],
    [0.500150978565216, 0.527155995368958],
    [0.499909996986389, 0.498252987861633],
    [0.499523013830185, 0.40106201171875],
    [0.289712011814117, 0.380764007568359],
    [0.499954998493195, 0.312398016452789],
    [0.499987006187439, 0.269918978214264],
    [0.500023007392883, 0.107050001621246],
    [0.500023007392883, 0.666234016418457],
    [0.5000159740448, 0.679224014282227],
    [0.500023007392883, 0.692348003387451],
    [0.499976992607117, 0.695277988910675],
    [0.499976992607117, 0.70593398809433],
    [0.499976992607117, 0.719385027885437],
    [0.499976992607117, 0.737019002437592],
    [0.499967992305756, 0.781370997428894],
    [0.499816000461578, 0.562981009483337],
    [0.473773002624512, 0.573909997940063],
    [0.104906998574734, 0.254140973091125],
    [0.365929991006851, 0.409575998783112],
    [0.338757991790771, 0.41302502155304],
    [0.311120003461838, 0.409460008144379],
    [0.274657994508743, 0.389131009578705],
    [0.393361985683441, 0.403706014156342],
    [0.345234006643295, 0.344011008739471],
    [0.370094001293182, 0.346076011657715],
    [0.319321990013123, 0.347265005111694],
    [0.297903001308441, 0.353591024875641],
    [0.24779200553894, 0.410809993743896],
    [0.396889001131058, 0.842755019664764],
    [0.280097991228104, 0.375599980354309],
    [0.106310002505779, 0.399955987930298],
    [0.2099249958992, 0.391353011131287],
    [0.355807989835739, 0.534406006336212],
    [0.471751004457474, 0.65040397644043],
    [0.474155008792877, 0.680191993713379],
    [0.439785003662109, 0.657229006290436],
    [0.414617002010345, 0.66654098033905],
    [0.450374007225037, 0.680860996246338],
    [0.428770989179611, 0.682690978050232],
    [0.374971002340317, 0.727805018424988],
    [0.486716985702515, 0.547628998756409],
    [0.485300987958908, 0.527395009994507],
    [0.257764995098114, 0.314490020275116],
    [0.401223003864288, 0.455172002315521],
    [0.429818987846375, 0.548614978790283],
    [0.421351999044418, 0.533740997314453],
    [0.276895999908447, 0.532056987285614],
    [0.483370006084442, 0.499586999416351],
    [0.33721199631691, 0.282882988452911],
    [0.296391993761063, 0.293242990970612],
    [0.169294998049736, 0.193813979625702],
    [0.447580009698868, 0.302609980106354],
    [0.392390012741089, 0.353887975215912],
    [0.354490011930466, 0.696784019470215],
    [0.067304998636246, 0.730105042457581],
    [0.442739009857178, 0.572826027870178],
    [0.457098007202148, 0.584792017936707],
    [0.381974011659622, 0.694710969924927],
    [0.392388999462128, 0.694203019142151],
    [0.277076005935669, 0.271932005882263],
    [0.422551989555359, 0.563233017921448],
    [0.385919004678726, 0.281364023685455],
    [0.383103013038635, 0.255840003490448],
    [0.331431001424789, 0.119714021682739],
    [0.229923993349075, 0.232002973556519],
    [0.364500999450684, 0.189113974571228],
    [0.229622006416321, 0.299540996551514],
    [0.173287004232407, 0.278747975826263],
    [0.472878992557526, 0.666198015213013],
    [0.446828007698059, 0.668527007102966],
    [0.422762006521225, 0.673889994621277],
    [0.445307999849319, 0.580065965652466],
    [0.388103008270264, 0.693961024284363],
    [0.403039008378983, 0.706539988517761],
    [0.403629004955292, 0.693953037261963],
    [0.460041999816895, 0.557139039039612],
    [0.431158006191254, 0.692366003990173],
    [0.452181994915009, 0.692366003990173],
    [0.475387006998062, 0.692366003990173],
    [0.465828001499176, 0.779190003871918],
    [0.472328990697861, 0.736225962638855],
    [0.473087012767792, 0.717857003211975],
    [0.473122000694275, 0.704625964164734],
    [0.473033010959625, 0.695277988910675],
    [0.427942007780075, 0.695277988910675],
    [0.426479011774063, 0.703539967536926],
    [0.423162013292313, 0.711845993995667],
    [0.4183090031147, 0.720062971115112],
    [0.390094995498657, 0.639572978019714],
    [0.013953999616206, 0.560034036636353],
    [0.499913990497589, 0.58014702796936],
    [0.413199990987778, 0.69539999961853],
    [0.409626007080078, 0.701822996139526],
    [0.468080013990402, 0.601534962654114],
    [0.422728985548019, 0.585985004901886],
    [0.463079988956451, 0.593783974647522],
    [0.37211999297142, 0.47341400384903],
    [0.334562003612518, 0.496073007583618],
    [0.411671012639999, 0.546965003013611],
    [0.242175996303558, 0.14767599105835],
    [0.290776997804642, 0.201445996761322],
    [0.327338010072708, 0.256527006626129],
    [0.399509996175766, 0.748921036720276],
    [0.441727995872498, 0.261676013469696],
    [0.429764986038208, 0.187834024429321],
    [0.412198007106781, 0.108901023864746],
    [0.288955003023148, 0.398952007293701],
    [0.218936994671822, 0.435410976409912],
    [0.41278201341629, 0.398970007896423],
    [0.257135003805161, 0.355440020561218],
    [0.427684992551804, 0.437960982322693],
    [0.448339998722076, 0.536936044692993],
    [0.178560003638268, 0.45755398273468],
    [0.247308000922203, 0.457193970680237],
    [0.286267012357712, 0.467674970626831],
    [0.332827985286713, 0.460712015628815],
    [0.368755996227264, 0.447206974029541],
    [0.398963987827301, 0.432654976844788],
    [0.476410001516342, 0.405806005001068],
    [0.189241006970406, 0.523923993110657],
    [0.228962004184723, 0.348950982093811],
    [0.490725994110107, 0.562400996685028],
    [0.404670000076294, 0.485132992267609],
    [0.019469000399113, 0.401564002037048],
    [0.426243007183075, 0.420431017875671],
    [0.396993011236191, 0.548797011375427],
    [0.266469985246658, 0.376977026462555],
    [0.439121007919312, 0.51895797252655],
    [0.032313998788595, 0.644356966018677],
    [0.419054001569748, 0.387154996395111],
    [0.462783008813858, 0.505746960639954],
    [0.238978996872902, 0.779744982719421],
    [0.198220998048782, 0.831938028335571],
    [0.107550002634525, 0.540755033493042],
    [0.183610007166862, 0.740257024765015],
    [0.134409993886948, 0.333683013916016],
    [0.385764002799988, 0.883153975009918],
    [0.490967005491257, 0.579378008842468],
    [0.382384985685349, 0.508572995662689],
    [0.174399003386497, 0.397670984268188],
    [0.318785011768341, 0.39623498916626],
    [0.343364000320435, 0.400596976280212],
    [0.396100014448166, 0.710216999053955],
    [0.187885001301765, 0.588537991046906],
    [0.430987000465393, 0.944064974784851],
    [0.318993002176285, 0.898285031318665],
    [0.266247987747192, 0.869701027870178],
    [0.500023007392883, 0.190576016902924],
    [0.499976992607117, 0.954452991485596],
    [0.366169989109039, 0.398822009563446],
    [0.393207013607025, 0.39553701877594],
    [0.410373002290726, 0.391080021858215],
    [0.194993004202843, 0.342101991176605],
    [0.388664990663528, 0.362284004688263],
    [0.365961998701096, 0.355970978736877],
    [0.343364000320435, 0.355356991291046],
    [0.318785011768341, 0.35834002494812],
    [0.301414996385574, 0.363156020641327],
    [0.058132998645306, 0.319076001644135],
    [0.301414996385574, 0.387449026107788],
    [0.499987989664078, 0.618434011936188],
    [0.415838003158569, 0.624195992946625],
    [0.445681989192963, 0.566076993942261],
    [0.465844005346298, 0.620640993118286],
    [0.49992299079895, 0.351523995399475],
    [0.288718998432159, 0.819945991039276],
    [0.335278987884521, 0.852819979190826],
    [0.440512001514435, 0.902418971061707],
    [0.128294005990028, 0.791940987110138],
    [0.408771991729736, 0.373893976211548],
    [0.455606997013092, 0.451801002025604],
    [0.499877005815506, 0.908990025520325],
    [0.375436991453171, 0.924192011356354],
    [0.11421000212431, 0.615022003650665],
    [0.448662012815475, 0.695277988910675],
    [0.4480200111866, 0.704632043838501],
    [0.447111994028091, 0.715808033943176],
    [0.444831997156143, 0.730794012546539],
    [0.430011987686157, 0.766808986663818],
    [0.406787008047104, 0.685672998428345],
    [0.400738000869751, 0.681069016456604],
    [0.392399996519089, 0.677703022956848],
    [0.367855995893478, 0.663918972015381],
    [0.247923001646996, 0.601333022117615],
    [0.452769994735718, 0.420849978923798],
    [0.43639200925827, 0.359887003898621],
    [0.416164010763168, 0.368713974952698],
    [0.413385987281799, 0.692366003990173],
    [0.228018000721931, 0.683571994304657],
    [0.468268007040024, 0.352671027183533],
    [0.411361992359161, 0.804327011108398],
    [0.499989002943039, 0.469825029373169],
    [0.479153990745544, 0.442654013633728],
    [0.499974012374878, 0.439637005329132],
    [0.432112008333206, 0.493588984012604],
    [0.499886006116867, 0.866917014122009],
    [0.49991300702095, 0.821729004383087],
    [0.456548988819122, 0.819200992584229],
    [0.344549000263214, 0.745438992977142],
    [0.37890899181366, 0.574010014533997],
    [0.374292999505997, 0.780184984207153],
    [0.319687992334366, 0.570737957954407],
    [0.357154995203018, 0.604269981384277],
    [0.295284003019333, 0.621580958366394],
    [0.447750002145767, 0.862477004528046],
    [0.410986006259918, 0.508723020553589],
    [0.31395098567009, 0.775308012962341],
    [0.354128003120422, 0.812552988529205],
    [0.324548006057739, 0.703992962837219],
    [0.189096003770828, 0.646299958229065],
    [0.279776990413666, 0.71465802192688],
    [0.1338230073452, 0.682700991630554],
    [0.336768001317978, 0.644733011722565],
    [0.429883986711502, 0.466521978378296],
    [0.455527991056442, 0.548622965812683],
    [0.437114000320435, 0.558896005153656],
    [0.467287987470627, 0.529924988746643],
    [0.414712011814117, 0.335219979286194],
    [0.37704598903656, 0.322777986526489],
    [0.344107985496521, 0.320150971412659],
    [0.312875986099243, 0.32233202457428],
    [0.283526003360748, 0.333190023899078],
    [0.241245999932289, 0.382785975933075],
    [0.102986000478268, 0.468762993812561],
    [0.267612010240555, 0.424560010433197],
    [0.297879010438919, 0.433175981044769],
    [0.333433985710144, 0.433878004550934],
    [0.366427004337311, 0.426115989685059],
    [0.396012008190155, 0.416696012020111],
    [0.420121014118195, 0.41022801399231],
    [0.007561000064015, 0.480777025222778],
    [0.432949006557465, 0.569517970085144],
    [0.458638995885849, 0.479089021682739],
    [0.473466008901596, 0.545744001865387],
    [0.476087987422943, 0.563830018043518],
    [0.468472003936768, 0.555056989192963],
    [0.433990985155106, 0.582361996173859],
    [0.483518004417419, 0.562983989715576],
    [0.482482999563217, 0.57784903049469],
    [0.42645001411438, 0.389798998832703],
    [0.438998997211456, 0.39649498462677],
    [0.450067013502121, 0.400434017181396],
    [0.289712011814117, 0.368252992630005],
    [0.276670008897781, 0.363372981548309],
    [0.517862021923065, 0.471948027610779],
    [0.710287988185883, 0.380764007568359],
    [0.526226997375488, 0.573909997940063],
    [0.895093023777008, 0.254140973091125],
    [0.634069979190826, 0.409575998783112],
    [0.661242008209229, 0.41302502155304],
    [0.688880026340485, 0.409460008144379],
    [0.725341975688934, 0.389131009578705],
    [0.606630027294159, 0.40370500087738],
    [0.654766023159027, 0.344011008739471],
    [0.629905998706818, 0.346076011657715],
    [0.680678009986877, 0.347265005111694],
    [0.702096998691559, 0.353591024875641],
    [0.75221198797226, 0.410804986953735],
    [0.602918028831482, 0.842862963676453],
    [0.719901978969574, 0.375599980354309],
    [0.893692970275879, 0.399959981441498],
    [0.790081977844238, 0.391354024410248],
    [0.643998026847839, 0.534487962722778],
    [0.528249025344849, 0.65040397644043],
    [0.525849997997284, 0.680191040039062],
    [0.560214996337891, 0.657229006290436],
    [0.585384011268616, 0.66654098033905],
    [0.549625992774963, 0.680860996246338],
    [0.57122802734375, 0.682691991329193],
    [0.624852001667023, 0.72809898853302],
    [0.513050019741058, 0.547281980514526],
    [0.51509702205658, 0.527251958847046],
    [0.742246985435486, 0.314507007598877],
    [0.598631024360657, 0.454979002475739],
    [0.570338010787964, 0.548575043678284],
    [0.578631997108459, 0.533622980117798],
    [0.723087012767792, 0.532054007053375],
    [0.516445994377136, 0.499638974666595],
    [0.662801027297974, 0.282917976379395],
    [0.70362401008606, 0.293271005153656],
    [0.830704987049103, 0.193813979625702],
    [0.552385985851288, 0.302568018436432],
    [0.607609987258911, 0.353887975215912],
    [0.645429015159607, 0.696707010269165],
    [0.932694971561432, 0.730105042457581],
    [0.557260990142822, 0.572826027870178],
    [0.542901992797852, 0.584792017936707],
    [0.6180260181427, 0.694710969924927],
    [0.607590973377228, 0.694203019142151],
    [0.722943007946014, 0.271963000297546],
    [0.577413976192474, 0.563166975975037],
    [0.614082992076874, 0.281386971473694],
    [0.616907000541687, 0.255886018276215],
    [0.668509006500244, 0.119913995265961],
    [0.770092010498047, 0.232020974159241],
    [0.635536015033722, 0.189248979091644],
    [0.77039098739624, 0.299556016921997],
    [0.826722025871277, 0.278755009174347],
    [0.527121007442474, 0.666198015213013],
    [0.553171992301941, 0.668527007102966],
    [0.577238023281097, 0.673889994621277],
    [0.554691970348358, 0.580065965652466],
    [0.611896991729736, 0.693961024284363],
    [0.59696102142334, 0.706539988517761],
    [0.596370995044708, 0.693953037261963],
    [0.539958000183105, 0.557139039039612],
    [0.568841993808746, 0.692366003990173],
    [0.547818005084991, 0.692366003990173],
    [0.52461302280426, 0.692366003990173],
    [0.534089982509613, 0.779141008853912],
    [0.527670979499817, 0.736225962638855],
    [0.526912987232208, 0.717857003211975],
    [0.526877999305725, 0.704625964164734],
    [0.526966989040375, 0.695277988910675],
    [0.572058022022247, 0.695277988910675],
    [0.573521018028259, 0.703539967536926],
    [0.57683801651001, 0.711845993995667],
    [0.581691026687622, 0.720062971115112],
    [0.609944999217987, 0.639909982681274],
    [0.986046016216278, 0.560034036636353],
    [0.5867999792099, 0.69539999961853],
    [0.590372025966644, 0.701822996139526],
    [0.531915009021759, 0.601536989212036],
    [0.577268004417419, 0.585934996604919],
    [0.536915004253387, 0.593786001205444],
    [0.627542972564697, 0.473352015018463],
    [0.665585994720459, 0.495950996875763],
    [0.588353991508484, 0.546862006187439],
    [0.757824003696442, 0.14767599105835],
    [0.709249973297119, 0.201507985591888],
    [0.672684013843536, 0.256581008434296],
    [0.600408971309662, 0.74900496006012],
    [0.55826598405838, 0.261672019958496],
    [0.570303976535797, 0.187870979309082],
    [0.588165998458862, 0.109044015407562],
    [0.711045026779175, 0.398952007293701],
    [0.781069993972778, 0.435405015945435],
    [0.587247014045715, 0.398931980133057],
    [0.742869973182678, 0.355445981025696],
    [0.572156012058258, 0.437651991844177],
    [0.55186802148819, 0.536570012569427],
    [0.821442008018494, 0.457556009292603],
    [0.752701997756958, 0.457181990146637],
    [0.71375697851181, 0.467626988887787],
    [0.66711300611496, 0.460672974586487],
    [0.631101012229919, 0.447153985500336],
    [0.6008620262146, 0.432473003864288],
    [0.523481011390686, 0.405627012252808],
    [0.810747981071472, 0.523926019668579],
    [0.771045982837677, 0.348959028720856],
    [0.509127020835876, 0.562718033790588],
    [0.595292985439301, 0.485023975372314],
    [0.980530977249146, 0.401564002037048],
    [0.573499977588654, 0.420000016689301],
    [0.602994978427887, 0.548687994480133],
    [0.733529984951019, 0.376977026462555],
    [0.560611009597778, 0.519016981124878],
    [0.967685997486115, 0.644356966018677],
    [0.580985009670258, 0.387160003185272],
    [0.537728011608124, 0.505385041236877],
    [0.760966002941132, 0.779752969741821],
    [0.801778972148895, 0.831938028335571],
    [0.892440974712372, 0.54076099395752],
    [0.816350996494293, 0.740260004997253],
    [0.865594983100891, 0.333687007427216],
    [0.614073991775513, 0.883246004581451],
    [0.508952975273132, 0.579437971115112],
    [0.617941975593567, 0.508316040039062],
    [0.825608015060425, 0.397674977779388],
    [0.681214988231659, 0.39623498916626],
    [0.656635999679565, 0.400596976280212],
    [0.603900015354156, 0.710216999053955],
    [0.81208598613739, 0.588539004325867],
    [0.56801301240921, 0.944564998149872],
    [0.681007981300354, 0.898285031318665],
    [0.733752012252808, 0.869701027870178],
    [0.633830010890961, 0.398822009563446],
    [0.606792986392975, 0.39553701877594],
    [0.589659988880157, 0.391062021255493],
    [0.805015981197357, 0.342108011245728],
    [0.611334979534149, 0.362284004688263],
    [0.634037971496582, 0.355970978736877],
    [0.656635999679565, 0.355356991291046],
    [0.681214988231659, 0.35834002494812],
    [0.698584973812103, 0.363156020641327],
    [0.941866993904114, 0.319076001644135],
    [0.698584973812103, 0.387449026107788],
    [0.584177017211914, 0.624107003211975],
    [0.554318010807037, 0.566076993942261],
    [0.534153997898102, 0.62064003944397],
    [0.711217999458313, 0.819975018501282],
    [0.664629995822906, 0.852871000766754],
    [0.559099972248077, 0.902631998062134],
    [0.871706008911133, 0.791940987110138],
    [0.591234028339386, 0.373893976211548],
    [0.544341027736664, 0.451583981513977],
    [0.624562978744507, 0.924192011356354],
    [0.88577002286911, 0.615028977394104],
    [0.551338016986847, 0.695277988910675],
    [0.551980018615723, 0.704632043838501],
    [0.552887976169586, 0.715808033943176],
    [0.555167973041534, 0.730794012546539],
    [0.569944024085999, 0.767035007476807],
    [0.593203008174896, 0.685675978660583],
    [0.599261999130249, 0.681069016456604],
    [0.607599973678589, 0.677703022956848],
    [0.631937980651855, 0.663500010967255],
    [0.752032995223999, 0.601315021514893],
    [0.547226011753082, 0.420395016670227],
    [0.563543975353241, 0.359827995300293],
    [0.583841025829315, 0.368713974952698],
    [0.586614012718201, 0.692366003990173],
    [0.771915018558502, 0.683578014373779],
    [0.531597018241882, 0.352482974529266],
    [0.588370978832245, 0.804440975189209],
    [0.52079701423645, 0.442565023899078],
    [0.567984998226166, 0.493479013442993],
    [0.543282985687256, 0.819254994392395],
    [0.655317008495331, 0.745514988899231],
    [0.621008992195129, 0.574018001556396],
    [0.625559985637665, 0.78031200170517],
    [0.680198013782501, 0.570719003677368],
    [0.64276397228241, 0.604337990283966],
    [0.704662978649139, 0.621529996395111],
    [0.552012026309967, 0.862591981887817],
    [0.589071989059448, 0.508637011051178],
    [0.685944974422455, 0.775357007980347],
    [0.645735025405884, 0.812640011310577],
    [0.675342977046967, 0.703978002071381],
    [0.810858011245728, 0.646304965019226],
    [0.72012197971344, 0.714666962623596],
    [0.866151988506317, 0.682704985141754],
    [0.663187026977539, 0.644596993923187],
    [0.570082008838654, 0.466325998306274],
    [0.544561982154846, 0.548375964164734],
    [0.562758982181549, 0.558784961700439],
    [0.531987011432648, 0.530140042304993],
    [0.585271000862122, 0.335177004337311],
    [0.622952997684479, 0.32277899980545],
    [0.655896008014679, 0.320163011550903],
    [0.687132000923157, 0.322345972061157],
    [0.716481983661652, 0.333200991153717],
    [0.758756995201111, 0.382786989212036],
    [0.897013008594513, 0.468769013881683],
    [0.732392013072968, 0.424547016620636],
    [0.70211398601532, 0.433162987232208],
    [0.66652500629425, 0.433866024017334],
    [0.633504986763, 0.426087975502014],
    [0.603875994682312, 0.416586995124817],
    [0.579657971858978, 0.409945011138916],
    [0.992439985275269, 0.480777025222778],
    [0.567192018032074, 0.569419980049133],
    [0.54136598110199, 0.478899002075195],
    [0.526564002037048, 0.546118021011353],
    [0.523913025856018, 0.563830018043518],
    [0.531529009342194, 0.555056989192963],
    [0.566035985946655, 0.582329034805298],
    [0.51631098985672, 0.563053965568542],
    [0.5174720287323, 0.577877044677734],
    [0.573594987392426, 0.389806985855103],
    [0.560697972774506, 0.395331978797913],
    [0.549755990505219, 0.399751007556915],
    [0.710287988185883, 0.368252992630005],
    [0.723330020904541, 0.363372981548309]
  ];
});

// src/facemesh/triangulation.js
var require_triangulation = __commonJS((exports) => {
  __export(exports, {
    default: () => triangulation_default
  });
  var triangulation_default = [
    127,
    34,
    139,
    11,
    0,
    37,
    232,
    231,
    120,
    72,
    37,
    39,
    128,
    121,
    47,
    232,
    121,
    128,
    104,
    69,
    67,
    175,
    171,
    148,
    157,
    154,
    155,
    118,
    50,
    101,
    73,
    39,
    40,
    9,
    151,
    108,
    48,
    115,
    131,
    194,
    204,
    211,
    74,
    40,
    185,
    80,
    42,
    183,
    40,
    92,
    186,
    230,
    229,
    118,
    202,
    212,
    214,
    83,
    18,
    17,
    76,
    61,
    146,
    160,
    29,
    30,
    56,
    157,
    173,
    106,
    204,
    194,
    135,
    214,
    192,
    203,
    165,
    98,
    21,
    71,
    68,
    51,
    45,
    4,
    144,
    24,
    23,
    77,
    146,
    91,
    205,
    50,
    187,
    201,
    200,
    18,
    91,
    106,
    182,
    90,
    91,
    181,
    85,
    84,
    17,
    206,
    203,
    36,
    148,
    171,
    140,
    92,
    40,
    39,
    193,
    189,
    244,
    159,
    158,
    28,
    247,
    246,
    161,
    236,
    3,
    196,
    54,
    68,
    104,
    193,
    168,
    8,
    117,
    228,
    31,
    189,
    193,
    55,
    98,
    97,
    99,
    126,
    47,
    100,
    166,
    79,
    218,
    155,
    154,
    26,
    209,
    49,
    131,
    135,
    136,
    150,
    47,
    126,
    217,
    223,
    52,
    53,
    45,
    51,
    134,
    211,
    170,
    140,
    67,
    69,
    108,
    43,
    106,
    91,
    230,
    119,
    120,
    226,
    130,
    247,
    63,
    53,
    52,
    238,
    20,
    242,
    46,
    70,
    156,
    78,
    62,
    96,
    46,
    53,
    63,
    143,
    34,
    227,
    173,
    155,
    133,
    123,
    117,
    111,
    44,
    125,
    19,
    236,
    134,
    51,
    216,
    206,
    205,
    154,
    153,
    22,
    39,
    37,
    167,
    200,
    201,
    208,
    36,
    142,
    100,
    57,
    212,
    202,
    20,
    60,
    99,
    28,
    158,
    157,
    35,
    226,
    113,
    160,
    159,
    27,
    204,
    202,
    210,
    113,
    225,
    46,
    43,
    202,
    204,
    62,
    76,
    77,
    137,
    123,
    116,
    41,
    38,
    72,
    203,
    129,
    142,
    64,
    98,
    240,
    49,
    102,
    64,
    41,
    73,
    74,
    212,
    216,
    207,
    42,
    74,
    184,
    169,
    170,
    211,
    170,
    149,
    176,
    105,
    66,
    69,
    122,
    6,
    168,
    123,
    147,
    187,
    96,
    77,
    90,
    65,
    55,
    107,
    89,
    90,
    180,
    101,
    100,
    120,
    63,
    105,
    104,
    93,
    137,
    227,
    15,
    86,
    85,
    129,
    102,
    49,
    14,
    87,
    86,
    55,
    8,
    9,
    100,
    47,
    121,
    145,
    23,
    22,
    88,
    89,
    179,
    6,
    122,
    196,
    88,
    95,
    96,
    138,
    172,
    136,
    215,
    58,
    172,
    115,
    48,
    219,
    42,
    80,
    81,
    195,
    3,
    51,
    43,
    146,
    61,
    171,
    175,
    199,
    81,
    82,
    38,
    53,
    46,
    225,
    144,
    163,
    110,
    246,
    33,
    7,
    52,
    65,
    66,
    229,
    228,
    117,
    34,
    127,
    234,
    107,
    108,
    69,
    109,
    108,
    151,
    48,
    64,
    235,
    62,
    78,
    191,
    129,
    209,
    126,
    111,
    35,
    143,
    163,
    161,
    246,
    117,
    123,
    50,
    222,
    65,
    52,
    19,
    125,
    141,
    221,
    55,
    65,
    3,
    195,
    197,
    25,
    7,
    33,
    220,
    237,
    44,
    70,
    71,
    139,
    122,
    193,
    245,
    247,
    130,
    33,
    71,
    21,
    162,
    153,
    158,
    159,
    170,
    169,
    150,
    188,
    174,
    196,
    216,
    186,
    92,
    144,
    160,
    161,
    2,
    97,
    167,
    141,
    125,
    241,
    164,
    167,
    37,
    72,
    38,
    12,
    145,
    159,
    160,
    38,
    82,
    13,
    63,
    68,
    71,
    226,
    35,
    111,
    158,
    153,
    154,
    101,
    50,
    205,
    206,
    92,
    165,
    209,
    198,
    217,
    165,
    167,
    97,
    220,
    115,
    218,
    133,
    112,
    243,
    239,
    238,
    241,
    214,
    135,
    169,
    190,
    173,
    133,
    171,
    208,
    32,
    125,
    44,
    237,
    86,
    87,
    178,
    85,
    86,
    179,
    84,
    85,
    180,
    83,
    84,
    181,
    201,
    83,
    182,
    137,
    93,
    132,
    76,
    62,
    183,
    61,
    76,
    184,
    57,
    61,
    185,
    212,
    57,
    186,
    214,
    207,
    187,
    34,
    143,
    156,
    79,
    239,
    237,
    123,
    137,
    177,
    44,
    1,
    4,
    201,
    194,
    32,
    64,
    102,
    129,
    213,
    215,
    138,
    59,
    166,
    219,
    242,
    99,
    97,
    2,
    94,
    141,
    75,
    59,
    235,
    24,
    110,
    228,
    25,
    130,
    226,
    23,
    24,
    229,
    22,
    23,
    230,
    26,
    22,
    231,
    112,
    26,
    232,
    189,
    190,
    243,
    221,
    56,
    190,
    28,
    56,
    221,
    27,
    28,
    222,
    29,
    27,
    223,
    30,
    29,
    224,
    247,
    30,
    225,
    238,
    79,
    20,
    166,
    59,
    75,
    60,
    75,
    240,
    147,
    177,
    215,
    20,
    79,
    166,
    187,
    147,
    213,
    112,
    233,
    244,
    233,
    128,
    245,
    128,
    114,
    188,
    114,
    217,
    174,
    131,
    115,
    220,
    217,
    198,
    236,
    198,
    131,
    134,
    177,
    132,
    58,
    143,
    35,
    124,
    110,
    163,
    7,
    228,
    110,
    25,
    356,
    389,
    368,
    11,
    302,
    267,
    452,
    350,
    349,
    302,
    303,
    269,
    357,
    343,
    277,
    452,
    453,
    357,
    333,
    332,
    297,
    175,
    152,
    377,
    384,
    398,
    382,
    347,
    348,
    330,
    303,
    304,
    270,
    9,
    336,
    337,
    278,
    279,
    360,
    418,
    262,
    431,
    304,
    408,
    409,
    310,
    415,
    407,
    270,
    409,
    410,
    450,
    348,
    347,
    422,
    430,
    434,
    313,
    314,
    17,
    306,
    307,
    375,
    387,
    388,
    260,
    286,
    414,
    398,
    335,
    406,
    418,
    364,
    367,
    416,
    423,
    358,
    327,
    251,
    284,
    298,
    281,
    5,
    4,
    373,
    374,
    253,
    307,
    320,
    321,
    425,
    427,
    411,
    421,
    313,
    18,
    321,
    405,
    406,
    320,
    404,
    405,
    315,
    16,
    17,
    426,
    425,
    266,
    377,
    400,
    369,
    322,
    391,
    269,
    417,
    465,
    464,
    386,
    257,
    258,
    466,
    260,
    388,
    456,
    399,
    419,
    284,
    332,
    333,
    417,
    285,
    8,
    346,
    340,
    261,
    413,
    441,
    285,
    327,
    460,
    328,
    355,
    371,
    329,
    392,
    439,
    438,
    382,
    341,
    256,
    429,
    420,
    360,
    364,
    394,
    379,
    277,
    343,
    437,
    443,
    444,
    283,
    275,
    440,
    363,
    431,
    262,
    369,
    297,
    338,
    337,
    273,
    375,
    321,
    450,
    451,
    349,
    446,
    342,
    467,
    293,
    334,
    282,
    458,
    461,
    462,
    276,
    353,
    383,
    308,
    324,
    325,
    276,
    300,
    293,
    372,
    345,
    447,
    382,
    398,
    362,
    352,
    345,
    340,
    274,
    1,
    19,
    456,
    248,
    281,
    436,
    427,
    425,
    381,
    256,
    252,
    269,
    391,
    393,
    200,
    199,
    428,
    266,
    330,
    329,
    287,
    273,
    422,
    250,
    462,
    328,
    258,
    286,
    384,
    265,
    353,
    342,
    387,
    259,
    257,
    424,
    431,
    430,
    342,
    353,
    276,
    273,
    335,
    424,
    292,
    325,
    307,
    366,
    447,
    345,
    271,
    303,
    302,
    423,
    266,
    371,
    294,
    455,
    460,
    279,
    278,
    294,
    271,
    272,
    304,
    432,
    434,
    427,
    272,
    407,
    408,
    394,
    430,
    431,
    395,
    369,
    400,
    334,
    333,
    299,
    351,
    417,
    168,
    352,
    280,
    411,
    325,
    319,
    320,
    295,
    296,
    336,
    319,
    403,
    404,
    330,
    348,
    349,
    293,
    298,
    333,
    323,
    454,
    447,
    15,
    16,
    315,
    358,
    429,
    279,
    14,
    15,
    316,
    285,
    336,
    9,
    329,
    349,
    350,
    374,
    380,
    252,
    318,
    402,
    403,
    6,
    197,
    419,
    318,
    319,
    325,
    367,
    364,
    365,
    435,
    367,
    397,
    344,
    438,
    439,
    272,
    271,
    311,
    195,
    5,
    281,
    273,
    287,
    291,
    396,
    428,
    199,
    311,
    271,
    268,
    283,
    444,
    445,
    373,
    254,
    339,
    263,
    466,
    249,
    282,
    334,
    296,
    449,
    347,
    346,
    264,
    447,
    454,
    336,
    296,
    299,
    338,
    10,
    151,
    278,
    439,
    455,
    292,
    407,
    415,
    358,
    371,
    355,
    340,
    345,
    372,
    390,
    249,
    466,
    346,
    347,
    280,
    442,
    443,
    282,
    19,
    94,
    370,
    441,
    442,
    295,
    248,
    419,
    197,
    263,
    255,
    359,
    440,
    275,
    274,
    300,
    383,
    368,
    351,
    412,
    465,
    263,
    467,
    466,
    301,
    368,
    389,
    380,
    374,
    386,
    395,
    378,
    379,
    412,
    351,
    419,
    436,
    426,
    322,
    373,
    390,
    388,
    2,
    164,
    393,
    370,
    462,
    461,
    164,
    0,
    267,
    302,
    11,
    12,
    374,
    373,
    387,
    268,
    12,
    13,
    293,
    300,
    301,
    446,
    261,
    340,
    385,
    384,
    381,
    330,
    266,
    425,
    426,
    423,
    391,
    429,
    355,
    437,
    391,
    327,
    326,
    440,
    457,
    438,
    341,
    382,
    362,
    459,
    457,
    461,
    434,
    430,
    394,
    414,
    463,
    362,
    396,
    369,
    262,
    354,
    461,
    457,
    316,
    403,
    402,
    315,
    404,
    403,
    314,
    405,
    404,
    313,
    406,
    405,
    421,
    418,
    406,
    366,
    401,
    361,
    306,
    408,
    407,
    291,
    409,
    408,
    287,
    410,
    409,
    432,
    436,
    410,
    434,
    416,
    411,
    264,
    368,
    383,
    309,
    438,
    457,
    352,
    376,
    401,
    274,
    275,
    4,
    421,
    428,
    262,
    294,
    327,
    358,
    433,
    416,
    367,
    289,
    455,
    439,
    462,
    370,
    326,
    2,
    326,
    370,
    305,
    460,
    455,
    254,
    449,
    448,
    255,
    261,
    446,
    253,
    450,
    449,
    252,
    451,
    450,
    256,
    452,
    451,
    341,
    453,
    452,
    413,
    464,
    463,
    441,
    413,
    414,
    258,
    442,
    441,
    257,
    443,
    442,
    259,
    444,
    443,
    260,
    445,
    444,
    467,
    342,
    445,
    459,
    458,
    250,
    289,
    392,
    290,
    290,
    328,
    460,
    376,
    433,
    435,
    250,
    290,
    392,
    411,
    416,
    433,
    341,
    463,
    464,
    453,
    464,
    465,
    357,
    465,
    412,
    343,
    412,
    399,
    360,
    363,
    440,
    437,
    399,
    456,
    420,
    456,
    363,
    401,
    435,
    288,
    372,
    383,
    353,
    339,
    255,
    249,
    448,
    261,
    255,
    133,
    243,
    190,
    133,
    155,
    112,
    33,
    246,
    247,
    33,
    130,
    25,
    398,
    384,
    286,
    362,
    398,
    414,
    362,
    463,
    341,
    263,
    359,
    467,
    263,
    249,
    255,
    466,
    467,
    260,
    75,
    60,
    166,
    238,
    239,
    79,
    162,
    127,
    139,
    72,
    11,
    37,
    121,
    232,
    120,
    73,
    72,
    39,
    114,
    128,
    47,
    233,
    232,
    128,
    103,
    104,
    67,
    152,
    175,
    148,
    173,
    157,
    155,
    119,
    118,
    101,
    74,
    73,
    40,
    107,
    9,
    108,
    49,
    48,
    131,
    32,
    194,
    211,
    184,
    74,
    185,
    191,
    80,
    183,
    185,
    40,
    186,
    119,
    230,
    118,
    210,
    202,
    214,
    84,
    83,
    17,
    77,
    76,
    146,
    161,
    160,
    30,
    190,
    56,
    173,
    182,
    106,
    194,
    138,
    135,
    192,
    129,
    203,
    98,
    54,
    21,
    68,
    5,
    51,
    4,
    145,
    144,
    23,
    90,
    77,
    91,
    207,
    205,
    187,
    83,
    201,
    18,
    181,
    91,
    182,
    180,
    90,
    181,
    16,
    85,
    17,
    205,
    206,
    36,
    176,
    148,
    140,
    165,
    92,
    39,
    245,
    193,
    244,
    27,
    159,
    28,
    30,
    247,
    161,
    174,
    236,
    196,
    103,
    54,
    104,
    55,
    193,
    8,
    111,
    117,
    31,
    221,
    189,
    55,
    240,
    98,
    99,
    142,
    126,
    100,
    219,
    166,
    218,
    112,
    155,
    26,
    198,
    209,
    131,
    169,
    135,
    150,
    114,
    47,
    217,
    224,
    223,
    53,
    220,
    45,
    134,
    32,
    211,
    140,
    109,
    67,
    108,
    146,
    43,
    91,
    231,
    230,
    120,
    113,
    226,
    247,
    105,
    63,
    52,
    241,
    238,
    242,
    124,
    46,
    156,
    95,
    78,
    96,
    70,
    46,
    63,
    116,
    143,
    227,
    116,
    123,
    111,
    1,
    44,
    19,
    3,
    236,
    51,
    207,
    216,
    205,
    26,
    154,
    22,
    165,
    39,
    167,
    199,
    200,
    208,
    101,
    36,
    100,
    43,
    57,
    202,
    242,
    20,
    99,
    56,
    28,
    157,
    124,
    35,
    113,
    29,
    160,
    27,
    211,
    204,
    210,
    124,
    113,
    46,
    106,
    43,
    204,
    96,
    62,
    77,
    227,
    137,
    116,
    73,
    41,
    72,
    36,
    203,
    142,
    235,
    64,
    240,
    48,
    49,
    64,
    42,
    41,
    74,
    214,
    212,
    207,
    183,
    42,
    184,
    210,
    169,
    211,
    140,
    170,
    176,
    104,
    105,
    69,
    193,
    122,
    168,
    50,
    123,
    187,
    89,
    96,
    90,
    66,
    65,
    107,
    179,
    89,
    180,
    119,
    101,
    120,
    68,
    63,
    104,
    234,
    93,
    227,
    16,
    15,
    85,
    209,
    129,
    49,
    15,
    14,
    86,
    107,
    55,
    9,
    120,
    100,
    121,
    153,
    145,
    22,
    178,
    88,
    179,
    197,
    6,
    196,
    89,
    88,
    96,
    135,
    138,
    136,
    138,
    215,
    172,
    218,
    115,
    219,
    41,
    42,
    81,
    5,
    195,
    51,
    57,
    43,
    61,
    208,
    171,
    199,
    41,
    81,
    38,
    224,
    53,
    225,
    24,
    144,
    110,
    105,
    52,
    66,
    118,
    229,
    117,
    227,
    34,
    234,
    66,
    107,
    69,
    10,
    109,
    151,
    219,
    48,
    235,
    183,
    62,
    191,
    142,
    129,
    126,
    116,
    111,
    143,
    7,
    163,
    246,
    118,
    117,
    50,
    223,
    222,
    52,
    94,
    19,
    141,
    222,
    221,
    65,
    196,
    3,
    197,
    45,
    220,
    44,
    156,
    70,
    139,
    188,
    122,
    245,
    139,
    71,
    162,
    145,
    153,
    159,
    149,
    170,
    150,
    122,
    188,
    196,
    206,
    216,
    92,
    163,
    144,
    161,
    164,
    2,
    167,
    242,
    141,
    241,
    0,
    164,
    37,
    11,
    72,
    12,
    144,
    145,
    160,
    12,
    38,
    13,
    70,
    63,
    71,
    31,
    226,
    111,
    157,
    158,
    154,
    36,
    101,
    205,
    203,
    206,
    165,
    126,
    209,
    217,
    98,
    165,
    97,
    237,
    220,
    218,
    237,
    239,
    241,
    210,
    214,
    169,
    140,
    171,
    32,
    241,
    125,
    237,
    179,
    86,
    178,
    180,
    85,
    179,
    181,
    84,
    180,
    182,
    83,
    181,
    194,
    201,
    182,
    177,
    137,
    132,
    184,
    76,
    183,
    185,
    61,
    184,
    186,
    57,
    185,
    216,
    212,
    186,
    192,
    214,
    187,
    139,
    34,
    156,
    218,
    79,
    237,
    147,
    123,
    177,
    45,
    44,
    4,
    208,
    201,
    32,
    98,
    64,
    129,
    192,
    213,
    138,
    235,
    59,
    219,
    141,
    242,
    97,
    97,
    2,
    141,
    240,
    75,
    235,
    229,
    24,
    228,
    31,
    25,
    226,
    230,
    23,
    229,
    231,
    22,
    230,
    232,
    26,
    231,
    233,
    112,
    232,
    244,
    189,
    243,
    189,
    221,
    190,
    222,
    28,
    221,
    223,
    27,
    222,
    224,
    29,
    223,
    225,
    30,
    224,
    113,
    247,
    225,
    99,
    60,
    240,
    213,
    147,
    215,
    60,
    20,
    166,
    192,
    187,
    213,
    243,
    112,
    244,
    244,
    233,
    245,
    245,
    128,
    188,
    188,
    114,
    174,
    134,
    131,
    220,
    174,
    217,
    236,
    236,
    198,
    134,
    215,
    177,
    58,
    156,
    143,
    124,
    25,
    110,
    7,
    31,
    228,
    25,
    264,
    356,
    368,
    0,
    11,
    267,
    451,
    452,
    349,
    267,
    302,
    269,
    350,
    357,
    277,
    350,
    452,
    357,
    299,
    333,
    297,
    396,
    175,
    377,
    381,
    384,
    382,
    280,
    347,
    330,
    269,
    303,
    270,
    151,
    9,
    337,
    344,
    278,
    360,
    424,
    418,
    431,
    270,
    304,
    409,
    272,
    310,
    407,
    322,
    270,
    410,
    449,
    450,
    347,
    432,
    422,
    434,
    18,
    313,
    17,
    291,
    306,
    375,
    259,
    387,
    260,
    424,
    335,
    418,
    434,
    364,
    416,
    391,
    423,
    327,
    301,
    251,
    298,
    275,
    281,
    4,
    254,
    373,
    253,
    375,
    307,
    321,
    280,
    425,
    411,
    200,
    421,
    18,
    335,
    321,
    406,
    321,
    320,
    405,
    314,
    315,
    17,
    423,
    426,
    266,
    396,
    377,
    369,
    270,
    322,
    269,
    413,
    417,
    464,
    385,
    386,
    258,
    248,
    456,
    419,
    298,
    284,
    333,
    168,
    417,
    8,
    448,
    346,
    261,
    417,
    413,
    285,
    326,
    327,
    328,
    277,
    355,
    329,
    309,
    392,
    438,
    381,
    382,
    256,
    279,
    429,
    360,
    365,
    364,
    379,
    355,
    277,
    437,
    282,
    443,
    283,
    281,
    275,
    363,
    395,
    431,
    369,
    299,
    297,
    337,
    335,
    273,
    321,
    348,
    450,
    349,
    359,
    446,
    467,
    283,
    293,
    282,
    250,
    458,
    462,
    300,
    276,
    383,
    292,
    308,
    325,
    283,
    276,
    293,
    264,
    372,
    447,
    346,
    352,
    340,
    354,
    274,
    19,
    363,
    456,
    281,
    426,
    436,
    425,
    380,
    381,
    252,
    267,
    269,
    393,
    421,
    200,
    428,
    371,
    266,
    329,
    432,
    287,
    422,
    290,
    250,
    328,
    385,
    258,
    384,
    446,
    265,
    342,
    386,
    387,
    257,
    422,
    424,
    430,
    445,
    342,
    276,
    422,
    273,
    424,
    306,
    292,
    307,
    352,
    366,
    345,
    268,
    271,
    302,
    358,
    423,
    371,
    327,
    294,
    460,
    331,
    279,
    294,
    303,
    271,
    304,
    436,
    432,
    427,
    304,
    272,
    408,
    395,
    394,
    431,
    378,
    395,
    400,
    296,
    334,
    299,
    6,
    351,
    168,
    376,
    352,
    411,
    307,
    325,
    320,
    285,
    295,
    336,
    320,
    319,
    404,
    329,
    330,
    349,
    334,
    293,
    333,
    366,
    323,
    447,
    316,
    15,
    315,
    331,
    358,
    279,
    317,
    14,
    316,
    8,
    285,
    9,
    277,
    329,
    350,
    253,
    374,
    252,
    319,
    318,
    403,
    351,
    6,
    419,
    324,
    318,
    325,
    397,
    367,
    365,
    288,
    435,
    397,
    278,
    344,
    439,
    310,
    272,
    311,
    248,
    195,
    281,
    375,
    273,
    291,
    175,
    396,
    199,
    312,
    311,
    268,
    276,
    283,
    445,
    390,
    373,
    339,
    295,
    282,
    296,
    448,
    449,
    346,
    356,
    264,
    454,
    337,
    336,
    299,
    337,
    338,
    151,
    294,
    278,
    455,
    308,
    292,
    415,
    429,
    358,
    355,
    265,
    340,
    372,
    388,
    390,
    466,
    352,
    346,
    280,
    295,
    442,
    282,
    354,
    19,
    370,
    285,
    441,
    295,
    195,
    248,
    197,
    457,
    440,
    274,
    301,
    300,
    368,
    417,
    351,
    465,
    251,
    301,
    389,
    385,
    380,
    386,
    394,
    395,
    379,
    399,
    412,
    419,
    410,
    436,
    322,
    387,
    373,
    388,
    326,
    2,
    393,
    354,
    370,
    461,
    393,
    164,
    267,
    268,
    302,
    12,
    386,
    374,
    387,
    312,
    268,
    13,
    298,
    293,
    301,
    265,
    446,
    340,
    380,
    385,
    381,
    280,
    330,
    425,
    322,
    426,
    391,
    420,
    429,
    437,
    393,
    391,
    326,
    344,
    440,
    438,
    458,
    459,
    461,
    364,
    434,
    394,
    428,
    396,
    262,
    274,
    354,
    457,
    317,
    316,
    402,
    316,
    315,
    403,
    315,
    314,
    404,
    314,
    313,
    405,
    313,
    421,
    406,
    323,
    366,
    361,
    292,
    306,
    407,
    306,
    291,
    408,
    291,
    287,
    409,
    287,
    432,
    410,
    427,
    434,
    411,
    372,
    264,
    383,
    459,
    309,
    457,
    366,
    352,
    401,
    1,
    274,
    4,
    418,
    421,
    262,
    331,
    294,
    358,
    435,
    433,
    367,
    392,
    289,
    439,
    328,
    462,
    326,
    94,
    2,
    370,
    289,
    305,
    455,
    339,
    254,
    448,
    359,
    255,
    446,
    254,
    253,
    449,
    253,
    252,
    450,
    252,
    256,
    451,
    256,
    341,
    452,
    414,
    413,
    463,
    286,
    441,
    414,
    286,
    258,
    441,
    258,
    257,
    442,
    257,
    259,
    443,
    259,
    260,
    444,
    260,
    467,
    445,
    309,
    459,
    250,
    305,
    289,
    290,
    305,
    290,
    460,
    401,
    376,
    435,
    309,
    250,
    392,
    376,
    411,
    433,
    453,
    341,
    464,
    357,
    453,
    465,
    343,
    357,
    412,
    437,
    343,
    399,
    344,
    360,
    440,
    420,
    437,
    456,
    360,
    420,
    363,
    361,
    401,
    288,
    265,
    372,
    353,
    390,
    339,
    249,
    339,
    448,
    255
  ];
});

// src/facemesh/facemesh.js
var require_facemesh = __commonJS((exports) => {
  const tf2 = require("@tensorflow/tfjs");
  const blazeface = require_blazeface();
  const keypoints = require_keypoints();
  const pipe = require_pipeline();
  const uv_coords = require_uvcoords();
  const triangulation = require_triangulation().default;
  class MediaPipeFaceMesh {
    constructor(blazeFace, blazeMeshModel, irisModel, config) {
      this.pipeline = new pipe.Pipeline(blazeFace, blazeMeshModel, irisModel, config);
      if (config)
        this.config = config;
    }
    async estimateFaces(input, config) {
      if (config)
        this.config = config;
      const predictions = await this.pipeline.predict(input, config);
      const results = [];
      for (const prediction of predictions || []) {
        if (prediction.isDisposedInternal)
          continue;
        const confidence = prediction.confidence.arraySync();
        if (confidence >= this.config.detector.minConfidence) {
          const mesh = prediction.coords ? prediction.coords.arraySync() : null;
          const annotations = {};
          if (mesh && mesh.length > 0) {
            for (const key in keypoints.MESH_ANNOTATIONS) {
              if (this.config.iris.enabled || key.includes("Iris") === false) {
                annotations[key] = keypoints.MESH_ANNOTATIONS[key].map((index) => mesh[index]);
              }
            }
          }
          results.push({
            confidence: confidence || 0,
            box: prediction.box ? [prediction.box.startPoint[0], prediction.box.startPoint[1], prediction.box.endPoint[0] - prediction.box.startPoint[0], prediction.box.endPoint[1] - prediction.box.startPoint[1]] : 0,
            mesh,
            annotations,
            image: prediction.image ? tf2.clone(prediction.image) : null
          });
        }
        if (prediction.confidence)
          prediction.confidence.dispose();
        if (prediction.coords)
          prediction.coords.dispose();
        if (prediction.image)
          prediction.image.dispose();
      }
      return results;
    }
  }
  async function load(config) {
    const models = await Promise.all([
      blazeface.load(config),
      tf2.loadGraphModel(config.mesh.modelPath, {fromTFHub: config.mesh.modelPath.includes("tfhub.dev")}),
      tf2.loadGraphModel(config.iris.modelPath, {fromTFHub: config.iris.modelPath.includes("tfhub.dev")})
    ]);
    const faceMesh = new MediaPipeFaceMesh(models[0], models[1], models[2], config);
    return faceMesh;
  }
  exports.load = load;
  exports.MediaPipeFaceMesh = MediaPipeFaceMesh;
  exports.uv_coords = uv_coords;
  exports.triangulation = triangulation;
});

// src/profile.js
var require_profile = __commonJS((exports) => {
  const profileData = {};
  function profile2(name, data) {
    if (!data || !data.kernels)
      return;
    const maxResults = 5;
    const time = data.kernels.filter((a) => a.kernelTimeMs > 0).reduce((a, b) => a += b.kernelTimeMs, 0);
    const slowest = data.kernels.map((a, i) => {
      a.id = i;
      return a;
    }).filter((a) => a.kernelTimeMs > 0).sort((a, b) => b.kernelTimeMs - a.kernelTimeMs);
    const largest = data.kernels.map((a, i) => {
      a.id = i;
      return a;
    }).filter((a) => a.totalBytesSnapshot > 0).sort((a, b) => b.totalBytesSnapshot - a.totalBytesSnapshot);
    if (slowest.length > maxResults)
      slowest.length = maxResults;
    if (largest.length > maxResults)
      largest.length = maxResults;
    const res = {newBytes: data.newBytes, newTensors: data.newTensors, peakBytes: data.peakBytes, numKernelOps: data.kernels.length, timeKernelOps: time, slowestKernelOps: slowest, largestKernelOps: largest};
    profileData[name] = res;
  }
  exports.run = profile2;
  exports.data = profileData;
});

// src/ssrnet/ssrnet.js
var require_ssrnet = __commonJS((exports) => {
  const tf2 = require("@tensorflow/tfjs");
  const profile2 = require_profile();
  const models = {};
  let last = {age: 0, gender: ""};
  let frame = 0;
  async function loadAge(config) {
    if (!models.age)
      models.age = await tf2.loadGraphModel(config.face.age.modelPath);
    return models.age;
  }
  async function loadGender(config) {
    if (!models.gender)
      models.gender = await tf2.loadGraphModel(config.face.gender.modelPath);
    return models.gender;
  }
  async function predict(image, config) {
    if (frame < config.face.age.skipFrames) {
      frame += 1;
      return last;
    }
    frame = 0;
    const resize = tf2.image.resizeBilinear(image, [config.face.age.inputSize, config.face.age.inputSize], false);
    const enhance = tf2.mul(resize, [255]);
    tf2.dispose(resize);
    const promises = [];
    let ageT;
    let genderT;
    const obj = {};
    if (!config.profile) {
      if (config.face.age.enabled)
        promises.push(ageT = models.age.predict(enhance));
      if (config.face.gender.enabled)
        promises.push(genderT = models.gender.predict(enhance));
      await Promise.all(promises);
    } else {
      const profileAge = config.face.age.enabled ? await tf2.profile(() => models.age.predict(enhance)) : {};
      ageT = profileAge.result.clone();
      profileAge.result.dispose();
      profile2.run("age", profileAge);
      const profileGender = config.face.gender.enabled ? await tf2.profile(() => models.gender.predict(enhance)) : {};
      genderT = profileGender.result.clone();
      profileGender.result.dispose();
      profile2.run("gender", profileGender);
    }
    if (ageT) {
      const data = await ageT.data();
      obj.age = Math.trunc(10 * data[0]) / 10;
      tf2.dispose(ageT);
    }
    if (genderT) {
      const data = await genderT.data();
      const confidence = Math.trunc(Math.abs(1.9 * 100 * (data[0] - 0.5))) / 100;
      if (confidence > config.face.gender.minConfidence) {
        obj.gender = data[0] <= 0.5 ? "female" : "male";
        obj.confidence = confidence;
      }
      tf2.dispose(genderT);
    }
    tf2.dispose(enhance);
    last = obj;
    return obj;
  }
  exports.predict = predict;
  exports.loadAge = loadAge;
  exports.loadGender = loadGender;
});

// src/emotion/emotion.js
var require_emotion = __commonJS((exports) => {
  const tf2 = require("@tensorflow/tfjs");
  const profile2 = require_profile();
  const annotations = ["angry", "discust", "fear", "happy", "sad", "surpise", "neutral"];
  const models = {};
  let last = [];
  let frame = 0;
  const multiplier = 1.5;
  async function load(config) {
    if (!models.emotion)
      models.emotion = await tf2.loadGraphModel(config.face.emotion.modelPath);
    return models.emotion;
  }
  async function predict(image, config) {
    if (frame < config.face.emotion.skipFrames) {
      frame += 1;
      return last;
    }
    frame = 0;
    const resize = tf2.image.resizeBilinear(image, [config.face.emotion.inputSize, config.face.emotion.inputSize], false);
    const [red, green, blue] = tf2.split(resize, 3, 3);
    resize.dispose();
    const redNorm = tf2.mul(red, [0.2989]);
    const greenNorm = tf2.mul(green, [0.587]);
    const blueNorm = tf2.mul(blue, [0.114]);
    red.dispose();
    green.dispose();
    blue.dispose();
    const grayscale = tf2.addN([redNorm, greenNorm, blueNorm]);
    redNorm.dispose();
    greenNorm.dispose();
    blueNorm.dispose();
    const obj = [];
    if (config.face.emotion.enabled) {
      let data;
      if (!config.profile) {
        const emotionT = await models.emotion.predict(grayscale);
        data = await emotionT.data();
        tf2.dispose(emotionT);
      } else {
        const profileData = await tf2.profile(() => models.emotion.predict(grayscale));
        data = await profileData.result.data();
        profileData.result.dispose();
        profile2.run("emotion", profileData);
      }
      for (let i = 0; i < data.length; i++) {
        if (multiplier * data[i] > config.face.emotion.minConfidence)
          obj.push({score: Math.min(0.99, Math.trunc(100 * multiplier * data[i]) / 100), emotion: annotations[i]});
      }
      obj.sort((a, b) => b.score - a.score);
    }
    tf2.dispose(grayscale);
    last = obj;
    return obj;
  }
  exports.predict = predict;
  exports.load = load;
});

// src/posenet/modelBase.js
var require_modelBase = __commonJS((exports) => {
  const tf2 = require("@tensorflow/tfjs");
  class BaseModel {
    constructor(model, outputStride) {
      this.model = model;
      this.outputStride = outputStride;
    }
    predict(input) {
      return tf2.tidy(() => {
        const asFloat = this.preprocessInput(input.toFloat());
        const asBatch = asFloat.expandDims(0);
        const results = this.model.predict(asBatch);
        const results3d = results.map((y) => y.squeeze([0]));
        const namedResults = this.nameOutputResults(results3d);
        return {
          heatmapScores: namedResults.heatmap.sigmoid(),
          offsets: namedResults.offsets,
          displacementFwd: namedResults.displacementFwd,
          displacementBwd: namedResults.displacementBwd
        };
      });
    }
    dispose() {
      this.model.dispose();
    }
  }
  exports.BaseModel = BaseModel;
});

// src/posenet/modelMobileNet.js
var require_modelMobileNet = __commonJS((exports) => {
  const tf2 = require("@tensorflow/tfjs");
  const modelBase = require_modelBase();
  class MobileNet extends modelBase.BaseModel {
    preprocessInput(input) {
      return tf2.tidy(() => tf2.div(input, 127.5).sub(1));
    }
    nameOutputResults(results) {
      const [offsets, heatmap, displacementFwd, displacementBwd] = results;
      return {offsets, heatmap, displacementFwd, displacementBwd};
    }
  }
  exports.MobileNet = MobileNet;
});

// src/posenet/heapSort.js
var require_heapSort = __commonJS((exports) => {
  function half(k) {
    return Math.floor(k / 2);
  }
  class MaxHeap {
    constructor(maxSize, getElementValue) {
      this.priorityQueue = new Array(maxSize);
      this.numberOfElements = -1;
      this.getElementValue = getElementValue;
    }
    enqueue(x) {
      this.priorityQueue[++this.numberOfElements] = x;
      this.swim(this.numberOfElements);
    }
    dequeue() {
      const max = this.priorityQueue[0];
      this.exchange(0, this.numberOfElements--);
      this.sink(0);
      this.priorityQueue[this.numberOfElements + 1] = null;
      return max;
    }
    empty() {
      return this.numberOfElements === -1;
    }
    size() {
      return this.numberOfElements + 1;
    }
    all() {
      return this.priorityQueue.slice(0, this.numberOfElements + 1);
    }
    max() {
      return this.priorityQueue[0];
    }
    swim(k) {
      while (k > 0 && this.less(half(k), k)) {
        this.exchange(k, half(k));
        k = half(k);
      }
    }
    sink(k) {
      while (2 * k <= this.numberOfElements) {
        let j = 2 * k;
        if (j < this.numberOfElements && this.less(j, j + 1))
          j++;
        if (!this.less(k, j))
          break;
        this.exchange(k, j);
        k = j;
      }
    }
    getValueAt(i) {
      return this.getElementValue(this.priorityQueue[i]);
    }
    less(i, j) {
      return this.getValueAt(i) < this.getValueAt(j);
    }
    exchange(i, j) {
      const t = this.priorityQueue[i];
      this.priorityQueue[i] = this.priorityQueue[j];
      this.priorityQueue[j] = t;
    }
  }
  exports.MaxHeap = MaxHeap;
});

// src/posenet/buildParts.js
var require_buildParts = __commonJS((exports) => {
  const heapSort = require_heapSort();
  function scoreIsMaximumInLocalWindow(keypointId, score, heatmapY, heatmapX, localMaximumRadius, scores) {
    const [height, width] = scores.shape;
    let localMaximum = true;
    const yStart = Math.max(heatmapY - localMaximumRadius, 0);
    const yEnd = Math.min(heatmapY + localMaximumRadius + 1, height);
    for (let yCurrent = yStart; yCurrent < yEnd; ++yCurrent) {
      const xStart = Math.max(heatmapX - localMaximumRadius, 0);
      const xEnd = Math.min(heatmapX + localMaximumRadius + 1, width);
      for (let xCurrent = xStart; xCurrent < xEnd; ++xCurrent) {
        if (scores.get(yCurrent, xCurrent, keypointId) > score) {
          localMaximum = false;
          break;
        }
      }
      if (!localMaximum) {
        break;
      }
    }
    return localMaximum;
  }
  function buildPartWithScoreQueue(scoreThreshold, localMaximumRadius, scores) {
    const [height, width, numKeypoints] = scores.shape;
    const queue = new heapSort.MaxHeap(height * width * numKeypoints, ({score}) => score);
    for (let heatmapY = 0; heatmapY < height; ++heatmapY) {
      for (let heatmapX = 0; heatmapX < width; ++heatmapX) {
        for (let keypointId = 0; keypointId < numKeypoints; ++keypointId) {
          const score = scores.get(heatmapY, heatmapX, keypointId);
          if (score < scoreThreshold)
            continue;
          if (scoreIsMaximumInLocalWindow(keypointId, score, heatmapY, heatmapX, localMaximumRadius, scores)) {
            queue.enqueue({score, part: {heatmapY, heatmapX, id: keypointId}});
          }
        }
      }
    }
    return queue;
  }
  exports.buildPartWithScoreQueue = buildPartWithScoreQueue;
});

// src/posenet/keypoints.js
var require_keypoints2 = __commonJS((exports) => {
  exports.partNames = [
    "nose",
    "leftEye",
    "rightEye",
    "leftEar",
    "rightEar",
    "leftShoulder",
    "rightShoulder",
    "leftElbow",
    "rightElbow",
    "leftWrist",
    "rightWrist",
    "leftHip",
    "rightHip",
    "leftKnee",
    "rightKnee",
    "leftAnkle",
    "rightAnkle"
  ];
  exports.NUM_KEYPOINTS = exports.partNames.length;
  exports.partIds = exports.partNames.reduce((result, jointName, i) => {
    result[jointName] = i;
    return result;
  }, {});
  const connectedPartNames = [
    ["leftHip", "leftShoulder"],
    ["leftElbow", "leftShoulder"],
    ["leftElbow", "leftWrist"],
    ["leftHip", "leftKnee"],
    ["leftKnee", "leftAnkle"],
    ["rightHip", "rightShoulder"],
    ["rightElbow", "rightShoulder"],
    ["rightElbow", "rightWrist"],
    ["rightHip", "rightKnee"],
    ["rightKnee", "rightAnkle"],
    ["leftShoulder", "rightShoulder"],
    ["leftHip", "rightHip"]
  ];
  exports.poseChain = [
    ["nose", "leftEye"],
    ["leftEye", "leftEar"],
    ["nose", "rightEye"],
    ["rightEye", "rightEar"],
    ["nose", "leftShoulder"],
    ["leftShoulder", "leftElbow"],
    ["leftElbow", "leftWrist"],
    ["leftShoulder", "leftHip"],
    ["leftHip", "leftKnee"],
    ["leftKnee", "leftAnkle"],
    ["nose", "rightShoulder"],
    ["rightShoulder", "rightElbow"],
    ["rightElbow", "rightWrist"],
    ["rightShoulder", "rightHip"],
    ["rightHip", "rightKnee"],
    ["rightKnee", "rightAnkle"]
  ];
  exports.connectedPartIndices = connectedPartNames.map(([jointNameA, jointNameB]) => [exports.partIds[jointNameA], exports.partIds[jointNameB]]);
  exports.partChannels = [
    "left_face",
    "right_face",
    "right_upper_leg_front",
    "right_lower_leg_back",
    "right_upper_leg_back",
    "left_lower_leg_front",
    "left_upper_leg_front",
    "left_upper_leg_back",
    "left_lower_leg_back",
    "right_feet",
    "right_lower_leg_front",
    "left_feet",
    "torso_front",
    "torso_back",
    "right_upper_arm_front",
    "right_upper_arm_back",
    "right_lower_arm_back",
    "left_lower_arm_front",
    "left_upper_arm_front",
    "left_upper_arm_back",
    "left_lower_arm_back",
    "right_hand",
    "right_lower_arm_front",
    "left_hand"
  ];
});

// src/posenet/vectors.js
var require_vectors = __commonJS((exports) => {
  const kpt = require_keypoints2();
  function getOffsetPoint(y, x, keypoint, offsets) {
    return {
      y: offsets.get(y, x, keypoint),
      x: offsets.get(y, x, keypoint + kpt.NUM_KEYPOINTS)
    };
  }
  exports.getOffsetPoint = getOffsetPoint;
  function getImageCoords(part, outputStride, offsets) {
    const {heatmapY, heatmapX, id: keypoint} = part;
    const {y, x} = getOffsetPoint(heatmapY, heatmapX, keypoint, offsets);
    return {
      x: part.heatmapX * outputStride + x,
      y: part.heatmapY * outputStride + y
    };
  }
  exports.getImageCoords = getImageCoords;
  function fillArray(element, size) {
    const result = new Array(size);
    for (let i = 0; i < size; i++) {
      result[i] = element;
    }
    return result;
  }
  exports.fillArray = fillArray;
  function clamp(a, min, max) {
    if (a < min)
      return min;
    if (a > max)
      return max;
    return a;
  }
  exports.clamp = clamp;
  function squaredDistance(y1, x1, y2, x2) {
    const dy = y2 - y1;
    const dx = x2 - x1;
    return dy * dy + dx * dx;
  }
  exports.squaredDistance = squaredDistance;
  function addVectors(a, b) {
    return {x: a.x + b.x, y: a.y + b.y};
  }
  exports.addVectors = addVectors;
  function clampVector(a, min, max) {
    return {y: clamp(a.y, min, max), x: clamp(a.x, min, max)};
  }
  exports.clampVector = clampVector;
});

// src/posenet/decodePose.js
var require_decodePose = __commonJS((exports) => {
  const keypoints = require_keypoints2();
  const vectors = require_vectors();
  const parentChildrenTuples = keypoints.poseChain.map(([parentJoinName, childJoinName]) => [keypoints.partIds[parentJoinName], keypoints.partIds[childJoinName]]);
  const parentToChildEdges = parentChildrenTuples.map(([, childJointId]) => childJointId);
  const childToParentEdges = parentChildrenTuples.map(([parentJointId]) => parentJointId);
  function getDisplacement(edgeId, point, displacements) {
    const numEdges = displacements.shape[2] / 2;
    return {
      y: displacements.get(point.y, point.x, edgeId),
      x: displacements.get(point.y, point.x, numEdges + edgeId)
    };
  }
  function getStridedIndexNearPoint(point, outputStride, height, width) {
    return {
      y: vectors.clamp(Math.round(point.y / outputStride), 0, height - 1),
      x: vectors.clamp(Math.round(point.x / outputStride), 0, width - 1)
    };
  }
  function traverseToTargetKeypoint(edgeId, sourceKeypoint, targetKeypointId, scoresBuffer, offsets, outputStride, displacements, offsetRefineStep = 2) {
    const [height, width] = scoresBuffer.shape;
    const sourceKeypointIndices = getStridedIndexNearPoint(sourceKeypoint.position, outputStride, height, width);
    const displacement = getDisplacement(edgeId, sourceKeypointIndices, displacements);
    const displacedPoint = vectors.addVectors(sourceKeypoint.position, displacement);
    let targetKeypoint = displacedPoint;
    for (let i = 0; i < offsetRefineStep; i++) {
      const targetKeypointIndices = getStridedIndexNearPoint(targetKeypoint, outputStride, height, width);
      const offsetPoint = vectors.getOffsetPoint(targetKeypointIndices.y, targetKeypointIndices.x, targetKeypointId, offsets);
      targetKeypoint = vectors.addVectors({
        x: targetKeypointIndices.x * outputStride,
        y: targetKeypointIndices.y * outputStride
      }, {x: offsetPoint.x, y: offsetPoint.y});
    }
    const targetKeyPointIndices = getStridedIndexNearPoint(targetKeypoint, outputStride, height, width);
    const score = scoresBuffer.get(targetKeyPointIndices.y, targetKeyPointIndices.x, targetKeypointId);
    return {position: targetKeypoint, part: keypoints.partNames[targetKeypointId], score};
  }
  function decodePose(root, scores, offsets, outputStride, displacementsFwd, displacementsBwd) {
    const numParts = scores.shape[2];
    const numEdges = parentToChildEdges.length;
    const instanceKeypoints = new Array(numParts);
    const {part: rootPart, score: rootScore} = root;
    const rootPoint = vectors.getImageCoords(rootPart, outputStride, offsets);
    instanceKeypoints[rootPart.id] = {
      score: rootScore,
      part: keypoints.partNames[rootPart.id],
      position: rootPoint
    };
    for (let edge = numEdges - 1; edge >= 0; --edge) {
      const sourceKeypointId = parentToChildEdges[edge];
      const targetKeypointId = childToParentEdges[edge];
      if (instanceKeypoints[sourceKeypointId] && !instanceKeypoints[targetKeypointId]) {
        instanceKeypoints[targetKeypointId] = traverseToTargetKeypoint(edge, instanceKeypoints[sourceKeypointId], targetKeypointId, scores, offsets, outputStride, displacementsBwd);
      }
    }
    for (let edge = 0; edge < numEdges; ++edge) {
      const sourceKeypointId = childToParentEdges[edge];
      const targetKeypointId = parentToChildEdges[edge];
      if (instanceKeypoints[sourceKeypointId] && !instanceKeypoints[targetKeypointId]) {
        instanceKeypoints[targetKeypointId] = traverseToTargetKeypoint(edge, instanceKeypoints[sourceKeypointId], targetKeypointId, scores, offsets, outputStride, displacementsFwd);
      }
    }
    return instanceKeypoints;
  }
  exports.decodePose = decodePose;
});

// src/posenet/decodeMultiple.js
var require_decodeMultiple = __commonJS((exports) => {
  const buildParts = require_buildParts();
  const decodePose = require_decodePose();
  const vectors = require_vectors();
  function withinNmsRadiusOfCorrespondingPoint(poses, squaredNmsRadius, {x, y}, keypointId) {
    return poses.some(({keypoints}) => {
      const correspondingKeypoint = keypoints[keypointId].position;
      return vectors.squaredDistance(y, x, correspondingKeypoint.y, correspondingKeypoint.x) <= squaredNmsRadius;
    });
  }
  function getInstanceScore(existingPoses, squaredNmsRadius, instanceKeypoints) {
    const notOverlappedKeypointScores = instanceKeypoints.reduce((result, {position, score}, keypointId) => {
      if (!withinNmsRadiusOfCorrespondingPoint(existingPoses, squaredNmsRadius, position, keypointId)) {
        result += score;
      }
      return result;
    }, 0);
    return notOverlappedKeypointScores / instanceKeypoints.length;
  }
  const kLocalMaximumRadius = 1;
  function decodeMultiplePoses(scoresBuffer, offsetsBuffer, displacementsFwdBuffer, displacementsBwdBuffer, outputStride, maxPoseDetections, scoreThreshold = 0.5, nmsRadius = 20) {
    const poses = [];
    const queue = buildParts.buildPartWithScoreQueue(scoreThreshold, kLocalMaximumRadius, scoresBuffer);
    const squaredNmsRadius = nmsRadius * nmsRadius;
    while (poses.length < maxPoseDetections && !queue.empty()) {
      const root = queue.dequeue();
      const rootImageCoords = vectors.getImageCoords(root.part, outputStride, offsetsBuffer);
      if (withinNmsRadiusOfCorrespondingPoint(poses, squaredNmsRadius, rootImageCoords, root.part.id))
        continue;
      const keypoints = decodePose.decodePose(root, scoresBuffer, offsetsBuffer, outputStride, displacementsFwdBuffer, displacementsBwdBuffer);
      const score = getInstanceScore(poses, squaredNmsRadius, keypoints);
      poses.push({keypoints, score});
    }
    return poses;
  }
  exports.decodeMultiplePoses = decodeMultiplePoses;
});

// src/posenet/util.js
var require_util2 = __commonJS((exports) => {
  const kpt = require_keypoints2();
  function eitherPointDoesntMeetConfidence(a, b, minConfidence) {
    return a < minConfidence || b < minConfidence;
  }
  function getAdjacentKeyPoints(keypoints, minConfidence) {
    return kpt.connectedPartIndices.reduce((result, [leftJoint, rightJoint]) => {
      if (eitherPointDoesntMeetConfidence(keypoints[leftJoint].score, keypoints[rightJoint].score, minConfidence)) {
        return result;
      }
      result.push([keypoints[leftJoint], keypoints[rightJoint]]);
      return result;
    }, []);
  }
  exports.getAdjacentKeyPoints = getAdjacentKeyPoints;
  const {NEGATIVE_INFINITY, POSITIVE_INFINITY} = Number;
  function getBoundingBox(keypoints) {
    return keypoints.reduce(({maxX, maxY, minX, minY}, {position: {x, y}}) => ({
      maxX: Math.max(maxX, x),
      maxY: Math.max(maxY, y),
      minX: Math.min(minX, x),
      minY: Math.min(minY, y)
    }), {
      maxX: NEGATIVE_INFINITY,
      maxY: NEGATIVE_INFINITY,
      minX: POSITIVE_INFINITY,
      minY: POSITIVE_INFINITY
    });
  }
  exports.getBoundingBox = getBoundingBox;
  function getBoundingBoxPoints(keypoints) {
    const {minX, minY, maxX, maxY} = getBoundingBox(keypoints);
    return [{x: minX, y: minY}, {x: maxX, y: minY}, {x: maxX, y: maxY}, {x: minX, y: maxY}];
  }
  exports.getBoundingBoxPoints = getBoundingBoxPoints;
  async function toTensorBuffers3D(tensors) {
    return Promise.all(tensors.map((tensor) => tensor.buffer()));
  }
  exports.toTensorBuffers3D = toTensorBuffers3D;
  function scalePose(pose, scaleY, scaleX) {
    return {
      score: pose.score,
      keypoints: pose.keypoints.map(({score, part, position}) => ({
        score,
        part,
        position: {x: position.x * scaleX, y: position.y * scaleY}
      }))
    };
  }
  exports.scalePose = scalePose;
  function resizeTo(image, [targetH, targetW]) {
    const input = image.squeeze(0);
    const resized = input.resizeBilinear([targetH, targetW]);
    input.dispose();
    return resized;
  }
  exports.resizeTo = resizeTo;
  function scaleAndFlipPoses(poses, [height, width], [inputResolutionHeight, inputResolutionWidth]) {
    const scaledPoses = poses.map((pose) => scalePose(pose, height / inputResolutionHeight, width / inputResolutionWidth));
    return scaledPoses;
  }
  exports.scaleAndFlipPoses = scaleAndFlipPoses;
});

// src/posenet/modelPoseNet.js
var require_modelPoseNet = __commonJS((exports) => {
  const tf2 = require("@tensorflow/tfjs");
  const modelMobileNet = require_modelMobileNet();
  const decodeMultiple = require_decodeMultiple();
  const util = require_util2();
  class PoseNet {
    constructor(net) {
      this.baseModel = net;
    }
    async estimatePoses(input, config) {
      const outputStride = config.outputStride;
      const height = input.shape[1];
      const width = input.shape[2];
      const resized = util.resizeTo(input, [config.inputResolution, config.inputResolution]);
      const {heatmapScores, offsets, displacementFwd, displacementBwd} = this.baseModel.predict(resized);
      const allTensorBuffers = await util.toTensorBuffers3D([heatmapScores, offsets, displacementFwd, displacementBwd]);
      const scoresBuffer = allTensorBuffers[0];
      const offsetsBuffer = allTensorBuffers[1];
      const displacementsFwdBuffer = allTensorBuffers[2];
      const displacementsBwdBuffer = allTensorBuffers[3];
      const poses = await decodeMultiple.decodeMultiplePoses(scoresBuffer, offsetsBuffer, displacementsFwdBuffer, displacementsBwdBuffer, outputStride, config.maxDetections, config.scoreThreshold, config.nmsRadius);
      const resultPoses = util.scaleAndFlipPoses(poses, [height, width], [config.inputResolution, config.inputResolution]);
      heatmapScores.dispose();
      offsets.dispose();
      displacementFwd.dispose();
      displacementBwd.dispose();
      resized.dispose();
      return resultPoses;
    }
    dispose() {
      this.baseModel.dispose();
    }
  }
  exports.PoseNet = PoseNet;
  async function loadMobileNet(config) {
    const graphModel = await tf2.loadGraphModel(config.modelPath);
    const mobilenet = new modelMobileNet.MobileNet(graphModel, config.outputStride);
    return new PoseNet(mobilenet);
  }
  async function load(config) {
    return loadMobileNet(config);
  }
  exports.load = load;
});

// src/posenet/posenet.js
var require_posenet = __commonJS((exports) => {
  const modelMobileNet = require_modelMobileNet();
  const modelPoseNet = require_modelPoseNet();
  const decodeMultiple = require_decodeMultiple();
  const keypoints = require_keypoints2();
  const util = require_util2();
  exports.load = modelPoseNet.load;
  exports.PoseNet = modelPoseNet.PoseNet;
  exports.MobileNet = modelMobileNet.MobileNet;
  exports.decodeMultiplePoses = decodeMultiple.decodeMultiplePoses;
  exports.partChannels = keypoints.partChannels;
  exports.partIds = keypoints.partIds;
  exports.partNames = keypoints.partNames;
  exports.poseChain = keypoints.poseChain;
  exports.getAdjacentKeyPoints = util.getAdjacentKeyPoints;
  exports.getBoundingBox = util.getBoundingBox;
  exports.getBoundingBoxPoints = util.getBoundingBoxPoints;
  exports.scaleAndFlipPoses = util.scaleAndFlipPoses;
  exports.scalePose = util.scalePose;
});

// src/handpose/box.js
var require_box2 = __commonJS((exports) => {
  const tf2 = require("@tensorflow/tfjs");
  function getBoxSize(box) {
    return [
      Math.abs(box.endPoint[0] - box.startPoint[0]),
      Math.abs(box.endPoint[1] - box.startPoint[1])
    ];
  }
  exports.getBoxSize = getBoxSize;
  function getBoxCenter(box) {
    return [
      box.startPoint[0] + (box.endPoint[0] - box.startPoint[0]) / 2,
      box.startPoint[1] + (box.endPoint[1] - box.startPoint[1]) / 2
    ];
  }
  exports.getBoxCenter = getBoxCenter;
  function cutBoxFromImageAndResize(box, image, cropSize) {
    const h = image.shape[1];
    const w = image.shape[2];
    const boxes = [[
      box.startPoint[1] / h,
      box.startPoint[0] / w,
      box.endPoint[1] / h,
      box.endPoint[0] / w
    ]];
    return tf2.image.cropAndResize(image, boxes, [0], cropSize);
  }
  exports.cutBoxFromImageAndResize = cutBoxFromImageAndResize;
  function scaleBoxCoordinates(box, factor) {
    const startPoint = [box.startPoint[0] * factor[0], box.startPoint[1] * factor[1]];
    const endPoint = [box.endPoint[0] * factor[0], box.endPoint[1] * factor[1]];
    const palmLandmarks = box.palmLandmarks.map((coord) => {
      const scaledCoord = [coord[0] * factor[0], coord[1] * factor[1]];
      return scaledCoord;
    });
    return {startPoint, endPoint, palmLandmarks};
  }
  exports.scaleBoxCoordinates = scaleBoxCoordinates;
  function enlargeBox(box, factor = 1.5) {
    const center = getBoxCenter(box);
    const size = getBoxSize(box);
    const newHalfSize = [factor * size[0] / 2, factor * size[1] / 2];
    const startPoint = [center[0] - newHalfSize[0], center[1] - newHalfSize[1]];
    const endPoint = [center[0] + newHalfSize[0], center[1] + newHalfSize[1]];
    return {startPoint, endPoint, palmLandmarks: box.palmLandmarks};
  }
  exports.enlargeBox = enlargeBox;
  function squarifyBox(box) {
    const centers = getBoxCenter(box);
    const size = getBoxSize(box);
    const maxEdge = Math.max(...size);
    const halfSize = maxEdge / 2;
    const startPoint = [centers[0] - halfSize, centers[1] - halfSize];
    const endPoint = [centers[0] + halfSize, centers[1] + halfSize];
    return {startPoint, endPoint, palmLandmarks: box.palmLandmarks};
  }
  exports.squarifyBox = squarifyBox;
  function shiftBox(box, shiftFactor) {
    const boxSize = [
      box.endPoint[0] - box.startPoint[0],
      box.endPoint[1] - box.startPoint[1]
    ];
    const shiftVector = [boxSize[0] * shiftFactor[0], boxSize[1] * shiftFactor[1]];
    const startPoint = [box.startPoint[0] + shiftVector[0], box.startPoint[1] + shiftVector[1]];
    const endPoint = [box.endPoint[0] + shiftVector[0], box.endPoint[1] + shiftVector[1]];
    return {startPoint, endPoint, palmLandmarks: box.palmLandmarks};
  }
  exports.shiftBox = shiftBox;
});

// src/handpose/handdetector.js
var require_handdetector = __commonJS((exports) => {
  const tf2 = require("@tensorflow/tfjs");
  const bounding = require_box2();
  class HandDetector {
    constructor(model, anchors, config) {
      this.model = model;
      this.width = config.inputSize;
      this.height = config.inputSize;
      this.anchors = anchors.map((anchor) => [anchor.x_center, anchor.y_center]);
      this.anchorsTensor = tf2.tensor2d(this.anchors);
      this.inputSizeTensor = tf2.tensor1d([config.inputSize, config.inputSize]);
      this.doubleInputSizeTensor = tf2.tensor1d([config.inputSize * 2, config.inputSize * 2]);
    }
    normalizeBoxes(boxes) {
      return tf2.tidy(() => {
        const boxOffsets = tf2.slice(boxes, [0, 0], [-1, 2]);
        const boxSizes = tf2.slice(boxes, [0, 2], [-1, 2]);
        const boxCenterPoints = tf2.add(tf2.div(boxOffsets, this.inputSizeTensor), this.anchorsTensor);
        const halfBoxSizes = tf2.div(boxSizes, this.doubleInputSizeTensor);
        const startPoints = tf2.mul(tf2.sub(boxCenterPoints, halfBoxSizes), this.inputSizeTensor);
        const endPoints = tf2.mul(tf2.add(boxCenterPoints, halfBoxSizes), this.inputSizeTensor);
        return tf2.concat2d([startPoints, endPoints], 1);
      });
    }
    normalizeLandmarks(rawPalmLandmarks, index) {
      return tf2.tidy(() => {
        const landmarks = tf2.add(tf2.div(rawPalmLandmarks.reshape([-1, 7, 2]), this.inputSizeTensor), this.anchors[index]);
        return tf2.mul(landmarks, this.inputSizeTensor);
      });
    }
    async getBoundingBoxes(input) {
      const batchedPrediction = this.model.predict(input);
      const prediction = batchedPrediction.squeeze();
      const scores = tf2.tidy(() => tf2.sigmoid(tf2.slice(prediction, [0, 0], [-1, 1])).squeeze());
      const rawBoxes = tf2.slice(prediction, [0, 1], [-1, 4]);
      const boxes = this.normalizeBoxes(rawBoxes);
      const boxesWithHandsTensor = await tf2.image.nonMaxSuppressionAsync(boxes, scores, this.maxHands, this.iouThreshold, this.scoreThreshold);
      const boxesWithHands = await boxesWithHandsTensor.array();
      const toDispose = [batchedPrediction, boxesWithHandsTensor, prediction, boxes, rawBoxes, scores];
      const detectedHands = tf2.tidy(() => {
        const detectedBoxes = [];
        for (const i in boxesWithHands) {
          const boxIndex = boxesWithHands[i];
          const matchingBox = tf2.slice(boxes, [boxIndex, 0], [1, -1]);
          const rawPalmLandmarks = tf2.slice(prediction, [boxIndex, 5], [1, 14]);
          const palmLandmarks = tf2.tidy(() => this.normalizeLandmarks(rawPalmLandmarks, boxIndex).reshape([-1, 2]));
          detectedBoxes.push({boxes: matchingBox, palmLandmarks});
        }
        return detectedBoxes;
      });
      toDispose.forEach((tensor) => tensor.dispose());
      return detectedHands;
    }
    async estimateHandBounds(input, config) {
      this.iouThreshold = config.iouThreshold;
      this.scoreThreshold = config.scoreThreshold;
      this.maxHands = config.maxHands;
      const resized = input.resizeBilinear([this.width, this.height]);
      const divided = resized.div(255);
      const normalized = divided.sub(0.5);
      const image = normalized.mul(2);
      resized.dispose();
      divided.dispose();
      normalized.dispose();
      const predictions = await this.getBoundingBoxes(image);
      image.dispose();
      if (!predictions || predictions.length === 0)
        return null;
      const hands = [];
      for (const i in predictions) {
        const prediction = predictions[i];
        const boundingBoxes = await prediction.boxes.array();
        const startPoint = boundingBoxes[0].slice(0, 2);
        const endPoint = boundingBoxes[0].slice(2, 4);
        const palmLandmarks = await prediction.palmLandmarks.array();
        prediction.boxes.dispose();
        prediction.palmLandmarks.dispose();
        hands.push(bounding.scaleBoxCoordinates({startPoint, endPoint, palmLandmarks}, [input.shape[2] / this.width, input.shape[1] / this.height]));
      }
      return hands;
    }
  }
  exports.HandDetector = HandDetector;
});

// src/handpose/keypoints.js
var require_keypoints3 = __commonJS((exports) => {
  exports.MESH_ANNOTATIONS = {
    thumb: [1, 2, 3, 4],
    indexFinger: [5, 6, 7, 8],
    middleFinger: [9, 10, 11, 12],
    ringFinger: [13, 14, 15, 16],
    pinky: [17, 18, 19, 20],
    palmBase: [0]
  };
});

// src/handpose/util.js
var require_util3 = __commonJS((exports) => {
  function normalizeRadians(angle) {
    return angle - 2 * Math.PI * Math.floor((angle + Math.PI) / (2 * Math.PI));
  }
  exports.normalizeRadians = normalizeRadians;
  function computeRotation(point1, point2) {
    const radians = Math.PI / 2 - Math.atan2(-(point2[1] - point1[1]), point2[0] - point1[0]);
    return normalizeRadians(radians);
  }
  exports.computeRotation = computeRotation;
  const buildTranslationMatrix = (x, y) => [[1, 0, x], [0, 1, y], [0, 0, 1]];
  function dot(v1, v2) {
    let product = 0;
    for (let i = 0; i < v1.length; i++) {
      product += v1[i] * v2[i];
    }
    return product;
  }
  exports.dot = dot;
  function getColumnFrom2DArr(arr, columnIndex) {
    const column = [];
    for (let i = 0; i < arr.length; i++) {
      column.push(arr[i][columnIndex]);
    }
    return column;
  }
  exports.getColumnFrom2DArr = getColumnFrom2DArr;
  function multiplyTransformMatrices(mat1, mat2) {
    const product = [];
    const size = mat1.length;
    for (let row = 0; row < size; row++) {
      product.push([]);
      for (let col = 0; col < size; col++) {
        product[row].push(dot(mat1[row], getColumnFrom2DArr(mat2, col)));
      }
    }
    return product;
  }
  function buildRotationMatrix(rotation, center) {
    const cosA = Math.cos(rotation);
    const sinA = Math.sin(rotation);
    const rotationMatrix = [[cosA, -sinA, 0], [sinA, cosA, 0], [0, 0, 1]];
    const translationMatrix = buildTranslationMatrix(center[0], center[1]);
    const translationTimesRotation = multiplyTransformMatrices(translationMatrix, rotationMatrix);
    const negativeTranslationMatrix = buildTranslationMatrix(-center[0], -center[1]);
    return multiplyTransformMatrices(translationTimesRotation, negativeTranslationMatrix);
  }
  exports.buildRotationMatrix = buildRotationMatrix;
  function invertTransformMatrix(matrix) {
    const rotationComponent = [[matrix[0][0], matrix[1][0]], [matrix[0][1], matrix[1][1]]];
    const translationComponent = [matrix[0][2], matrix[1][2]];
    const invertedTranslation = [
      -dot(rotationComponent[0], translationComponent),
      -dot(rotationComponent[1], translationComponent)
    ];
    return [
      rotationComponent[0].concat(invertedTranslation[0]),
      rotationComponent[1].concat(invertedTranslation[1]),
      [0, 0, 1]
    ];
  }
  exports.invertTransformMatrix = invertTransformMatrix;
  function rotatePoint(homogeneousCoordinate, rotationMatrix) {
    return [
      dot(homogeneousCoordinate, rotationMatrix[0]),
      dot(homogeneousCoordinate, rotationMatrix[1])
    ];
  }
  exports.rotatePoint = rotatePoint;
});

// src/handpose/pipeline.js
var require_pipeline2 = __commonJS((exports) => {
  const tf2 = require("@tensorflow/tfjs");
  const bounding = require_box2();
  const util = require_util3();
  const UPDATE_REGION_OF_INTEREST_IOU_THRESHOLD = 0.8;
  const PALM_BOX_SHIFT_VECTOR = [0, -0.4];
  const HAND_BOX_SHIFT_VECTOR = [0, -0.1];
  const HAND_BOX_ENLARGE_FACTOR = 1.65;
  const PALM_LANDMARK_IDS = [0, 5, 9, 13, 17, 1, 2];
  const PALM_LANDMARKS_INDEX_OF_PALM_BASE = 0;
  const PALM_LANDMARKS_INDEX_OF_MIDDLE_FINGER_BASE = 2;
  class HandPipeline {
    constructor(boundingBoxDetector, meshDetector, config) {
      this.regionsOfInterest = [];
      this.runsWithoutHandDetector = 0;
      this.boundingBoxDetector = boundingBoxDetector;
      this.meshDetector = meshDetector;
      this.meshWidth = config.inputSize;
      this.meshHeight = config.inputSize;
      this.enlargeFactor = config.enlargeFactor;
    }
    getBoxForPalmLandmarks(palmLandmarks, rotationMatrix) {
      const rotatedPalmLandmarks = palmLandmarks.map((coord) => {
        const homogeneousCoordinate = [...coord, 1];
        return util.rotatePoint(homogeneousCoordinate, rotationMatrix);
      });
      const boxAroundPalm = this.calculateLandmarksBoundingBox(rotatedPalmLandmarks);
      return bounding.enlargeBox(bounding.squarifyBox(bounding.shiftBox(boxAroundPalm, PALM_BOX_SHIFT_VECTOR)), this.enlargeFactor);
    }
    getBoxForHandLandmarks(landmarks) {
      const boundingBox = this.calculateLandmarksBoundingBox(landmarks);
      const boxAroundHand = bounding.enlargeBox(bounding.squarifyBox(bounding.shiftBox(boundingBox, HAND_BOX_SHIFT_VECTOR)), HAND_BOX_ENLARGE_FACTOR);
      const palmLandmarks = [];
      for (let i = 0; i < PALM_LANDMARK_IDS.length; i++) {
        palmLandmarks.push(landmarks[PALM_LANDMARK_IDS[i]].slice(0, 2));
      }
      boxAroundHand.palmLandmarks = palmLandmarks;
      return boxAroundHand;
    }
    transformRawCoords(rawCoords, box, angle, rotationMatrix) {
      const boxSize = bounding.getBoxSize(box);
      const scaleFactor = [boxSize[0] / this.meshWidth, boxSize[1] / this.meshHeight];
      const coordsScaled = rawCoords.map((coord) => [
        scaleFactor[0] * (coord[0] - this.meshWidth / 2),
        scaleFactor[1] * (coord[1] - this.meshHeight / 2),
        coord[2]
      ]);
      const coordsRotationMatrix = util.buildRotationMatrix(angle, [0, 0]);
      const coordsRotated = coordsScaled.map((coord) => {
        const rotated = util.rotatePoint(coord, coordsRotationMatrix);
        return [...rotated, coord[2]];
      });
      const inverseRotationMatrix = util.invertTransformMatrix(rotationMatrix);
      const boxCenter = [...bounding.getBoxCenter(box), 1];
      const originalBoxCenter = [
        util.dot(boxCenter, inverseRotationMatrix[0]),
        util.dot(boxCenter, inverseRotationMatrix[1])
      ];
      return coordsRotated.map((coord) => [
        coord[0] + originalBoxCenter[0],
        coord[1] + originalBoxCenter[1],
        coord[2]
      ]);
    }
    async estimateHands(image, config) {
      this.skipFrames = config.skipFrames;
      this.detectionConfidence = config.minConfidence;
      this.maxHands = config.maxHands;
      this.runsWithoutHandDetector++;
      const useFreshBox = this.shouldUpdateRegionsOfInterest();
      if (useFreshBox === true) {
        const boundingBoxPredictions = await this.boundingBoxDetector.estimateHandBounds(image, config);
        this.regionsOfInterest = [];
        for (const i in boundingBoxPredictions) {
          this.updateRegionsOfInterest(boundingBoxPredictions[i], true, i);
        }
        this.runsWithoutHandDetector = 0;
      }
      const hands = [];
      if (!this.regionsOfInterest)
        return hands;
      for (const i in this.regionsOfInterest) {
        const currentBox = this.regionsOfInterest[i][0];
        if (!currentBox)
          return hands;
        const angle = util.computeRotation(currentBox.palmLandmarks[PALM_LANDMARKS_INDEX_OF_PALM_BASE], currentBox.palmLandmarks[PALM_LANDMARKS_INDEX_OF_MIDDLE_FINGER_BASE]);
        const palmCenter = bounding.getBoxCenter(currentBox);
        const palmCenterNormalized = [palmCenter[0] / image.shape[2], palmCenter[1] / image.shape[1]];
        const rotatedImage = tf2.image.rotateWithOffset(image, angle, 0, palmCenterNormalized);
        const rotationMatrix = util.buildRotationMatrix(-angle, palmCenter);
        const box = useFreshBox ? this.getBoxForPalmLandmarks(currentBox.palmLandmarks, rotationMatrix) : currentBox;
        const croppedInput = bounding.cutBoxFromImageAndResize(box, rotatedImage, [this.meshWidth, this.meshHeight]);
        const handImage = croppedInput.div(255);
        croppedInput.dispose();
        rotatedImage.dispose();
        const prediction = this.meshDetector.predict(handImage);
        const [flag, keypoints] = prediction;
        handImage.dispose();
        const flagValue = flag.dataSync()[0];
        flag.dispose();
        if (flagValue < config.minConfidence) {
          keypoints.dispose();
          this.regionsOfInterest[i] = [];
          return hands;
        }
        const keypointsReshaped = tf2.reshape(keypoints, [-1, 3]);
        const rawCoords = await keypointsReshaped.array();
        keypoints.dispose();
        keypointsReshaped.dispose();
        const coords = this.transformRawCoords(rawCoords, box, angle, rotationMatrix);
        const nextBoundingBox = this.getBoxForHandLandmarks(coords);
        this.updateRegionsOfInterest(nextBoundingBox, false, i);
        const result = {
          landmarks: coords,
          confidence: flagValue,
          box: {
            topLeft: nextBoundingBox.startPoint,
            bottomRight: nextBoundingBox.endPoint
          }
        };
        hands.push(result);
      }
      return hands;
    }
    calculateLandmarksBoundingBox(landmarks) {
      const xs = landmarks.map((d) => d[0]);
      const ys = landmarks.map((d) => d[1]);
      const startPoint = [Math.min(...xs), Math.min(...ys)];
      const endPoint = [Math.max(...xs), Math.max(...ys)];
      return {startPoint, endPoint};
    }
    updateRegionsOfInterest(box, forceUpdate, index) {
      if (forceUpdate) {
        this.regionsOfInterest[index] = [box];
      } else {
        const previousBox = this.regionsOfInterest[index][0];
        let iou = 0;
        if (previousBox != null && previousBox.startPoint != null) {
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
        this.regionsOfInterest[index][0] = iou > UPDATE_REGION_OF_INTEREST_IOU_THRESHOLD ? previousBox : box;
      }
    }
    shouldUpdateRegionsOfInterest() {
      return !this.regionsOfInterest || this.regionsOfInterest.length === 0 || this.runsWithoutHandDetector >= this.skipFrames;
    }
  }
  exports.HandPipeline = HandPipeline;
});

// src/handpose/handpose.js
var require_handpose = __commonJS((exports) => {
  const tf2 = require("@tensorflow/tfjs");
  const hand = require_handdetector();
  const keypoints = require_keypoints3();
  const pipe = require_pipeline2();
  class HandPose {
    constructor(pipeline) {
      this.pipeline = pipeline;
    }
    async estimateHands(input, config) {
      this.skipFrames = config.skipFrames;
      this.detectionConfidence = config.minConfidence;
      this.maxHands = config.maxHands;
      const predictions = await this.pipeline.estimateHands(input, config);
      const hands = [];
      if (!predictions)
        return hands;
      for (const prediction of predictions) {
        if (!prediction)
          return [];
        const annotations = {};
        for (const key of Object.keys(keypoints.MESH_ANNOTATIONS)) {
          annotations[key] = keypoints.MESH_ANNOTATIONS[key].map((index) => prediction.landmarks[index]);
        }
        hands.push({
          confidence: prediction.confidence || 0,
          box: prediction.box ? [prediction.box.topLeft[0], prediction.box.topLeft[1], prediction.box.bottomRight[0] - prediction.box.topLeft[0], prediction.box.bottomRight[1] - prediction.box.topLeft[1]] : 0,
          landmarks: prediction.landmarks,
          annotations
        });
      }
      return hands;
    }
  }
  exports.HandPose = HandPose;
  async function loadAnchors(url) {
    if (tf2.env().features.IS_NODE) {
      const fs = require("fs");
      const data = await fs.readFileSync(url.replace("file://", ""));
      return JSON.parse(data);
    }
    return tf2.util.fetch(url).then((d) => d.json());
  }
  async function load(config) {
    const [anchors, handDetectorModel, handPoseModel] = await Promise.all([
      loadAnchors(config.detector.anchors),
      tf2.loadGraphModel(config.detector.modelPath, {fromTFHub: config.detector.modelPath.includes("tfhub.dev")}),
      tf2.loadGraphModel(config.skeleton.modelPath, {fromTFHub: config.skeleton.modelPath.includes("tfhub.dev")})
    ]);
    const detector = new hand.HandDetector(handDetectorModel, anchors, config);
    const pipeline = new pipe.HandPipeline(detector, handPoseModel, config);
    const handpose2 = new HandPose(pipeline);
    return handpose2;
  }
  exports.load = load;
});

// src/imagefx.js
var require_imagefx = __commonJS((exports) => {
  const WebGLProgram = function(gl, vertexSource, fragmentSource) {
    const _collect = function(source, prefix, collection) {
      const r = new RegExp("\\b" + prefix + " \\w+ (\\w+)", "ig");
      source.replace(r, (match, name) => {
        collection[name] = 0;
        return match;
      });
    };
    const _compile = function(source, type) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error("Filter: GL compile failed", gl.getShaderInfoLog(shader));
      }
      return shader;
    };
    this.uniform = {};
    this.attribute = {};
    const _vsh = _compile(vertexSource, gl.VERTEX_SHADER);
    const _fsh = _compile(fragmentSource, gl.FRAGMENT_SHADER);
    this.id = gl.createProgram();
    gl.attachShader(this.id, _vsh);
    gl.attachShader(this.id, _fsh);
    gl.linkProgram(this.id);
    if (!gl.getProgramParameter(this.id, gl.LINK_STATUS)) {
      throw new Error("Filter: GL link failed", gl.getProgramInfoLog(this.id));
    }
    gl.useProgram(this.id);
    _collect(vertexSource, "attribute", this.attribute);
    for (const a in this.attribute) {
      this.attribute[a] = gl.getAttribLocation(this.id, a);
    }
    _collect(vertexSource, "uniform", this.uniform);
    _collect(fragmentSource, "uniform", this.uniform);
    for (const u in this.uniform) {
      this.uniform[u] = gl.getUniformLocation(this.id, u);
    }
  };
  const WebGLImageFilter = function(params) {
    if (!params)
      params = {};
    let _drawCount = 0;
    let _sourceTexture = null;
    let _lastInChain = false;
    let _currentFramebufferIndex = -1;
    let _tempFramebuffers = [null, null];
    let _filterChain = [];
    let _width = -1;
    let _height = -1;
    let _vertexBuffer = null;
    let _currentProgram = null;
    const _canvas = params.canvas || document.createElement("canvas");
    const _shaderProgramCache = {};
    const gl = _canvas.getContext("webgl") || _canvas.getContext("experimental-webgl");
    if (!gl)
      throw new Error("Filter: getContext() failed");
    this.addFilter = function(name) {
      const args = Array.prototype.slice.call(arguments, 1);
      const filter = _filter[name];
      _filterChain.push({func: filter, args});
    };
    this.reset = function() {
      _filterChain = [];
    };
    this.apply = function(image) {
      _resize(image.width, image.height);
      _drawCount = 0;
      if (!_sourceTexture)
        _sourceTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, _sourceTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      if (_filterChain.length === 0) {
        _draw();
        return _canvas;
      }
      for (let i = 0; i < _filterChain.length; i++) {
        _lastInChain = i === _filterChain.length - 1;
        const f = _filterChain[i];
        f.func.apply(this, f.args || []);
      }
      return _canvas;
    };
    const _resize = function(width, height) {
      if (width === _width && height === _height) {
        return;
      }
      _canvas.width = width;
      _width = width;
      _canvas.height = height;
      _height = height;
      if (!_vertexBuffer) {
        const vertices = new Float32Array([
          -1,
          -1,
          0,
          1,
          1,
          -1,
          1,
          1,
          -1,
          1,
          0,
          0,
          -1,
          1,
          0,
          0,
          1,
          -1,
          1,
          1,
          1,
          1,
          1,
          0
        ]);
        _vertexBuffer = gl.createBuffer(), gl.bindBuffer(gl.ARRAY_BUFFER, _vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      }
      gl.viewport(0, 0, _width, _height);
      _tempFramebuffers = [null, null];
    };
    const _getTempFramebuffer = function(index) {
      _tempFramebuffers[index] = _tempFramebuffers[index] || _createFramebufferTexture(_width, _height);
      return _tempFramebuffers[index];
    };
    const _createFramebufferTexture = function(width, height) {
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      const renderbuffer = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return {fbo, texture};
    };
    const _draw = function(flags) {
      let source = null;
      let target = null;
      let flipY = false;
      if (_drawCount === 0) {
        source = _sourceTexture;
      } else {
        source = _getTempFramebuffer(_currentFramebufferIndex).texture;
      }
      _drawCount++;
      if (_lastInChain && !(flags & DRAW.INTERMEDIATE)) {
        target = null;
        flipY = _drawCount % 2 === 0;
      } else {
        _currentFramebufferIndex = (_currentFramebufferIndex + 1) % 2;
        target = _getTempFramebuffer(_currentFramebufferIndex).fbo;
      }
      gl.bindTexture(gl.TEXTURE_2D, source);
      gl.bindFramebuffer(gl.FRAMEBUFFER, target);
      gl.uniform1f(_currentProgram.uniform.flipY, flipY ? -1 : 1);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    const _compileShader = function(fragmentSource) {
      if (_shaderProgramCache[fragmentSource]) {
        _currentProgram = _shaderProgramCache[fragmentSource];
        gl.useProgram(_currentProgram.id);
        return _currentProgram;
      }
      _currentProgram = new WebGLProgram(gl, SHADER.VERTEX_IDENTITY, fragmentSource);
      const floatSize = Float32Array.BYTES_PER_ELEMENT;
      const vertSize = 4 * floatSize;
      gl.enableVertexAttribArray(_currentProgram.attribute.pos);
      gl.vertexAttribPointer(_currentProgram.attribute.pos, 2, gl.FLOAT, false, vertSize, 0 * floatSize);
      gl.enableVertexAttribArray(_currentProgram.attribute.uv);
      gl.vertexAttribPointer(_currentProgram.attribute.uv, 2, gl.FLOAT, false, vertSize, 2 * floatSize);
      _shaderProgramCache[fragmentSource] = _currentProgram;
      return _currentProgram;
    };
    let DRAW = {INTERMEDIATE: 1};
    let SHADER = {};
    SHADER.VERTEX_IDENTITY = [
      "precision highp float;",
      "attribute vec2 pos;",
      "attribute vec2 uv;",
      "varying vec2 vUv;",
      "uniform float flipY;",
      "void main(void) {",
      "vUv = uv;",
      "gl_Position = vec4(pos.x, pos.y*flipY, 0.0, 1.);",
      "}"
    ].join("\n");
    SHADER.FRAGMENT_IDENTITY = [
      "precision highp float;",
      "varying vec2 vUv;",
      "uniform sampler2D texture;",
      "void main(void) {",
      "gl_FragColor = texture2D(texture, vUv);",
      "}"
    ].join("\n");
    let _filter = {};
    _filter.colorMatrix = function(matrix) {
      const m = new Float32Array(matrix);
      m[4] /= 255;
      m[9] /= 255;
      m[14] /= 255;
      m[19] /= 255;
      const shader = m[18] === 1 && m[3] === 0 && m[8] === 0 && m[13] === 0 && m[15] === 0 && m[16] === 0 && m[17] === 0 && m[19] === 0 ? _filter.colorMatrix.SHADER.WITHOUT_ALPHA : _filter.colorMatrix.SHADER.WITH_ALPHA;
      const program = _compileShader(shader);
      gl.uniform1fv(program.uniform.m, m);
      _draw();
    };
    _filter.colorMatrix.SHADER = {};
    _filter.colorMatrix.SHADER.WITH_ALPHA = [
      "precision highp float;",
      "varying vec2 vUv;",
      "uniform sampler2D texture;",
      "uniform float m[20];",
      "void main(void) {",
      "vec4 c = texture2D(texture, vUv);",
      "gl_FragColor.r = m[0] * c.r + m[1] * c.g + m[2] * c.b + m[3] * c.a + m[4];",
      "gl_FragColor.g = m[5] * c.r + m[6] * c.g + m[7] * c.b + m[8] * c.a + m[9];",
      "gl_FragColor.b = m[10] * c.r + m[11] * c.g + m[12] * c.b + m[13] * c.a + m[14];",
      "gl_FragColor.a = m[15] * c.r + m[16] * c.g + m[17] * c.b + m[18] * c.a + m[19];",
      "}"
    ].join("\n");
    _filter.colorMatrix.SHADER.WITHOUT_ALPHA = [
      "precision highp float;",
      "varying vec2 vUv;",
      "uniform sampler2D texture;",
      "uniform float m[20];",
      "void main(void) {",
      "vec4 c = texture2D(texture, vUv);",
      "gl_FragColor.r = m[0] * c.r + m[1] * c.g + m[2] * c.b + m[4];",
      "gl_FragColor.g = m[5] * c.r + m[6] * c.g + m[7] * c.b + m[9];",
      "gl_FragColor.b = m[10] * c.r + m[11] * c.g + m[12] * c.b + m[14];",
      "gl_FragColor.a = c.a;",
      "}"
    ].join("\n");
    _filter.brightness = function(brightness) {
      const b = (brightness || 0) + 1;
      _filter.colorMatrix([
        b,
        0,
        0,
        0,
        0,
        0,
        b,
        0,
        0,
        0,
        0,
        0,
        b,
        0,
        0,
        0,
        0,
        0,
        1,
        0
      ]);
    };
    _filter.saturation = function(amount) {
      const x = (amount || 0) * 2 / 3 + 1;
      const y = (x - 1) * -0.5;
      _filter.colorMatrix([
        x,
        y,
        y,
        0,
        0,
        y,
        x,
        y,
        0,
        0,
        y,
        y,
        x,
        0,
        0,
        0,
        0,
        0,
        1,
        0
      ]);
    };
    _filter.desaturate = function() {
      _filter.saturation(-1);
    };
    _filter.contrast = function(amount) {
      const v = (amount || 0) + 1;
      const o = -128 * (v - 1);
      _filter.colorMatrix([
        v,
        0,
        0,
        0,
        o,
        0,
        v,
        0,
        0,
        o,
        0,
        0,
        v,
        0,
        o,
        0,
        0,
        0,
        1,
        0
      ]);
    };
    _filter.negative = function() {
      _filter.contrast(-2);
    };
    _filter.hue = function(rotation) {
      rotation = (rotation || 0) / 180 * Math.PI;
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);
      const lumR = 0.213;
      const lumG = 0.715;
      const lumB = 0.072;
      _filter.colorMatrix([
        lumR + cos * (1 - lumR) + sin * -lumR,
        lumG + cos * -lumG + sin * -lumG,
        lumB + cos * -lumB + sin * (1 - lumB),
        0,
        0,
        lumR + cos * -lumR + sin * 0.143,
        lumG + cos * (1 - lumG) + sin * 0.14,
        lumB + cos * -lumB + sin * -0.283,
        0,
        0,
        lumR + cos * -lumR + sin * -(1 - lumR),
        lumG + cos * -lumG + sin * lumG,
        lumB + cos * (1 - lumB) + sin * lumB,
        0,
        0,
        0,
        0,
        0,
        1,
        0
      ]);
    };
    _filter.desaturateLuminance = function() {
      _filter.colorMatrix([
        0.2764723,
        0.929708,
        0.0938197,
        0,
        -37.1,
        0.2764723,
        0.929708,
        0.0938197,
        0,
        -37.1,
        0.2764723,
        0.929708,
        0.0938197,
        0,
        -37.1,
        0,
        0,
        0,
        1,
        0
      ]);
    };
    _filter.sepia = function() {
      _filter.colorMatrix([
        0.393,
        0.7689999,
        0.18899999,
        0,
        0,
        0.349,
        0.6859999,
        0.16799999,
        0,
        0,
        0.272,
        0.5339999,
        0.13099999,
        0,
        0,
        0,
        0,
        0,
        1,
        0
      ]);
    };
    _filter.brownie = function() {
      _filter.colorMatrix([
        0.5997023498159715,
        0.34553243048391263,
        -0.2708298674538042,
        0,
        47.43192855600873,
        -0.037703249837783157,
        0.8609577587992641,
        0.15059552388459913,
        0,
        -36.96841498319127,
        0.24113635128153335,
        -0.07441037908422492,
        0.44972182064877153,
        0,
        -7.562075277591283,
        0,
        0,
        0,
        1,
        0
      ]);
    };
    _filter.vintagePinhole = function() {
      _filter.colorMatrix([
        0.6279345635605994,
        0.3202183420819367,
        -0.03965408211312453,
        0,
        9.651285835294123,
        0.02578397704808868,
        0.6441188644374771,
        0.03259127616149294,
        0,
        7.462829176470591,
        0.0466055556782719,
        -0.0851232987247891,
        0.5241648018700465,
        0,
        5.159190588235296,
        0,
        0,
        0,
        1,
        0
      ]);
    };
    _filter.kodachrome = function() {
      _filter.colorMatrix([
        1.1285582396593525,
        -0.3967382283601348,
        -0.03992559172921793,
        0,
        63.72958762196502,
        -0.16404339962244616,
        1.0835251566291304,
        -0.05498805115633132,
        0,
        24.732407896706203,
        -0.16786010706155763,
        -0.5603416277695248,
        1.6014850761964943,
        0,
        35.62982807460946,
        0,
        0,
        0,
        1,
        0
      ]);
    };
    _filter.technicolor = function() {
      _filter.colorMatrix([
        1.9125277891456083,
        -0.8545344976951645,
        -0.09155508482755585,
        0,
        11.793603434377337,
        -0.3087833385928097,
        1.7658908555458428,
        -0.10601743074722245,
        0,
        -70.35205161461398,
        -0.231103377548616,
        -0.7501899197440212,
        1.847597816108189,
        0,
        30.950940869491138,
        0,
        0,
        0,
        1,
        0
      ]);
    };
    _filter.polaroid = function() {
      _filter.colorMatrix([
        1.438,
        -0.062,
        -0.062,
        0,
        0,
        -0.122,
        1.378,
        -0.122,
        0,
        0,
        -0.016,
        -0.016,
        1.483,
        0,
        0,
        0,
        0,
        0,
        1,
        0
      ]);
    };
    _filter.shiftToBGR = function() {
      _filter.colorMatrix([
        0,
        0,
        1,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1,
        0
      ]);
    };
    _filter.convolution = function(matrix) {
      const m = new Float32Array(matrix);
      const pixelSizeX = 1 / _width;
      const pixelSizeY = 1 / _height;
      const program = _compileShader(_filter.convolution.SHADER);
      gl.uniform1fv(program.uniform.m, m);
      gl.uniform2f(program.uniform.px, pixelSizeX, pixelSizeY);
      _draw();
    };
    _filter.convolution.SHADER = [
      "precision highp float;",
      "varying vec2 vUv;",
      "uniform sampler2D texture;",
      "uniform vec2 px;",
      "uniform float m[9];",
      "void main(void) {",
      "vec4 c11 = texture2D(texture, vUv - px);",
      "vec4 c12 = texture2D(texture, vec2(vUv.x, vUv.y - px.y));",
      "vec4 c13 = texture2D(texture, vec2(vUv.x + px.x, vUv.y - px.y));",
      "vec4 c21 = texture2D(texture, vec2(vUv.x - px.x, vUv.y) );",
      "vec4 c22 = texture2D(texture, vUv);",
      "vec4 c23 = texture2D(texture, vec2(vUv.x + px.x, vUv.y) );",
      "vec4 c31 = texture2D(texture, vec2(vUv.x - px.x, vUv.y + px.y) );",
      "vec4 c32 = texture2D(texture, vec2(vUv.x, vUv.y + px.y) );",
      "vec4 c33 = texture2D(texture, vUv + px );",
      "gl_FragColor = ",
      "c11 * m[0] + c12 * m[1] + c22 * m[2] +",
      "c21 * m[3] + c22 * m[4] + c23 * m[5] +",
      "c31 * m[6] + c32 * m[7] + c33 * m[8];",
      "gl_FragColor.a = c22.a;",
      "}"
    ].join("\n");
    _filter.detectEdges = function() {
      _filter.convolution.call(this, [
        0,
        1,
        0,
        1,
        -4,
        1,
        0,
        1,
        0
      ]);
    };
    _filter.sobelX = function() {
      _filter.convolution.call(this, [
        -1,
        0,
        1,
        -2,
        0,
        2,
        -1,
        0,
        1
      ]);
    };
    _filter.sobelY = function() {
      _filter.convolution.call(this, [
        -1,
        -2,
        -1,
        0,
        0,
        0,
        1,
        2,
        1
      ]);
    };
    _filter.sharpen = function(amount) {
      const a = amount || 1;
      _filter.convolution.call(this, [
        0,
        -1 * a,
        0,
        -1 * a,
        1 + 4 * a,
        -1 * a,
        0,
        -1 * a,
        0
      ]);
    };
    _filter.emboss = function(size) {
      const s = size || 1;
      _filter.convolution.call(this, [
        -2 * s,
        -1 * s,
        0,
        -1 * s,
        1,
        1 * s,
        0,
        1 * s,
        2 * s
      ]);
    };
    _filter.blur = function(size) {
      const blurSizeX = size / 7 / _width;
      const blurSizeY = size / 7 / _height;
      const program = _compileShader(_filter.blur.SHADER);
      gl.uniform2f(program.uniform.px, 0, blurSizeY);
      _draw(DRAW.INTERMEDIATE);
      gl.uniform2f(program.uniform.px, blurSizeX, 0);
      _draw();
    };
    _filter.blur.SHADER = [
      "precision highp float;",
      "varying vec2 vUv;",
      "uniform sampler2D texture;",
      "uniform vec2 px;",
      "void main(void) {",
      "gl_FragColor = vec4(0.0);",
      "gl_FragColor += texture2D(texture, vUv + vec2(-7.0*px.x, -7.0*px.y))*0.0044299121055113265;",
      "gl_FragColor += texture2D(texture, vUv + vec2(-6.0*px.x, -6.0*px.y))*0.00895781211794;",
      "gl_FragColor += texture2D(texture, vUv + vec2(-5.0*px.x, -5.0*px.y))*0.0215963866053;",
      "gl_FragColor += texture2D(texture, vUv + vec2(-4.0*px.x, -4.0*px.y))*0.0443683338718;",
      "gl_FragColor += texture2D(texture, vUv + vec2(-3.0*px.x, -3.0*px.y))*0.0776744219933;",
      "gl_FragColor += texture2D(texture, vUv + vec2(-2.0*px.x, -2.0*px.y))*0.115876621105;",
      "gl_FragColor += texture2D(texture, vUv + vec2(-1.0*px.x, -1.0*px.y))*0.147308056121;",
      "gl_FragColor += texture2D(texture, vUv                             )*0.159576912161;",
      "gl_FragColor += texture2D(texture, vUv + vec2( 1.0*px.x,  1.0*px.y))*0.147308056121;",
      "gl_FragColor += texture2D(texture, vUv + vec2( 2.0*px.x,  2.0*px.y))*0.115876621105;",
      "gl_FragColor += texture2D(texture, vUv + vec2( 3.0*px.x,  3.0*px.y))*0.0776744219933;",
      "gl_FragColor += texture2D(texture, vUv + vec2( 4.0*px.x,  4.0*px.y))*0.0443683338718;",
      "gl_FragColor += texture2D(texture, vUv + vec2( 5.0*px.x,  5.0*px.y))*0.0215963866053;",
      "gl_FragColor += texture2D(texture, vUv + vec2( 6.0*px.x,  6.0*px.y))*0.00895781211794;",
      "gl_FragColor += texture2D(texture, vUv + vec2( 7.0*px.x,  7.0*px.y))*0.0044299121055113265;",
      "}"
    ].join("\n");
    _filter.pixelate = function(size) {
      const blurSizeX = size / _width;
      const blurSizeY = size / _height;
      const program = _compileShader(_filter.pixelate.SHADER);
      gl.uniform2f(program.uniform.size, blurSizeX, blurSizeY);
      _draw();
    };
    _filter.pixelate.SHADER = [
      "precision highp float;",
      "varying vec2 vUv;",
      "uniform vec2 size;",
      "uniform sampler2D texture;",
      "vec2 pixelate(vec2 coord, vec2 size) {",
      "return floor( coord / size ) * size;",
      "}",
      "void main(void) {",
      "gl_FragColor = vec4(0.0);",
      "vec2 coord = pixelate(vUv, size);",
      "gl_FragColor += texture2D(texture, coord);",
      "}"
    ].join("\n");
  };
  exports.Canvas = WebGLImageFilter;
});

// config.js
var require_config = __commonJS((exports) => {
  __export(exports, {
    default: () => config_default
  });
  var config_default = {
    backend: "webgl",
    console: true,
    profile: false,
    deallocate: false,
    scoped: false,
    videoOptimized: true,
    filter: {
      enabled: true,
      width: 0,
      height: 0,
      return: true,
      brightness: 0,
      contrast: 0,
      sharpness: 0,
      blur: 0,
      saturation: 0,
      hue: 0,
      negative: false,
      sepia: false,
      vintage: false,
      kodachrome: false,
      technicolor: false,
      polaroid: false,
      pixelate: 0
    },
    face: {
      enabled: true,
      detector: {
        modelPath: "../models/blazeface/back/model.json",
        inputSize: 256,
        maxFaces: 10,
        skipFrames: 10,
        minConfidence: 0.5,
        iouThreshold: 0.3,
        scoreThreshold: 0.7
      },
      mesh: {
        enabled: true,
        modelPath: "../models/facemesh/model.json",
        inputSize: 192
      },
      iris: {
        enabled: true,
        modelPath: "../models/iris/model.json",
        enlargeFactor: 2.3,
        inputSize: 64
      },
      age: {
        enabled: true,
        modelPath: "../models/ssrnet-age/imdb/model.json",
        inputSize: 64,
        skipFrames: 10
      },
      gender: {
        enabled: true,
        minConfidence: 0.8,
        modelPath: "../models/ssrnet-gender/imdb/model.json"
      },
      emotion: {
        enabled: true,
        inputSize: 64,
        minConfidence: 0.5,
        skipFrames: 10,
        modelPath: "../models/emotion/model.json"
      }
    },
    body: {
      enabled: true,
      modelPath: "../models/posenet/model.json",
      inputResolution: 257,
      outputStride: 16,
      maxDetections: 10,
      scoreThreshold: 0.7,
      nmsRadius: 20
    },
    hand: {
      enabled: true,
      inputSize: 256,
      skipFrames: 10,
      minConfidence: 0.5,
      iouThreshold: 0.3,
      scoreThreshold: 0.7,
      enlargeFactor: 1.65,
      maxHands: 10,
      detector: {
        anchors: "../models/handdetect/anchors.json",
        modelPath: "../models/handdetect/model.json"
      },
      skeleton: {
        modelPath: "../models/handskeleton/model.json"
      }
    }
  };
});

// package.json
var require_package = __commonJS((exports, module) => {
  module.exports = {
    name: "@vladmandic/human",
    version: "0.5.5",
    description: "human: 3D Face Detection, Iris Tracking and Age & Gender Prediction",
    sideEffects: false,
    main: "dist/human.node.js",
    module: "dist/human.esm.js",
    browser: "dist/human.esm.js",
    author: "Vladimir Mandic <mandic00@live.com>",
    bugs: {
      url: "https://github.com/vladmandic/human/issues"
    },
    homepage: "https://github.com/vladmandic/human#readme",
    license: "MIT",
    engines: {
      node: ">=14.0.0"
    },
    repository: {
      type: "git",
      url: "git+https://github.com/vladmandic/human.git"
    },
    dependencies: {},
    peerDependencies: {},
    devDependencies: {
      "@tensorflow/tfjs": "^2.7.0",
      "@tensorflow/tfjs-node": "^2.7.0",
      "@vladmandic/pilogger": "^0.2.7",
      dayjs: "^1.9.4",
      esbuild: "^0.7.22",
      eslint: "^7.12.1",
      "eslint-config-airbnb-base": "^14.2.0",
      "eslint-plugin-import": "^2.22.1",
      "eslint-plugin-json": "^2.1.2",
      "eslint-plugin-node": "^11.1.0",
      "eslint-plugin-promise": "^4.2.1",
      rimraf: "^3.0.2",
      seedrandom: "^3.0.5",
      "simple-git": "^2.21.0"
    },
    scripts: {
      start: "node --trace-warnings --unhandled-rejections=strict --trace-uncaught --no-deprecation src/node.js",
      lint: "eslint src/*.js demo/*.js",
      "build-iife": "esbuild --bundle --platform=browser --sourcemap --target=esnext --format=iife --external:fs --global-name=Human --metafile=dist/human.json --outfile=dist/human.js src/human.js",
      "build-esm-bundle": "esbuild --bundle --platform=browser --sourcemap --target=esnext --format=esm --external:fs --metafile=dist/human.esm.json --outfile=dist/human.esm.js src/human.js",
      "build-esm-nobundle": "esbuild --bundle --platform=browser --sourcemap --target=esnext --format=esm --external:@tensorflow --external:fs --metafile=dist/human.esm-nobundle.json --outfile=dist/human.esm-nobundle.js src/human.js",
      "build-node": "esbuild --bundle --platform=node --sourcemap --target=esnext --format=cjs --metafile=dist/human.node.json --outfile=dist/human.node.js src/human.js",
      "build-node-nobundle": "esbuild --bundle --platform=node --sourcemap --target=esnext --format=cjs --external:@tensorflow --metafile=dist/human.node.json --outfile=dist/human.node-nobundle.js src/human.js",
      build: "rimraf dist/* && npm run build-iife && npm run build-esm-bundle && npm run build-esm-nobundle && npm run build-node && npm run build-node-nobundle && ls -l dist/",
      update: "npm update --depth 20 --force && npm dedupe && npm prune && npm audit",
      changelog: "node changelog.js"
    },
    keywords: [
      "tensorflowjs",
      "face-detection",
      "face-geometry",
      "body-tracking",
      "hand-tracking",
      "iris-tracking",
      "age-estimation",
      "emotion-detection",
      "gender-prediction",
      "gesture-recognition"
    ]
  };
});

// src/human.js
const tf = require("@tensorflow/tfjs");
const facemesh = require_facemesh();
const ssrnet = require_ssrnet();
const emotion = require_emotion();
const posenet = require_posenet();
const handpose = require_handpose();
const fxImage = require_imagefx();
const profile = require_profile();
const defaults = require_config().default;
const app = require_package();
let first = true;
const override = {
  face: {detector: {skipFrames: 0}, age: {skipFrames: 0}, emotion: {skipFrames: 0}},
  hand: {skipFrames: 0}
};
const now = () => {
  if (typeof performance !== "undefined")
    return performance.now();
  return parseInt(Number(process.hrtime.bigint()) / 1e3 / 1e3);
};
function mergeDeep(...objects) {
  const isObject = (obj) => obj && typeof obj === "object";
  return objects.reduce((prev, obj) => {
    Object.keys(obj || {}).forEach((key) => {
      const pVal = prev[key];
      const oVal = obj[key];
      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        prev[key] = pVal.concat(...oVal);
      } else if (isObject(pVal) && isObject(oVal)) {
        prev[key] = mergeDeep(pVal, oVal);
      } else {
        prev[key] = oVal;
      }
    });
    return prev;
  }, {});
}
function sanity(input) {
  if (!input)
    return "input is not defined";
  if (tf.ENV.flags.IS_NODE && !(input instanceof tf.Tensor)) {
    return "input must be a tensor";
  }
  try {
    tf.getBackend();
  } catch {
    return "backend not loaded";
  }
  return null;
}
class Human {
  constructor() {
    this.tf = tf;
    this.version = app.version;
    this.defaults = defaults;
    this.config = defaults;
    this.fx = null;
    this.state = "idle";
    this.numTensors = 0;
    this.analyzeMemoryLeaks = false;
    this.inCanvas = null;
    this.outCanvas = null;
    this.models = {
      facemesh: null,
      posenet: null,
      handpose: null,
      iris: null,
      age: null,
      gender: null,
      emotion: null
    };
    this.facemesh = facemesh;
    this.ssrnet = ssrnet;
    this.emotion = emotion;
    this.posenet = posenet;
    this.handpose = handpose;
  }
  log(...msg) {
    if (msg && this.config.console)
      console.log("Human:", ...msg);
  }
  profile() {
    if (this.config.profile)
      return profile.data;
    return {};
  }
  analyze(...msg) {
    if (!this.analyzeMemoryLeaks)
      return;
    const current = tf.engine().state.numTensors;
    const previous = this.numTensors;
    this.numTensors = current;
    const leaked = current - previous;
    if (leaked !== 0)
      this.log(...msg, leaked);
  }
  async load(userConfig) {
    if (userConfig)
      this.config = mergeDeep(defaults, userConfig);
    if (this.config.face.enabled && !this.models.facemesh) {
      this.log("Load model: Face");
      this.models.facemesh = await facemesh.load(this.config.face);
    }
    if (this.config.body.enabled && !this.models.posenet) {
      this.log("Load model: Body");
      this.models.posenet = await posenet.load(this.config.body);
    }
    if (this.config.hand.enabled && !this.models.handpose) {
      this.log("Load model: Hand");
      this.models.handpose = await handpose.load(this.config.hand);
    }
    if (this.config.face.enabled && this.config.face.age.enabled && !this.models.age) {
      this.log("Load model: Age");
      this.models.age = await ssrnet.loadAge(this.config);
    }
    if (this.config.face.enabled && this.config.face.gender.enabled && !this.models.gender) {
      this.log("Load model: Gender");
      this.models.gender = await ssrnet.loadGender(this.config);
    }
    if (this.config.face.enabled && this.config.face.emotion.enabled && !this.models.emotion) {
      this.log("Load model: Emotion");
      this.models.emotion = await emotion.load(this.config);
    }
  }
  async checkBackend() {
    if (tf.getBackend() !== this.config.backend) {
      this.state = "backend";
      this.log("Setting backend:", this.config.backend);
      await tf.setBackend(this.config.backend);
      tf.enableProdMode();
      if (this.config.deallocate && this.config.backend === "webgl") {
        this.log("Changing WebGL: WEBGL_DELETE_TEXTURE_THRESHOLD:", this.config.deallocate);
        tf.ENV.set("WEBGL_DELETE_TEXTURE_THRESHOLD", this.config.deallocate ? 0 : -1);
      }
      await tf.ready();
    }
  }
  tfImage(input) {
    let tensor;
    if (input instanceof tf.Tensor) {
      tensor = tf.clone(input);
    } else {
      const originalWidth = input.naturalWidth || input.videoWidth || input.width || input.shape && input.shape[1] > 0;
      const originalHeight = input.naturalHeight || input.videoHeight || input.height || input.shape && input.shape[2] > 0;
      let targetWidth = originalWidth;
      let targetHeight = originalHeight;
      if (this.config.filter.width > 0)
        targetWidth = this.config.filter.width;
      else if (this.config.filter.height > 0)
        targetWidth = originalWidth * (this.config.filter.height / originalHeight);
      if (this.config.filter.height > 0)
        targetHeight = this.config.filter.height;
      else if (this.config.filter.width > 0)
        targetHeight = originalHeight * (this.config.filter.width / originalWidth);
      if (!this.inCanvas || this.inCanvas.width !== originalWidth || this.inCanvas.height !== originalHeight) {
        this.inCanvas = typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(targetWidth, targetHeight) : document.createElement("canvas");
        if (this.inCanvas.width !== targetWidth)
          this.inCanvas.width = targetWidth;
        if (this.inCanvas.height !== targetHeight)
          this.inCanvas.height = targetHeight;
      }
      const ctx = this.inCanvas.getContext("2d");
      if (input instanceof ImageData)
        ctx.putImageData(input, 0, 0);
      else
        ctx.drawImage(input, 0, 0, originalWidth, originalHeight, 0, 0, this.inCanvas.width, this.inCanvas.height);
      if (this.config.filter.enabled) {
        if (!this.outCanvas || this.inCanvas.width !== this.outCanvas.width || this.inCanvas.height !== this.outCanvas.height) {
          this.outCanvas = typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(this.inCanvas.width, this.inCanvas.height) : document.createElement("canvas");
          if (this.outCanvas.width !== this.inCanvas.width)
            this.outCanvas.width = this.inCanvas.width;
          if (this.outCanvas.height !== this.inCanvas.height)
            this.outCanvas.height = this.inCanvas.height;
        }
        if (!this.fx)
          this.fx = tf.ENV.flags.IS_BROWSER && typeof document !== "undefined" ? new fxImage.Canvas({canvas: this.outCanvas}) : null;
        this.fx.reset();
        this.fx.addFilter("brightness", this.config.filter.brightness);
        if (this.config.filter.contrast !== 0)
          this.fx.addFilter("contrast", this.config.filter.contrast);
        if (this.config.filter.sharpness !== 0)
          this.fx.addFilter("sharpen", this.config.filter.sharpness);
        if (this.config.filter.blur !== 0)
          this.fx.addFilter("blur", this.config.filter.blur);
        if (this.config.filter.saturation !== 0)
          this.fx.addFilter("saturation", this.config.filter.saturation);
        if (this.config.filter.hue !== 0)
          this.fx.addFilter("hue", this.config.filter.hue);
        if (this.config.filter.negative)
          this.fx.addFilter("negative");
        if (this.config.filter.sepia)
          this.fx.addFilter("sepia");
        if (this.config.filter.vintage)
          this.fx.addFilter("brownie");
        if (this.config.filter.sepia)
          this.fx.addFilter("sepia");
        if (this.config.filter.kodachrome)
          this.fx.addFilter("kodachrome");
        if (this.config.filter.technicolor)
          this.fx.addFilter("technicolor");
        if (this.config.filter.polaroid)
          this.fx.addFilter("polaroid");
        if (this.config.filter.pixelate !== 0)
          this.fx.addFilter("pixelate", this.config.filter.pixelate);
        this.outCanvas = this.fx.apply(this.inCanvas);
      }
      if (!this.outCanvas)
        this.outCanvas = this.inCanvas;
      let pixels;
      if (this.config.backend === "webgl" || this.outCanvas instanceof ImageData) {
        pixels = tf.browser.fromPixels(this.outCanvas);
      } else {
        const tempCanvas = typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(targetWidth, targetHeight) : document.createElement("canvas");
        tempCanvas.width = targetWidth;
        tempCanvas.height = targetHeight;
        const tempCtx = tempCanvas.getContext("2d");
        tempCtx.drawImage(this.outCanvas, 0, 0);
        const data = tempCtx.getImageData(0, 0, targetWidth, targetHeight);
        pixels = tf.browser.fromPixels(data);
      }
      const casted = pixels.toFloat();
      tensor = casted.expandDims(0);
      pixels.dispose();
      casted.dispose();
    }
    return {tensor, canvas: this.config.filter.return ? this.outCanvas : null};
  }
  async detect(input, userConfig = {}) {
    this.state = "config";
    const perf = {};
    let timeStamp;
    this.config = mergeDeep(defaults, userConfig);
    if (!this.config.videoOptimized)
      this.config = mergeDeep(this.config, override);
    this.state = "check";
    const error = sanity(input);
    if (error) {
      this.log(error, input);
      return {error};
    }
    return new Promise(async (resolve) => {
      const timeStart = now();
      timeStamp = now();
      await this.checkBackend();
      perf.backend = Math.trunc(now() - timeStamp);
      if (first) {
        this.log("Starting");
        this.log("Configuration:", this.config);
        this.log("Flags:", tf.ENV.flags);
        first = false;
      }
      timeStamp = now();
      this.state = "load";
      await this.load();
      perf.load = Math.trunc(now() - timeStamp);
      if (this.config.scoped)
        tf.engine().startScope();
      this.analyze("Start Detect:");
      timeStamp = now();
      const image = this.tfImage(input);
      perf.image = Math.trunc(now() - timeStamp);
      const imageTensor = image.tensor;
      this.state = "run:body";
      timeStamp = now();
      this.analyze("Start PoseNet");
      const poseRes = this.config.body.enabled ? await this.models.posenet.estimatePoses(imageTensor, this.config.body) : [];
      this.analyze("End PoseNet:");
      perf.body = Math.trunc(now() - timeStamp);
      this.state = "run:hand";
      timeStamp = now();
      this.analyze("Start HandPose:");
      const handRes = this.config.hand.enabled ? await this.models.handpose.estimateHands(imageTensor, this.config.hand) : [];
      this.analyze("End HandPose:");
      perf.hand = Math.trunc(now() - timeStamp);
      const faceRes = [];
      if (this.config.face.enabled) {
        this.state = "run:face";
        timeStamp = now();
        this.analyze("Start FaceMesh:");
        const faces = await this.models.facemesh.estimateFaces(imageTensor, this.config.face);
        perf.face = Math.trunc(now() - timeStamp);
        for (const face of faces) {
          if (!face.image || face.image.isDisposedInternal) {
            this.log("Face object is disposed:", face.image);
            continue;
          }
          this.state = "run:agegender";
          timeStamp = now();
          const ssrData = this.config.face.age.enabled || this.config.face.gender.enabled ? await ssrnet.predict(face.image, this.config) : {};
          perf.agegender = Math.trunc(now() - timeStamp);
          this.state = "run:emotion";
          timeStamp = now();
          const emotionData = this.config.face.emotion.enabled ? await emotion.predict(face.image, this.config) : {};
          perf.emotion = Math.trunc(now() - timeStamp);
          face.image.dispose();
          const iris = face.annotations.leftEyeIris && face.annotations.rightEyeIris ? Math.max(face.annotations.leftEyeIris[3][0] - face.annotations.leftEyeIris[1][0], face.annotations.rightEyeIris[3][0] - face.annotations.rightEyeIris[1][0]) : 0;
          faceRes.push({
            confidence: face.confidence,
            box: face.box,
            mesh: face.mesh,
            annotations: face.annotations,
            age: ssrData.age,
            gender: ssrData.gender,
            agConfidence: ssrData.confidence,
            emotion: emotionData,
            iris: iris !== 0 ? Math.trunc(100 * 11.7 / iris) / 100 : 0
          });
          this.analyze("End FaceMesh:");
        }
      }
      imageTensor.dispose();
      this.state = "idle";
      if (this.config.scoped)
        tf.engine().endScope();
      this.analyze("End Scope:");
      perf.total = Math.trunc(now() - timeStart);
      resolve({face: faceRes, body: poseRes, hand: handRes, performance: perf, canvas: image.canvas});
    });
  }
}
export {
  Human as default
};
//# sourceMappingURL=human.esm-nobundle.js.map
