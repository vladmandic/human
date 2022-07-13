import { TRI468 as triangulation } from '../face/facemeshcoords';
import { mergeDeep } from '../util/util';
import { getCanvasContext, rad2deg, rect, point, lines, arrow } from './primitives';
import { options } from './options';
import * as facemeshConstants from '../face/constants';
import type { FaceResult } from '../result';
import type { AnyCanvas, DrawOptions } from '../exports';

let opt: DrawOptions;

function drawLabels(f: FaceResult, ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
  if (opt.drawLabels) {
    // silly hack since fillText does not suport new line
    const labels:string[] = [];
    labels.push(`face: ${Math.trunc(100 * f.score)}%`);
    if (f.genderScore) labels.push(`${f.gender || ''} ${Math.trunc(100 * f.genderScore)}%`);
    if (f.age) labels.push(`age: ${f.age || ''}`);
    if (f.iris) labels.push(`distance: ${f.iris}`);
    if (f.real) labels.push(`real: ${Math.trunc(100 * f.real)}%`);
    if (f.live) labels.push(`live: ${Math.trunc(100 * f.live)}%`);
    if (f.emotion && f.emotion.length > 0) {
      const emotion = f.emotion.map((a) => `${Math.trunc(100 * a.score)}% ${a.emotion}`);
      if (emotion.length > 3) emotion.length = 3;
      labels.push(emotion.join(' '));
    }
    if (f.rotation && f.rotation.angle && f.rotation.gaze) {
      if (f.rotation.angle.roll) labels.push(`roll: ${rad2deg(f.rotation.angle.roll)}° yaw:${rad2deg(f.rotation.angle.yaw)}° pitch:${rad2deg(f.rotation.angle.pitch)}°`);
      if (f.rotation.gaze.bearing) labels.push(`gaze: ${rad2deg(f.rotation.gaze.bearing)}°`);
    }
    if (labels.length === 0) labels.push('face');
    ctx.fillStyle = opt.color;
    for (let i = labels.length - 1; i >= 0; i--) {
      const x = Math.max(f.box[0], 0);
      const y = i * opt.lineHeight + f.box[1];
      if (opt.shadowColor && opt.shadowColor !== '') {
        ctx.fillStyle = opt.shadowColor;
        ctx.fillText(labels[i], x + 5, y + 16);
      }
      ctx.fillStyle = opt.labelColor;
      ctx.fillText(labels[i], x + 4, y + 15);
    }
  }
}

function drawIrisElipse(f: FaceResult, ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
  // iris: array[center, left, top, right, bottom]
  if (f.annotations && f.annotations['leftEyeIris'] && f.annotations['leftEyeIris'][0]) {
    ctx.strokeStyle = opt.useDepth ? 'rgba(255, 200, 255, 0.3)' : opt.color;
    ctx.beginPath();
    const sizeX = Math.abs(f.annotations['leftEyeIris'][3][0] - f.annotations['leftEyeIris'][1][0]) / 2;
    const sizeY = Math.abs(f.annotations['leftEyeIris'][4][1] - f.annotations['leftEyeIris'][2][1]) / 2;
    ctx.ellipse(f.annotations['leftEyeIris'][0][0], f.annotations['leftEyeIris'][0][1], sizeX, sizeY, 0, 0, 2 * Math.PI);
    ctx.stroke();
    if (opt.fillPolygons) {
      ctx.fillStyle = opt.useDepth ? 'rgba(255, 255, 200, 0.3)' : opt.color;
      ctx.fill();
    }
  }
  if (f.annotations && f.annotations['rightEyeIris'] && f.annotations['rightEyeIris'][0]) {
    ctx.strokeStyle = opt.useDepth ? 'rgba(255, 200, 255, 0.3)' : opt.color;
    ctx.beginPath();
    const sizeX = Math.abs(f.annotations['rightEyeIris'][3][0] - f.annotations['rightEyeIris'][1][0]) / 2;
    const sizeY = Math.abs(f.annotations['rightEyeIris'][4][1] - f.annotations['rightEyeIris'][2][1]) / 2;
    ctx.ellipse(f.annotations['rightEyeIris'][0][0], f.annotations['rightEyeIris'][0][1], sizeX, sizeY, 0, 0, 2 * Math.PI);
    ctx.stroke();
    if (opt.fillPolygons) {
      ctx.fillStyle = opt.useDepth ? 'rgba(255, 255, 200, 0.3)' : opt.color;
      ctx.fill();
    }
  }
}

function drawGazeSpheres(f: FaceResult, ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
  if (opt.drawGaze && f.rotation?.angle && typeof Path2D !== 'undefined') {
    ctx.strokeStyle = 'pink';
    const valX = (f.box[0] + f.box[2] / 2) - (f.box[3] * rad2deg(f.rotation.angle.yaw) / 90);
    const valY = (f.box[1] + f.box[3] / 2) + (f.box[2] * rad2deg(f.rotation.angle.pitch) / 90);
    const pathV = new Path2D(`
      M ${f.box[0] + f.box[2] / 2} ${f.box[1]}
      C
        ${valX} ${f.box[1]},
        ${valX} ${f.box[1] + f.box[3]},
        ${f.box[0] + f.box[2] / 2} ${f.box[1] + f.box[3]}
    `);
    const pathH = new Path2D(`
      M ${f.box[0]} ${f.box[1] + f.box[3] / 2}
      C 
        ${f.box[0]} ${valY},
        ${f.box[0] + f.box[2]} ${valY},
        ${f.box[0] + f.box[2]} ${f.box[1] + f.box[3] / 2}
    `);
    ctx.stroke(pathH);
    ctx.stroke(pathV);
  }
}

function drawGazeArrows(f: FaceResult, ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
  if (opt.drawGaze && f.rotation?.gaze?.strength && f.rotation?.gaze?.bearing && f.annotations['leftEyeIris'] && f.annotations['rightEyeIris'] && f.annotations['leftEyeIris'][0] && f.annotations['rightEyeIris'][0]) {
    ctx.strokeStyle = 'pink';
    ctx.fillStyle = 'pink';
    const leftGaze = [
      f.annotations['leftEyeIris'][0][0] + (Math.sin(f.rotation.gaze.bearing) * f.rotation.gaze.strength * f.box[3]),
      f.annotations['leftEyeIris'][0][1] + (Math.cos(f.rotation.gaze.bearing) * f.rotation.gaze.strength * f.box[2]),
    ];
    arrow(ctx, [f.annotations['leftEyeIris'][0][0], f.annotations['leftEyeIris'][0][1]], [leftGaze[0], leftGaze[1]], 4);
    const rightGaze = [
      f.annotations['rightEyeIris'][0][0] + (Math.sin(f.rotation.gaze.bearing) * f.rotation.gaze.strength * f.box[3]),
      f.annotations['rightEyeIris'][0][1] + (Math.cos(f.rotation.gaze.bearing) * f.rotation.gaze.strength * f.box[2]),
    ];
    arrow(ctx, [f.annotations['rightEyeIris'][0][0], f.annotations['rightEyeIris'][0][1]], [rightGaze[0], rightGaze[1]], 4);
  }
}

function drawFacePolygons(f: FaceResult, ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
  if (opt.drawPolygons && f.mesh.length >= 468) {
    ctx.lineWidth = 1;
    for (let i = 0; i < triangulation.length / 3; i++) {
      const points = [triangulation[i * 3 + 0], triangulation[i * 3 + 1], triangulation[i * 3 + 2]].map((index) => f.mesh[index]);
      lines(ctx, points, opt);
    }
    drawIrisElipse(f, ctx);
  }
  /*
  if (opt.drawPolygons && f.contours.length > 1) {
    ctx.lineWidth = 5;
    lines(ctx, f.contours, opt);
  }
  ctx.lineWidth = 1;
  */
}

function drawFacePoints(f: FaceResult, ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
  if (opt.drawPoints && f.mesh.length >= 468) {
    for (let i = 0; i < f.mesh.length; i++) {
      point(ctx, f.mesh[i][0], f.mesh[i][1], f.mesh[i][2], opt);
      if (opt.drawAttention) {
        if (facemeshConstants.LANDMARKS_REFINEMENT_LIPS_CONFIG.includes(i)) point(ctx, f.mesh[i][0], f.mesh[i][1], (f.mesh[i][2] as number) + 127, opt);
        if (facemeshConstants.LANDMARKS_REFINEMENT_LEFT_EYE_CONFIG.includes(i)) point(ctx, f.mesh[i][0], f.mesh[i][1], (f.mesh[i][2] as number) - 127, opt);
        if (facemeshConstants.LANDMARKS_REFINEMENT_RIGHT_EYE_CONFIG.includes(i)) point(ctx, f.mesh[i][0], f.mesh[i][1], (f.mesh[i][2] as number) - 127, opt);
      }
    }
  }
}

function drawFaceBoxes(f: FaceResult, ctx) {
  if (opt.drawBoxes) {
    rect(ctx, f.box[0], f.box[1], f.box[2], f.box[3], opt);
  }
}

/** draw detected faces */
export async function face(inCanvas: AnyCanvas, result: Array<FaceResult>, drawOptions?: Partial<DrawOptions>) {
  opt = mergeDeep(options, drawOptions);
  if (!result || !inCanvas) return;
  const ctx = getCanvasContext(inCanvas);
  if (!ctx) return;
  ctx.font = opt.font;
  ctx.strokeStyle = opt.color;
  ctx.fillStyle = opt.color;
  for (const f of result) {
    drawFaceBoxes(f, ctx);
    drawLabels(f, ctx);
    if (f.mesh && f.mesh.length > 0) {
      drawFacePoints(f, ctx);
      drawFacePolygons(f, ctx);
      drawGazeSpheres(f, ctx);
      drawGazeArrows(f, ctx);
    }
  }
}
