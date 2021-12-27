/**
 * Module that implements helper draw functions, exposed as human.draw
 */

import { TRI468 as triangulation } from '../face/facemeshcoords';
import { mergeDeep, now, log } from './util';
import { env } from './env';
import type { Result, FaceResult, BodyResult, HandResult, ObjectResult, GestureResult, PersonResult, Point } from '../result';
import type { AnyCanvas } from '../exports';

/** Draw Options
 * - Accessed via `human.draw.options` or provided per each draw method as the drawOptions optional parameter
 */
export type DrawOptions = {
  /** draw line color */
  color: string,
  /** label color */
  labelColor: string,
  /** label shadow color */
  shadowColor: string,
  /** label font */
  font: string,
  /** line spacing between labels */
  lineHeight: number,
  /** line width for drawn lines */
  lineWidth: number,
  /** size of drawn points */
  pointSize: number,
  /** draw rounded boxes by n pixels */
  roundRect: number,
  /** should points be drawn? */
  drawPoints: boolean,
  /** should labels be drawn? */
  drawLabels: boolean,
  /** should detected gestures be drawn? */
  drawGestures: boolean,
  /** should draw boxes around detection results? */
  drawBoxes: boolean,
  /** should draw polygons from detection points? */
  drawPolygons: boolean,
  /** should draw gaze arrows? */
  drawGaze: boolean,
  /** should fill polygons? */
  fillPolygons: boolean,
  /** use z-coordinate when available */
  useDepth: boolean,
  /** should lines be curved? */
  useCurves: boolean,
}

/** currently set draw options {@link DrawOptions} */
export const options: DrawOptions = {
  color: <string>'rgba(173, 216, 230, 0.6)', // 'lightblue' with light alpha channel
  labelColor: <string>'rgba(173, 216, 230, 1)', // 'lightblue' with dark alpha channel
  shadowColor: <string>'black',
  font: <string>'small-caps 16px "Segoe UI"',
  lineHeight: <number>18,
  lineWidth: <number>4,
  pointSize: <number>2,
  roundRect: <number>8,
  drawPoints: <boolean>false,
  drawLabels: <boolean>true,
  drawBoxes: <boolean>true,
  drawGestures: <boolean>true,
  drawPolygons: <boolean>true,
  drawGaze: <boolean>true,
  fillPolygons: <boolean>false,
  useDepth: <boolean>true,
  useCurves: <boolean>false,
};

let drawTime = 0;

const getCanvasContext = (input: AnyCanvas) => {
  if (!input) log('draw error: invalid canvas');
  else if (!input.getContext) log('draw error: canvas context not defined');
  else {
    const ctx = input.getContext('2d');
    if (!ctx) log('draw error: cannot get canvas context');
    else return ctx;
  }
  return null;
};

const rad2deg = (theta: number) => Math.round((theta * 180) / Math.PI);

function point(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, x: number, y: number, z: number | undefined, localOptions: DrawOptions) {
  z = z || 0;
  ctx.fillStyle = localOptions.useDepth && z ? `rgba(${127.5 + (2 * z)}, ${127.5 - (2 * z)}, 255, 0.3)` : localOptions.color;
  ctx.beginPath();
  ctx.arc(x, y, localOptions.pointSize, 0, 2 * Math.PI);
  ctx.fill();
}

function rect(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, x: number, y: number, width: number, height: number, localOptions: DrawOptions) {
  ctx.beginPath();
  ctx.lineWidth = localOptions.lineWidth;
  if (localOptions.useCurves) {
    const cx = (x + x + width) / 2;
    const cy = (y + y + height) / 2;
    ctx.ellipse(cx, cy, width / 2, height / 2, 0, 0, 2 * Math.PI);
  } else {
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

function lines(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, points: Point[], localOptions: DrawOptions) {
  if (points.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (const pt of points) {
    const z = pt[2] || 0;
    ctx.strokeStyle = localOptions.useDepth && z !== 0 ? `rgba(${127.5 + (2 * z)}, ${127.5 - (2 * z)}, 255, 0.3)` : localOptions.color;
    ctx.fillStyle = localOptions.useDepth && z !== 0 ? `rgba(${127.5 + (2 * z)}, ${127.5 - (2 * z)}, 255, 0.3)` : localOptions.color;
    ctx.lineTo(pt[0], Math.round(pt[1]));
  }
  ctx.stroke();
  if (localOptions.fillPolygons) {
    ctx.closePath();
    ctx.fill();
  }
}

function curves(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, points: Point[], localOptions: DrawOptions) {
  if (points.length < 2) return;
  ctx.lineWidth = localOptions.lineWidth;
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

function arrow(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, from: Point, to: Point, radius = 5) {
  let angle;
  let x;
  let y;
  ctx.beginPath();
  ctx.moveTo(from[0], from[1]);
  ctx.lineTo(to[0], to[1]);
  angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
  x = radius * Math.cos(angle) + to[0];
  y = radius * Math.sin(angle) + to[1];
  ctx.moveTo(x, y);
  angle += (1.0 / 3.0) * (2 * Math.PI);
  x = radius * Math.cos(angle) + to[0];
  y = radius * Math.sin(angle) + to[1];
  ctx.lineTo(x, y);
  angle += (1.0 / 3.0) * (2 * Math.PI);
  x = radius * Math.cos(angle) + to[0];
  y = radius * Math.sin(angle) + to[1];
  ctx.lineTo(x, y);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
}

/** draw detected gestures */
export async function gesture(inCanvas: AnyCanvas, result: Array<GestureResult>, drawOptions?: Partial<DrawOptions>) {
  const localOptions = mergeDeep(options, drawOptions);
  if (!result || !inCanvas) return;
  if (localOptions.drawGestures) {
    const ctx = getCanvasContext(inCanvas);
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
}

/** draw detected faces */
export async function face(inCanvas: AnyCanvas, result: Array<FaceResult>, drawOptions?: Partial<DrawOptions>) {
  const localOptions = mergeDeep(options, drawOptions);
  if (!result || !inCanvas) return;
  const ctx = getCanvasContext(inCanvas);
  if (!ctx) return;
  for (const f of result) {
    ctx.font = localOptions.font;
    ctx.strokeStyle = localOptions.color;
    ctx.fillStyle = localOptions.color;
    if (localOptions.drawBoxes) rect(ctx, f.box[0], f.box[1], f.box[2], f.box[3], localOptions);
    if (localOptions.drawLabels) {
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
    }
    // ctx.lineWidth = localOptions.lineWidth;
    ctx.lineWidth = 2;
    if (f.mesh && f.mesh.length > 0) {
      if (localOptions.drawPoints) {
        for (const pt of f.mesh) point(ctx, pt[0], pt[1], pt[2], localOptions);
      }
      if (localOptions.drawPolygons) {
        if (f.mesh.length > 450) {
          for (let i = 0; i < triangulation.length / 3; i++) {
            const points = [
              triangulation[i * 3 + 0],
              triangulation[i * 3 + 1],
              triangulation[i * 3 + 2],
            ].map((index) => f.mesh[index]);
            lines(ctx, points, localOptions);
          }
        }
        // iris: array[center, left, top, right, bottom]
        if (f.annotations && f.annotations['leftEyeIris'] && f.annotations['leftEyeIris'][0]) {
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
        if (f.annotations && f.annotations['rightEyeIris'] && f.annotations['rightEyeIris'][0]) {
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
        if (localOptions.drawGaze && f.rotation?.gaze?.strength && f.rotation?.gaze?.bearing && f.annotations['leftEyeIris'] && f.annotations['rightEyeIris'] && f.annotations['leftEyeIris'][0] && f.annotations['rightEyeIris'][0]) {
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
    }
  }
}

/** draw detected bodies */
export async function body(inCanvas: AnyCanvas, result: Array<BodyResult>, drawOptions?: Partial<DrawOptions>) {
  const localOptions = mergeDeep(options, drawOptions);
  if (!result || !inCanvas) return;
  const ctx = getCanvasContext(inCanvas);
  if (!ctx) return;
  ctx.lineJoin = 'round';
  for (let i = 0; i < result.length; i++) {
    ctx.strokeStyle = localOptions.color;
    ctx.fillStyle = localOptions.color;
    ctx.lineWidth = localOptions.lineWidth;
    ctx.font = localOptions.font;
    if (localOptions.drawBoxes && result[i].box && result[i].box?.length === 4) {
      rect(ctx, result[i].box[0], result[i].box[1], result[i].box[2], result[i].box[3], localOptions);
      if (localOptions.drawLabels) {
        if (localOptions.shadowColor && localOptions.shadowColor !== '') {
          ctx.fillStyle = localOptions.shadowColor;
          ctx.fillText(`body ${100 * result[i].score}%`, result[i].box[0] + 3, 1 + result[i].box[1] + localOptions.lineHeight, result[i].box[2]);
        }
        ctx.fillStyle = localOptions.labelColor;
        ctx.fillText(`body ${100 * result[i].score}%`, result[i].box[0] + 2, 0 + result[i].box[1] + localOptions.lineHeight, result[i].box[2]);
      }
    }
    if (localOptions.drawPoints && result[i].keypoints) {
      for (let pt = 0; pt < result[i].keypoints.length; pt++) {
        if (!result[i].keypoints[pt].score || (result[i].keypoints[pt].score === 0)) continue;
        ctx.fillStyle = localOptions.useDepth && result[i].keypoints[pt].position[2] ? `rgba(${127.5 + (2 * (result[i].keypoints[pt].position[2] || 0))}, ${127.5 - (2 * (result[i].keypoints[pt].position[2] || 0))}, 255, 0.5)` : localOptions.color;
        point(ctx, result[i].keypoints[pt].position[0], result[i].keypoints[pt].position[1], 0, localOptions);
      }
    }
    if (localOptions.drawLabels && result[i].keypoints) {
      ctx.font = localOptions.font;
      for (const pt of result[i].keypoints) {
        if (!pt.score || (pt.score === 0)) continue;
        ctx.fillStyle = localOptions.useDepth && pt.position[2] ? `rgba(${127.5 + (2 * pt.position[2])}, ${127.5 - (2 * pt.position[2])}, 255, 0.5)` : localOptions.color;
        ctx.fillText(`${pt.part} ${Math.trunc(100 * pt.score)}%`, pt.position[0] + 4, pt.position[1] + 4);
      }
    }
    if (localOptions.drawPolygons && result[i].keypoints && result[i].annotations) {
      for (const part of Object.values(result[i].annotations)) {
        for (const connected of part) curves(ctx, connected, localOptions);
      }
    }
  }
}

/** draw detected hands */
export async function hand(inCanvas: AnyCanvas, result: Array<HandResult>, drawOptions?: Partial<DrawOptions>) {
  const localOptions = mergeDeep(options, drawOptions);
  if (!result || !inCanvas) return;
  const ctx = getCanvasContext(inCanvas);
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
          ctx.fillText(`hand:${Math.trunc(100 * h.score)}%`, h.box[0] + 3, 1 + h.box[1] + localOptions.lineHeight, h.box[2]); // can use h.label
        }
        ctx.fillStyle = localOptions.labelColor;
        ctx.fillText(`hand:${Math.trunc(100 * h.score)}%`, h.box[0] + 2, 0 + h.box[1] + localOptions.lineHeight, h.box[2]); // can use h.label
      }
      ctx.stroke();
    }
    if (localOptions.drawPoints) {
      if (h.keypoints && h.keypoints.length > 0) {
        for (const pt of h.keypoints) {
          ctx.fillStyle = localOptions.useDepth ? `rgba(${127.5 + (2 * (pt[2] || 0))}, ${127.5 - (2 * (pt[2] || 0))}, 255, 0.5)` : localOptions.color;
          point(ctx, pt[0], pt[1], 0, localOptions);
        }
      }
    }
    if (localOptions.drawLabels && h.annotations) {
      const addHandLabel = (part: Array<Point>, title: string) => {
        if (!part || part.length === 0 || !part[0]) return;
        const z = part[part.length - 1][2] || 0;
        ctx.fillStyle = localOptions.useDepth ? `rgba(${127.5 + (2 * z)}, ${127.5 - (2 * z)}, 255, 0.5)` : localOptions.color;
        ctx.fillText(title, part[part.length - 1][0] + 4, part[part.length - 1][1] + 4);
      };
      ctx.font = localOptions.font;
      addHandLabel(h.annotations['index'], 'index');
      addHandLabel(h.annotations['middle'], 'middle');
      addHandLabel(h.annotations['ring'], 'ring');
      addHandLabel(h.annotations['pinky'], 'pinky');
      addHandLabel(h.annotations['thumb'], 'thumb');
      addHandLabel(h.annotations['palm'], 'palm');
    }
    if (localOptions.drawPolygons && h.annotations) {
      const addHandLine = (part: Array<Point>) => {
        if (!part || part.length === 0 || !part[0]) return;
        for (let i = 0; i < part.length; i++) {
          ctx.beginPath();
          const z = part[i][2] || 0;
          ctx.strokeStyle = localOptions.useDepth ? `rgba(${127.5 + (i * z)}, ${127.5 - (i * z)}, 255, 0.5)` : localOptions.color;
          ctx.moveTo(part[i > 0 ? i - 1 : 0][0], part[i > 0 ? i - 1 : 0][1]);
          ctx.lineTo(part[i][0], part[i][1]);
          ctx.stroke();
        }
      };
      ctx.lineWidth = localOptions.lineWidth;
      addHandLine(h.annotations['index']);
      addHandLine(h.annotations['middle']);
      addHandLine(h.annotations['ring']);
      addHandLine(h.annotations['pinky']);
      addHandLine(h.annotations['thumb']);
      // addPart(h.annotations.palm);
    }
  }
}

/** draw detected objects */
export async function object(inCanvas: AnyCanvas, result: Array<ObjectResult>, drawOptions?: Partial<DrawOptions>) {
  const localOptions = mergeDeep(options, drawOptions);
  if (!result || !inCanvas) return;
  const ctx = getCanvasContext(inCanvas);
  if (!ctx) return;
  ctx.lineJoin = 'round';
  ctx.font = localOptions.font;
  for (const h of result) {
    if (localOptions.drawBoxes) {
      ctx.strokeStyle = localOptions.color;
      ctx.fillStyle = localOptions.color;
      rect(ctx, h.box[0], h.box[1], h.box[2], h.box[3], localOptions);
      if (localOptions.drawLabels) {
        const label = `${h.label} ${Math.round(100 * h.score)}%`;
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

/** draw combined person results instead of individual detection result objects */
export async function person(inCanvas: AnyCanvas, result: Array<PersonResult>, drawOptions?: Partial<DrawOptions>) {
  const localOptions = mergeDeep(options, drawOptions);
  if (!result || !inCanvas) return;
  const ctx = getCanvasContext(inCanvas);
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

/** draw processed canvas */
export async function canvas(input: AnyCanvas | HTMLImageElement | HTMLVideoElement, output: AnyCanvas) {
  if (!input || !output) return;
  const ctx = getCanvasContext(output);
  if (!ctx) return;
  ctx.drawImage(input, 0, 0);
}

/** meta-function that performs draw for: canvas, face, body, hand */
export async function all(inCanvas: AnyCanvas, result: Result, drawOptions?: Partial<DrawOptions>) {
  if (!result || !result.performance || !result || !inCanvas) return null;
  const timeStamp = now();
  const localOptions = mergeDeep(options, drawOptions);
  const promise = Promise.all([
    face(inCanvas, result.face, localOptions),
    body(inCanvas, result.body, localOptions),
    hand(inCanvas, result.hand, localOptions),
    object(inCanvas, result.object, localOptions),
    gesture(inCanvas, result.gesture, localOptions), // gestures do not have buffering
    // person(inCanvas, result.persons, localOptions); // already included above
  ]);
  drawTime = env.perfadd ? drawTime + Math.round(now() - timeStamp) : Math.round(now() - timeStamp);
  result.performance.draw = drawTime;
  return promise;
}
