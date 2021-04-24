import { log, now } from './helpers';
import * as tf from '../dist/tfjs.esm.js';
import * as emotion from './emotion/emotion';
import * as faceres from './faceres/faceres';

type Tensor = typeof tf.Tensor;

const calculateFaceAngle = (face, image_size): { angle: { pitch: number, yaw: number, roll: number }, matrix: [number, number, number, number, number, number, number, number, number] } => {
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const degrees = (theta) => (theta * 180) / Math.PI;
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
    let thetaX; let thetaY; let thetaZ;
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
    return { pitch: 2 * -thetaX, yaw: 2 * -thetaY, roll: 2 * -thetaZ };
  };
  // simple Euler angle calculation based existing 3D mesh
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const meshToEulerAngle = (mesh) => {
    const radians = (a1, a2, b1, b2) => Math.atan2(b2 - a2, b1 - a1);
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    const angle = {
      // values are in radians in range of -pi/2 to pi/2 which is -90 to +90 degrees
      // value of 0 means center
      // pitch is face move up/down
      pitch: radians(mesh[10][1], mesh[10][2], mesh[152][1], mesh[152][2]), // looking at y,z of top and bottom points of the face
      // yaw is face turn left/right
      yaw: radians(mesh[33][0], mesh[33][2], mesh[263][0], mesh[263][2]), // looking at x,z of outside corners of leftEye and rightEye
      // roll is face lean left/right
      roll: radians(mesh[33][0], mesh[33][1], mesh[263][0], mesh[263][1]), // looking at x,y of outside corners of leftEye and rightEye
    };
    return angle;
  };

  const mesh = face.meshRaw;
  if (!mesh || mesh.length < 300) return { angle: { pitch: 0, yaw: 0, roll: 0 }, matrix: [1, 0, 0, 0, 1, 0, 0, 0, 1] };

  const size = Math.max(face.boxRaw[2] * image_size[0], face.boxRaw[3] * image_size[1]) / 1.5;
  // top, bottom, left, right
  const pts = [mesh[10], mesh[152], mesh[234], mesh[454]].map((pt) => [
    // make the xyz coordinates proportional, independent of the image/box size
    pt[0] * image_size[0] / size,
    pt[1] * image_size[1] / size,
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
  return { angle, matrix };
};

export const detectFace = async (parent, input): Promise<any> => {
  // run facemesh, includes blazeface and iris
  // eslint-disable-next-line no-async-promise-executor
  let timeStamp;
  let ageRes;
  let genderRes;
  let emotionRes;
  let embeddingRes;
  let descRes;
  const faceRes: Array<{
      confidence: number,
      boxConfidence: number,
      faceConfidence: number,
      box: [number, number, number, number],
      mesh: Array<[number, number, number]>
      meshRaw: Array<[number, number, number]>
      boxRaw: [number, number, number, number],
      annotations: Array<{ part: string, points: Array<[number, number, number]>[] }>,
      age: number,
      gender: string,
      genderConfidence: number,
      emotion: string,
      embedding: number[],
      iris: number,
      rotation: {
        angle: { pitch: number, yaw: number, roll: number },
        matrix: [number, number, number, number, number, number, number, number, number]
      },
      tensor: Tensor,
    }> = [];
  parent.state = 'run:face';
  timeStamp = now();
  const faces = await parent.models.face?.estimateFaces(input, parent.config);
  parent.perf.face = Math.trunc(now() - timeStamp);
  if (!faces) return [];
  for (const face of faces) {
    parent.analyze('Get Face');

    // is something went wrong, skip the face
    if (!face.image || face.image.isDisposedInternal) {
      log('Face object is disposed:', face.image);
      continue;
    }

    const rotation = calculateFaceAngle(face, [input.shape[2], input.shape[1]]);

    // run emotion, inherits face from blazeface
    parent.analyze('Start Emotion:');
    if (parent.config.async) {
      emotionRes = parent.config.face.emotion.enabled ? emotion.predict(face.image, parent.config) : {};
    } else {
      parent.state = 'run:emotion';
      timeStamp = now();
      emotionRes = parent.config.face.emotion.enabled ? await emotion.predict(face.image, parent.config) : {};
      parent.perf.emotion = Math.trunc(now() - timeStamp);
    }
    parent.analyze('End Emotion:');

    // run emotion, inherits face from blazeface
    parent.analyze('Start Description:');
    if (parent.config.async) {
      descRes = parent.config.face.description.enabled ? faceres.predict(face, parent.config) : [];
    } else {
      parent.state = 'run:description';
      timeStamp = now();
      descRes = parent.config.face.description.enabled ? await faceres.predict(face.image, parent.config) : [];
      parent.perf.embedding = Math.trunc(now() - timeStamp);
    }
    parent.analyze('End Description:');

    // if async wait for results
    if (parent.config.async) {
      [ageRes, genderRes, emotionRes, embeddingRes, descRes] = await Promise.all([ageRes, genderRes, emotionRes, embeddingRes, descRes]);
    }

    parent.analyze('Finish Face:');

    // calculate iris distance
    // iris: array[ center, left, top, right, bottom]
    if (!parent.config.face.iris.enabled && face?.annotations?.leftEyeIris && face?.annotations?.rightEyeIris) {
      delete face.annotations.leftEyeIris;
      delete face.annotations.rightEyeIris;
    }
    const irisSize = (face.annotations?.leftEyeIris && face.annotations?.rightEyeIris)
    /* average human iris size is 11.7mm */
      ? 11.7 * Math.max(Math.abs(face.annotations.leftEyeIris[3][0] - face.annotations.leftEyeIris[1][0]), Math.abs(face.annotations.rightEyeIris[4][1] - face.annotations.rightEyeIris[2][1]))
      : 0;

    // combine results
    faceRes.push({
      ...face,
      age: descRes.age,
      gender: descRes.gender,
      genderConfidence: descRes.genderConfidence,
      embedding: descRes.descriptor,
      emotion: emotionRes,
      iris: (irisSize !== 0) ? Math.trunc(irisSize) / 100 : 0,
      rotation,
      tensor: parent.config.face.detector.return ? face.image?.squeeze() : null,
    });
    // dispose original face tensor
    face.image?.dispose();

    parent.analyze('End Face');
  }
  parent.analyze('End FaceMesh:');
  if (parent.config.async) {
    if (parent.perf.face) delete parent.perf.face;
    if (parent.perf.age) delete parent.perf.age;
    if (parent.perf.gender) delete parent.perf.gender;
    if (parent.perf.emotion) delete parent.perf.emotion;
  }
  return faceRes;
};
