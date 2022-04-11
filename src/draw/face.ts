import { TRI468 as triangulation } from '../face/facemeshcoords';
import { mergeDeep } from '../util/util';
import { getCanvasContext, rad2deg, rect, point, lines, arrow } from './primitives';
import { options } from './options';
import type { FaceResult } from '../result';
import type { AnyCanvas, DrawOptions } from '../exports';

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
        const length = Math.max(468, f.mesh.length);
        for (let i = 0; i < length; i++) point(ctx, f.mesh[i][0], f.mesh[i][1], f.mesh[i][2], localOptions);
      }
      if (localOptions.drawAttention && f.mesh.length > 468) {
        for (let i = 468; i < f.mesh.length; i++) point(ctx, f.mesh[i][0], f.mesh[i][1], -255, localOptions);
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
