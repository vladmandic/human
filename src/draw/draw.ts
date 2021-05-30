/**
 * Module that implements helper draw functions, exposed as human.draw
 */

import { TRI468 as triangulation } from '../blazeface/coords';
import { mergeDeep } from '../helpers';
import type { Result, Face, Body, Hand, Item, Gesture, Person } from '../result';

/**
 * Draw Options
 * Accessed via `human.draw.options` or provided per each draw method as the drawOptions optional parameter
 * -color: draw color
 * -labelColor: color for labels
 * -shadowColor: optional shadow color for labels
 * -font: font for labels
 * -lineHeight: line height for labels, used for multi-line labels,
 * -lineWidth: width of any lines,
 * -pointSize: size of any point,
 * -roundRect: for boxes, round corners by this many pixels,
 * -drawPoints: should points be drawn,
 * -drawLabels: should labels be drawn,
 * -drawBoxes: should boxes be drawn,
 * -drawPolygons: should polygons be drawn,
 * -fillPolygons: should drawn polygons be filled,
 * -useDepth: use z-axis coordinate as color shade,
 * -useCurves: draw polygons as cures or as lines,
 * -bufferedOutput: experimental: allows to call draw methods multiple times for each detection and interpolate results between results thus achieving smoother animations
 * -bufferedFactor: speed of interpolation convergence where 1 means 100% immediately, 2 means 50% at each interpolation, etc.
 */
export interface DrawOptions {
  color: string,
  labelColor: string,
  shadowColor: string,
  font: string,
  lineHeight: number,
  lineWidth: number,
  pointSize: number,
  roundRect: number,
  drawPoints: boolean,
  drawLabels: boolean,
  drawBoxes: boolean,
  drawPolygons: boolean,
  drawGaze: boolean,
  fillPolygons: boolean,
  useDepth: boolean,
  useCurves: boolean,
  bufferedOutput: boolean,
  bufferedFactor: number,
}

export const options: DrawOptions = {
  color: <string>'rgba(173, 216, 230, 0.3)', // 'lightblue' with light alpha channel
  labelColor: <string>'rgba(173, 216, 230, 1)', // 'lightblue' with dark alpha channel
  shadowColor: <string>'black',
  font: <string>'small-caps 14px "Segoe UI"',
  lineHeight: <number>24,
  lineWidth: <number>6,
  pointSize: <number>2,
  roundRect: <number>28,
  drawPoints: <boolean>false,
  drawLabels: <boolean>true,
  drawBoxes: <boolean>true,
  drawPolygons: <boolean>true,
  drawGaze: <boolean>false,
  fillPolygons: <boolean>false,
  useDepth: <boolean>true,
  useCurves: <boolean>false,
  bufferedFactor: <number>2,
  bufferedOutput: <boolean>false,
};

let bufferedResult: Result = { face: [], body: [], hand: [], gesture: [], object: [], persons: [], performance: {}, timestamp: 0 };

const rad2deg = (theta) => Math.round((theta * 180) / Math.PI);

function point(ctx, x, y, z = 0, localOptions) {
  ctx.fillStyle = localOptions.useDepth && z ? `rgba(${127.5 + (2 * z)}, ${127.5 - (2 * z)}, 255, 0.3)` : localOptions.color;
  ctx.beginPath();
  ctx.arc(x, y, localOptions.pointSize, 0, 2 * Math.PI);
  ctx.fill();
}

function rect(ctx, x, y, width, height, localOptions) {
  ctx.beginPath();
  if (localOptions.useCurves) {
    const cx = (x + x + width) / 2;
    const cy = (y + y + height) / 2;
    ctx.ellipse(cx, cy, width / 2, height / 2, 0, 0, 2 * Math.PI);
  } else {
    ctx.lineWidth = localOptions.lineWidth;
    ctx.moveTo(x + localOptions.roundRect, y);
    ctx.lineTo(x + width - localOptions.roundRect, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + localOptions.roundRect);
    ctx.lineTo(x + width, y + height - localOptions.roundRect);
    ctx.quadraticCurveTo(x + width, y + height, x + width - localOptions.roundRect, y + height);
    ctx.lineTo(x + localOptions.roundRect, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - localOptions.roundRect);
    ctx.lineTo(x, y + localOptions.roundRect);
    ctx.quadraticCurveTo(x, y, x + localOptions.roundRect, y);
    ctx.closePath();
  }
  ctx.stroke();
}

function lines(ctx, points: [number, number, number?][] = [], localOptions) {
  if (points === undefined || points.length === 0) return;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (const pt of points) {
    const z = pt[2] || 0;
    ctx.strokeStyle = localOptions.useDepth && z ? `rgba(${127.5 + (2 * z)}, ${127.5 - (2 * z)}, 255, 0.3)` : localOptions.color;
    ctx.fillStyle = localOptions.useDepth && z ? `rgba(${127.5 + (2 * z)}, ${127.5 - (2 * z)}, 255, 0.3)` : localOptions.color;
    ctx.lineTo(pt[0], Math.round(pt[1]));
  }
  ctx.stroke();
  if (localOptions.fillPolygons) {
    ctx.closePath();
    ctx.fill();
  }
}

function curves(ctx, points: [number, number, number?][] = [], localOptions) {
  if (points === undefined || points.length === 0) return;
  if (!localOptions.useCurves || points.length <= 2) {
    lines(ctx, points, localOptions);
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
  if (localOptions.fillPolygons) {
    ctx.closePath();
    ctx.fill();
  }
}

export async function gesture(inCanvas: HTMLCanvasElement, result: Array<Gesture>, drawOptions?: DrawOptions) {
  const localOptions = mergeDeep(options, drawOptions);
  if (!result || !inCanvas) return;
  if (!(inCanvas instanceof HTMLCanvasElement)) return;
  const ctx = inCanvas.getContext('2d');
  if (!ctx) return;
  ctx.font = localOptions.font;
  ctx.fillStyle = localOptions.color;
  let i = 1;
  for (let j = 0; j < result.length; j++) {
    let where: unknown[] = []; // what&where is a record
    let what: unknown[] = []; // what&where is a record
    [where, what] = Object.entries(result[j]);
    if ((what.length > 1) && ((what[1] as string).length > 0)) {
      const who = where[1] as number > 0 ? `#${where[1]}` : '';
      const label = `${where[0]} ${who}: ${what[1]}`;
      if (localOptions.shadowColor && localOptions.shadowColor !== '') {
        ctx.fillStyle = localOptions.shadowColor;
        ctx.fillText(label, 8, 2 + (i * localOptions.lineHeight));
      }
      ctx.fillStyle = localOptions.labelColor;
      ctx.fillText(label, 6, 0 + (i * localOptions.lineHeight));
      i += 1;
    }
  }
}

export async function face(inCanvas: HTMLCanvasElement, result: Array<Face>, drawOptions?: DrawOptions) {
  const localOptions = mergeDeep(options, drawOptions);
  if (!result || !inCanvas) return;
  if (!(inCanvas instanceof HTMLCanvasElement)) return;
  const ctx = inCanvas.getContext('2d');
  if (!ctx) return;
  for (const f of result) {
    ctx.font = localOptions.font;
    ctx.strokeStyle = localOptions.color;
    ctx.fillStyle = localOptions.color;
    if (localOptions.drawBoxes) rect(ctx, f.box[0], f.box[1], f.box[2], f.box[3], localOptions);
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
    if (f.rotation && f.rotation.angle && f.rotation.gaze) {
      if (f.rotation.angle.roll) labels.push(`roll: ${rad2deg(f.rotation.angle.roll)}° yaw:${rad2deg(f.rotation.angle.yaw)}° pitch:${rad2deg(f.rotation.angle.pitch)}°`);
      if (f.rotation.gaze.angle) labels.push(`gaze: ${rad2deg(f.rotation.gaze.angle)}°`);
    }
    if (labels.length === 0) labels.push('face');
    ctx.fillStyle = localOptions.color;
    for (let i = labels.length - 1; i >= 0; i--) {
      const x = Math.max(f.box[0], 0);
      const y = i * localOptions.lineHeight + f.box[1];
      if (localOptions.shadowColor && localOptions.shadowColor !== '') {
        ctx.fillStyle = localOptions.shadowColor;
        ctx.fillText(labels[i], x + 5, y + 16);
      }
      ctx.fillStyle = localOptions.labelColor;
      ctx.fillText(labels[i], x + 4, y + 15);
    }
    ctx.lineWidth = 1;
    if (f.mesh && f.mesh.length > 0) {
      if (localOptions.drawPoints) {
        for (const pt of f.mesh) point(ctx, pt[0], pt[1], pt[2], localOptions);
        // for (const pt of f.meshRaw) point(ctx, pt[0] * inCanvas.offsetWidth, pt[1] * inCanvas.offsetHeight, pt[2]);
      }
      if (localOptions.drawPolygons) {
        ctx.lineWidth = 1;
        for (let i = 0; i < triangulation.length / 3; i++) {
          const points = [
            triangulation[i * 3 + 0],
            triangulation[i * 3 + 1],
            triangulation[i * 3 + 2],
          ].map((index) => f.mesh[index]);
          lines(ctx, points, localOptions);
        }
        // iris: array[center, left, top, right, bottom]
        if (f.annotations && f.annotations['leftEyeIris']) {
          ctx.strokeStyle = localOptions.useDepth ? 'rgba(255, 200, 255, 0.3)' : localOptions.color;
          ctx.beginPath();
          const sizeX = Math.abs(f.annotations['leftEyeIris'][3][0] - f.annotations['leftEyeIris'][1][0]) / 2;
          const sizeY = Math.abs(f.annotations['leftEyeIris'][4][1] - f.annotations['leftEyeIris'][2][1]) / 2;
          ctx.ellipse(f.annotations['leftEyeIris'][0][0], f.annotations['leftEyeIris'][0][1], sizeX, sizeY, 0, 0, 2 * Math.PI);
          ctx.stroke();
          if (localOptions.fillPolygons) {
            ctx.fillStyle = localOptions.useDepth ? 'rgba(255, 255, 200, 0.3)' : localOptions.color;
            ctx.fill();
          }
        }
        if (f.annotations && f.annotations['rightEyeIris']) {
          ctx.strokeStyle = localOptions.useDepth ? 'rgba(255, 200, 255, 0.3)' : localOptions.color;
          ctx.beginPath();
          const sizeX = Math.abs(f.annotations['rightEyeIris'][3][0] - f.annotations['rightEyeIris'][1][0]) / 2;
          const sizeY = Math.abs(f.annotations['rightEyeIris'][4][1] - f.annotations['rightEyeIris'][2][1]) / 2;
          ctx.ellipse(f.annotations['rightEyeIris'][0][0], f.annotations['rightEyeIris'][0][1], sizeX, sizeY, 0, 0, 2 * Math.PI);
          ctx.stroke();
          if (localOptions.fillPolygons) {
            ctx.fillStyle = localOptions.useDepth ? 'rgba(255, 255, 200, 0.3)' : localOptions.color;
            ctx.fill();
          }
        }
        if (localOptions.drawGaze && f.rotation?.gaze?.strength && f.rotation?.gaze?.angle) {
          const leftGaze = [
            f.annotations['leftEyeIris'][0][0] + (Math.cos(f.rotation.gaze.angle) * f.rotation.gaze.strength * f.box[2]),
            f.annotations['leftEyeIris'][0][1] - (Math.sin(f.rotation.gaze.angle) * f.rotation.gaze.strength * f.box[3]),
          ];
          ctx.beginPath();
          ctx.moveTo(f.annotations['leftEyeIris'][0][0], f.annotations['leftEyeIris'][0][1]);
          ctx.strokeStyle = 'pink';
          ctx.lineTo(leftGaze[0], leftGaze[1]);
          ctx.stroke();

          const rightGaze = [
            f.annotations['rightEyeIris'][0][0] + (Math.cos(f.rotation.gaze.angle) * f.rotation.gaze.strength * f.box[2]),
            f.annotations['rightEyeIris'][0][1] - (Math.sin(f.rotation.gaze.angle) * f.rotation.gaze.strength * f.box[3]),
          ];
          ctx.beginPath();
          ctx.moveTo(f.annotations['rightEyeIris'][0][0], f.annotations['rightEyeIris'][0][1]);
          ctx.strokeStyle = 'pink';
          ctx.lineTo(rightGaze[0], rightGaze[1]);
          ctx.stroke();
        }
      }
    }
  }
}

export async function body(inCanvas: HTMLCanvasElement, result: Array<Body>, drawOptions?: DrawOptions) {
  const localOptions = mergeDeep(options, drawOptions);
  if (!result || !inCanvas) return;
  if (!(inCanvas instanceof HTMLCanvasElement)) return;
  const ctx = inCanvas.getContext('2d');
  if (!ctx) return;
  ctx.lineJoin = 'round';
  for (let i = 0; i < result.length; i++) {
    ctx.strokeStyle = localOptions.color;
    ctx.fillStyle = localOptions.color;
    ctx.lineWidth = localOptions.lineWidth;
    ctx.font = localOptions.font;
    if (localOptions.drawBoxes && result[i].box && result[i].box?.length === 4) {
      // @ts-ignore box may not exist
      rect(ctx, result[i].box[0], result[i].box[1], result[i].box[2], result[i].box[3], localOptions);
      if (localOptions.drawLabels) {
        if (localOptions.shadowColor && localOptions.shadowColor !== '') {
          ctx.fillStyle = localOptions.shadowColor;
          // @ts-ignore box may not exist
          ctx.fillText(`body ${100 * result[i].score}%`, result[i].box[0] + 3, 1 + result[i].box[1] + localOptions.lineHeight, result[i].box[2]);
        }
        ctx.fillStyle = localOptions.labelColor;
        // @ts-ignore box may not exist
        ctx.fillText(`body ${100 * result[i].score}%`, result[i].box[0] + 2, 0 + result[i].box[1] + localOptions.lineHeight, result[i].box[2]);
      }
    }
    if (localOptions.drawPoints) {
      for (let pt = 0; pt < result[i].keypoints.length; pt++) {
        ctx.fillStyle = localOptions.useDepth && result[i].keypoints[pt].position.z ? `rgba(${127.5 + (2 * (result[i].keypoints[pt].position.z || 0))}, ${127.5 - (2 * (result[i].keypoints[pt].position.z || 0))}, 255, 0.5)` : localOptions.color;
        point(ctx, result[i].keypoints[pt].position.x, result[i].keypoints[pt].position.y, 0, localOptions);
      }
    }
    if (localOptions.drawLabels) {
      ctx.font = localOptions.font;
      if (result[i].keypoints) {
        for (const pt of result[i].keypoints) {
          ctx.fillStyle = localOptions.useDepth && pt.position.z ? `rgba(${127.5 + (2 * pt.position.z)}, ${127.5 - (2 * pt.position.z)}, 255, 0.5)` : localOptions.color;
          ctx.fillText(`${pt.part} ${Math.trunc(100 * pt.score)}%`, pt.position.x + 4, pt.position.y + 4);
        }
      }
    }
    if (localOptions.drawPolygons && result[i].keypoints) {
      let part;
      const points: [number, number, number?][] = [];
      // shoulder line
      points.length = 0;
      part = result[i].keypoints.find((a) => a.part === 'leftShoulder');
      if (part) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'rightShoulder');
      if (part) points.push([part.position.x, part.position.y]);
      curves(ctx, points, localOptions);
      // torso main
      points.length = 0;
      part = result[i].keypoints.find((a) => a.part === 'rightShoulder');
      if (part) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'rightHip');
      if (part) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'leftHip');
      if (part) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'leftShoulder');
      if (part) points.push([part.position.x, part.position.y]);
      if (points.length === 4) lines(ctx, points, localOptions); // only draw if we have complete torso
      // leg left
      points.length = 0;
      part = result[i].keypoints.find((a) => a.part === 'leftHip');
      if (part) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'leftKnee');
      if (part) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'leftAnkle');
      if (part) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'leftHeel');
      if (part) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'leftFoot');
      if (part) points.push([part.position.x, part.position.y]);
      curves(ctx, points, localOptions);
      // leg right
      points.length = 0;
      part = result[i].keypoints.find((a) => a.part === 'rightHip');
      if (part) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'rightKnee');
      if (part) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'rightAnkle');
      if (part) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'rightHeel');
      if (part) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'rightFoot');
      if (part) points.push([part.position.x, part.position.y]);
      curves(ctx, points, localOptions);
      // arm left
      points.length = 0;
      part = result[i].keypoints.find((a) => a.part === 'leftShoulder');
      if (part) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'leftElbow');
      if (part) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'leftWrist');
      if (part) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'leftPalm');
      if (part) points.push([part.position.x, part.position.y]);
      curves(ctx, points, localOptions);
      // arm right
      points.length = 0;
      part = result[i].keypoints.find((a) => a.part === 'rightShoulder');
      if (part) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'rightElbow');
      if (part) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'rightWrist');
      if (part) points.push([part.position.x, part.position.y]);
      part = result[i].keypoints.find((a) => a.part === 'rightPalm');
      if (part) points.push([part.position.x, part.position.y]);
      curves(ctx, points, localOptions);
      // draw all
    }
  }
}

export async function hand(inCanvas: HTMLCanvasElement, result: Array<Hand>, drawOptions?: DrawOptions) {
  const localOptions = mergeDeep(options, drawOptions);
  if (!result || !inCanvas) return;
  if (!(inCanvas instanceof HTMLCanvasElement)) return;
  const ctx = inCanvas.getContext('2d');
  if (!ctx) return;
  ctx.lineJoin = 'round';
  ctx.font = localOptions.font;
  for (const h of result) {
    if (localOptions.drawBoxes) {
      ctx.strokeStyle = localOptions.color;
      ctx.fillStyle = localOptions.color;
      rect(ctx, h.box[0], h.box[1], h.box[2], h.box[3], localOptions);
      if (localOptions.drawLabels) {
        if (localOptions.shadowColor && localOptions.shadowColor !== '') {
          ctx.fillStyle = localOptions.shadowColor;
          ctx.fillText('hand', h.box[0] + 3, 1 + h.box[1] + localOptions.lineHeight, h.box[2]);
        }
        ctx.fillStyle = localOptions.labelColor;
        ctx.fillText('hand', h.box[0] + 2, 0 + h.box[1] + localOptions.lineHeight, h.box[2]);
      }
      ctx.stroke();
    }
    if (localOptions.drawPoints) {
      if (h.landmarks && h.landmarks.length > 0) {
        for (const pt of h.landmarks) {
          ctx.fillStyle = localOptions.useDepth ? `rgba(${127.5 + (2 * pt[2])}, ${127.5 - (2 * pt[2])}, 255, 0.5)` : localOptions.color;
          point(ctx, pt[0], pt[1], 0, localOptions);
        }
      }
    }
    if (localOptions.drawLabels) {
      const addHandLabel = (part, title) => {
        ctx.fillStyle = localOptions.useDepth ? `rgba(${127.5 + (2 * part[part.length - 1][2])}, ${127.5 - (2 * part[part.length - 1][2])}, 255, 0.5)` : localOptions.color;
        ctx.fillText(title, part[part.length - 1][0] + 4, part[part.length - 1][1] + 4);
      };
      ctx.font = localOptions.font;
      addHandLabel(h.annotations['indexFinger'], 'index');
      addHandLabel(h.annotations['middleFinger'], 'middle');
      addHandLabel(h.annotations['ringFinger'], 'ring');
      addHandLabel(h.annotations['pinky'], 'pinky');
      addHandLabel(h.annotations['thumb'], 'thumb');
      addHandLabel(h.annotations['palmBase'], 'palm');
    }
    if (localOptions.drawPolygons) {
      const addHandLine = (part) => {
        if (!part) return;
        for (let i = 0; i < part.length; i++) {
          ctx.beginPath();
          ctx.strokeStyle = localOptions.useDepth ? `rgba(${127.5 + (2 * part[i][2])}, ${127.5 - (2 * part[i][2])}, 255, 0.5)` : localOptions.color;
          ctx.moveTo(part[i > 0 ? i - 1 : 0][0], part[i > 0 ? i - 1 : 0][1]);
          ctx.lineTo(part[i][0], part[i][1]);
          ctx.stroke();
        }
      };
      ctx.lineWidth = localOptions.lineWidth;
      addHandLine(h.annotations['indexFinger']);
      addHandLine(h.annotations['middleFinger']);
      addHandLine(h.annotations['ringFinger']);
      addHandLine(h.annotations['pinky']);
      addHandLine(h.annotations['thumb']);
      // addPart(h.annotations.palmBase);
    }
  }
}

export async function object(inCanvas: HTMLCanvasElement, result: Array<Item>, drawOptions?: DrawOptions) {
  const localOptions = mergeDeep(options, drawOptions);
  if (!result || !inCanvas) return;
  if (!(inCanvas instanceof HTMLCanvasElement)) return;
  const ctx = inCanvas.getContext('2d');
  if (!ctx) return;
  ctx.lineJoin = 'round';
  ctx.font = localOptions.font;
  for (const h of result) {
    if (localOptions.drawBoxes) {
      ctx.strokeStyle = localOptions.color;
      ctx.fillStyle = localOptions.color;
      rect(ctx, h.box[0], h.box[1], h.box[2], h.box[3], localOptions);
      if (localOptions.drawLabels) {
        const label = `${Math.round(100 * h.score)}% ${h.label}`;
        if (localOptions.shadowColor && localOptions.shadowColor !== '') {
          ctx.fillStyle = localOptions.shadowColor;
          ctx.fillText(label, h.box[0] + 3, 1 + h.box[1] + localOptions.lineHeight, h.box[2]);
        }
        ctx.fillStyle = localOptions.labelColor;
        ctx.fillText(label, h.box[0] + 2, 0 + h.box[1] + localOptions.lineHeight, h.box[2]);
      }
      ctx.stroke();
    }
  }
}

export async function person(inCanvas: HTMLCanvasElement, result: Array<Person>, drawOptions?: DrawOptions) {
  const localOptions = mergeDeep(options, drawOptions);
  if (!result || !inCanvas) return;
  if (!(inCanvas instanceof HTMLCanvasElement)) return;
  const ctx = inCanvas.getContext('2d');
  if (!ctx) return;
  ctx.lineJoin = 'round';
  ctx.font = localOptions.font;

  for (let i = 0; i < result.length; i++) {
    if (localOptions.drawBoxes) {
      ctx.strokeStyle = localOptions.color;
      ctx.fillStyle = localOptions.color;
      rect(ctx, result[i].box[0], result[i].box[1], result[i].box[2], result[i].box[3], localOptions);
      if (localOptions.drawLabels) {
        const label = `person #${i}`;
        if (localOptions.shadowColor && localOptions.shadowColor !== '') {
          ctx.fillStyle = localOptions.shadowColor;
          ctx.fillText(label, result[i].box[0] + 3, 1 + result[i].box[1] + localOptions.lineHeight, result[i].box[2]);
        }
        ctx.fillStyle = localOptions.labelColor;
        ctx.fillText(label, result[i].box[0] + 2, 0 + result[i].box[1] + localOptions.lineHeight, result[i].box[2]);
      }
      ctx.stroke();
    }
  }
}

function calcBuffered(newResult, localOptions) {
  // each record is only updated using deep clone when number of detected record changes, otherwise it will converge by itself
  // otherwise bufferedResult is a shallow clone of result plus updated local calculated values
  // thus mixing by-reference and by-value assignments to minimize memory operations

  // interpolate body results
  if (!bufferedResult.body || (newResult.body.length !== bufferedResult.body.length)) bufferedResult.body = JSON.parse(JSON.stringify(newResult.body)); // deep clone once
  for (let i = 0; i < newResult.body.length; i++) {
    const box = newResult.body[i].box // update box
      .map((b, j) => ((localOptions.bufferedFactor - 1) * bufferedResult.body[i].box[j] + b) / localOptions.bufferedFactor) as [number, number, number, number];
    const boxRaw = newResult.body[i].boxRaw // update boxRaw
      .map((b, j) => ((localOptions.bufferedFactor - 1) * bufferedResult.body[i].boxRaw[j] + b) / localOptions.bufferedFactor) as [number, number, number, number];
    const keypoints = newResult.body[i].keypoints // update keypoints
      .map((keypoint, j) => ({
        score: keypoint.score,
        part: keypoint.part,
        position: {
          x: bufferedResult.body[i].keypoints[j] ? ((localOptions.bufferedFactor - 1) * bufferedResult.body[i].keypoints[j].position.x + keypoint.position.x) / localOptions.bufferedFactor : keypoint.position.x,
          y: bufferedResult.body[i].keypoints[j] ? ((localOptions.bufferedFactor - 1) * bufferedResult.body[i].keypoints[j].position.y + keypoint.position.y) / localOptions.bufferedFactor : keypoint.position.y,
        },
      }));
    bufferedResult.body[i] = { ...newResult.body[i], box, boxRaw, keypoints }; // shallow clone plus updated values
  }

  // interpolate hand results
  if (!bufferedResult.hand || (newResult.hand.length !== bufferedResult.hand.length)) bufferedResult.hand = JSON.parse(JSON.stringify(newResult.hand)); // deep clone once
  for (let i = 0; i < newResult.hand.length; i++) {
    const box = newResult.hand[i].box // update box
      .map((b, j) => ((localOptions.bufferedFactor - 1) * bufferedResult.hand[i].box[j] + b) / localOptions.bufferedFactor);
    const boxRaw = newResult.hand[i].boxRaw // update boxRaw
      .map((b, j) => ((localOptions.bufferedFactor - 1) * bufferedResult.hand[i].boxRaw[j] + b) / localOptions.bufferedFactor);
    const landmarks = newResult.hand[i].landmarks // update landmarks
      .map((landmark, j) => landmark
        .map((coord, k) => ((localOptions.bufferedFactor - 1) * bufferedResult.hand[i].landmarks[j][k] + coord) / localOptions.bufferedFactor));
    const keys = Object.keys(newResult.hand[i].annotations); // update annotations
    const annotations = [];
    for (const key of keys) {
      annotations[key] = newResult.hand[i].annotations[key]
        .map((val, j) => val
          .map((coord, k) => ((localOptions.bufferedFactor - 1) * bufferedResult.hand[i].annotations[key][j][k] + coord) / localOptions.bufferedFactor));
    }
    bufferedResult.hand[i] = { ...newResult.hand[i], box, boxRaw, landmarks, annotations }; // shallow clone plus updated values
  }

  // interpolate face results
  if (!bufferedResult.face || (newResult.face.length !== bufferedResult.face.length)) bufferedResult.face = JSON.parse(JSON.stringify(newResult.face)); // deep clone once
  for (let i = 0; i < newResult.face.length; i++) {
    const box = newResult.face[i].box // update box
      .map((b, j) => ((localOptions.bufferedFactor - 1) * bufferedResult.face[i].box[j] + b) / localOptions.bufferedFactor);
    const boxRaw = newResult.face[i].boxRaw // update boxRaw
      .map((b, j) => ((localOptions.bufferedFactor - 1) * bufferedResult.face[i].boxRaw[j] + b) / localOptions.bufferedFactor);
    const matrix = newResult.face[i].rotation.matrix;
    const angle = {
      roll: ((localOptions.bufferedFactor - 1) * bufferedResult.face[i].rotation.angle.roll + newResult.face[i].rotation.angle.roll) / localOptions.bufferedFactor,
      yaw: ((localOptions.bufferedFactor - 1) * bufferedResult.face[i].rotation.angle.yaw + newResult.face[i].rotation.angle.yaw) / localOptions.bufferedFactor,
      pitch: ((localOptions.bufferedFactor - 1) * bufferedResult.face[i].rotation.angle.pitch + newResult.face[i].rotation.angle.pitch) / localOptions.bufferedFactor,
    };
    const gaze = {
      angle: ((localOptions.bufferedFactor - 1) * bufferedResult.face[i].rotation.gaze.angle + newResult.face[i].rotation.gaze.angle) / localOptions.bufferedFactor,
      strength: ((localOptions.bufferedFactor - 1) * bufferedResult.face[i].rotation.gaze.strength + newResult.face[i].rotation.gaze.strength) / localOptions.bufferedFactor,
    };
    const rotation = { angle, matrix, gaze };
    bufferedResult.face[i] = { ...newResult.face[i], rotation, box, boxRaw }; // shallow clone plus updated values
  }

  // interpolate person results
  const newPersons = newResult.persons; // trigger getter function
  if (!bufferedResult.persons || (newPersons.length !== bufferedResult.persons.length)) bufferedResult.persons = JSON.parse(JSON.stringify(newPersons));
  for (let i = 0; i < newPersons.length; i++) { // update person box, we don't update the rest as it's updated as reference anyhow
    bufferedResult.persons[i].box = newPersons[i].box
      .map((box, j) => ((localOptions.bufferedFactor - 1) * bufferedResult.persons[i].box[j] + box) / localOptions.bufferedFactor);
  }

  // no buffering implemented for face, object, gesture
  // bufferedResult.face = JSON.parse(JSON.stringify(newResult.face));
  // bufferedResult.object = JSON.parse(JSON.stringify(newResult.object));
  // bufferedResult.gesture = JSON.parse(JSON.stringify(newResult.gesture));
}

export async function canvas(inCanvas: HTMLCanvasElement, outCanvas: HTMLCanvasElement) {
  if (!inCanvas || !outCanvas) return;
  if (!(inCanvas instanceof HTMLCanvasElement) || !(outCanvas instanceof HTMLCanvasElement)) return;
  const outCtx = inCanvas.getContext('2d');
  outCtx?.drawImage(inCanvas, 0, 0);
}

export async function all(inCanvas: HTMLCanvasElement, result: Result, drawOptions?: DrawOptions) {
  const localOptions = mergeDeep(options, drawOptions);
  if (!result || !inCanvas) return;
  if (!(inCanvas instanceof HTMLCanvasElement)) return;
  if (localOptions.bufferedOutput) calcBuffered(result, localOptions); // do results interpolation
  else bufferedResult = result; // just use results as-is
  face(inCanvas, bufferedResult.face, localOptions); // face does have buffering
  body(inCanvas, bufferedResult.body, localOptions); // use interpolated results if available
  hand(inCanvas, bufferedResult.hand, localOptions); // use interpolated results if available
  // person(inCanvas, bufferedResult.persons, localOptions); // use interpolated results if available
  gesture(inCanvas, result.gesture, localOptions); // gestures do not have buffering
  object(inCanvas, result.object, localOptions); // object detection does not have buffering
}
