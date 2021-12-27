/**
 * FingerPose algorithm implementation
 * See `fingerpose.ts` for entry point
 */

import { Finger, FingerCurl, FingerDirection, FingerGesture } from './fingerdef';

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
export const { thumb, index, middle, ring, pinky } = Finger;
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
export const { none, half, full } = FingerCurl;
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
export const { verticalUp, verticalDown, horizontalLeft, horizontalRight, diagonalUpRight, diagonalUpLeft, diagonalDownRight, diagonalDownLeft } = FingerDirection;

// describe thumbs up gesture 👍
const ThumbsUp = new FingerGesture('thumbs up');
ThumbsUp.curl(thumb, none, 1.0);
ThumbsUp.direction(thumb, verticalUp, 1.0);
ThumbsUp.direction(thumb, diagonalUpLeft, 0.25);
ThumbsUp.direction(thumb, diagonalUpRight, 0.25);
for (const finger of [Finger.index, Finger.middle, Finger.ring, Finger.pinky]) {
  ThumbsUp.curl(finger, full, 1.0);
  ThumbsUp.direction(finger, horizontalLeft, 1.0);
  ThumbsUp.direction(finger, horizontalRight, 1.0);
}

// describe Victory gesture ✌️
const Victory = new FingerGesture('victory');
Victory.curl(thumb, half, 0.5);
Victory.curl(thumb, none, 0.5);
Victory.direction(thumb, verticalUp, 1.0);
Victory.direction(thumb, diagonalUpLeft, 1.0);
Victory.curl(index, none, 1.0);
Victory.direction(index, verticalUp, 0.75);
Victory.direction(index, diagonalUpLeft, 1.0);
Victory.curl(middle, none, 1.0);
Victory.direction(middle, verticalUp, 1.0);
Victory.direction(middle, diagonalUpLeft, 0.75);
Victory.curl(ring, full, 1.0);
Victory.direction(ring, verticalUp, 0.2);
Victory.direction(ring, diagonalUpLeft, 1.0);
Victory.direction(ring, horizontalLeft, 0.2);
Victory.curl(pinky, full, 1.0);
Victory.direction(pinky, verticalUp, 0.2);
Victory.direction(pinky, diagonalUpLeft, 1.0);
Victory.direction(pinky, horizontalLeft, 0.2);
Victory.weight(index, 2);
Victory.weight(middle, 2);

// describe Point gesture ✌️
const Point = new FingerGesture('point');
Point.curl(thumb, full, 1.0);
Point.curl(index, none, 0.5);
Point.curl(middle, full, 0.5);
Point.curl(ring, full, 0.5);
Point.curl(pinky, full, 0.5);
Point.weight(index, 2);
Point.weight(middle, 2);

// describe Point gesture ✌️
const MiddleFinger = new FingerGesture('middle finger');
MiddleFinger.curl(thumb, none, 1.0);
MiddleFinger.curl(index, full, 0.5);
MiddleFinger.curl(middle, full, 0.5);
MiddleFinger.curl(ring, full, 0.5);
MiddleFinger.curl(pinky, full, 0.5);
MiddleFinger.weight(index, 2);
MiddleFinger.weight(middle, 2);

// describe Open Palm gesture ✌️
const OpenPalm = new FingerGesture('open palm');
OpenPalm.curl(thumb, none, 0.75);
OpenPalm.curl(index, none, 0.75);
OpenPalm.curl(middle, none, 0.75);
OpenPalm.curl(ring, none, 0.75);
OpenPalm.curl(pinky, none, 0.75);

export default [ThumbsUp, Victory, Point, MiddleFinger, OpenPalm];
