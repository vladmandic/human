/**
 * Face algorithm implementation
 * Uses FaceMesh, Emotion and FaceRes models to create a unified pipeline
 */

import { log, now } from '../util/util';
import { env } from '../util/env';
import * as tf from '../../dist/tfjs.esm.js';
import * as facemesh from './facemesh';
import * as emotion from '../gear/emotion';
import * as faceres from './faceres';
import * as antispoof from './antispoof';
import type { FaceResult } from '../result';
import type { Tensor } from '../tfjs/types';
import { calculateFaceAngle } from './angles';

export const detectFace = async (parent /* instance of human */, input: Tensor): Promise<FaceResult[]> => {
  // run facemesh, includes blazeface and iris
  // eslint-disable-next-line no-async-promise-executor
  let timeStamp;
  let ageRes;
  let gearRes;
  let genderRes;
  let emotionRes;
  let embeddingRes;
  let antispoofRes;
  let descRes;
  const faceRes: Array<FaceResult> = [];
  parent.state = 'run:face';
  timeStamp = now();

  const faces = await facemesh.predict(input, parent.config);
  parent.performance.face = env.perfadd ? (parent.performance.face || 0) + Math.trunc(now() - timeStamp) : Math.trunc(now() - timeStamp);
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
      emotionRes = parent.config.face.emotion.enabled ? emotion.predict(faces[i].tensor || tf.tensor([]), parent.config, i, faces.length) : null;
    } else {
      parent.state = 'run:emotion';
      timeStamp = now();
      emotionRes = parent.config.face.emotion.enabled ? await emotion.predict(faces[i].tensor || tf.tensor([]), parent.config, i, faces.length) : null;
      parent.performance.emotion = env.perfadd ? (parent.performance.emotion || 0) + Math.trunc(now() - timeStamp) : Math.trunc(now() - timeStamp);
    }
    parent.analyze('End Emotion:');

    // run antispoof, inherits face from blazeface
    parent.analyze('Start AntiSpoof:');
    if (parent.config.async) {
      antispoofRes = parent.config.face.antispoof.enabled ? antispoof.predict(faces[i].tensor || tf.tensor([]), parent.config, i, faces.length) : null;
    } else {
      parent.state = 'run:antispoof';
      timeStamp = now();
      antispoofRes = parent.config.face.antispoof.enabled ? await antispoof.predict(faces[i].tensor || tf.tensor([]), parent.config, i, faces.length) : null;
      parent.performance.antispoof = env.perfadd ? (parent.performance.antispoof || 0) + Math.trunc(now() - timeStamp) : Math.trunc(now() - timeStamp);
    }
    parent.analyze('End AntiSpoof:');

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
      descRes = parent.config.face.description.enabled ? faceres.predict(faces[i].tensor || tf.tensor([]), parent.config, i, faces.length) : null;
    } else {
      parent.state = 'run:description';
      timeStamp = now();
      descRes = parent.config.face.description.enabled ? await faceres.predict(faces[i].tensor || tf.tensor([]), parent.config, i, faces.length) : null;
      parent.performance.embedding = env.perfadd ? (parent.performance.embedding || 0) + Math.trunc(now() - timeStamp) : Math.trunc(now() - timeStamp);
    }
    parent.analyze('End Description:');

    // if async wait for results
    if (parent.config.async) {
      [ageRes, genderRes, emotionRes, embeddingRes, descRes, gearRes, antispoofRes] = await Promise.all([ageRes, genderRes, emotionRes, embeddingRes, descRes, gearRes, antispoofRes]);
    }

    parent.analyze('Finish Face:');

    // calculate iris distance
    // iris: array[ center, left, top, right, bottom]
    if (!parent.config.face.iris.enabled && faces[i]?.annotations?.leftEyeIris && faces[i]?.annotations?.rightEyeIris) {
      delete faces[i].annotations.leftEyeIris;
      delete faces[i].annotations.rightEyeIris;
    }
    const irisSize = (faces[i].annotations && faces[i].annotations.leftEyeIris && faces[i].annotations.leftEyeIris[0] && faces[i].annotations.rightEyeIris && faces[i].annotations.rightEyeIris[0]
      && (faces[i].annotations.leftEyeIris.length > 0) && (faces[i].annotations.rightEyeIris.length > 0)
      && (faces[i].annotations.leftEyeIris[0] !== null) && (faces[i].annotations.rightEyeIris[0] !== null))
      ? Math.max(Math.abs(faces[i].annotations.leftEyeIris[3][0] - faces[i].annotations.leftEyeIris[1][0]), Math.abs(faces[i].annotations.rightEyeIris[4][1] - faces[i].annotations.rightEyeIris[2][1])) / input.shape[2]
      : 0; // note: average human iris size is 11.7mm

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
      age: descRes?.age,
      gender: descRes?.gender,
      genderScore: descRes?.genderScore,
      embedding: descRes?.descriptor,
      emotion: emotionRes,
      real: antispoofRes,
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
