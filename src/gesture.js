exports.body = (res) => {
  if (!res) return [];
  const gestures = [];
  for (const pose of res) {
    // raising hands
    const leftWrist = pose.keypoints.find((a) => (a.part === 'leftWrist'));
    const rightWrist = pose.keypoints.find((a) => (a.part === 'rightWrist'));
    const nose = pose.keypoints.find((a) => (a.part === 'nose'));
    if (nose && leftWrist && rightWrist && (leftWrist.position.y < nose.position.y) && (rightWrist.position.y < nose.position.y)) gestures.push('i give up');
    else if (nose && leftWrist && (leftWrist.position.y < nose.position.y)) gestures.push('raise left hand');
    else if (nose && rightWrist && (rightWrist.position.y < nose.position.y)) gestures.push('raise right hand');

    // leaning
    const leftShoulder = pose.keypoints.find((a) => (a.part === 'leftShoulder'));
    const rightShoulder = pose.keypoints.find((a) => (a.part === 'rightShoulder'));
    if (leftShoulder && rightShoulder) gestures.push(`leaning ${(leftShoulder.position.y > rightShoulder.position.y) ? 'left' : 'right'}`);
  }
  return gestures;
};

exports.face = (res) => {
  if (!res) return [];
  const gestures = [];
  for (const face of res) {
    if (face.annotations['rightCheek'] && face.annotations['leftCheek'] && (face.annotations['rightCheek'].length > 0) && (face.annotations['leftCheek'].length > 0)) {
      gestures.push(`facing ${((face.annotations['rightCheek'][0][2] > 0) || (face.annotations['leftCheek'][0][2] < 0)) ? 'right' : 'left'}`);
    }
  }
  return gestures;
};

exports.hand = (res) => {
  if (!res) return [];
  const gestures = [];
  for (const hand of res) {
    const fingers = [];
    for (const [finger, pos] of Object.entries(hand['annotations'])) {
      if (finger !== 'palmBase') fingers.push({ name: finger.toLowerCase(), position: pos[0] }); // get tip of each finger
    }
    if (fingers && fingers.length > 0) {
      const closest = fingers.reduce((best, a) => (best.position[2] < a.position[2] ? best : a));
      const highest = fingers.reduce((best, a) => (best.position[1] < a.position[1] ? best : a));
      gestures.push(`${closest.name} forward ${highest.name} up`);
    }
  }
  return gestures;
};
