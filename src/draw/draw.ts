import { TRI468 as triangulation } from '../blazeface/coords';
import { mergeDeep } from '../helpers';
import type { Result, Face, Body, Hand, Item, Gesture } from '../result';

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
 * -useRawBoxes: Boolean: internal: use non-normalized coordinates when performing draw methods,
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
  drawPoints: Boolean,
  drawLabels: Boolean,
  drawBoxes: Boolean,
  drawPolygons: Boolean,
  fillPolygons: Boolean,
  useDepth: Boolean,
  useCurves: Boolean,
  bufferedOutput: Boolean,
  useRawBoxes: Boolean,
  calculateHandBox: Boolean,
}

export const options: DrawOptions = {
  color: <string>'rgba(173, 216, 230, 0.3)', // 'lightblue' with light alpha channel
  labelColor: <string>'rgba(173, 216, 230, 1)', // 'lightblue' with dark alpha channel
  shadowColor: <string>'black',
  font: <string>'small-caps 16px "Segoe UI"',
  lineHeight: <number>24,
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
  bufferedOutput: <Boolean>false, // not yet implemented
  useRawBoxes: <Boolean>false,
  calculateHandBox: <Boolean>true,
};

let bufferedResult: Result;

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
    let where: any[] = []; // what&where is a record
    let what: any[] = []; // what&where is a record
    [where, what] = Object.entries(result[j]);
    if ((what.length > 1) && (what[1].length > 0)) {
      const person = where[1] > 0 ? `#${where[1]}` : '';
      const label = `${where[0]} ${person}: ${what[1]}`;
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
    if (localOptions.drawBoxes) {
      if (localOptions.useRawBoxes) rect(ctx, inCanvas.width * f.boxRaw[0], inCanvas.height * f.boxRaw[1], inCanvas.width * f.boxRaw[2], inCanvas.height * f.boxRaw[3], localOptions);
      else rect(ctx, f.box[0], f.box[1], f.box[2], f.box[3], localOptions);
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
    if (f.rotation && f.rotation.angle && f.rotation.angle.roll) labels.push(`roll: ${Math.trunc(100 * f.rotation.angle.roll) / 100} yaw:${Math.trunc(100 * f.rotation.angle.yaw) / 100} pitch:${Math.trunc(100 * f.rotation.angle.pitch) / 100}`);
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
      let box;
      if (!localOptions.calculateHandBox) {
        box = localOptions.useRawBoxes ? h.boxRaw : h.box;
      } else {
        box = [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 0, 0];
        if (h.landmarks && h.landmarks.length > 0) {
          for (const pt of h.landmarks) {
            if (pt[0] < box[0]) box[0] = pt[0];
            if (pt[1] < box[1]) box[1] = pt[1];
            if (pt[0] > box[2]) box[2] = pt[0];
            if (pt[1] > box[3]) box[3] = pt[1];
          }
          box[2] -= box[0];
          box[3] -= box[1];
        }
      }
      if (localOptions.useRawBoxes) rect(ctx, inCanvas.width * box[0], inCanvas.height * box[1], inCanvas.width * box[2], inCanvas.height * box[3], localOptions);
      else rect(ctx, box[0], box[1], box[2], box[3], localOptions);
      if (localOptions.drawLabels) {
        if (localOptions.shadowColor && localOptions.shadowColor !== '') {
          ctx.fillStyle = localOptions.shadowColor;
          ctx.fillText('hand', box[0] + 3, 1 + box[1] + localOptions.lineHeight, box[2]);
        }
        ctx.fillStyle = localOptions.labelColor;
        ctx.fillText('hand', box[0] + 2, 0 + box[1] + localOptions.lineHeight, box[2]);
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
      if (localOptions.useRawBoxes) rect(ctx, inCanvas.width * h.boxRaw[0], inCanvas.height * h.boxRaw[1], inCanvas.width * h.boxRaw[2], inCanvas.height * h.boxRaw[3], localOptions);
      else rect(ctx, h.box[0], h.box[1], h.box[2], h.box[3], localOptions);
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
  if (localOptions.bufferedOutput) {
    if (result.timestamp !== bufferedResult?.timestamp) bufferedResult = result;
  } else {
    bufferedResult = result;
  }
  face(inCanvas, bufferedResult.face, localOptions);
  body(inCanvas, bufferedResult.body, localOptions);
  hand(inCanvas, bufferedResult.hand, localOptions);
  gesture(inCanvas, bufferedResult.gesture, localOptions);
  object(inCanvas, bufferedResult.object, localOptions);
}
