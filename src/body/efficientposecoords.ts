export const kpt: Array<string> = [
  'head',
  'neck',
  'rightShoulder',
  'rightElbow',
  'rightWrist',
  'chest',
  'leftShoulder',
  'leftElbow',
  'leftWrist',
  'bodyCenter',
  'rightHip',
  'rightKnee',
  'rightAnkle',
  'leftHip',
  'leftKnee',
  'leftAnkle',
];

export const connected: Record<string, string[]> = {
  leftLeg: ['leftHip', 'leftKnee', 'leftAnkle'],
  rightLeg: ['rightHip', 'rightKnee', 'rightAnkle'],
  torso: ['leftShoulder', 'rightShoulder', 'rightHip', 'leftHip', 'leftShoulder'],
  leftArm: ['leftShoulder', 'leftElbow', 'leftWrist'],
  rightArm: ['rightShoulder', 'rightElbow', 'rightWrist'],
  head: [],
};
