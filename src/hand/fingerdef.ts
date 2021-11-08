/**
 * FingerPose algorithm implementation
 * See `fingerpose.ts` for entry point
 */

export const Finger = {
  thumb: 0,
  index: 1,
  middle: 2,
  ring: 3,
  pinky: 4,
  all: [0, 1, 2, 3, 4], // just for convenience
  nameMapping: { 0: 'thumb', 1: 'index', 2: 'middle', 3: 'ring', 4: 'pinky' },
  // Describes mapping of joints based on the 21 points returned by handpose.
  // [0]     Palm
  // [1-4]   Thumb
  // [5-8]   Index
  // [9-12]  Middle
  // [13-16] Ring
  // [17-20] Pinky
  pointsMapping: {
    0: [[0, 1], [1, 2], [2, 3], [3, 4]],
    1: [[0, 5], [5, 6], [6, 7], [7, 8]],
    2: [[0, 9], [9, 10], [10, 11], [11, 12]],
    3: [[0, 13], [13, 14], [14, 15], [15, 16]],
    4: [[0, 17], [17, 18], [18, 19], [19, 20]],
  },
  getName: (value) => Finger.nameMapping[value],
  getPoints: (value) => Finger.pointsMapping[value],
};

export const FingerCurl = {
  none: 0,
  half: 1,
  full: 2,
  nameMapping: { 0: 'none', 1: 'half', 2: 'full' },
  getName: (value) => FingerCurl.nameMapping[value],
};

export const FingerDirection = {
  verticalUp: 0,
  verticalDown: 1,
  horizontalLeft: 2,
  horizontalRight: 3,
  diagonalUpRight: 4,
  diagonalUpLeft: 5,
  diagonalDownRight: 6,
  diagonalDownLeft: 7,
  nameMapping: { 0: 'verticalUp', 1: 'verticalDown', 2: 'horizontalLeft', 3: 'horizontalRight', 4: 'diagonalUpRight', 5: 'diagonalUpLeft', 6: 'diagonalDownRight', 7: 'diagonalDownLeft' },
  getName: (value) => FingerDirection.nameMapping[value],
};

export class FingerGesture {
  name;
  curls;
  directions;
  weights;
  weightsRelative;

  constructor(name) {
    // name (should be unique)
    this.name = name;
    this.curls = {};
    this.directions = {};
    this.weights = [1.0, 1.0, 1.0, 1.0, 1.0];
    this.weightsRelative = [1.0, 1.0, 1.0, 1.0, 1.0];
  }

  curl(finger, curl, confidence) {
    if (typeof this.curls[finger] === 'undefined') this.curls[finger] = [];
    this.curls[finger].push([curl, confidence]);
  }

  direction(finger, position, confidence) {
    if (!this.directions[finger]) this.directions[finger] = [];
    this.directions[finger].push([position, confidence]);
  }

  weight(finger, weight) {
    this.weights[finger] = weight;
    // recalculate relative weights
    const total = this.weights.reduce((a, b) => a + b, 0);
    this.weightsRelative = this.weights.map((el) => el * 5 / total);
  }

  matchAgainst(detectedCurls, detectedDirections) {
    let confidence = 0.0;
    // look at the detected curl of each finger and compare with
    // the expected curl of this finger inside current gesture
    for (const fingerIdx in detectedCurls) {
      const detectedCurl = detectedCurls[fingerIdx];
      const expectedCurls = this.curls[fingerIdx];
      if (typeof expectedCurls === 'undefined') {
        // no curl description available for this finger
        // add default confidence of "1"
        confidence += this.weightsRelative[fingerIdx];
        continue;
      }
      // compare to each possible curl of this specific finger
      for (const [expectedCurl, score] of expectedCurls) {
        if (detectedCurl === expectedCurl) {
          confidence += score * this.weightsRelative[fingerIdx];
          break;
        }
      }
    }
    // same for detected direction of each finger
    for (const fingerIdx in detectedDirections) {
      const detectedDirection = detectedDirections[fingerIdx];
      const expectedDirections = this.directions[fingerIdx];
      if (typeof expectedDirections === 'undefined') {
        // no direction description available for this finger
        // add default confidence of "1"
        confidence += this.weightsRelative[fingerIdx];
        continue;
      }
      // compare to each possible direction of this specific finger
      for (const [expectedDirection, score] of expectedDirections) {
        if (detectedDirection === expectedDirection) {
          confidence += score * this.weightsRelative[fingerIdx];
          break;
        }
      }
    }
    return confidence / 10;
  }
}
