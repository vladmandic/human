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
    if (face.agConfidence) labels.push(`${Math.trunc(100 * face.agConfidence)}% ${face.gender || ''}`);
    if (face.age) labels.push(`Age:${face.age || ''}`);
    if (face.iris) labels.push(`iris: ${face.iris}`);
    if (face.emotion && face.emotion[0]) labels.push(`${Math.trunc(100 * face.emotion[0].score)}% ${face.emotion[0].emotion}`);
    ctx.fillStyle = ui.baseLabel;
    for (const i in labels) ctx.fillText(labels[i], face.box[0] + 6, face.box[1] + 24 + ((i + 1) * ui.baseLineHeight));
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
      }
    }
  }
}

async function drawBody(result, canvas, ui) {
  if (!result) return;
  const ctx = canvas.getContext('2d');
  for (const pose of result) {
    ctx.fillStyle = ui.baseColor;
    ctx.strokeStyle = ui.baseColor;
    ctx.font = ui.baseFont;
    ctx.lineWidth = ui.baseLineWidth;
    if (ui.drawPoints) {
      for (const point of pose.keypoints) {
        ctx.beginPath();
        ctx.arc(point.position.x, point.position.y, 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
    if (ui.drawPolygons) {
      const path = new Path2D();
      let part;
      // torso
      part = pose.keypoints.find((a) => a.part === 'leftShoulder');
      path.moveTo(part.position.x, part.position.y);
      part = pose.keypoints.find((a) => a.part === 'rightShoulder');
      path.lineTo(part.position.x, part.position.y);
      part = pose.keypoints.find((a) => a.part === 'rightHip');
      path.lineTo(part.position.x, part.position.y);
      part = pose.keypoints.find((a) => a.part === 'leftHip');
      path.lineTo(part.position.x, part.position.y);
      part = pose.keypoints.find((a) => a.part === 'leftShoulder');
      path.lineTo(part.position.x, part.position.y);
      // legs
      part = pose.keypoints.find((a) => a.part === 'leftHip');
      path.moveTo(part.position.x, part.position.y);
      part = pose.keypoints.find((a) => a.part === 'leftKnee');
      path.lineTo(part.position.x, part.position.y);
      part = pose.keypoints.find((a) => a.part === 'leftAnkle');
      path.lineTo(part.position.x, part.position.y);
      part = pose.keypoints.find((a) => a.part === 'rightHip');
      path.moveTo(part.position.x, part.position.y);
      part = pose.keypoints.find((a) => a.part === 'rightKnee');
      path.lineTo(part.position.x, part.position.y);
      part = pose.keypoints.find((a) => a.part === 'rightAnkle');
      path.lineTo(part.position.x, part.position.y);
      // arms
      part = pose.keypoints.find((a) => a.part === 'leftShoulder');
      path.moveTo(part.position.x, part.position.y);
      part = pose.keypoints.find((a) => a.part === 'leftElbow');
      path.lineTo(part.position.x, part.position.y);
      part = pose.keypoints.find((a) => a.part === 'leftWrist');
      path.lineTo(part.position.x, part.position.y);
      // arms
      part = pose.keypoints.find((a) => a.part === 'rightShoulder');
      path.moveTo(part.position.x, part.position.y);
      part = pose.keypoints.find((a) => a.part === 'rightElbow');
      path.lineTo(part.position.x, part.position.y);
      part = pose.keypoints.find((a) => a.part === 'rightWrist');
      path.lineTo(part.position.x, part.position.y);
      // draw all
      ctx.stroke(path);
    }
  }
}

async function drawHand(result, canvas, ui) {
  if (!result) return;
  const ctx = canvas.getContext('2d');
  for (const hand of result) {
    ctx.font = ui.baseFont;
    ctx.lineWidth = ui.baseLineWidth;
    if (ui.drawBoxes) {
      ctx.lineWidth = ui.baseLineWidth;
      ctx.beginPath();
      ctx.strokeStyle = ui.baseColor;
      ctx.fillStyle = ui.baseColor;
      ctx.rect(hand.box[0], hand.box[1], hand.box[2], hand.box[3]);
      ctx.fillStyle = ui.baseLabel;
      ctx.fillText('hand', hand.box[0] + 2, hand.box[1] + 22, hand.box[2]);
      ctx.stroke();
    }
    if (ui.drawPoints) {
      for (const point of hand.landmarks) {
        ctx.fillStyle = ui.useDepth ? `rgba(${127.5 + (2 * point[2])}, ${127.5 - (2 * point[2])}, 255, 0.5)` : ui.baseColor;
        ctx.beginPath();
        ctx.arc(point[0], point[1], 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
    if (ui.drawPolygons) {
      const addPart = (part) => {
        for (let i = 1; i < part.length; i++) {
          ctx.lineWidth = ui.baseLineWidth;
          ctx.beginPath();
          ctx.strokeStyle = ui.useDepth ? `rgba(${127.5 + (2 * part[i][2])}, ${127.5 - (2 * part[i][2])}, 255, 0.5)` : ui.baseColor;
          ctx.moveTo(part[i - 1][0], part[i - 1][1]);
          ctx.lineTo(part[i][0], part[i][1]);
          ctx.stroke();
        }
      };
      addPart(hand.annotations.indexFinger);
      addPart(hand.annotations.middleFinger);
      addPart(hand.annotations.ringFinger);
      addPart(hand.annotations.pinky);
      addPart(hand.annotations.thumb);
      addPart(hand.annotations.palmBase);
    }
  }
}

const draw = {
  face: drawFace,
  body: drawBody,
  hand: drawHand,
};

export default draw;
