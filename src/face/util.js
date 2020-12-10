exports.IDENTITY_MATRIX = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
/**
 * Normalizes the provided angle to the range -pi to pi.
 * @param angle The angle in radians to be normalized.
 */
function normalizeRadians(angle) {
  return angle - 2 * Math.PI * Math.floor((angle + Math.PI) / (2 * Math.PI));
}
exports.normalizeRadians = normalizeRadians;

/**
 * Computes the angle of rotation between two anchor points.
 * @param point1 First anchor point
 * @param point2 Second anchor point
 */
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
    -dot(rotationComponent[1], translationComponent),
  ];
  return [
    rotationComponent[0].concat(invertedTranslation[0]),
    rotationComponent[1].concat(invertedTranslation[1]),
    [0, 0, 1],
  ];
}
exports.invertTransformMatrix = invertTransformMatrix;

function rotatePoint(homogeneousCoordinate, rotationMatrix) {
  return [
    dot(homogeneousCoordinate, rotationMatrix[0]),
    dot(homogeneousCoordinate, rotationMatrix[1]),
  ];
}
exports.rotatePoint = rotatePoint;

function xyDistanceBetweenPoints(a, b) {
  return Math.sqrt(((a[0] - b[0]) ** 2) + ((a[1] - b[1]) ** 2));
}
exports.xyDistanceBetweenPoints = xyDistanceBetweenPoints;
