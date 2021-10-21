/**
 * FingerPose algorithm implementation constants
 *
 * Based on: [**FingerPose***](https://github.com/andypotato/fingerpose)
 */

import { Finger, FingerCurl, FingerDirection } from './fingerdef';
import Gestures from '../hand/fingergesture';

const minConfidence = 0.7;
const options = {
  // curl estimation
  HALF_CURL_START_LIMIT: 60.0,
  NO_CURL_START_LIMIT: 130.0,
  // direction estimation
  DISTANCE_VOTE_POWER: 1.1,
  SINGLE_ANGLE_VOTE_POWER: 0.9,
  TOTAL_ANGLE_VOTE_POWER: 1.6,
};

function calculateSlope(point1x, point1y, point2x, point2y) {
  const value = (point1y - point2y) / (point1x - point2x);
  let slope = Math.atan(value) * 180 / Math.PI;
  if (slope <= 0) slope = -slope;
  else if (slope > 0) slope = 180 - slope;
  return slope;
}

// point1, point2 are 2d or 3d point arrays (xy[z])
// returns either a single scalar (2d) or array of two slopes (3d)
function getSlopes(point1, point2) {
  if (!point1 || !point2) return [0, 0];
  const slopeXY = calculateSlope(point1[0], point1[1], point2[0], point2[1]);
  if (point1.length === 2) return slopeXY;
  const slopeYZ = calculateSlope(point1[1], point1[2], point2[1], point2[2]);
  return [slopeXY, slopeYZ];
}

function angleOrientationAt(angle, weightageAt = 1.0) {
  let isVertical = 0;
  let isDiagonal = 0;
  let isHorizontal = 0;
  if (angle >= 75.0 && angle <= 105.0) isVertical = 1 * weightageAt;
  else if (angle >= 25.0 && angle <= 155.0) isDiagonal = 1 * weightageAt;
  else isHorizontal = 1 * weightageAt;
  return [isVertical, isDiagonal, isHorizontal];
}

function estimateFingerCurl(startPoint, midPoint, endPoint) {
  const start_mid_x_dist = startPoint[0] - midPoint[0];
  const start_end_x_dist = startPoint[0] - endPoint[0];
  const mid_end_x_dist = midPoint[0] - endPoint[0];
  const start_mid_y_dist = startPoint[1] - midPoint[1];
  const start_end_y_dist = startPoint[1] - endPoint[1];
  const mid_end_y_dist = midPoint[1] - endPoint[1];
  const start_mid_z_dist = startPoint[2] - midPoint[2];
  const start_end_z_dist = startPoint[2] - endPoint[2];
  const mid_end_z_dist = midPoint[2] - endPoint[2];
  const start_mid_dist = Math.sqrt(start_mid_x_dist * start_mid_x_dist + start_mid_y_dist * start_mid_y_dist + start_mid_z_dist * start_mid_z_dist);
  const start_end_dist = Math.sqrt(start_end_x_dist * start_end_x_dist + start_end_y_dist * start_end_y_dist + start_end_z_dist * start_end_z_dist);
  const mid_end_dist = Math.sqrt(mid_end_x_dist * mid_end_x_dist + mid_end_y_dist * mid_end_y_dist + mid_end_z_dist * mid_end_z_dist);
  let cos_in = (mid_end_dist * mid_end_dist + start_mid_dist * start_mid_dist - start_end_dist * start_end_dist) / (2 * mid_end_dist * start_mid_dist);
  if (cos_in > 1.0) cos_in = 1.0;
  else if (cos_in < -1.0) cos_in = -1.0;
  let angleOfCurve = Math.acos(cos_in);
  angleOfCurve = (57.2958 * angleOfCurve) % 180;
  let fingerCurl;
  if (angleOfCurve > options.NO_CURL_START_LIMIT) fingerCurl = FingerCurl.none;
  else if (angleOfCurve > options.HALF_CURL_START_LIMIT) fingerCurl = FingerCurl.half;
  else fingerCurl = FingerCurl.full;
  return fingerCurl;
}

function estimateHorizontalDirection(start_end_x_dist, start_mid_x_dist, mid_end_x_dist, max_dist_x) {
  let estimatedDirection;
  if (max_dist_x === Math.abs(start_end_x_dist)) {
    if (start_end_x_dist > 0) estimatedDirection = FingerDirection.horizontalLeft;
    else estimatedDirection = FingerDirection.horizontalRight;
  } else if (max_dist_x === Math.abs(start_mid_x_dist)) {
    if (start_mid_x_dist > 0) estimatedDirection = FingerDirection.horizontalLeft;
    else estimatedDirection = FingerDirection.horizontalRight;
  } else {
    if (mid_end_x_dist > 0) estimatedDirection = FingerDirection.horizontalLeft;
    else estimatedDirection = FingerDirection.horizontalRight;
  }
  return estimatedDirection;
}

function estimateVerticalDirection(start_end_y_dist, start_mid_y_dist, mid_end_y_dist, max_dist_y) {
  let estimatedDirection;
  if (max_dist_y === Math.abs(start_end_y_dist)) {
    if (start_end_y_dist < 0) estimatedDirection = FingerDirection.verticalDown;
    else estimatedDirection = FingerDirection.verticalUp;
  } else if (max_dist_y === Math.abs(start_mid_y_dist)) {
    if (start_mid_y_dist < 0) estimatedDirection = FingerDirection.verticalDown;
    else estimatedDirection = FingerDirection.verticalUp;
  } else {
    if (mid_end_y_dist < 0) estimatedDirection = FingerDirection.verticalDown;
    else estimatedDirection = FingerDirection.verticalUp;
  }
  return estimatedDirection;
}

function estimateDiagonalDirection(start_end_y_dist, start_mid_y_dist, mid_end_y_dist, max_dist_y, start_end_x_dist, start_mid_x_dist, mid_end_x_dist, max_dist_x) {
  let estimatedDirection;
  const reqd_vertical_direction = estimateVerticalDirection(start_end_y_dist, start_mid_y_dist, mid_end_y_dist, max_dist_y);
  const reqd_horizontal_direction = estimateHorizontalDirection(start_end_x_dist, start_mid_x_dist, mid_end_x_dist, max_dist_x);
  if (reqd_vertical_direction === FingerDirection.verticalUp) {
    if (reqd_horizontal_direction === FingerDirection.horizontalLeft) estimatedDirection = FingerDirection.diagonalUpLeft;
    else estimatedDirection = FingerDirection.diagonalUpRight;
  } else {
    if (reqd_horizontal_direction === FingerDirection.horizontalLeft) estimatedDirection = FingerDirection.diagonalDownLeft;
    else estimatedDirection = FingerDirection.diagonalDownRight;
  }
  return estimatedDirection;
}

function calculateFingerDirection(startPoint, midPoint, endPoint, fingerSlopes) {
  const start_mid_x_dist = startPoint[0] - midPoint[0];
  const start_end_x_dist = startPoint[0] - endPoint[0];
  const mid_end_x_dist = midPoint[0] - endPoint[0];
  const start_mid_y_dist = startPoint[1] - midPoint[1];
  const start_end_y_dist = startPoint[1] - endPoint[1];
  const mid_end_y_dist = midPoint[1] - endPoint[1];
  const max_dist_x = Math.max(Math.abs(start_mid_x_dist), Math.abs(start_end_x_dist), Math.abs(mid_end_x_dist));
  const max_dist_y = Math.max(Math.abs(start_mid_y_dist), Math.abs(start_end_y_dist), Math.abs(mid_end_y_dist));
  let voteVertical = 0.0;
  let voteDiagonal = 0.0;
  let voteHorizontal = 0.0;
  const start_end_x_y_dist_ratio = max_dist_y / (max_dist_x + 0.00001);
  if (start_end_x_y_dist_ratio > 1.5) voteVertical += options.DISTANCE_VOTE_POWER;
  else if (start_end_x_y_dist_ratio > 0.66) voteDiagonal += options.DISTANCE_VOTE_POWER;
  else voteHorizontal += options.DISTANCE_VOTE_POWER;
  const start_mid_dist = Math.sqrt(start_mid_x_dist * start_mid_x_dist + start_mid_y_dist * start_mid_y_dist);
  const start_end_dist = Math.sqrt(start_end_x_dist * start_end_x_dist + start_end_y_dist * start_end_y_dist);
  const mid_end_dist = Math.sqrt(mid_end_x_dist * mid_end_x_dist + mid_end_y_dist * mid_end_y_dist);
  const max_dist = Math.max(start_mid_dist, start_end_dist, mid_end_dist);
  let calc_start_point_x = startPoint[0];
  let calc_start_point_y = startPoint[1];
  let calc_end_point_x = endPoint[0];
  let calc_end_point_y = endPoint[1];
  if (max_dist === start_mid_dist) {
    calc_end_point_x = endPoint[0];
    calc_end_point_y = endPoint[1];
  } else if (max_dist === mid_end_dist) {
    calc_start_point_x = midPoint[0];
    calc_start_point_y = midPoint[1];
  }
  const calcStartPoint = [calc_start_point_x, calc_start_point_y];
  const calcEndPoint = [calc_end_point_x, calc_end_point_y];
  const totalAngle = getSlopes(calcStartPoint, calcEndPoint);
  const votes = angleOrientationAt(totalAngle, options.TOTAL_ANGLE_VOTE_POWER);
  voteVertical += votes[0];
  voteDiagonal += votes[1];
  voteHorizontal += votes[2];
  for (const fingerSlope of fingerSlopes) {
    const fingerVotes = angleOrientationAt(fingerSlope, options.SINGLE_ANGLE_VOTE_POWER);
    voteVertical += fingerVotes[0];
    voteDiagonal += fingerVotes[1];
    voteHorizontal += fingerVotes[2];
  }
  // in case of tie, highest preference goes to Vertical,
  // followed by horizontal and then diagonal
  let estimatedDirection;
  if (voteVertical === Math.max(voteVertical, voteDiagonal, voteHorizontal)) {
    estimatedDirection = estimateVerticalDirection(start_end_y_dist, start_mid_y_dist, mid_end_y_dist, max_dist_y);
  } else if (voteHorizontal === Math.max(voteDiagonal, voteHorizontal)) {
    estimatedDirection = estimateHorizontalDirection(start_end_x_dist, start_mid_x_dist, mid_end_x_dist, max_dist_x);
  } else {
    estimatedDirection = estimateDiagonalDirection(start_end_y_dist, start_mid_y_dist, mid_end_y_dist, max_dist_y, start_end_x_dist, start_mid_x_dist, mid_end_x_dist, max_dist_x);
  }
  return estimatedDirection;
}

function estimate(landmarks) {
  // step 1: calculate slopes
  const slopesXY: Array<number[]> = [];
  const slopesYZ: Array<number[]> = [];
  const fingerCurls: Array<number> = [];
  const fingerDirections: Array<number> = [];
  if (!landmarks) return { curls: fingerCurls, directions: fingerDirections };

  // step 1: calculate slopes
  for (const finger of Finger.all) {
    const points = Finger.getPoints(finger);
    const slopeAtXY: Array<number> = [];
    const slopeAtYZ: Array<number> = [];
    for (const point of points) {
      const point1 = landmarks[point[0]];
      const point2 = landmarks[point[1]];
      // calculate single slope
      const slopes = getSlopes(point1, point2);
      const slopeXY = slopes[0];
      const slopeYZ = slopes[1];
      slopeAtXY.push(slopeXY);
      slopeAtYZ.push(slopeYZ);
    }
    slopesXY.push(slopeAtXY);
    slopesYZ.push(slopeAtYZ);
  }

  // step 2: calculate orientations
  for (const finger of Finger.all) {
    // start finger predictions from palm - except for thumb
    const pointIndexAt = (finger === Finger.thumb) ? 1 : 0;
    const fingerPointsAt = Finger.getPoints(finger);
    const startPoint = landmarks[fingerPointsAt[pointIndexAt][0]];
    const midPoint = landmarks[fingerPointsAt[pointIndexAt + 1][1]];
    const endPoint = landmarks[fingerPointsAt[3][1]];
    // check if finger is curled
    const fingerCurled = estimateFingerCurl(startPoint, midPoint, endPoint);
    const fingerPosition = calculateFingerDirection(startPoint, midPoint, endPoint, slopesXY[finger].slice(pointIndexAt));
    fingerCurls[finger] = fingerCurled;
    fingerDirections[finger] = fingerPosition;
  }
  return { curls: fingerCurls, directions: fingerDirections };
}

export function analyze(keypoints) { // get estimations of curl / direction for each finger
  if (!keypoints || keypoints.length === 0) return null;
  const estimatorRes = estimate(keypoints);
  const landmarks = {};
  for (const fingerIdx of Finger.all) {
    landmarks[Finger.getName(fingerIdx)] = {
      curl: FingerCurl.getName(estimatorRes.curls[fingerIdx]),
      direction: FingerDirection.getName(estimatorRes.directions[fingerIdx]),
    };
  }
  return landmarks;
}

export function match(keypoints) { // compare gesture description to each known gesture
  const poses: Array<{ name: string, confidence: number }> = [];
  if (!keypoints || keypoints.length === 0) return poses;
  const estimatorRes = estimate(keypoints);
  for (const gesture of Gestures) {
    const confidence = gesture.matchAgainst(estimatorRes.curls, estimatorRes.directions);
    if (confidence >= minConfidence) poses.push({ name: gesture.name, confidence });
  }
  return poses;
}
