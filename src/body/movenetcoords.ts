export const kpt: Array<string> = [ // used to create part labels
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

export const horizontal: Array<string[]> = [ // used to fix left vs right
  ['leftEye', 'rightEye'],
  ['leftEar', 'rightEar'],
  ['leftShoulder', 'rightShoulder'],
  ['leftElbow', 'rightElbow'],
  ['leftWrist', 'rightWrist'],
  ['leftHip', 'rightHip'],
  ['leftKnee', 'rightKnee'],
  ['leftAnkle', 'rightAnkle'],
];

export const vertical: Array<string[]> = [ // used to remove unlikely keypoint positions
  ['leftKnee', 'leftShoulder'],
  ['rightKnee', 'rightShoulder'],
  ['leftAnkle', 'leftKnee'],
  ['rightAnkle', 'rightKnee'],
];

export const relative: Array<string[][]> = [ // used to match relative body parts
  [['leftHip', 'rightHip'], ['leftShoulder', 'rightShoulder']],
  [['leftElbow', 'rightElbow'], ['leftShoulder', 'rightShoulder']],
];

export const connected: Record<string, string[]> = { // used to create body outline in annotations
  leftLeg: ['leftHip', 'leftKnee', 'leftAnkle'],
  rightLeg: ['rightHip', 'rightKnee', 'rightAnkle'],
  torso: ['leftShoulder', 'rightShoulder', 'rightHip', 'leftHip', 'leftShoulder'],
  leftArm: ['leftShoulder', 'leftElbow', 'leftWrist'],
  rightArm: ['rightShoulder', 'rightElbow', 'rightWrist'],
  head: [],
};
