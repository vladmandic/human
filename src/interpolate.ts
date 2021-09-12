/**
 * Module that interpolates results for smoother animations
 */

import type { Result, FaceResult, BodyResult, HandResult, ObjectResult, GestureResult, PersonResult } from './result';

const bufferedResult: Result = { face: [], body: [], hand: [], gesture: [], object: [], persons: [], performance: {}, timestamp: 0 };

export function calc(newResult: Result): Result {
  if (!newResult) return { face: [], body: [], hand: [], gesture: [], object: [], persons: [], performance: {}, timestamp: 0 };
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

  bufferedResult.canvas = newResult.canvas;

  // interpolate body results
  if (!bufferedResult.body || (newResult.body.length !== bufferedResult.body.length)) {
    bufferedResult.body = JSON.parse(JSON.stringify(newResult.body as BodyResult[])); // deep clone once
  } else {
    for (let i = 0; i < newResult.body.length; i++) {
      const box = newResult.body[i].box // update box
        .map((b, j) => ((bufferedFactor - 1) * bufferedResult.body[i].box[j] + b) / bufferedFactor) as [number, number, number, number];
      const boxRaw = newResult.body[i].boxRaw // update boxRaw
        .map((b, j) => ((bufferedFactor - 1) * bufferedResult.body[i].boxRaw[j] + b) / bufferedFactor) as [number, number, number, number];
      const keypoints = (newResult.body[i].keypoints // update keypoints
        .map((keypoint, j) => ({
          score: keypoint.score,
          part: keypoint.part,
          position: [
            bufferedResult.body[i].keypoints[j] ? ((bufferedFactor - 1) * bufferedResult.body[i].keypoints[j].position[0] + keypoint.position[0]) / bufferedFactor : keypoint.position[0],
            bufferedResult.body[i].keypoints[j] ? ((bufferedFactor - 1) * bufferedResult.body[i].keypoints[j].position[1] + keypoint.position[1]) / bufferedFactor : keypoint.position[1],
          ],
          positionRaw: [
            bufferedResult.body[i].keypoints[j] ? ((bufferedFactor - 1) * bufferedResult.body[i].keypoints[j].positionRaw[0] + keypoint.positionRaw[0]) / bufferedFactor : keypoint.position[0],
            bufferedResult.body[i].keypoints[j] ? ((bufferedFactor - 1) * bufferedResult.body[i].keypoints[j].positionRaw[1] + keypoint.positionRaw[1]) / bufferedFactor : keypoint.position[1],
          ],
        }))) as Array<{ score: number, part: string, position: [number, number, number?], positionRaw: [number, number, number?] }>;
      bufferedResult.body[i] = { ...newResult.body[i], box, boxRaw, keypoints }; // shallow clone plus updated values
    }
  }

  // interpolate hand results
  if (!bufferedResult.hand || (newResult.hand.length !== bufferedResult.hand.length)) {
    bufferedResult.hand = JSON.parse(JSON.stringify(newResult.hand as HandResult[])); // deep clone once
  } else {
    for (let i = 0; i < newResult.hand.length; i++) {
      const box = (newResult.hand[i].box// update box
        .map((b, j) => ((bufferedFactor - 1) * bufferedResult.hand[i].box[j] + b) / bufferedFactor)) as [number, number, number, number];
      const boxRaw = (newResult.hand[i].boxRaw // update boxRaw
        .map((b, j) => ((bufferedFactor - 1) * bufferedResult.hand[i].boxRaw[j] + b) / bufferedFactor)) as [number, number, number, number];
      const keypoints = newResult.hand[i].keypoints ? newResult.hand[i].keypoints // update landmarks
        .map((landmark, j) => landmark
          .map((coord, k) => (((bufferedFactor - 1) * bufferedResult.hand[i].keypoints[j][k] + coord) / bufferedFactor)) as [number, number, number])
        : [];
      const keys = Object.keys(newResult.hand[i].annotations); // update annotations
      const annotations = {};
      for (const key of keys) {
        annotations[key] = newResult.hand[i].annotations[key]
          .map((val, j) => val.map((coord, k) => ((bufferedFactor - 1) * bufferedResult.hand[i].annotations[key][j][k] + coord) / bufferedFactor));
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
        .map((b, j) => ((bufferedFactor - 1) * bufferedResult.face[i].box[j] + b) / bufferedFactor)) as [number, number, number, number];
      const boxRaw = (newResult.face[i].boxRaw // update boxRaw
        .map((b, j) => ((bufferedFactor - 1) * bufferedResult.face[i].boxRaw[j] + b) / bufferedFactor)) as [number, number, number, number];
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
  }

  // interpolate object detection results
  if (!bufferedResult.object || (newResult.object.length !== bufferedResult.object.length)) {
    bufferedResult.object = JSON.parse(JSON.stringify(newResult.object as ObjectResult[])); // deep clone once
  } else {
    for (let i = 0; i < newResult.object.length; i++) {
      const box = (newResult.object[i].box // update box
        .map((b, j) => ((bufferedFactor - 1) * bufferedResult.object[i].box[j] + b) / bufferedFactor)) as [number, number, number, number];
      const boxRaw = (newResult.object[i].boxRaw // update boxRaw
        .map((b, j) => ((bufferedFactor - 1) * bufferedResult.object[i].boxRaw[j] + b) / bufferedFactor)) as [number, number, number, number];
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
          .map((box, j) => ((bufferedFactor - 1) * bufferedResult.persons[i].box[j] + box) / bufferedFactor)) as [number, number, number, number];
      }
    }
  }

  // just copy latest gestures without interpolation
  if (newResult.gesture) bufferedResult.gesture = newResult.gesture as GestureResult[];
  if (newResult.performance) bufferedResult.performance = newResult.performance;

  return bufferedResult;
}
