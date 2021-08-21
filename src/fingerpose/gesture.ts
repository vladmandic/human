export default class Gesture {
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

  addCurl(finger, curl, confidence) {
    if (typeof this.curls[finger] === 'undefined') this.curls[finger] = [];
    this.curls[finger].push([curl, confidence]);
  }

  addDirection(finger, position, confidence) {
    if (!this.directions[finger]) this.directions[finger] = [];
    this.directions[finger].push([position, confidence]);
  }

  setWeight(finger, weight) {
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
