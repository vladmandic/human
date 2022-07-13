import { log } from '../util/util';
import type { AnyCanvas } from '../exports';
import type { Point } from '../result';
import type { DrawOptions } from './options';

export const getCanvasContext = (input: AnyCanvas) => {
  if (!input) log('draw error: invalid canvas');
  else if (!input.getContext) log('draw error: canvas context not defined');
  else {
    const ctx = input.getContext('2d');
    if (!ctx) log('draw error: cannot get canvas context');
    else return ctx;
  }
  return null;
};

export const rad2deg = (theta: number) => Math.round((theta * 180) / Math.PI);

export const colorDepth = (z: number | undefined, opt: DrawOptions): string => {
  if (!opt.useDepth || typeof z === 'undefined') return opt.color;
  const rgb = Uint8ClampedArray.from([127 + (2 * z), 127 - (2 * z), 255]);
  const color = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opt.alpha})`;
  return color;
};

export function point(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, x: number, y: number, z: number | undefined, localOptions: DrawOptions) {
  ctx.fillStyle = colorDepth(z, localOptions);
  ctx.beginPath();
  ctx.arc(x, y, localOptions.pointSize, 0, 2 * Math.PI);
  ctx.fill();
}

export function rect(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, x: number, y: number, width: number, height: number, localOptions: DrawOptions) {
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

export function lines(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, points: Point[], localOptions: DrawOptions) {
  if (points.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (const pt of points) {
    ctx.strokeStyle = colorDepth(pt[2] || 0, localOptions);
    ctx.lineTo(Math.trunc(pt[0]), Math.trunc(pt[1]));
  }
  ctx.stroke();
  if (localOptions.fillPolygons) {
    ctx.closePath();
    ctx.fill();
  }
}

export function curves(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, points: Point[], localOptions: DrawOptions) {
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

export function arrow(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, from: Point, to: Point, radius = 5) {
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
