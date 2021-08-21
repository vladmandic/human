// based on <https://github.com/andypotato/fingerpose>

import * as estimator from './estimator';
import { Finger, FingerCurl, FingerDirection } from './description';
import Gestures from './gestures';

const minConfidence = 0.7;

export function analyze(keypoints) { // get estimations of curl / direction for each finger
  const estimatorRes = estimator.estimate(keypoints);
  const landmarks = {};
  for (const fingerIdx of Finger.all) {
    landmarks[Finger.getName(fingerIdx)] = {
      curl: FingerCurl.getName(estimatorRes.curls[fingerIdx]),
      direction: FingerDirection.getName(estimatorRes.directions[fingerIdx]),
    };
  }
  // console.log('finger landmarks', landmarks);
  return landmarks;
}

export function match(keypoints) { // compare gesture description to each known gesture
  const estimatorRes = estimator.estimate(keypoints);
  const poses: Array<{ name: string, confidence: number }> = [];
  for (const gesture of Gestures) {
    const confidence = gesture.matchAgainst(estimatorRes.curls, estimatorRes.directions);
    if (confidence >= minConfidence) poses.push({ name: gesture.name, confidence });
  }
  // console.log('finger poses', poses);
  return poses;
}
