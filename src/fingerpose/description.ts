const Finger = {
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

const FingerCurl = {
  none: 0,
  half: 1,
  full: 2,
  nameMapping: { 0: 'none', 1: 'half', 2: 'full' },
  getName: (value) => FingerCurl.nameMapping[value],
};

const FingerDirection = {
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

export { Finger, FingerCurl, FingerDirection };
