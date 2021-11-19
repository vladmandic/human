/* eslint-disable no-multi-spaces */

export const kpt: Array<string> = [
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
  'leftPinky',       // 17
  'rightPinky',      // 18
  'leftIndex',       // 19
  'rightIndex',      // 20
  'leftThumb',       // 21
  'rightThumb',      // 22
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
  'leftPalm',        // 35 // z-coord not ok
  'leftHand',        // 36 // similar to wrist but z-coord not ok
  'rightPalm',       // 37 // z-coord not ok
  'rightHand',       // 38 // similar to wrist but z-coord not ok
];

export const connected: Record<string, string[]> = {
  leftLeg: ['leftHip', 'leftKnee', 'leftAnkle', 'leftHeel', 'leftFoot'],
  rightLeg: ['rightHip', 'rightKnee', 'rightAnkle', 'rightHeel', 'rightFoot'],
  torso: ['leftShoulder', 'rightShoulder', 'rightHip', 'leftHip', 'leftShoulder'],
  leftArm: ['leftShoulder', 'leftElbow', 'leftWrist', 'leftPalm'],
  rightArm: ['rightShoulder', 'rightElbow', 'rightWrist', 'rightPalm'],
  leftHand: ['leftHand', 'leftPalm', 'leftPinky', 'leftPalm', 'leftIndex', 'leftPalm', 'leftThumb'],
  rightHand: ['rightHand', 'rightPalm', 'rightPinky', 'rightPalm', 'rightIndex', 'rightPalm', 'rightThumb'],
  leftEye: ['leftEyeInside', 'leftEye', 'leftEyeOutside'],
  rightEye: ['rightEyeInside', 'rightEye', 'rightEyeOutside'],
  mouth: ['leftMouth', 'rightMouth'],
};
