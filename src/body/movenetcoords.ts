export const kpt: Array<string> = [
  'nose',
  'leftEye',
  'rightEye',
  'leftEar',
  'rightEar',
  'leftShoulder',
  'rightShoulder',
  'leftElbow',
  'rightElbow',
  'leftWrist',
  'rightWrist',
  'leftHip',
  'rightHip',
  'leftKnee',
  'rightKnee',
  'leftAnkle',
  'rightAnkle',
];

export const pairs: Array<string[]> = [
  ['leftEye', 'rightEye'],
  ['leftEar', 'rightEar'],
  ['leftShoulder', 'rightShoulder'],
  ['leftElbow', 'rightElbow'],
  ['leftWrist', 'rightWrist'],
  ['leftHip', 'rightHip'],
  ['leftKnee', 'rightKnee'],
  ['leftAnkle', 'rightAnkle'],
];

export const connected: Record<string, string[]> = {
  leftLeg: ['leftHip', 'leftKnee', 'leftAnkle'],
  rightLeg: ['rightHip', 'rightKnee', 'rightAnkle'],
  torso: ['leftShoulder', 'rightShoulder', 'rightHip', 'leftHip', 'leftShoulder'],
  leftArm: ['leftShoulder', 'leftElbow', 'leftWrist'],
  rightArm: ['rightShoulder', 'rightElbow', 'rightWrist'],
  head: [],
};
