export const defaultLabels = {
  face: `face
    confidence: [score]%
    [gender] [genderScore]%
    age: [age] years
    distance: [distance]cm
    real: [real]%
    live: [live]%
    [emotions]
    roll: [roll]° yaw:[yaw]° pitch:[pitch]°
    gaze: [gaze]°`,
  body: 'body [score]%',
  bodyPart: '[label] [score]%',
  object: '[label] [score]%',
  hand: '[label] [score]%',
  finger: '[label]',
  gesture: '[where] [who]: [what]',
};
