import type { Point, FaceResult } from '../result';

type Vector = [number, number, number];

const calculateGaze = (face: FaceResult): { bearing: number, strength: number } => {
  const radians = (pt1: Point, pt2: Point) => Math.atan2(pt1[1] - pt2[1], pt1[0] - pt2[0]); // function to calculate angle between any two points
  if (!face.annotations['rightEyeIris'] || !face.annotations['leftEyeIris']) return { bearing: 0, strength: 0 };

  const offsetIris = [0, -0.1]; // iris center may not align with average of eye extremes
  const eyeRatio = 1; // factor to normalize changes x vs y

  const left = (face.mesh[33][2] || 0) > (face.mesh[263][2] || 0); // pick left or right eye depending which one is closer bazed on outsize point z axis
  const irisCenter = left ? face.mesh[473] : face.mesh[468];
  const eyeCenter = left // eye center is average of extreme points on x axis for both x and y, ignoring y extreme points as eyelids naturally open/close more when gazing up/down so relative point is less precise
    ? [(face.mesh[133][0] + face.mesh[33][0]) / 2, (face.mesh[133][1] + face.mesh[33][1]) / 2]
    : [(face.mesh[263][0] + face.mesh[362][0]) / 2, (face.mesh[263][1] + face.mesh[362][1]) / 2];
  const eyeSize = left // eye size is difference between extreme points for both x and y, used to normalize & squarify eye dimensions
    ? [face.mesh[133][0] - face.mesh[33][0], face.mesh[23][1] - face.mesh[27][1]]
    : [face.mesh[263][0] - face.mesh[362][0], face.mesh[253][1] - face.mesh[257][1]];
  const eyeDiff: Point = [ // x distance between extreme point and center point normalized with eye size
    (eyeCenter[0] - irisCenter[0]) / eyeSize[0] - offsetIris[0],
    eyeRatio * (irisCenter[1] - eyeCenter[1]) / eyeSize[1] - offsetIris[1],
  ];
  let strength = Math.sqrt((eyeDiff[0] * eyeDiff[0]) + (eyeDiff[1] * eyeDiff[1])); // vector length is a diagonal between two differences
  strength = Math.min(strength, face.boxRaw[2] / 2, face.boxRaw[3] / 2); // limit strength to half of box size to avoid clipping due to low precision
  const bearing = (radians([0, 0], eyeDiff) + (Math.PI / 2)) % Math.PI; // using eyeDiff instead eyeCenter/irisCenter combo due to manual adjustments and rotate clockwise 90degrees
  return { bearing, strength };
};

export const calculateFaceAngle = (face: FaceResult, imageSize: [number, number]): {
  angle: { pitch: number, yaw: number, roll: number },
  matrix: [number, number, number, number, number, number, number, number, number],
  gaze: { bearing: number, strength: number },
} => {
  // const degrees = (theta) => Math.abs(((theta * 180) / Math.PI) % 360);
  const normalize = (v: Vector): Vector => { // normalize vector
    const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    v[0] /= length;
    v[1] /= length;
    v[2] /= length;
    return v;
  };
  const subVectors = (a: Vector, b: Vector): Vector => { // vector subtraction (a - b)
    const x = a[0] - b[0];
    const y = a[1] - b[1];
    const z = a[2] - b[2];
    return [x, y, z];
  };
  const crossVectors = (a: Vector, b: Vector): Vector => { // vector cross product (a x b)
    const x = a[1] * b[2] - a[2] * b[1];
    const y = a[2] * b[0] - a[0] * b[2];
    const z = a[0] * b[1] - a[1] * b[0];
    return [x, y, z];
  };
  // 3x3 rotation matrix to Euler angles based on https://www.geometrictools.com/Documentation/EulerAngles.pdf
  const rotationMatrixToEulerAngle = (r: number[]): { pitch: number, yaw: number, roll: number } => {
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    const [r00, _r01, _r02, r10, r11, r12, r20, r21, r22] = r;
    let thetaX: number;
    let thetaY: number;
    let thetaZ: number;
    if (r10 < 1) { // YZX calculation
      if (r10 > -1) {
        thetaZ = Math.asin(r10);
        thetaY = Math.atan2(-r20, r00);
        thetaX = Math.atan2(-r12, r11);
      } else {
        thetaZ = -Math.PI / 2;
        thetaY = -Math.atan2(r21, r22);
        thetaX = 0;
      }
    } else {
      thetaZ = Math.PI / 2;
      thetaY = Math.atan2(r21, r22);
      thetaX = 0;
    }
    if (isNaN(thetaX)) thetaX = 0;
    if (isNaN(thetaY)) thetaY = 0;
    if (isNaN(thetaZ)) thetaZ = 0;
    return { pitch: 2 * -thetaX, yaw: 2 * -thetaY, roll: 2 * -thetaZ };
  };

  /*
  const meshToEulerAngle = (mesh) => { // simple Euler angle calculation based existing 3D mesh
    const radians = (a1, a2, b1, b2) => Math.atan2(b2 - a2, b1 - a1);
    return { // values are in radians in range of -pi/2 to pi/2 which is -90 to +90 degrees, value of 0 means center
      pitch: radians(mesh[10][1], mesh[10][2], mesh[152][1], mesh[152][2]), // looking at y,z of top and bottom points of the face // pitch is face move up/down
      yaw: radians(mesh[33][0], mesh[33][2], mesh[263][0], mesh[263][2]), // looking at x,z of outside corners of leftEye and rightEye // yaw is face turn left/right
      roll: radians(mesh[33][0], mesh[33][1], mesh[263][0], mesh[263][1]), // looking at x,y of outside corners of leftEye and rightEye // roll is face lean left/right
    };
  };
  */

  // initialize gaze and mesh
  const mesh = face.meshRaw;
  if (!mesh || mesh.length < 300) return { angle: { pitch: 0, yaw: 0, roll: 0 }, matrix: [1, 0, 0, 0, 1, 0, 0, 0, 1], gaze: { bearing: 0, strength: 0 } };

  const size = Math.max(face.boxRaw[2] * imageSize[0], face.boxRaw[3] * imageSize[1]) / 1.5;
  // top, bottom, left, right
  const pts: Point[] = [mesh[10], mesh[152], mesh[234], mesh[454]].map((pt) => [pt[0] * imageSize[0] / size, pt[1] * imageSize[1] / size, pt[2]] as Point); // make the xyz coordinates proportional, independent of the image/box size

  const y_axis = normalize(subVectors(pts[1] as Vector, pts[0] as Vector));
  let x_axis = normalize(subVectors(pts[3] as Vector, pts[2] as Vector));
  const z_axis = normalize(crossVectors(x_axis, y_axis));
  // adjust x_axis to make sure that all axes are perpendicular to each other
  x_axis = crossVectors(y_axis, z_axis);

  // Rotation Matrix from Axis Vectors - http://renderdan.blogspot.com/2006/05/rotation-matrix-from-axis-vectors.html
  // 3x3 rotation matrix is flatten to array in row-major order. Note that the rotation represented by this matrix is inverted.
  const matrix: [number, number, number, number, number, number, number, number, number] = [
    x_axis[0], x_axis[1], x_axis[2],
    y_axis[0], y_axis[1], y_axis[2],
    z_axis[0], z_axis[1], z_axis[2],
  ];
  const angle = rotationMatrixToEulerAngle(matrix);
  // const angle = meshToEulerAngle(mesh);

  // we have iris keypoints so we can calculate gaze direction
  const gaze = mesh.length === 478 ? calculateGaze(face) : { bearing: 0, strength: 0 };

  return { angle, matrix, gaze };
};
