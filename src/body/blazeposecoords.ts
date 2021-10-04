/* eslint-disable no-multi-spaces */

export const kpt = [
  'nose',            //  0
  'leftEyeInside',   //  1
  'leftEye',         //  2
  'leftEyeOutside',  //  3
  'rightEyeInside',  //  4
  'rightEye',        //  5
  'rightEyeOutside', //  6
  'leftEar',         //  7
  'rightEar',        //  8
  'leftMouth',       //  9
  'rightMouth',      // 10
  'leftShoulder',    // 11
  'rightShoulder',   // 12
  'leftElbow',       // 13
  'rightElbow',      // 14
  'leftWrist',       // 15
  'rightWrist',      // 16
  'leftPalm',        // 17
  'rightPalm',       // 18
  'leftIndex',       // 19
  'rightIndex',      // 20
  'leftPinky',       // 21
  'rightPinky',      // 22
  'leftHip',         // 23
  'rightHip',        // 24
  'leftKnee',        // 25
  'rightKnee',       // 26
  'leftAnkle',       // 27
  'rightAnkle',      // 28
  'leftHeel',        // 29
  'rightHeel',       // 30
  'leftFoot',        // 31
  'rightFoot',       // 32
  'bodyCenter',      // 33
  'bodyTop',         // 34
  'leftThumb',       // 35
  'leftHand',        // 36
  'rightThumb',      // 37
  'rightHand',       // 38
];

export const connected = {
  leftLeg: ['leftHip', 'leftKnee', 'leftAnkle', 'leftHeel', 'leftFoot'],
  rightLeg: ['rightHip', 'rightKnee', 'rightAnkle', 'rightHeel', 'rightFoot'],
  torso: ['leftShoulder', 'rightShoulder', 'rightHip', 'leftHip', 'leftShoulder'],
  leftArm: ['leftShoulder', 'leftElbow', 'leftWrist', 'leftPalm'],
  rightArm: ['rightShoulder', 'rightElbow', 'rightWrist', 'rightPalm'],
  leftHand: [],
  rightHand: [],
  head: [],
};
