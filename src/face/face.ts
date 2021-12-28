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
import type { FaceResult, Emotion, Gender, Race } from '../result';
import type { Tensor } from '../tfjs/types';
import type { Human } from '../human';
import { calculateFaceAngle } from './angles';

type DescRes = { age: number, gender: Gender, genderScore: number, descriptor: number[], race?: { score: number, race: Race }[] };

export const detectFace = async (instance: Human /* instance of human */, input: Tensor): Promise<FaceResult[]> => {
  // run facemesh, includes blazeface and iris
  // eslint-disable-next-line no-async-promise-executor
  let timeStamp: number = now();
  let ageRes: { age: number } | Promise<{ age: number }> | null;
  let gearRes: gear.GearType | Promise<gear.GearType> | null;
  let genderRes: { gender: string, genderScore: number } | Promise<{ gender: string, genderScore: number }> | null;
  let emotionRes: { score: number, emotion: Emotion }[] | Promise<{ score: number, emotion: Emotion }[]>;
  let mobilefacenetRes: number[] | Promise<number[]> | null;
  let antispoofRes: number | Promise<number> | null;
  let livenessRes: number | Promise<number> | null;
  let descRes: DescRes | Promise<DescRes> | null;

  const faceRes: Array<FaceResult> = [];
  instance.state = 'run:face';

  const faces = await facemesh.predict(input, instance.config);
  instance.performance.face = env.perfadd ? (instance.performance.face || 0) + Math.trunc(now() - timeStamp) : Math.trunc(now() - timeStamp);
  if (!input.shape || input.shape.length !== 4) return [];
  if (!faces) return [];
  // for (const face of faces) {
  for (let i = 0; i < faces.length; i++) {
    instance.analyze('Get Face');

    // is something went wrong, skip the face
    // @ts-ignore possibly undefied
    if (!faces[i].tensor || faces[i].tensor['isDisposedInternal']) {
      log('Face object is disposed:', faces[i].tensor);
      continue;
    }

    // optional face mask
    if (instance.config.face.detector?.mask) {
      const masked = await mask.mask(faces[i]);
      tf.dispose(faces[i].tensor);
      faces[i].tensor = masked as Tensor;
    }

    // calculate face angles
    const rotation = faces[i].mesh && (faces[i].mesh.length > 200) ? calculateFaceAngle(faces[i], [input.shape[2], input.shape[1]]) : null;

    // run emotion, inherits face from blazeface
    instance.analyze('Start Emotion:');
    if (instance.config.async) {
      emotionRes = instance.config.face.emotion?.enabled ? emotion.predict(faces[i].tensor || tf.tensor([]), instance.config, i, faces.length) : [];
    } else {
      instance.state = 'run:emotion';
      timeStamp = now();
      emotionRes = instance.config.face.emotion?.enabled ? await emotion.predict(faces[i].tensor || tf.tensor([]), instance.config, i, faces.length) : [];
      instance.performance.emotion = env.perfadd ? (instance.performance.emotion || 0) + Math.trunc(now() - timeStamp) : Math.trunc(now() - timeStamp);
    }
    instance.analyze('End Emotion:');

    // run antispoof, inherits face from blazeface
    instance.analyze('Start AntiSpoof:');
    if (instance.config.async) {
      antispoofRes = instance.config.face.antispoof?.enabled ? antispoof.predict(faces[i].tensor || tf.tensor([]), instance.config, i, faces.length) : 0;
    } else {
      instance.state = 'run:antispoof';
      timeStamp = now();
      antispoofRes = instance.config.face.antispoof?.enabled ? await antispoof.predict(faces[i].tensor || tf.tensor([]), instance.config, i, faces.length) : 0;
      instance.performance.antispoof = env.perfadd ? (instance.performance.antispoof || 0) + Math.trunc(now() - timeStamp) : Math.trunc(now() - timeStamp);
    }
    instance.analyze('End AntiSpoof:');

    // run liveness, inherits face from blazeface
    instance.analyze('Start Liveness:');
    if (instance.config.async) {
      livenessRes = instance.config.face.liveness?.enabled ? liveness.predict(faces[i].tensor || tf.tensor([]), instance.config, i, faces.length) : 0;
    } else {
      instance.state = 'run:liveness';
      timeStamp = now();
      livenessRes = instance.config.face.liveness?.enabled ? await liveness.predict(faces[i].tensor || tf.tensor([]), instance.config, i, faces.length) : 0;
      instance.performance.liveness = env.perfadd ? (instance.performance.antispoof || 0) + Math.trunc(now() - timeStamp) : Math.trunc(now() - timeStamp);
    }
    instance.analyze('End Liveness:');

    // run gear, inherits face from blazeface
    instance.analyze('Start GEAR:');
    if (instance.config.async) {
      gearRes = instance.config.face['gear']?.enabled ? gear.predict(faces[i].tensor || tf.tensor([]), instance.config, i, faces.length) : null;
    } else {
      instance.state = 'run:gear';
      timeStamp = now();
      gearRes = instance.config.face['gear']?.enabled ? await gear.predict(faces[i].tensor || tf.tensor([]), instance.config, i, faces.length) : null;
      instance.performance.gear = Math.trunc(now() - timeStamp);
    }
    instance.analyze('End GEAR:');

    // run gear, inherits face from blazeface
    instance.analyze('Start SSRNet:');
    if (instance.config.async) {
      ageRes = instance.config.face['ssrnet']?.enabled ? ssrnetAge.predict(faces[i].tensor || tf.tensor([]), instance.config, i, faces.length) : null;
      genderRes = instance.config.face['ssrnet']?.enabled ? ssrnetGender.predict(faces[i].tensor || tf.tensor([]), instance.config, i, faces.length) : null;
    } else {
      instance.state = 'run:ssrnet';
      timeStamp = now();
      ageRes = instance.config.face['ssrnet']?.enabled ? await ssrnetAge.predict(faces[i].tensor || tf.tensor([]), instance.config, i, faces.length) : null;
      genderRes = instance.config.face['ssrnet']?.enabled ? await ssrnetGender.predict(faces[i].tensor || tf.tensor([]), instance.config, i, faces.length) : null;
      instance.performance.ssrnet = Math.trunc(now() - timeStamp);
    }
    instance.analyze('End SSRNet:');

    // run gear, inherits face from blazeface
    instance.analyze('Start MobileFaceNet:');
    if (instance.config.async) {
      mobilefacenetRes = instance.config.face['mobilefacenet']?.enabled ? mobilefacenet.predict(faces[i].tensor || tf.tensor([]), instance.config, i, faces.length) : null;
    } else {
      instance.state = 'run:mobilefacenet';
      timeStamp = now();
      mobilefacenetRes = instance.config.face['mobilefacenet']?.enabled ? await mobilefacenet.predict(faces[i].tensor || tf.tensor([]), instance.config, i, faces.length) : null;
      instance.performance.mobilefacenet = Math.trunc(now() - timeStamp);
    }
    instance.analyze('End MobileFaceNet:');

    // run emotion, inherits face from blazeface
    instance.analyze('Start Description:');
    if (instance.config.async) {
      descRes = instance.config.face.description?.enabled ? faceres.predict(faces[i].tensor || tf.tensor([]), instance.config, i, faces.length) : null;
    } else {
      instance.state = 'run:description';
      timeStamp = now();
      descRes = instance.config.face.description?.enabled ? await faceres.predict(faces[i].tensor || tf.tensor([]), instance.config, i, faces.length) : null;
      instance.performance.description = env.perfadd ? (instance.performance.description || 0) + Math.trunc(now() - timeStamp) : Math.trunc(now() - timeStamp);
    }
    instance.analyze('End Description:');

    // if async wait for results
    if (instance.config.async) {
      [ageRes, genderRes, emotionRes, mobilefacenetRes, descRes, gearRes, antispoofRes, livenessRes] = await Promise.all([ageRes, genderRes, emotionRes, mobilefacenetRes, descRes, gearRes, antispoofRes, livenessRes]);
    }
    instance.analyze('Finish Face:');

    if (instance.config.face['ssrnet']?.enabled && ageRes && genderRes) { // override age/gender if ssrnet model is used
      descRes = {
        ...(descRes as DescRes),
        age: (ageRes as { age: number}).age,
        gender: (genderRes as { gender: Gender, genderScore: number }).gender,
        genderScore: (genderRes as { gender: Gender, genderScore: number }).genderScore,
      };
    }
    if (instance.config.face['gear']?.enabled && gearRes) { // override age/gender/race if gear model is used
      descRes = {
        ...(descRes as DescRes),
        age: (gearRes as gear.GearType).age,
        gender: (gearRes as gear.GearType).gender,
        genderScore: (gearRes as gear.GearType).genderScore,
        race: (gearRes as gear.GearType).race,
      };
    }
    if (instance.config.face['mobilefacenet']?.enabled && mobilefacenetRes) { // override descriptor if embedding model is used
      (descRes as DescRes).descriptor = mobilefacenetRes as number[];
    }

    // calculate iris distance
    // iris: array[ center, left, top, right, bottom]
    if (!instance.config.face.iris?.enabled) {
      // if (faces[i]?.annotations?.leftEyeIris) delete faces[i].annotations.leftEyeIris;
      // if (faces[i]?.annotations?.rightEyeIris) delete faces[i].annotations.rightEyeIris;
    }
    const irisSize = (faces[i].annotations && faces[i].annotations.leftEyeIris && faces[i].annotations.leftEyeIris[0] && faces[i].annotations.rightEyeIris && faces[i].annotations.rightEyeIris[0]
      && (faces[i].annotations.leftEyeIris.length > 0) && (faces[i].annotations.rightEyeIris.length > 0)
      && (faces[i].annotations.leftEyeIris[0] !== null) && (faces[i].annotations.rightEyeIris[0] !== null))
      ? Math.max(Math.abs(faces[i].annotations.leftEyeIris[3][0] - faces[i].annotations.leftEyeIris[1][0]), Math.abs(faces[i].annotations.rightEyeIris[4][1] - faces[i].annotations.rightEyeIris[2][1])) / input.shape[2]
      : 0; // note: average human iris size is 11.7mm

    // optionally return tensor
    const tensor = instance.config.face.detector?.return ? tf.squeeze(faces[i].tensor) : null;
    // dispose original face tensor
    tf.dispose(faces[i].tensor);
    // delete temp face image
    if (faces[i].tensor) delete faces[i].tensor;
    // combine results
    const res: FaceResult = {
      ...faces[i],
      id: i,
    };
    if ((descRes as DescRes)?.age) res.age = (descRes as DescRes).age as number;
    if ((descRes as DescRes)?.gender) res.gender = (descRes as DescRes).gender as Gender;
    if ((descRes as DescRes)?.genderScore) res.genderScore = (descRes as DescRes)?.genderScore as number;
    if ((descRes as DescRes)?.descriptor) res.embedding = (descRes as DescRes)?.descriptor as Array<number>;
    if ((descRes as DescRes)?.race) res.race = (descRes as DescRes)?.race as { score: number, race: Race }[];
    if (emotionRes) res.emotion = emotionRes as Array<{ score: number, emotion: Emotion }>;
    if (antispoofRes) res.real = antispoofRes as number;
    if (livenessRes) res.live = livenessRes as number;
    if (irisSize && irisSize !== 0) res.iris = Math.trunc(500 / irisSize / 11.7) / 100;
    if (rotation) res.rotation = rotation;
    if (tensor) res.tensor = tensor;
    faceRes.push(res);
    instance.analyze('End Face');
  }
  instance.analyze('End FaceMesh:');
  if (instance.config.async) {
    if (instance.performance.face) delete instance.performance.face;
    if (instance.performance.age) delete instance.performance.age;
    if (instance.performance.gender) delete instance.performance.gender;
    if (instance.performance.emotion) delete instance.performance.emotion;
  }
  return faceRes;
};
