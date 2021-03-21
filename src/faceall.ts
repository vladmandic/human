import { log, now } from './helpers';
import * as tf from '../dist/tfjs.esm.js';
import * as age from './age/age';
import * as gender from './gender/gender';
import * as emotion from './emotion/emotion';
import * as embedding from './embedding/embedding';
import * as faceres from './faceres/faceres';

type Tensor = typeof tf.Tensor;

const calculateFaceAngle = (mesh): { roll: number | null, yaw: number | null, pitch: number | null } => {
  if (!mesh || mesh.length < 300) return { roll: null, yaw: null, pitch: null };
  const radians = (a1, a2, b1, b2) => Math.atan2(b2 - a2, b1 - a1);
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const degrees = (theta) => Math.abs(((theta * 180) / Math.PI) % 360);
  const angle = {
    // values are in radians in range of -pi/2 to pi/2 which is -90 to +90 degrees
    // value of 0 means center
    // roll is face lean left/right
    roll: radians(mesh[33][0], mesh[33][1], mesh[263][0], mesh[263][1]), // looking at x,y of outside corners of leftEye and rightEye
    // yaw is face turn left/right
    yaw: radians(mesh[33][0], mesh[33][2], mesh[263][0], mesh[263][2]), // looking at x,z of outside corners of leftEye and rightEye
    // pitch is face move up/down
    pitch: radians(mesh[10][1], mesh[10][2], mesh[152][1], mesh[152][2]), // looking at y,z of top and bottom points of the face
  };
  return angle;
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
      angle: { roll: number | null, yaw: number | null, pitch: number | null },
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

    const angle = calculateFaceAngle(face.mesh);

    // run age, inherits face from blazeface
    parent.analyze('Start Age:');
    if (parent.config.async) {
      ageRes = parent.config.face.age.enabled ? age.predict(face.image, parent.config) : {};
    } else {
      parent.state = 'run:age';
      timeStamp = now();
      ageRes = parent.config.face.age.enabled ? await age.predict(face.image, parent.config) : {};
      parent.perf.age = Math.trunc(now() - timeStamp);
    }

    // run gender, inherits face from blazeface
    parent.analyze('Start Gender:');
    if (parent.config.async) {
      genderRes = parent.config.face.gender.enabled ? gender.predict(face.image, parent.config) : {};
    } else {
      parent.state = 'run:gender';
      timeStamp = now();
      genderRes = parent.config.face.gender.enabled ? await gender.predict(face.image, parent.config) : {};
      parent.perf.gender = Math.trunc(now() - timeStamp);
    }

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
    parent.analyze('Start Embedding:');
    if (parent.config.async) {
      embeddingRes = parent.config.face.embedding.enabled ? embedding.predict(face, parent.config) : [];
    } else {
      parent.state = 'run:embedding';
      timeStamp = now();
      embeddingRes = parent.config.face.embedding.enabled ? await embedding.predict(face, parent.config) : [];
      parent.perf.embedding = Math.trunc(now() - timeStamp);
    }
    parent.analyze('End Embedding:');

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
      age: descRes.age || ageRes.age,
      gender: descRes.gender || genderRes.gender,
      genderConfidence: descRes.genderConfidence || genderRes.confidence,
      embedding: descRes.descriptor || embeddingRes,
      emotion: emotionRes,
      iris: (irisSize !== 0) ? Math.trunc(irisSize) / 100 : 0,
      angle,
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
