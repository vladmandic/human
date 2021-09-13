/**
 * Module that analyzes person age
 * Obsolete
 */

import { log, now } from './helpers';
import * as tf from '../dist/tfjs.esm.js';
import * as facemesh from './blazeface/facemesh';
import * as emotion from './emotion/emotion';
import * as faceres from './faceres/faceres';
import type { FaceResult } from './result';
import type { Tensor } from './tfjs/types';

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
const rad2deg = (theta) => Math.round((theta * 180) / Math.PI);

const calculateGaze = (face): { bearing: number, strength: number } => {
  const radians = (pt1, pt2) => Math.atan2(pt1[1] - pt2[1], pt1[0] - pt2[0]); // function to calculate angle between any two points
  if (!face.annotations['rightEyeIris'] || !face.annotations['leftEyeIris']) return { bearing: 0, strength: 0 };

  const offsetIris = [0, -0.1]; // iris center may not align with average of eye extremes
  const eyeRatio = 1; // factor to normalize changes x vs y

  const left = face.mesh[33][2] > face.mesh[263][2]; // pick left or right eye depending which one is closer bazed on outsize point z axis
  const irisCenter = left ? face.mesh[473] : face.mesh[468];
  const eyeCenter = left // eye center is average of extreme points on x axis for both x and y, ignoring y extreme points as eyelids naturally open/close more when gazing up/down so relative point is less precise
    ? [(face.mesh[133][0] + face.mesh[33][0]) / 2, (face.mesh[133][1] + face.mesh[33][1]) / 2]
    : [(face.mesh[263][0] + face.mesh[362][0]) / 2, (face.mesh[263][1] + face.mesh[362][1]) / 2];
  const eyeSize = left // eye size is difference between extreme points for both x and y, used to normalize & squarify eye dimensions
    ? [face.mesh[133][0] - face.mesh[33][0], face.mesh[23][1] - face.mesh[27][1]]
    : [face.mesh[263][0] - face.mesh[362][0], face.mesh[253][1] - face.mesh[257][1]];

  const eyeDiff = [ // x distance between extreme point and center point normalized with eye size
    (eyeCenter[0] - irisCenter[0]) / eyeSize[0] - offsetIris[0],
    eyeRatio * (irisCenter[1] - eyeCenter[1]) / eyeSize[1] - offsetIris[1],
  ];
  let strength = Math.sqrt((eyeDiff[0] ** 2) + (eyeDiff[1] ** 2)); // vector length is a diagonal between two differences
  strength = Math.min(strength, face.boxRaw[2] / 2, face.boxRaw[3] / 2); // limit strength to half of box size to avoid clipping due to low precision
  const bearing = (radians([0, 0], eyeDiff) + (Math.PI / 2)) % Math.PI; // using eyeDiff instead eyeCenter/irisCenter combo due to manual adjustments and rotate clockwise 90degrees

  return { bearing, strength };
};

const calculateFaceAngle = (face, imageSize): {
  angle: { pitch: number, yaw: number, roll: number },
  matrix: [number, number, number, number, number, number, number, number, number],
  gaze: { bearing: number, strength: number },
} => {
  // const degrees = (theta) => Math.abs(((theta * 180) / Math.PI) % 360);
  const normalize = (v) => { // normalize vector
    const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    v[0] /= length;
    v[1] /= length;
    v[2] /= length;
    return v;
  };
  const subVectors = (a, b) => { // vector subtraction (a - b)
    const x = a[0] - b[0];
    const y = a[1] - b[1];
    const z = a[2] - b[2];
    return [x, y, z];
  };
  const crossVectors = (a, b) => { // vector cross product (a x b)
    const x = a[1] * b[2] - a[2] * b[1];
    const y = a[2] * b[0] - a[0] * b[2];
    const z = a[0] * b[1] - a[1] * b[0];
    return [x, y, z];
  };
  // 3x3 rotation matrix to Euler angles based on https://www.geometrictools.com/Documentation/EulerAngles.pdf
  const rotationMatrixToEulerAngle = (r) => {
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    const [r00, r01, r02, r10, r11, r12, r20, r21, r22] = r;
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
  // simple Euler angle calculation based existing 3D mesh
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const meshToEulerAngle = (mesh) => {
    const radians = (a1, a2, b1, b2) => Math.atan2(b2 - a2, b1 - a1);
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    const angle = {
      // values are in radians in range of -pi/2 to pi/2 which is -90 to +90 degrees, value of 0 means center
      // pitch is face move up/down
      pitch: radians(mesh[10][1], mesh[10][2], mesh[152][1], mesh[152][2]), // looking at y,z of top and bottom points of the face
      // yaw is face turn left/right
      yaw: radians(mesh[33][0], mesh[33][2], mesh[263][0], mesh[263][2]), // looking at x,z of outside corners of leftEye and rightEye
      // roll is face lean left/right
      roll: radians(mesh[33][0], mesh[33][1], mesh[263][0], mesh[263][1]), // looking at x,y of outside corners of leftEye and rightEye
    };
    return angle;
  };

  // initialize gaze and mesh
  const mesh = face.meshRaw;
  if (!mesh || mesh.length < 300) return { angle: { pitch: 0, yaw: 0, roll: 0 }, matrix: [1, 0, 0, 0, 1, 0, 0, 0, 1], gaze: { bearing: 0, strength: 0 } };

  const size = Math.max(face.boxRaw[2] * imageSize[0], face.boxRaw[3] * imageSize[1]) / 1.5;
  // top, bottom, left, right
  const pts = [mesh[10], mesh[152], mesh[234], mesh[454]].map((pt) => [
    // make the xyz coordinates proportional, independent of the image/box size
    pt[0] * imageSize[0] / size,
    pt[1] * imageSize[1] / size,
    pt[2],
  ]);

  const y_axis = normalize(subVectors(pts[1], pts[0]));
  let x_axis = normalize(subVectors(pts[3], pts[2]));
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

export const detectFace = async (parent /* instance of human */, input: Tensor): Promise<FaceResult[]> => {
  // run facemesh, includes blazeface and iris
  // eslint-disable-next-line no-async-promise-executor
  let timeStamp;
  let ageRes;
  let gearRes;
  let genderRes;
  let emotionRes;
  let embeddingRes;
  let descRes;
  const faceRes: Array<FaceResult> = [];
  parent.state = 'run:face';
  timeStamp = now();
  const faces = await facemesh.predict(input, parent.config);
  parent.performance.face = Math.trunc(now() - timeStamp);
  if (!input.shape || input.shape.length !== 4) return [];
  if (!faces) return [];
  // for (const face of faces) {
  for (let i = 0; i < faces.length; i++) {
    parent.analyze('Get Face');

    // is something went wrong, skip the face
    // @ts-ignore possibly undefied
    if (!faces[i].tensor || faces[i].tensor['isDisposedInternal']) {
      log('Face object is disposed:', faces[i].tensor);
      continue;
    }

    const rotation = calculateFaceAngle(faces[i], [input.shape[2], input.shape[1]]);

    // run emotion, inherits face from blazeface
    parent.analyze('Start Emotion:');
    if (parent.config.async) {
      emotionRes = parent.config.face.emotion.enabled ? emotion.predict(faces[i].tensor || tf.tensor([]), parent.config, i, faces.length) : {};
    } else {
      parent.state = 'run:emotion';
      timeStamp = now();
      emotionRes = parent.config.face.emotion.enabled ? await emotion.predict(faces[i].tensor || tf.tensor([]), parent.config, i, faces.length) : {};
      parent.performance.emotion = Math.trunc(now() - timeStamp);
    }
    parent.analyze('End Emotion:');

    // run gear, inherits face from blazeface
    /*
    parent.analyze('Start GEAR:');
    if (parent.config.async) {
      gearRes = parent.config.face.agegenderrace.enabled ? agegenderrace.predict(faces[i].tensor || tf.tensor([]), parent.config, i, faces.length) : {};
    } else {
      parent.state = 'run:gear';
      timeStamp = now();
      gearRes = parent.config.face.agegenderrace.enabled ? await agegenderrace.predict(faces[i].tensor || tf.tensor([]), parent.config, i, faces.length) : {};
      parent.performance.emotion = Math.trunc(now() - timeStamp);
    }
    parent.analyze('End GEAR:');
    */

    // run emotion, inherits face from blazeface
    parent.analyze('Start Description:');
    if (parent.config.async) {
      descRes = parent.config.face.description.enabled ? faceres.predict(faces[i].tensor || tf.tensor([]), parent.config, i, faces.length) : [];
    } else {
      parent.state = 'run:description';
      timeStamp = now();
      descRes = parent.config.face.description.enabled ? await faceres.predict(faces[i].tensor || tf.tensor([]), parent.config, i, faces.length) : [];
      parent.performance.embedding = Math.trunc(now() - timeStamp);
    }
    parent.analyze('End Description:');

    // if async wait for results
    if (parent.config.async) {
      [ageRes, genderRes, emotionRes, embeddingRes, descRes, gearRes] = await Promise.all([ageRes, genderRes, emotionRes, embeddingRes, descRes, gearRes]);
    }

    parent.analyze('Finish Face:');

    // calculate iris distance
    // iris: array[ center, left, top, right, bottom]
    if (!parent.config.face.iris.enabled && faces[i]?.annotations?.leftEyeIris && faces[i]?.annotations?.rightEyeIris) {
      delete faces[i].annotations.leftEyeIris;
      delete faces[i].annotations.rightEyeIris;
    }
    const irisSize = (faces[i].annotations?.leftEyeIris && faces[i].annotations?.rightEyeIris)
    /* note: average human iris size is 11.7mm */
      ? Math.max(Math.abs(faces[i].annotations.leftEyeIris[3][0] - faces[i].annotations.leftEyeIris[1][0]), Math.abs(faces[i].annotations.rightEyeIris[4][1] - faces[i].annotations.rightEyeIris[2][1])) / input.shape[2]
      : 0;

    // optionally return tensor
    const tensor = parent.config.face.detector.return ? tf.squeeze(faces[i].tensor) : null;
    // dispose original face tensor
    tf.dispose(faces[i].tensor);
    // delete temp face image
    if (faces[i].tensor) delete faces[i].tensor;
    // combine results
    faceRes.push({
      ...faces[i],
      id: i,
      age: descRes.age,
      gender: descRes.gender,
      genderScore: descRes.genderScore,
      embedding: descRes.descriptor,
      emotion: emotionRes,
      iris: irisSize !== 0 ? Math.trunc(500 / irisSize / 11.7) / 100 : 0,
      rotation,
      tensor,
    });
    parent.analyze('End Face');
  }
  parent.analyze('End FaceMesh:');
  if (parent.config.async) {
    if (parent.performance.face) delete parent.performance.face;
    if (parent.performance.age) delete parent.performance.age;
    if (parent.performance.gender) delete parent.performance.gender;
    if (parent.performance.emotion) delete parent.performance.emotion;
  }
  return faceRes;
};
