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
import * as mask from './mask';
import * as antispoof from './antispoof';
import * as liveness from './liveness';
import * as gear from '../gear/gear';
import * as ssrnetAge from '../gear/ssrnet-age';
import * as ssrnetGender from '../gear/ssrnet-gender';
import * as mobilefacenet from './mobilefacenet';
import type { FaceResult } from '../result';
import type { Tensor } from '../tfjs/types';
import type { Human } from '../human';
import { calculateFaceAngle } from './angles';

export const detectFace = async (parent: Human /* instance of human */, input: Tensor): Promise<FaceResult[]> => {
  // run facemesh, includes blazeface and iris
  // eslint-disable-next-line no-async-promise-executor
  let timeStamp;
  let ageRes;
  let gearRes;
  let genderRes;
  let emotionRes;
  let mobilefacenetRes;
  let antispoofRes;
  let livenessRes;
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

    // optional face mask
    if (parent.config.face.detector?.mask) {
      const masked = await mask.mask(faces[i]);
      tf.dispose(faces[i].tensor);
      faces[i].tensor = masked as Tensor;
    }

    // calculate face angles
    const rotation = faces[i].mesh && (faces[i].mesh.length > 200) ? calculateFaceAngle(faces[i], [input.shape[2], input.shape[1]]) : null;

    // run emotion, inherits face from blazeface
    parent.analyze('Start Emotion:');
    if (parent.config.async) {
      emotionRes = parent.config.face.emotion?.enabled ? emotion.predict(faces[i].tensor || tf.tensor([]), parent.config, i, faces.length) : null;
    } else {
      parent.state = 'run:emotion';
      timeStamp = now();
      emotionRes = parent.config.face.emotion?.enabled ? await emotion.predict(faces[i].tensor || tf.tensor([]), parent.config, i, faces.length) : null;
      parent.performance.emotion = env.perfadd ? (parent.performance.emotion || 0) + Math.trunc(now() - timeStamp) : Math.trunc(now() - timeStamp);
    }
    parent.analyze('End Emotion:');

    // run antispoof, inherits face from blazeface
    parent.analyze('Start AntiSpoof:');
    if (parent.config.async) {
      antispoofRes = parent.config.face.antispoof?.enabled ? antispoof.predict(faces[i].tensor || tf.tensor([]), parent.config, i, faces.length) : null;
    } else {
      parent.state = 'run:antispoof';
      timeStamp = now();
      antispoofRes = parent.config.face.antispoof?.enabled ? await antispoof.predict(faces[i].tensor || tf.tensor([]), parent.config, i, faces.length) : null;
      parent.performance.antispoof = env.perfadd ? (parent.performance.antispoof || 0) + Math.trunc(now() - timeStamp) : Math.trunc(now() - timeStamp);
    }
    parent.analyze('End AntiSpoof:');

    // run liveness, inherits face from blazeface
    parent.analyze('Start Liveness:');
    if (parent.config.async) {
      livenessRes = parent.config.face.liveness?.enabled ? liveness.predict(faces[i].tensor || tf.tensor([]), parent.config, i, faces.length) : null;
    } else {
      parent.state = 'run:liveness';
      timeStamp = now();
      livenessRes = parent.config.face.liveness?.enabled ? await liveness.predict(faces[i].tensor || tf.tensor([]), parent.config, i, faces.length) : null;
      parent.performance.liveness = env.perfadd ? (parent.performance.antispoof || 0) + Math.trunc(now() - timeStamp) : Math.trunc(now() - timeStamp);
    }
    parent.analyze('End Liveness:');

    // run gear, inherits face from blazeface
    parent.analyze('Start GEAR:');
    if (parent.config.async) {
      gearRes = parent.config.face['gear']?.enabled ? gear.predict(faces[i].tensor || tf.tensor([]), parent.config, i, faces.length) : {};
    } else {
      parent.state = 'run:gear';
      timeStamp = now();
      gearRes = parent.config.face['gear']?.enabled ? await gear.predict(faces[i].tensor || tf.tensor([]), parent.config, i, faces.length) : {};
      parent.performance.gear = Math.trunc(now() - timeStamp);
    }
    parent.analyze('End GEAR:');

    // run gear, inherits face from blazeface
    parent.analyze('Start SSRNet:');
    if (parent.config.async) {
      ageRes = parent.config.face['ssrnet']?.enabled ? ssrnetAge.predict(faces[i].tensor || tf.tensor([]), parent.config, i, faces.length) : {};
      genderRes = parent.config.face['ssrnet']?.enabled ? ssrnetGender.predict(faces[i].tensor || tf.tensor([]), parent.config, i, faces.length) : {};
    } else {
      parent.state = 'run:ssrnet';
      timeStamp = now();
      ageRes = parent.config.face['ssrnet']?.enabled ? await ssrnetAge.predict(faces[i].tensor || tf.tensor([]), parent.config, i, faces.length) : {};
      genderRes = parent.config.face['ssrnet']?.enabled ? await ssrnetGender.predict(faces[i].tensor || tf.tensor([]), parent.config, i, faces.length) : {};
      parent.performance.ssrnet = Math.trunc(now() - timeStamp);
    }
    parent.analyze('End SSRNet:');

    // run gear, inherits face from blazeface
    parent.analyze('Start MobileFaceNet:');
    if (parent.config.async) {
      mobilefacenetRes = parent.config.face['mobilefacenet']?.enabled ? mobilefacenet.predict(faces[i].tensor || tf.tensor([]), parent.config, i, faces.length) : {};
    } else {
      parent.state = 'run:mobilefacenet';
      timeStamp = now();
      mobilefacenetRes = parent.config.face['mobilefacenet']?.enabled ? await mobilefacenet.predict(faces[i].tensor || tf.tensor([]), parent.config, i, faces.length) : {};
      parent.performance.mobilefacenet = Math.trunc(now() - timeStamp);
    }
    parent.analyze('End MobileFaceNet:');

    // run emotion, inherits face from blazeface
    parent.analyze('Start Description:');
    if (parent.config.async) {
      descRes = parent.config.face.description?.enabled ? faceres.predict(faces[i].tensor || tf.tensor([]), parent.config, i, faces.length) : null;
    } else {
      parent.state = 'run:description';
      timeStamp = now();
      descRes = parent.config.face.description?.enabled ? await faceres.predict(faces[i].tensor || tf.tensor([]), parent.config, i, faces.length) : null;
      parent.performance.description = env.perfadd ? (parent.performance.description || 0) + Math.trunc(now() - timeStamp) : Math.trunc(now() - timeStamp);
    }
    parent.analyze('End Description:');

    // if async wait for results
    if (parent.config.async) {
      [ageRes, genderRes, emotionRes, mobilefacenetRes, descRes, gearRes, antispoofRes, livenessRes] = await Promise.all([ageRes, genderRes, emotionRes, mobilefacenetRes, descRes, gearRes, antispoofRes, livenessRes]);
    }
    parent.analyze('Finish Face:');

    // override age/gender if alternative models are used
    if (parent.config.face['ssrnet']?.enabled && ageRes && genderRes) descRes = { age: ageRes.age, gender: genderRes.gender, genderScore: genderRes.genderScore };
    if (parent.config.face['gear']?.enabled && gearRes) descRes = { age: gearRes.age, gender: gearRes.gender, genderScore: gearRes.genderScore, race: gearRes.race };
    // override descriptor if embedding model is used
    if (parent.config.face['mobilefacenet']?.enabled && mobilefacenetRes) descRes.descriptor = mobilefacenetRes;

    // calculate iris distance
    // iris: array[ center, left, top, right, bottom]
    if (!parent.config.face.iris?.enabled && faces[i]?.annotations?.leftEyeIris && faces[i]?.annotations?.rightEyeIris) {
      delete faces[i].annotations.leftEyeIris;
      delete faces[i].annotations.rightEyeIris;
    }
    const irisSize = (faces[i].annotations && faces[i].annotations.leftEyeIris && faces[i].annotations.leftEyeIris[0] && faces[i].annotations.rightEyeIris && faces[i].annotations.rightEyeIris[0]
      && (faces[i].annotations.leftEyeIris.length > 0) && (faces[i].annotations.rightEyeIris.length > 0)
      && (faces[i].annotations.leftEyeIris[0] !== null) && (faces[i].annotations.rightEyeIris[0] !== null))
      ? Math.max(Math.abs(faces[i].annotations.leftEyeIris[3][0] - faces[i].annotations.leftEyeIris[1][0]), Math.abs(faces[i].annotations.rightEyeIris[4][1] - faces[i].annotations.rightEyeIris[2][1])) / input.shape[2]
      : 0; // note: average human iris size is 11.7mm

    // optionally return tensor
    const tensor = parent.config.face.detector?.return ? tf.squeeze(faces[i].tensor) : null;
    // dispose original face tensor
    tf.dispose(faces[i].tensor);
    // delete temp face image
    if (faces[i].tensor) delete faces[i].tensor;
    // combine results
    const res: FaceResult = {
      ...faces[i],
      id: i,
    };
    if (descRes?.age) res.age = descRes.age;
    if (descRes?.gender) res.gender = descRes.gender;
    if (descRes?.genderScore) res.genderScore = descRes?.genderScore;
    if (descRes?.descriptor) res.embedding = descRes?.descriptor;
    if (descRes?.race) res.race = descRes?.race;
    if (emotionRes) res.emotion = emotionRes;
    if (antispoofRes) res.real = antispoofRes;
    if (livenessRes) res.live = livenessRes;
    if (irisSize && irisSize !== 0) res.iris = Math.trunc(500 / irisSize / 11.7) / 100;
    if (rotation) res.rotation = rotation;
    if (tensor) res.tensor = tensor;
    faceRes.push(res);
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
