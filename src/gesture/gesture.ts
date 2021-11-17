/**
 * Gesture detection algorithm
 */

import type { GestureResult, BodyResult, FaceResult, HandResult, Point } from '../result';
import * as fingerPose from '../hand/fingerpose';

/** face gesture type */
export type FaceGesture =
  `facing ${'left' | 'center' | 'right'}`
  | `blink ${'left' | 'right'} eye`
  | `mouth ${number}% open`
  | `head ${'up' | 'down'}`;

/** iris gesture type */
export type IrisGesture =
  'facing center'
  | `looking ${'left' | 'right' | 'up' | 'down'}`
  | 'looking center';

/** body gesture type */
export type BodyGesture =
  `leaning ${'left' | 'right'}`
  | `raise ${'left' | 'right'} hand`
  | 'i give up';

/** hand gesture type */
export type HandGesture =
  `${'thumb' | 'index' | 'middle' | 'ring' | 'pinky'} forward`
  | `${'thumb' | 'index' | 'middle' | 'ring' | 'pinky'} up`
  | 'victory'
  | 'thumbs up';

export const body = (res: BodyResult[]): GestureResult[] => {
  if (!res) return [];
  const gestures: Array<{ body: number, gesture: BodyGesture }> = [];
  for (let i = 0; i < res.length; i++) {
    // raising hands
    const leftWrist = res[i].keypoints.find((a) => (a.part === 'leftWrist'));
    const rightWrist = res[i].keypoints.find((a) => (a.part === 'rightWrist'));
    const nose = res[i].keypoints.find((a) => (a.part === 'nose'));
    if (nose && leftWrist && rightWrist && (leftWrist.position[1] < nose.position[1]) && (rightWrist.position[1] < nose.position[1])) gestures.push({ body: i, gesture: 'i give up' });
    else if (nose && leftWrist && (leftWrist.position[1] < nose.position[1])) gestures.push({ body: i, gesture: 'raise left hand' });
    else if (nose && rightWrist && (rightWrist.position[1] < nose.position[1])) gestures.push({ body: i, gesture: 'raise right hand' });

    // leaning
    const leftShoulder = res[i].keypoints.find((a) => (a.part === 'leftShoulder'));
    const rightShoulder = res[i].keypoints.find((a) => (a.part === 'rightShoulder'));
    if (leftShoulder && rightShoulder && Math.abs(leftShoulder.positionRaw[1] - rightShoulder.positionRaw[1]) > 0.1) {
      gestures.push({ body: i, gesture: `leaning ${(leftShoulder.position[1] > rightShoulder.position[1]) ? 'left' : 'right'}` });
    }
  }
  return gestures;
};

export const face = (res: FaceResult[]): GestureResult[] => {
  if (!res) return [];
  const gestures: Array<{ face: number, gesture: FaceGesture }> = [];
  for (let i = 0; i < res.length; i++) {
    if (res[i].mesh && res[i].mesh.length > 450) {
      const zDiff = (res[i].mesh[33][2] || 0) - (res[i].mesh[263][2] || 0);
      const xDiff = res[i].mesh[33][0] - res[i].mesh[263][0];
      if (Math.abs(zDiff / xDiff) <= 0.15) gestures.push({ face: i, gesture: 'facing center' });
      else gestures.push({ face: i, gesture: `facing ${zDiff < 0 ? 'left' : 'right'}` });
      const openLeft = Math.abs(res[i].mesh[374][1] - res[i].mesh[386][1]) / Math.abs(res[i].mesh[443][1] - res[i].mesh[450][1]); // center of eye inner lid y coord div center of wider eye border y coord
      if (openLeft < 0.2) gestures.push({ face: i, gesture: 'blink left eye' });
      const openRight = Math.abs(res[i].mesh[145][1] - res[i].mesh[159][1]) / Math.abs(res[i].mesh[223][1] - res[i].mesh[230][1]); // center of eye inner lid y coord div center of wider eye border y coord
      if (openRight < 0.2) gestures.push({ face: i, gesture: 'blink right eye' });
      const mouthOpen = Math.min(100, 500 * Math.abs(res[i].mesh[13][1] - res[i].mesh[14][1]) / Math.abs(res[i].mesh[10][1] - res[i].mesh[152][1]));
      if (mouthOpen > 10) gestures.push({ face: i, gesture: `mouth ${Math.trunc(mouthOpen)}% open` });
      const chinDepth = res[i].mesh[152][2] || 0;
      if (Math.abs(chinDepth) > 10) gestures.push({ face: i, gesture: `head ${chinDepth < 0 ? 'up' : 'down'}` });
    }
  }
  return gestures;
};

export const iris = (res: FaceResult[]): GestureResult[] => {
  if (!res) return [];
  const gestures: Array<{ iris: number, gesture: IrisGesture }> = [];
  for (let i = 0; i < res.length; i++) {
    if (!res[i].annotations || !res[i].annotations.leftEyeIris || !res[i].annotations.leftEyeIris[0] || !res[i].annotations.rightEyeIris || !res[i].annotations.rightEyeIris[0]) continue;
    const sizeXLeft = res[i].annotations.leftEyeIris[3][0] - res[i].annotations.leftEyeIris[1][0];
    const sizeYLeft = res[i].annotations.leftEyeIris[4][1] - res[i].annotations.leftEyeIris[2][1];
    const areaLeft = Math.abs(sizeXLeft * sizeYLeft);

    const sizeXRight = res[i].annotations.rightEyeIris[3][0] - res[i].annotations.rightEyeIris[1][0];
    const sizeYRight = res[i].annotations.rightEyeIris[4][1] - res[i].annotations.rightEyeIris[2][1];
    const areaRight = Math.abs(sizeXRight * sizeYRight);

    let center = false;
    const difference = Math.abs(areaLeft - areaRight) / Math.max(areaLeft, areaRight);
    if (difference < 0.25) {
      center = true;
      gestures.push({ iris: i, gesture: 'facing center' });
    }

    const leftIrisCenterX = Math.abs(res[i].mesh[263][0] - res[i].annotations.leftEyeIris[0][0]) / res[i].box[2];
    const rightIrisCenterX = Math.abs(res[i].mesh[33][0] - res[i].annotations.rightEyeIris[0][0]) / res[i].box[2];
    if (leftIrisCenterX > 0.06 || rightIrisCenterX > 0.06) center = false;
    if (leftIrisCenterX > rightIrisCenterX) { // check eye with bigger offset
      if (leftIrisCenterX > 0.05) gestures.push({ iris: i, gesture: 'looking right' });
    } else {
      if (rightIrisCenterX > 0.05) gestures.push({ iris: i, gesture: 'looking left' });
    }

    const rightIrisCenterY = Math.abs(res[i].mesh[145][1] - res[i].annotations.rightEyeIris[0][1]) / res[i].box[3];
    const leftIrisCenterY = Math.abs(res[i].mesh[374][1] - res[i].annotations.leftEyeIris[0][1]) / res[i].box[3];
    if (leftIrisCenterY < 0.01 || rightIrisCenterY < 0.01 || leftIrisCenterY > 0.022 || rightIrisCenterY > 0.022) center = false;
    if (leftIrisCenterY < 0.01 || rightIrisCenterY < 0.01) gestures.push({ iris: i, gesture: 'looking down' });
    if (leftIrisCenterY > 0.022 || rightIrisCenterY > 0.022) gestures.push({ iris: i, gesture: 'looking up' });

    // still center;
    if (center) gestures.push({ iris: i, gesture: 'looking center' });
  }
  return gestures;
};

export const hand = (res: HandResult[]): GestureResult[] => {
  if (!res) return [];
  const gestures: Array<{ hand: number, gesture: HandGesture }> = [];
  for (let i = 0; i < res.length; i++) {
    const fingers: Array<{ name: string, position: Point }> = [];
    if (res[i]['annotations']) {
      for (const [finger, pos] of Object.entries(res[i]['annotations'])) {
        if (finger !== 'palmBase' && Array.isArray(pos) && pos[0]) fingers.push({ name: finger.toLowerCase(), position: pos[0] }); // get tip of each finger
      }
    }
    if (fingers && fingers.length > 0) {
      const closest = fingers.reduce((best, a) => ((best.position[2] || 0) < (a.position[2] || 0) ? best : a));
      gestures.push({ hand: i, gesture: `${closest.name} forward` as HandGesture });
      const highest = fingers.reduce((best, a) => (best.position[1] < a.position[1] ? best : a));
      gestures.push({ hand: i, gesture: `${highest.name} up` as HandGesture });
    }
    if (res[i]['keypoints']) {
      const poses = fingerPose.match(res[i]['keypoints']);
      for (const pose of poses) gestures.push({ hand: i, gesture: pose.name as HandGesture });
    }
  }
  return gestures;
};
