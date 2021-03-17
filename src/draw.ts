import config from '../config';
import { TRI468 as triangulation } from './blazeface/coords';

export const drawOptions = {
  color: <string>'rgba(173, 216, 230, 0.3)', // 'lightblue' with light alpha channel
  labelColor: <string>'rgba(173, 216, 230, 1)', // 'lightblue' with dark alpha channel
  shadowColor: <string>'black',
  font: <string>'small-caps 16px "Segoe UI"',
  lineHeight: <number>20,
  lineWidth: <number>6,
  pointSize: <number>2,
  roundRect: <number>28,
  drawPoints: <Boolean>false,
  drawLabels: <Boolean>true,
  drawBoxes: <Boolean>true,
  drawPolygons: <Boolean>true,
  fillPolygons: <Boolean>false,
  useDepth: <Boolean>true,
  useCurves: <Boolean>false,
  bufferedOutput: <Boolean>false,
};

function point(ctx, x, y, z = null) {
  ctx.fillStyle = drawOptions.useDepth && z ? `rgba(${127.5 + (2 * (z || 0))}, ${127.5 - (2 * (z || 0))}, 255, 0.3)` : drawOptions.color;
  ctx.beginPath();
  ctx.arc(x, y, drawOptions.pointSize, 0, 2 * Math.PI);
  ctx.fill();
}

function rect(ctx, x, y, width, height) {
  ctx.beginPath();
  if (drawOptions.useCurves) {
    const cx = (x + x + width) / 2;
    const cy = (y + y + height) / 2;
    ctx.ellipse(cx, cy, width / 2, height / 2, 0, 0, 2 * Math.PI);
  } else {
    ctx.lineWidth = drawOptions.lineWidth;
    ctx.moveTo(x + drawOptions.roundRect, y);
    ctx.lineTo(x + width - drawOptions.roundRect, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + drawOptions.roundRect);
    ctx.lineTo(x + width, y + height - drawOptions.roundRect);
    ctx.quadraticCurveTo(x + width, y + height, x + width - drawOptions.roundRect, y + height);
    ctx.lineTo(x + drawOptions.roundRect, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - drawOptions.roundRect);
    ctx.lineTo(x, y + drawOptions.roundRect);
    ctx.quadraticCurveTo(x, y, x + drawOptions.roundRect, y);
    ctx.closePath();
  }
  ctx.stroke();
}

function lines(ctx, points: number[] = []) {
  if (points === undefined || points.length === 0) return;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (const pt of points) {
    ctx.strokeStyle = drawOptions.useDepth && pt[2] ? `rgba(${127.5 + (2 * pt[2])}, ${127.5 - (2 * pt[2])}, 255, 0.3)` : drawOptions.color;
    ctx.fillStyle = drawOptions.useDepth && pt[2] ? `rgba(${127.5 + (2 * pt[2])}, ${127.5 - (2 * pt[2])}, 255, 0.3)` : drawOptions.color;
    ctx.lineTo(pt[0], parseInt(pt[1]));
  }
  ctx.stroke();
  if (drawOptions.fillPolygons) {
    ctx.closePath();
    ctx.fill();
  }
}

function curves(ctx, points: number[] = []) {
  if (points === undefined || points.length === 0) return;
  if (!drawOptions.useCurves || points.length <= 2) {
    lines(ctx, points);
    return;
  }
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 0; i < points.length - 2; i++) {
    const xc = (points[i][0] + points[i + 1][0]) / 2;
    const yc = (points[i][1] + points[i + 1][1]) / 2;
    ctx.quadraticCurveTo(points[i][0], points[i][1], xc, yc);
  }
  ctx.quadraticCurveTo(points[points.length - 2][0], points[points.length - 2][1], points[points.length - 1][0], points[points.length - 1][1]);
  ctx.stroke();
  if (drawOptions.fillPolygons) {
    ctx.closePath();
    ctx.fill();
  }
}

export async function gesture(inCanvas, result) {
  if (!result || !inCanvas) return;
  if (!(inCanvas instanceof HTMLCanvasElement)) return;
  const ctx = inCanvas.getContext('2d');
  if (!ctx) return;
  ctx.font = drawOptions.font;
  ctx.fillStyle = drawOptions.color;
  let i = 1;
  for (let j = 0; j < result.length; j++) {
    let where:any[] = [];
    let what:any[] = [];
    [where, what] = Object.entries(result[j]);
    if ((what.length > 1) && (what[1].length > 0)) {
      const person = where[1] > 0 ? `#${where[1]}` : '';
      const label = `${where[0]} ${person}: ${what[1]}`;
      if (drawOptions.shadowColor && drawOptions.shadowColor !== '') {
        ctx.fillStyle = drawOptions.shadowColor;
        ctx.fillText(label, 8, 2 + (i * drawOptions.lineHeight));
      }
      ctx.fillStyle = drawOptions.labelColor;
      ctx.fillText(label, 6, 0 + (i * drawOptions.lineHeight));
      i += 1;
    }
  }
}

export async function face(inCanvas, result) {
  if (!result || !inCanvas) return;
  if (!(inCanvas instanceof HTMLCanvasElement)) return;
  const ctx = inCanvas.getContext('2d');
  if (!ctx) return;
  for (const f of result) {
    ctx.font = drawOptions.font;
    ctx.strokeStyle = drawOptions.color;
    ctx.fillStyle = drawOptions.color;
    if (drawOptions.drawBoxes) {
      rect(ctx, f.box[0], f.box[1], f.box[2], f.box[3]);
      // rect(ctx, inCanvas.width * f.boxRaw[0], inCanvas.height * f.boxRaw[1], inCanvas.width * f.boxRaw[2], inCanvas.height * f.boxRaw[3]);
    }
    // silly hack since fillText does not suport new line
    const labels:string[] = [];
    labels.push(`face confidence: ${Math.trunc(100 * f.confidence)}%`);
    if (f.genderConfidence) labels.push(`${f.gender || ''} ${Math.trunc(100 * f.genderConfidence)}% confident`);
    // if (f.genderConfidence) labels.push(f.gender);
    if (f.age) labels.push(`age: ${f.age || ''}`);
    if (f.iris) labels.push(`iris distance: ${f.iris}`);
    if (f.emotion && f.emotion.length > 0) {
      const emotion = f.emotion.map((a) => `${Math.trunc(100 * a.score)}% ${a.emotion}`);
      labels.push(emotion.join(' '));
    }
    if (f.angle && f.angle.roll) labels.push(`roll: ${Math.trunc(100 * f.angle.roll) / 100} yaw:${Math.trunc(100 * f.angle.yaw) / 100} pitch:${Math.trunc(100 * f.angle.pitch) / 100}`);
    if (labels.length === 0) labels.push('face');
    ctx.fillStyle = drawOptions.color;
    for (let i = labels.length - 1; i >= 0; i--) {
      const x = Math.max(f.box[0], 0);
      const y = i * drawOptions.lineHeight + f.box[1];
      if (drawOptions.shadowColor && drawOptions.shadowColor !== '') {
        ctx.fillStyle = drawOptions.shadowColor;
        ctx.fillText(labels[i], x + 5, y + 16);
      }
      ctx.fillStyle = drawOptions.labelColor;
      ctx.fillText(labels[i], x + 4, y + 15);
    }
    ctx.lineWidth = 1;
    if (f.mesh && f.mesh.length > 0) {
      if (drawOptions.drawPoints) {
        for (const pt of f.mesh) point(ctx, pt[0], pt[1], pt[2]);
        // for (const pt of f.meshRaw) point(ctx, pt[0] * inCanvas.offsetWidth, pt[1] * inCanvas.offsetHeight, pt[2]);
      }
      if (drawOptions.drawPolygons) {
        ctx.lineWidth = 1;
        for (let i = 0; i < triangulation.length / 3; i++) {
          const points = [
            triangulation[i * 3 + 0],
            triangulation[i * 3 + 1],
            triangulation[i * 3 + 2],
          ].map((index) => f.mesh[index]);
          lines(ctx, points);
        }
        // iris: array[center, left, top, right, bottom]
        if (f.annotations && f.annotations.leftEyeIris) {
          ctx.strokeStyle = drawOptions.useDepth ? 'rgba(255, 200, 255, 0.3)' : drawOptions.color;
          ctx.beginPath();
          const sizeX = Math.abs(f.annotations.leftEyeIris[3][0] - f.annotations.leftEyeIris[1][0]) / 2;
          const sizeY = Math.abs(f.annotations.leftEyeIris[4][1] - f.annotations.leftEyeIris[2][1]) / 2;
          ctx.ellipse(f.annotations.leftEyeIris[0][0], f.annotations.leftEyeIris[0][1], sizeX, sizeY, 0, 0, 2 * Math.PI);
          ctx.stroke();
          if (drawOptions.fillPolygons) {
            ctx.fillStyle = drawOptions.useDepth ? 'rgba(255, 255, 200, 0.3)' : drawOptions.color;
            ctx.fill();
          }
        }
        if (f.annotations && f.annotations.rightEyeIris) {
          ctx.strokeStyle = drawOptions.useDepth ? 'rgba(255, 200, 255, 0.3)' : drawOptions.color;
          ctx.beginPath();
          const sizeX = Math.abs(f.annotations.rightEyeIris[3][0] - f.annotations.rightEyeIris[1][0]) / 2;
          const sizeY = Math.abs(f.annotations.rightEyeIris[4][1] - f.annotations.rightEyeIris[2][1]) / 2;
          ctx.ellipse(f.annotations.rightEyeIris[0][0], f.annotations.rightEyeIris[0][1], sizeX, sizeY, 0, 0, 2 * Math.PI);
          ctx.stroke();
          if (drawOptions.fillPolygons) {
            ctx.fillStyle = drawOptions.useDepth ? 'rgba(255, 255, 200, 0.3)' : drawOptions.color;
            ctx.fill();
          }
        }
      }
    }
  }
}

const lastDrawnPose:any[] = [];
export async function body(inCanvas, result) {
  if (!result || !inCanvas) return;
  if (!(inCanvas instanceof HTMLCanvasElement)) return;
  const ctx = inCanvas.getContext('2d');
  if (!ctx) return;
  ctx.lineJoin = 'round';
  for (let i = 0; i < result.length; i++) {
    // result[i].keypoints = result[i].keypoints.filter((a) => a.score > 0.5);
    if (!lastDrawnPose[i] && drawOptions.bufferedOutput) lastDrawnPose[i] = { ...result[i] };
    ctx.strokeStyle = drawOptions.color;
    ctx.lineWidth = drawOptions.lineWidth;
    if (drawOptions.drawPoints) {
      for (let pt = 0; pt < result[i].keypoints.length; pt++) {
        ctx.fillStyle = drawOptions.useDepth && result[i].keypoints[pt].position.z ? `rgba(${127.5 + (2 * result[i].keypoints[pt].position.z)}, ${127.5 - (2 * result[i].keypoints[pt].position.z)}, 255, 0.5)` : drawOptions.color;
        if (drawOptions.bufferedOutput) {
          lastDrawnPose[i].keypoints[pt][0] = (lastDrawnPose[i].keypoints[pt][0] + result[i].keypoints[pt].position.x) / 2;
          lastDrawnPose[i].keypoints[pt][1] = (lastDrawnPose[i].keypoints[pt][1] + result[i].keypoints[pt].position.y) / 2;
          point(ctx, lastDrawnPose[i].keypoints[pt][0], lastDrawnPose[i].keypoints[pt][1]);
        } else {
          point(ctx, result[i].keypoints[pt].position.x, result[i].keypoints[pt].position.y);
        }
      }
    }
    if (drawOptions.drawLabels) {
      ctx.font = drawOptions.font;
      for (const pt of result[i].keypoints) {
        ctx.fillStyle = drawOptions.useDepth && pt.position.z ? `rgba(${127.5 + (2 * pt.position.z)}, ${127.5 - (2 * pt.position.z)}, 255, 0.5)` : drawOptions.color;
        ctx.fillText(`${pt.part}`, pt.position.x + 4, pt.position.y + 4);
      }
    }
    if (drawOptions.drawPolygons) {
      let part;
      const points: any[] = [];
      // torso
      points.length = 0;
      part = result[i].keypoints.find((a) => a.part === 'leftShoulder');
      if (part && part.score > config.body.scoreThreshold) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'rightShoulder');
      if (part && part.score > config.body.scoreThreshold) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'rightHip');
      if (part && part.score > config.body.scoreThreshold) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'leftHip');
      if (part && part.score > config.body.scoreThreshold) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'leftShoulder');
      if (part && part.score > config.body.scoreThreshold) points.push([part.position.x, part.position.y]);
      if (points.length === 5) lines(ctx, points); // only draw if we have complete torso
      // leg left
      points.length = 0;
      part = result[i].keypoints.find((a) => a.part === 'leftHip');
      if (part && part.score > config.body.scoreThreshold) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'leftKnee');
      if (part && part.score > config.body.scoreThreshold) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'leftAnkle');
      if (part && part.score > config.body.scoreThreshold) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'leftHeel');
      if (part && part.score > config.body.scoreThreshold) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'leftFoot');
      if (part && part.score > config.body.scoreThreshold) points.push([part.position.x, part.position.y]);
      curves(ctx, points);
      // leg right
      points.length = 0;
      part = result[i].keypoints.find((a) => a.part === 'rightHip');
      if (part && part.score > config.body.scoreThreshold) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'rightKnee');
      if (part && part.score > config.body.scoreThreshold) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'rightAnkle');
      if (part && part.score > config.body.scoreThreshold) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'rightHeel');
      if (part && part.score > config.body.scoreThreshold) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'rightFoot');
      if (part && part.score > config.body.scoreThreshold) points.push([part.position.x, part.position.y]);
      curves(ctx, points);
      // arm left
      points.length = 0;
      part = result[i].keypoints.find((a) => a.part === 'leftShoulder');
      if (part && part.score > config.body.scoreThreshold) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'leftElbow');
      if (part && part.score > config.body.scoreThreshold) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'leftWrist');
      if (part && part.score > config.body.scoreThreshold) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'leftPalm');
      if (part && part.score > config.body.scoreThreshold) points.push([part.position.x, part.position.y]);
      curves(ctx, points);
      // arm right
      points.length = 0;
      part = result[i].keypoints.find((a) => a.part === 'rightShoulder');
      if (part && part.score > config.body.scoreThreshold) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'rightElbow');
      if (part && part.score > config.body.scoreThreshold) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'rightWrist');
      if (part && part.score > config.body.scoreThreshold) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'rightPalm');
      if (part && part.score > config.body.scoreThreshold) points.push([part.position.x, part.position.y]);
      curves(ctx, points);
      // draw all
    }
  }
}

export async function hand(inCanvas, result) {
  if (!result || !inCanvas) return;
  if (!(inCanvas instanceof HTMLCanvasElement)) return;
  const ctx = inCanvas.getContext('2d');
  if (!ctx) return;
  ctx.lineJoin = 'round';
  ctx.font = drawOptions.font;
  for (const h of result) {
    if (drawOptions.drawBoxes) {
      ctx.strokeStyle = drawOptions.color;
      ctx.fillStyle = drawOptions.color;
      rect(ctx, h.box[0], h.box[1], h.box[2], h.box[3]);
      if (drawOptions.drawLabels) {
        if (drawOptions.shadowColor && drawOptions.shadowColor !== '') {
          ctx.fillStyle = drawOptions.shadowColor;
          ctx.fillText('hand', h.box[0] + 3, 1 + h.box[1] + drawOptions.lineHeight, h.box[2]);
        }
        ctx.fillStyle = drawOptions.labelColor;
        ctx.fillText('hand', h.box[0] + 2, 0 + h.box[1] + drawOptions.lineHeight, h.box[2]);
      }
      ctx.stroke();
    }
    if (drawOptions.drawPoints) {
      if (h.landmarks && h.landmarks.length > 0) {
        for (const pt of h.landmarks) {
          ctx.fillStyle = drawOptions.useDepth ? `rgba(${127.5 + (2 * pt[2])}, ${127.5 - (2 * pt[2])}, 255, 0.5)` : drawOptions.color;
          point(ctx, pt[0], pt[1]);
        }
      }
    }
    if (drawOptions.drawPolygons) {
      const addPart = (part) => {
        if (!part) return;
        for (let i = 0; i < part.length; i++) {
          ctx.lineWidth = drawOptions.lineWidth;
          ctx.beginPath();
          ctx.strokeStyle = drawOptions.useDepth ? `rgba(${127.5 + (2 * part[i][2])}, ${127.5 - (2 * part[i][2])}, 255, 0.5)` : drawOptions.color;
          ctx.moveTo(part[i > 0 ? i - 1 : 0][0], part[i > 0 ? i - 1 : 0][1]);
          ctx.lineTo(part[i][0], part[i][1]);
          ctx.stroke();
        }
      };
      addPart(h.annotations.indexFinger);
      addPart(h.annotations.middleFinger);
      addPart(h.annotations.ringFinger);
      addPart(h.annotations.pinky);
      addPart(h.annotations.thumb);
      // addPart(hand.annotations.palmBase);
    }
  }
}

export async function object(inCanvas, result) {
  if (!result || !inCanvas) return;
  if (!(inCanvas instanceof HTMLCanvasElement)) return;
  const ctx = inCanvas.getContext('2d');
  if (!ctx) return;
  ctx.lineJoin = 'round';
  ctx.font = drawOptions.font;
  for (const h of result) {
    if (drawOptions.drawBoxes) {
      ctx.strokeStyle = drawOptions.color;
      ctx.fillStyle = drawOptions.color;
      rect(ctx, h.box[0], h.box[1], h.box[2] - h.box[0], h.box[3] - h.box[1]);
      if (drawOptions.drawLabels) {
        const label = `${Math.round(100 * h.score)}% ${h.label}`;
        if (drawOptions.shadowColor && drawOptions.shadowColor !== '') {
          ctx.fillStyle = drawOptions.shadowColor;
          ctx.fillText(label, h.box[0] + 3, 1 + h.box[1] + drawOptions.lineHeight, h.box[2]);
        }
        ctx.fillStyle = drawOptions.labelColor;
        ctx.fillText(label, h.box[0] + 2, 0 + h.box[1] + drawOptions.lineHeight, h.box[2]);
      }
      ctx.stroke();
    }
  }
}

export async function canvas(inCanvas, outCanvas) {
  if (!inCanvas || !outCanvas) return;
  if (!(inCanvas instanceof HTMLCanvasElement) || !(outCanvas instanceof HTMLCanvasElement)) return;
  const outCtx = inCanvas.getContext('2d');
  outCtx?.drawImage(inCanvas, 0, 0);
}

export async function all(inCanvas, result) {
  if (!result || !inCanvas) return;
  if (!(inCanvas instanceof HTMLCanvasElement)) return;
  face(inCanvas, result.face);
  body(inCanvas, result.body);
  hand(inCanvas, result.hand);
  gesture(inCanvas, result.gesture);
  object(inCanvas, result.object);
}
