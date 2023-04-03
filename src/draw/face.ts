import { TRI468 as triangulation } from '../face/facemeshcoords';
import { mergeDeep } from '../util/util';
import { getCanvasContext, rad2deg, rect, point, lines, arrow, labels, replace } from './primitives';
import { options } from './options';
import * as facemeshConstants from '../face/constants';
import type { FaceResult } from '../result';
import type { AnyCanvas, DrawOptions } from '../exports';

let localOptions: DrawOptions;

function drawLabels(f: FaceResult, ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
  if (!localOptions.drawLabels || (localOptions.faceLabels?.length === 0)) return;
  let l = localOptions.faceLabels.slice();
  l = replace(l, '[id]', f.id.toFixed(0));
  if (f.score) l = replace(l, '[score]', 100 * f.score);
  if (f.gender) l = replace(l, '[gender]', f.gender);
  if (f.genderScore) l = replace(l, '[genderScore]', 100 * f.genderScore);
  if (f.age) l = replace(l, '[age]', f.age);
  if (f.distance) l = replace(l, '[distance]', 100 * f.distance);
  if (f.real) l = replace(l, '[real]', 100 * f.real);
  if (f.live) l = replace(l, '[live]', 100 * f.live);
  if (f.emotion && f.emotion.length > 0) {
    const emotion = f.emotion.map((a) => `${Math.trunc(100 * a.score)}% ${a.emotion}`);
    if (emotion.length > 3) emotion.length = 3;
    l = replace(l, '[emotions]', emotion.join(' '));
  }
  if (f.rotation?.angle?.roll) l = replace(l, '[roll]', rad2deg(f.rotation.angle.roll));
  if (f.rotation?.angle?.yaw) l = replace(l, '[yaw]', rad2deg(f.rotation.angle.yaw));
  if (f.rotation?.angle?.pitch) l = replace(l, '[pitch]', rad2deg(f.rotation.angle.pitch));
  if (f.rotation?.gaze?.bearing) l = replace(l, '[gaze]', rad2deg(f.rotation.gaze.bearing));
  labels(ctx, l, f.box[0], f.box[1], localOptions);
}

function drawIrisElipse(f: FaceResult, ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
  // iris: array[center, left, top, right, bottom]
  if (f.annotations?.leftEyeIris && f.annotations?.leftEyeIris[0]) {
    ctx.strokeStyle = localOptions.useDepth ? 'rgba(255, 200, 255, 0.3)' : localOptions.color;
    ctx.beginPath();
    const sizeX = Math.abs(f.annotations.leftEyeIris[3][0] - f.annotations.leftEyeIris[1][0]) / 2;
    const sizeY = Math.abs(f.annotations.leftEyeIris[4][1] - f.annotations.leftEyeIris[2][1]) / 2;
    ctx.ellipse(f.annotations.leftEyeIris[0][0], f.annotations.leftEyeIris[0][1], sizeX, sizeY, 0, 0, 2 * Math.PI);
    ctx.stroke();
    if (localOptions.fillPolygons) {
      ctx.fillStyle = localOptions.useDepth ? 'rgba(255, 255, 200, 0.3)' : localOptions.color;
      ctx.fill();
    }
  }
  if (f.annotations?.rightEyeIris && f.annotations?.rightEyeIris[0]) {
    ctx.strokeStyle = localOptions.useDepth ? 'rgba(255, 200, 255, 0.3)' : localOptions.color;
    ctx.beginPath();
    const sizeX = Math.abs(f.annotations.rightEyeIris[3][0] - f.annotations.rightEyeIris[1][0]) / 2;
    const sizeY = Math.abs(f.annotations.rightEyeIris[4][1] - f.annotations.rightEyeIris[2][1]) / 2;
    ctx.ellipse(f.annotations.rightEyeIris[0][0], f.annotations.rightEyeIris[0][1], sizeX, sizeY, 0, 0, 2 * Math.PI);
    ctx.stroke();
    if (localOptions.fillPolygons) {
      ctx.fillStyle = localOptions.useDepth ? 'rgba(255, 255, 200, 0.3)' : localOptions.color;
      ctx.fill();
    }
  }
}

function drawGazeSpheres(f: FaceResult, ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
  if (localOptions.drawGaze && f.rotation?.angle && typeof Path2D !== 'undefined') {
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
  if (localOptions.drawGaze && f.rotation?.gaze.strength && f.rotation.gaze.bearing && f.annotations.leftEyeIris && f.annotations.rightEyeIris && f.annotations.leftEyeIris[0] && f.annotations.rightEyeIris[0]) {
    ctx.strokeStyle = 'pink';
    ctx.fillStyle = 'pink';
    const leftGaze = [
      f.annotations.leftEyeIris[0][0] + (Math.sin(f.rotation.gaze.bearing) * f.rotation.gaze.strength * f.box[3]),
      f.annotations.leftEyeIris[0][1] + (Math.cos(f.rotation.gaze.bearing) * f.rotation.gaze.strength * f.box[2]),
    ];
    arrow(ctx, [f.annotations.leftEyeIris[0][0], f.annotations.leftEyeIris[0][1]], [leftGaze[0], leftGaze[1]], 4);
    const rightGaze = [
      f.annotations.rightEyeIris[0][0] + (Math.sin(f.rotation.gaze.bearing) * f.rotation.gaze.strength * f.box[3]),
      f.annotations.rightEyeIris[0][1] + (Math.cos(f.rotation.gaze.bearing) * f.rotation.gaze.strength * f.box[2]),
    ];
    arrow(ctx, [f.annotations.rightEyeIris[0][0], f.annotations.rightEyeIris[0][1]], [rightGaze[0], rightGaze[1]], 4);
  }
}

function drawFacePolygons(f: FaceResult, ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
  if (localOptions.drawPolygons && f.mesh.length >= 468) {
    ctx.lineWidth = 1;
    for (let i = 0; i < triangulation.length / 3; i++) {
      const points = [triangulation[i * 3 + 0], triangulation[i * 3 + 1], triangulation[i * 3 + 2]].map((index) => f.mesh[index]);
      lines(ctx, points, localOptions);
    }
    drawIrisElipse(f, ctx);
  }
  /*
  if (localOptions.drawPolygons && f.contours.length > 1) {
    ctx.lineWidth = 5;
    lines(ctx, f.contours, opt);
  }
  ctx.lineWidth = 1;
  */
}

function drawFacePoints(f: FaceResult, ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
  if (localOptions.drawPoints) {
    if (f?.mesh.length >= 468) {
      for (let i = 0; i < f.mesh.length; i++) {
        point(ctx, f.mesh[i][0], f.mesh[i][1], f.mesh[i][2], localOptions);
        if (localOptions.drawAttention) {
          if (facemeshConstants.LANDMARKS_REFINEMENT_LIPS_CONFIG.includes(i)) point(ctx, f.mesh[i][0], f.mesh[i][1], (f.mesh[i][2] as number) + 127, localOptions);
          if (facemeshConstants.LANDMARKS_REFINEMENT_LEFT_EYE_CONFIG.includes(i)) point(ctx, f.mesh[i][0], f.mesh[i][1], (f.mesh[i][2] as number) - 127, localOptions);
          if (facemeshConstants.LANDMARKS_REFINEMENT_RIGHT_EYE_CONFIG.includes(i)) point(ctx, f.mesh[i][0], f.mesh[i][1], (f.mesh[i][2] as number) - 127, localOptions);
        }
      }
    } else {
      for (const [k, v] of Object.entries(f?.annotations || {})) {
        if (!v?.[0]) continue;
        const pt = v[0];
        point(ctx, pt[0], pt[1], 0, localOptions);
        if (localOptions.drawLabels) labels(ctx, k, pt[0], pt[1], localOptions);
      }
    }
  }
}

function drawFaceBoxes(f: FaceResult, ctx) {
  if (localOptions.drawBoxes) {
    rect(ctx, f.box[0], f.box[1], f.box[2], f.box[3], localOptions);
  }
}

/** draw detected faces */
export function face(inCanvas: AnyCanvas, result: FaceResult[], drawOptions?: Partial<DrawOptions>) {
  localOptions = mergeDeep(options, drawOptions);
  if (!result || !inCanvas) return;
  const ctx = getCanvasContext(inCanvas) as CanvasRenderingContext2D;
  if (!ctx) return;
  ctx.font = localOptions.font;
  ctx.strokeStyle = localOptions.color;
  ctx.fillStyle = localOptions.color;
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
