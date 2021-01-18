async function drawGesture(result, canvas, ui) {
  if (!result) return;
  const ctx = canvas.getContext('2d');
  ctx.font = ui.baseFont;
  ctx.fillStyle = ui.baseLabel;
  let i = 1;
  for (let gesture = 0; gesture < result.length; gesture++) {
    const [where, what] = Object.entries(result[gesture]);
    if ((what.length > 1) && (what[1].length > 0)) {
      const person = where[1] > 0 ? `#${where[1]}` : '';
      const label = `${where[0]} ${person}: ${what[1]}`;
      ctx.fillStyle = 'black';
      ctx.fillText(label, 8, 2 + (i * ui.baseLineHeight));
      ctx.fillStyle = ui.baseLabel;
      ctx.fillText(label, 6, 0 + (i * ui.baseLineHeight));
      i += 1;
    }
  }
}

async function drawFace(result, canvas, ui, triangulation) {
  if (!result) return;
  const ctx = canvas.getContext('2d');
  for (const face of result) {
    ctx.font = ui.baseFont;
    ctx.strokeStyle = ui.baseColor;
    ctx.fillStyle = ui.baseColor;
    ctx.lineWidth = ui.baseLineWidth;
    ctx.beginPath();
    if (ui.drawBoxes) {
      ctx.rect(face.box[0], face.box[1], face.box[2], face.box[3]);
    }
    // silly hack since fillText does not suport new line
    const labels = [];
    // labels.push(`${Math.trunc(100 * face.confidence)}% face`);
    if (face.genderConfidence) labels.push(`${face.gender || ''} ${Math.trunc(100 * face.genderConfidence)}% confident`);
    // if (face.genderConfidence) labels.push(face.gender);
    if (face.age) labels.push(`age: ${face.age || ''}`);
    if (face.iris) labels.push(`iris distance: ${face.iris}`);
    if (face.emotion && face.emotion.length > 0) {
      const emotion = face.emotion.map((a) => `${Math.trunc(100 * a.score)}% ${a.emotion}`);
      labels.push(emotion.join(' '));
    }
    if (labels.length === 0) labels.push('face');
    ctx.fillStyle = ui.baseLabel;
    for (let i = 0; i < labels.length; i++) {
      ctx.fillStyle = 'black';
      ctx.fillText(labels[i], face.box[0] + 1, face.box[1] - ((labels.length - i) * ui.baseLineHeight) + 6);
      ctx.fillStyle = ui.baseLabel;
      ctx.fillText(labels[i], face.box[0] + 0, face.box[1] - ((labels.length - i) * ui.baseLineHeight) + 5);
    }
    ctx.fillStyle = ui.baseColor;
    ctx.stroke();
    ctx.lineWidth = 1;
    if (face.mesh) {
      if (ui.drawPoints) {
        for (const point of face.mesh) {
          ctx.fillStyle = ui.useDepth ? `rgba(${127.5 + (2 * point[2])}, ${127.5 - (2 * point[2])}, 255, 0.5)` : ui.baseColor;
          ctx.beginPath();
          ctx.arc(point[0], point[1], 2, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
      if (ui.drawPolygons) {
        for (let i = 0; i < triangulation.length / 3; i++) {
          const points = [
            triangulation[i * 3 + 0],
            triangulation[i * 3 + 1],
            triangulation[i * 3 + 2],
          ].map((index) => face.mesh[index]);
          const path = new Path2D();
          path.moveTo(points[0][0], points[0][1]);
          for (const point of points) {
            path.lineTo(point[0], point[1]);
          }
          path.closePath();
          ctx.strokeStyle = ui.useDepth ? `rgba(${127.5 + (2 * points[0][2])}, ${127.5 - (2 * points[0][2])}, 255, 0.3)` : ui.baseColor;
          ctx.stroke(path);
          if (ui.fillPolygons) {
            ctx.fillStyle = ui.useDepth ? `rgba(${127.5 + (2 * points[0][2])}, ${127.5 - (2 * points[0][2])}, 255, 0.3)` : ui.baseColor;
            ctx.fill(path);
          }
        }
        // iris: array[center, left, top, right, bottom]
        if (face.annotations && face.annotations.leftEyeIris) {
          ctx.strokeStyle = ui.useDepth ? 'rgba(255, 200, 255, 0.3)' : ui.baseColor;
          ctx.beginPath();
          const sizeX = Math.abs(face.annotations.leftEyeIris[3][0] - face.annotations.leftEyeIris[1][0]) / 2;
          const sizeY = Math.abs(face.annotations.leftEyeIris[4][1] - face.annotations.leftEyeIris[2][1]) / 2;
          ctx.ellipse(face.annotations.leftEyeIris[0][0], face.annotations.leftEyeIris[0][1], sizeX, sizeY, 0, 0, 2 * Math.PI);
          ctx.stroke();
          if (ui.fillPolygons) {
            ctx.fillStyle = ui.useDepth ? 'rgba(255, 255, 200, 0.3)' : ui.baseColor;
            ctx.fill();
          }
        }
        if (face.annotations && face.annotations.rightEyeIris) {
          ctx.strokeStyle = ui.useDepth ? 'rgba(255, 200, 255, 0.3)' : ui.baseColor;
          ctx.beginPath();
          const sizeX = Math.abs(face.annotations.rightEyeIris[3][0] - face.annotations.rightEyeIris[1][0]) / 2;
          const sizeY = Math.abs(face.annotations.rightEyeIris[4][1] - face.annotations.rightEyeIris[2][1]) / 2;
          ctx.ellipse(face.annotations.rightEyeIris[0][0], face.annotations.rightEyeIris[0][1], sizeX, sizeY, 0, 0, 2 * Math.PI);
          ctx.stroke();
          if (ui.fillPolygons) {
            ctx.fillStyle = ui.useDepth ? 'rgba(255, 255, 200, 0.3)' : ui.baseColor;
            ctx.fill();
          }
        }
      }
    }
  }
}

const lastDrawnPose = [];
async function drawBody(result, canvas, ui) {
  if (!result) return;
  const ctx = canvas.getContext('2d');
  ctx.lineJoin = 'round';
  for (let i = 0; i < result.length; i++) {
    if (!lastDrawnPose[i] && ui.buffered) lastDrawnPose[i] = { ...result[i] };
    ctx.fillStyle = ui.baseColor;
    ctx.strokeStyle = ui.baseColor;
    ctx.font = ui.baseFont;
    ctx.lineWidth = ui.baseLineWidth;
    if (ui.drawPoints) {
      for (let pt = 0; pt < result[i].keypoints.length; pt++) {
        ctx.beginPath();
        if (ui.buffered) {
          lastDrawnPose[i].keypoints[pt].position.x = (lastDrawnPose[i].keypoints[pt].position.x + result[i].keypoints[pt].position.x) / 2;
          lastDrawnPose[i].keypoints[pt].position.y = (lastDrawnPose[i].keypoints[pt].position.y + result[i].keypoints[pt].position.y) / 2;
          ctx.arc(lastDrawnPose[i].keypoints[pt].position.x, lastDrawnPose[i].keypoints[pt].position.y, 2, 0, 2 * Math.PI);
        } else {
          ctx.arc(result[i].keypoints[pt].position.x, result[i].keypoints[pt].position.y, 2, 0, 2 * Math.PI);
        }
        ctx.fill();
      }
    }
    if (ui.drawPolygons) {
      const path = new Path2D();
      let root;
      let part;
      // torso
      root = result[i].keypoints.find((a) => a.part === 'leftShoulder');
      if (root) {
        path.moveTo(root.position.x, root.position.y);
        part = result[i].keypoints.find((a) => a.part === 'rightShoulder');
        if (part) path.lineTo(part.position.x, part.position.y);
        part = result[i].keypoints.find((a) => a.part === 'rightHip');
        if (part) path.lineTo(part.position.x, part.position.y);
        part = result[i].keypoints.find((a) => a.part === 'leftHip');
        if (part) path.lineTo(part.position.x, part.position.y);
        part = result[i].keypoints.find((a) => a.part === 'leftShoulder');
        if (part) path.lineTo(part.position.x, part.position.y);
      }
      // leg left
      root = result[i].keypoints.find((a) => a.part === 'leftHip');
      if (root) {
        path.moveTo(root.position.x, root.position.y);
        part = result[i].keypoints.find((a) => a.part === 'leftKnee');
        if (part) path.lineTo(part.position.x, part.position.y);
        part = result[i].keypoints.find((a) => a.part === 'leftAnkle');
        if (part) path.lineTo(part.position.x, part.position.y);
      }
      // leg right
      root = result[i].keypoints.find((a) => a.part === 'rightHip');
      if (root) {
        path.moveTo(root.position.x, root.position.y);
        part = result[i].keypoints.find((a) => a.part === 'rightKnee');
        if (part) path.lineTo(part.position.x, part.position.y);
        part = result[i].keypoints.find((a) => a.part === 'rightAnkle');
        if (part) path.lineTo(part.position.x, part.position.y);
      }
      // arm left
      root = result[i].keypoints.find((a) => a.part === 'leftShoulder');
      if (root) {
        path.moveTo(root.position.x, root.position.y);
        part = result[i].keypoints.find((a) => a.part === 'leftElbow');
        if (part) path.lineTo(part.position.x, part.position.y);
        part = result[i].keypoints.find((a) => a.part === 'leftWrist');
        if (part) path.lineTo(part.position.x, part.position.y);
      }
      // arm right
      root = result[i].keypoints.find((a) => a.part === 'rightShoulder');
      if (root) {
        path.moveTo(root.position.x, root.position.y);
        part = result[i].keypoints.find((a) => a.part === 'rightElbow');
        if (part) path.lineTo(part.position.x, part.position.y);
        part = result[i].keypoints.find((a) => a.part === 'rightWrist');
        if (part) path.lineTo(part.position.x, part.position.y);
      }
      // draw all
      ctx.stroke(path);
    }
  }
}

async function drawHand(result, canvas, ui) {
  if (!result) return;
  const ctx = canvas.getContext('2d');
  ctx.lineJoin = 'round';
  for (const hand of result) {
    ctx.font = ui.baseFont;
    ctx.lineWidth = ui.baseLineWidth;
    if (ui.drawBoxes) {
      ctx.lineWidth = ui.baseLineWidth;
      ctx.beginPath();
      ctx.strokeStyle = ui.baseColor;
      ctx.fillStyle = ui.baseColor;
      ctx.rect(hand.box[0], hand.box[1], hand.box[2], hand.box[3]);
      ctx.fillStyle = 'black';
      ctx.fillText('hand', hand.box[0] + 3, 1 + hand.box[1] + ui.baseLineHeight, hand.box[2]);
      ctx.fillStyle = ui.baseLabel;
      ctx.fillText('hand', hand.box[0] + 2, 0 + hand.box[1] + ui.baseLineHeight, hand.box[2]);
      ctx.stroke();
    }
    if (ui.drawPoints) {
      if (hand.landmarks && hand.landmarks.length > 0) {
        for (const point of hand.landmarks) {
          ctx.fillStyle = ui.useDepth ? `rgba(${127.5 + (2 * point[2])}, ${127.5 - (2 * point[2])}, 255, 0.5)` : ui.baseColor;
          ctx.beginPath();
          ctx.arc(point[0], point[1], 2, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }
    if (ui.drawPolygons) {
      const addPart = (part) => {
        if (!part) return;
        for (let i = 0; i < part.length; i++) {
          ctx.lineWidth = ui.baseLineWidth;
          ctx.beginPath();
          ctx.strokeStyle = ui.useDepth ? `rgba(${127.5 + (2 * part[i][2])}, ${127.5 - (2 * part[i][2])}, 255, 0.5)` : ui.baseColor;
          ctx.moveTo(part[i > 0 ? i - 1 : 0][0], part[i > 0 ? i - 1 : 0][1]);
          ctx.lineTo(part[i][0], part[i][1]);
          ctx.stroke();
        }
      };
      addPart(hand.annotations.indexFinger);
      addPart(hand.annotations.middleFinger);
      addPart(hand.annotations.ringFinger);
      addPart(hand.annotations.pinky);
      addPart(hand.annotations.thumb);
      // addPart(hand.annotations.palmBase);
    }
  }
}

// eslint-disable-next-line import/prefer-default-export
export default {
  face: drawFace,
  body: drawBody,
  hand: drawHand,
  gesture: drawGesture,
};
