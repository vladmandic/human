/**
 * Results interpolation for smoothening of video detection results inbetween detected frames
 */

import type { Result, FaceResult, BodyResult, HandResult, ObjectResult, GestureResult, PersonResult, Box, Point, BodyLandmark, BodyAnnotation } from '../result';
import type { Config } from '../config';

import * as moveNetCoords from '../body/movenetcoords';
import * as blazePoseCoords from '../body/blazeposecoords';
import * as efficientPoseCoords from '../body/efficientposecoords';
import { now } from './util';
import { env } from './env';

const bufferedResult: Result = { face: [], body: [], hand: [], gesture: [], object: [], persons: [], performance: {}, timestamp: 0, error: null };
let interpolateTime = 0;

export function calc(newResult: Result, config: Config): Result {
  const t0 = now();
  if (!newResult) return { face: [], body: [], hand: [], gesture: [], object: [], persons: [], performance: {}, timestamp: 0, error: null };
  // each record is only updated using deep clone when number of detected record changes, otherwise it will converge by itself
  // otherwise bufferedResult is a shallow clone of result plus updated local calculated values
  // thus mixing by-reference and by-value assignments to minimize memory operations

  const elapsed = Date.now() - newResult.timestamp;
  // curve fitted: buffer = 8 - ln(delay)
  // interpolation formula: current = ((buffer - 1) * previous + live) / buffer
  // - at  50ms delay buffer = ~4.1 => 28% towards live data
  // - at 250ms delay buffer = ~2.5 => 40% towards live data
  // - at 500ms delay buffer = ~1.8 => 55% towards live data
  // - at 750ms delay buffer = ~1.4 => 71% towards live data
  // - at  1sec delay buffer = 1 which means live data is used
  const bufferedFactor = elapsed < 1000 ? 8 - Math.log(elapsed + 1) : 1;

  if (newResult.canvas) bufferedResult.canvas = newResult.canvas;
  if (newResult.error) bufferedResult.error = newResult.error;

  // interpolate body results
  if (!bufferedResult.body || (newResult.body.length !== bufferedResult.body.length)) {
    bufferedResult.body = JSON.parse(JSON.stringify(newResult.body as BodyResult[])); // deep clone once
  } else {
    for (let i = 0; i < newResult.body.length; i++) {
      const box = newResult.body[i].box // update box
        .map((newBoxCoord, j) => ((bufferedFactor - 1) * bufferedResult.body[i].box[j] + newBoxCoord) / bufferedFactor) as Box;
      const boxRaw = newResult.body[i].boxRaw // update boxRaw
        .map((newBoxCoord, j) => ((bufferedFactor - 1) * bufferedResult.body[i].boxRaw[j] + newBoxCoord) / bufferedFactor) as Box;
      const keypoints = (newResult.body[i].keypoints // update keypoints
        .map((newKpt, j) => ({
          score: newKpt.score,
          part: newKpt.part as BodyLandmark,
          position: [
            bufferedResult.body[i].keypoints[j] ? ((bufferedFactor - 1) * (bufferedResult.body[i].keypoints[j].position[0] || 0) + (newKpt.position[0] || 0)) / bufferedFactor : newKpt.position[0],
            bufferedResult.body[i].keypoints[j] ? ((bufferedFactor - 1) * (bufferedResult.body[i].keypoints[j].position[1] || 0) + (newKpt.position[1] || 0)) / bufferedFactor : newKpt.position[1],
            bufferedResult.body[i].keypoints[j] ? ((bufferedFactor - 1) * (bufferedResult.body[i].keypoints[j].position[2] || 0) + (newKpt.position[2] || 0)) / bufferedFactor : newKpt.position[2],
          ],
          positionRaw: [
            bufferedResult.body[i].keypoints[j] ? ((bufferedFactor - 1) * (bufferedResult.body[i].keypoints[j].positionRaw[0] || 0) + (newKpt.positionRaw[0] || 0)) / bufferedFactor : newKpt.positionRaw[0],
            bufferedResult.body[i].keypoints[j] ? ((bufferedFactor - 1) * (bufferedResult.body[i].keypoints[j].positionRaw[1] || 0) + (newKpt.positionRaw[1] || 0)) / bufferedFactor : newKpt.positionRaw[1],
            bufferedResult.body[i].keypoints[j] ? ((bufferedFactor - 1) * (bufferedResult.body[i].keypoints[j].positionRaw[2] || 0) + (newKpt.positionRaw[2] || 0)) / bufferedFactor : newKpt.positionRaw[2],
          ],
          distance: [
            bufferedResult.body[i].keypoints[j] ? ((bufferedFactor - 1) * (bufferedResult.body[i].keypoints[j].distance?.[0] || 0) + (newKpt.distance?.[0] || 0)) / bufferedFactor : newKpt.distance?.[0],
            bufferedResult.body[i].keypoints[j] ? ((bufferedFactor - 1) * (bufferedResult.body[i].keypoints[j].distance?.[1] || 0) + (newKpt.distance?.[1] || 0)) / bufferedFactor : newKpt.distance?.[1],
            bufferedResult.body[i].keypoints[j] ? ((bufferedFactor - 1) * (bufferedResult.body[i].keypoints[j].distance?.[2] || 0) + (newKpt.distance?.[2] || 0)) / bufferedFactor : newKpt.distance?.[2],
          ],
        }))) as Array<{ score: number, part: BodyLandmark, position: [number, number, number?], positionRaw: [number, number, number?] }>;

      const annotations: Record<BodyAnnotation, Point[][]> = {} as Record<BodyAnnotation, Point[][]>; // recreate annotations
      let coords = { connected: {} };
      if (config.body?.modelPath?.includes('efficientpose')) coords = efficientPoseCoords;
      else if (config.body?.modelPath?.includes('blazepose')) coords = blazePoseCoords;
      else if (config.body?.modelPath?.includes('movenet')) coords = moveNetCoords;
      for (const [name, indexes] of Object.entries(coords.connected as Record<string, string[]>)) {
        const pt: Array<Point[]> = [];
        for (let j = 0; j < indexes.length - 1; j++) {
          const pt0 = keypoints.find((kp) => kp.part === indexes[j]);
          const pt1 = keypoints.find((kp) => kp.part === indexes[j + 1]);
          // if (pt0 && pt1 && pt0.score > (config.body.minConfidence || 0) && pt1.score > (config.body.minConfidence || 0)) pt.push([pt0.position, pt1.position]);
          if (pt0 && pt1) pt.push([pt0.position, pt1.position]);
        }
        annotations[name] = pt;
      }
      bufferedResult.body[i] = { ...newResult.body[i], box, boxRaw, keypoints, annotations: annotations as BodyResult['annotations'] }; // shallow clone plus updated values
    }
  }

  // interpolate hand results
  if (!bufferedResult.hand || (newResult.hand.length !== bufferedResult.hand.length)) {
    bufferedResult.hand = JSON.parse(JSON.stringify(newResult.hand as HandResult[])); // deep clone once
  } else {
    for (let i = 0; i < newResult.hand.length; i++) {
      const box = (newResult.hand[i].box// update box
        .map((b, j) => ((bufferedFactor - 1) * bufferedResult.hand[i].box[j] + b) / bufferedFactor)) as Box;
      const boxRaw = (newResult.hand[i].boxRaw // update boxRaw
        .map((b, j) => ((bufferedFactor - 1) * bufferedResult.hand[i].boxRaw[j] + b) / bufferedFactor)) as Box;
      if (bufferedResult.hand[i].keypoints.length !== newResult.hand[i].keypoints.length) bufferedResult.hand[i].keypoints = newResult.hand[i].keypoints; // reset keypoints as previous frame did not have them
      const keypoints = newResult.hand[i].keypoints && newResult.hand[i].keypoints.length > 0 ? newResult.hand[i].keypoints // update landmarks
        .map((landmark, j) => landmark
          .map((coord, k) => (((bufferedFactor - 1) * (bufferedResult.hand[i].keypoints[j][k] || 1) + (coord || 0)) / bufferedFactor)) as Point)
        : [];
      let annotations = {};
      if (Object.keys(bufferedResult.hand[i].annotations).length !== Object.keys(newResult.hand[i].annotations).length) {
        bufferedResult.hand[i].annotations = newResult.hand[i].annotations; // reset annotations as previous frame did not have them
        annotations = bufferedResult.hand[i].annotations;
      } else if (newResult.hand[i].annotations) {
        for (const key of Object.keys(newResult.hand[i].annotations)) { // update annotations
          annotations[key] = newResult.hand[i].annotations[key] && newResult.hand[i].annotations[key][0]
            ? newResult.hand[i].annotations[key]
              .map((val, j: number) => val
                .map((coord: number, k: number) => ((bufferedFactor - 1) * bufferedResult.hand[i].annotations[key][j][k] + coord) / bufferedFactor))
            : null;
        }
      }
      bufferedResult.hand[i] = { ...newResult.hand[i], box, boxRaw, keypoints, annotations: annotations as HandResult['annotations'] }; // shallow clone plus updated values
    }
  }

  // interpolate face results
  if (!bufferedResult.face || (newResult.face.length !== bufferedResult.face.length)) {
    bufferedResult.face = JSON.parse(JSON.stringify(newResult.face as FaceResult[])); // deep clone once
  } else {
    for (let i = 0; i < newResult.face.length; i++) {
      const box = (newResult.face[i].box // update box
        .map((b, j) => ((bufferedFactor - 1) * bufferedResult.face[i].box[j] + b) / bufferedFactor)) as Box;
      const boxRaw = (newResult.face[i].boxRaw // update boxRaw
        .map((b, j) => ((bufferedFactor - 1) * bufferedResult.face[i].boxRaw[j] + b) / bufferedFactor)) as Box;
      if (newResult.face[i].rotation) {
        const rotation: {
          matrix: [number, number, number, number, number, number, number, number, number],
          angle: { roll: number, yaw: number, pitch: number },
          gaze: { bearing: number, strength: number }
        } = { matrix: [0, 0, 0, 0, 0, 0, 0, 0, 0], angle: { roll: 0, yaw: 0, pitch: 0 }, gaze: { bearing: 0, strength: 0 } };
        rotation.matrix = newResult.face[i].rotation?.matrix as [number, number, number, number, number, number, number, number, number];
        rotation.angle = {
          roll: ((bufferedFactor - 1) * (bufferedResult.face[i].rotation?.angle?.roll || 0) + (newResult.face[i].rotation?.angle?.roll || 0)) / bufferedFactor,
          yaw: ((bufferedFactor - 1) * (bufferedResult.face[i].rotation?.angle?.yaw || 0) + (newResult.face[i].rotation?.angle?.yaw || 0)) / bufferedFactor,
          pitch: ((bufferedFactor - 1) * (bufferedResult.face[i].rotation?.angle?.pitch || 0) + (newResult.face[i].rotation?.angle?.pitch || 0)) / bufferedFactor,
        };
        rotation.gaze = {
          // not fully correct due projection on circle, also causes wrap-around draw on jump from negative to positive
          bearing: ((bufferedFactor - 1) * (bufferedResult.face[i].rotation?.gaze?.bearing || 0) + (newResult.face[i].rotation?.gaze?.bearing || 0)) / bufferedFactor,
          strength: ((bufferedFactor - 1) * (bufferedResult.face[i].rotation?.gaze?.strength || 0) + (newResult.face[i].rotation?.gaze?.strength || 0)) / bufferedFactor,
        };
        bufferedResult.face[i] = { ...newResult.face[i], rotation, box, boxRaw }; // shallow clone plus updated values
      }
      bufferedResult.face[i] = { ...newResult.face[i], box, boxRaw }; // shallow clone plus updated values
    }
  }

  // interpolate object detection results
  if (!bufferedResult.object || (newResult.object.length !== bufferedResult.object.length)) {
    bufferedResult.object = JSON.parse(JSON.stringify(newResult.object as ObjectResult[])); // deep clone once
  } else {
    for (let i = 0; i < newResult.object.length; i++) {
      const box = (newResult.object[i].box // update box
        .map((b, j) => ((bufferedFactor - 1) * bufferedResult.object[i].box[j] + b) / bufferedFactor)) as Box;
      const boxRaw = (newResult.object[i].boxRaw // update boxRaw
        .map((b, j) => ((bufferedFactor - 1) * bufferedResult.object[i].boxRaw[j] + b) / bufferedFactor)) as Box;
      bufferedResult.object[i] = { ...newResult.object[i], box, boxRaw }; // shallow clone plus updated values
    }
  }

  // interpolate person results
  if (newResult.persons) {
    const newPersons = newResult.persons; // trigger getter function
    if (!bufferedResult.persons || (newPersons.length !== bufferedResult.persons.length)) {
      bufferedResult.persons = JSON.parse(JSON.stringify(newPersons as PersonResult[]));
    } else {
      for (let i = 0; i < newPersons.length; i++) { // update person box, we don't update the rest as it's updated as reference anyhow
        bufferedResult.persons[i].box = (newPersons[i].box
          .map((box, j) => ((bufferedFactor - 1) * bufferedResult.persons[i].box[j] + box) / bufferedFactor)) as Box;
      }
    }
  }

  // just copy latest gestures without interpolation
  if (newResult.gesture) bufferedResult.gesture = newResult.gesture as GestureResult[];

  // append interpolation performance data
  const t1 = now();
  interpolateTime = env.perfadd ? interpolateTime + Math.round(t1 - t0) : Math.round(t1 - t0);
  if (newResult.performance) bufferedResult.performance = { ...newResult.performance, interpolate: interpolateTime };

  return bufferedResult;
}
