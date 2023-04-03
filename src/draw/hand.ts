import { mergeDeep } from '../util/util';
import { getCanvasContext, rect, point, colorDepth, replace, labels } from './primitives';
import { options } from './options';
import type { HandResult } from '../result';
import type { AnyCanvas, DrawOptions, Point } from '../exports';

/** draw detected hands */
export function hand(inCanvas: AnyCanvas, result: HandResult[], drawOptions?: Partial<DrawOptions>) {
  const localOptions: DrawOptions = mergeDeep(options, drawOptions);
  if (!result || !inCanvas) return;
  const ctx = getCanvasContext(inCanvas) as CanvasRenderingContext2D;
  if (!ctx) return;
  ctx.lineJoin = 'round';
  ctx.font = localOptions.font;
  for (const h of result) {
    if (localOptions.drawBoxes) {
      ctx.strokeStyle = localOptions.color;
      ctx.fillStyle = localOptions.color;
      rect(ctx, h.box[0], h.box[1], h.box[2], h.box[3], localOptions);
      if (localOptions.drawLabels && (localOptions.handLabels?.length > 0)) {
        let l = localOptions.handLabels.slice();
        l = replace(l, '[id]', h.id.toFixed(0));
        l = replace(l, '[label]', h.label);
        l = replace(l, '[score]', 100 * h.score);
        labels(ctx, l, h.box[0], h.box[1], localOptions);
      }
      ctx.stroke();
    }
    if (localOptions.drawPoints) {
      if (h.keypoints && h.keypoints.length > 0) {
        for (const pt of h.keypoints) {
          ctx.fillStyle = colorDepth(pt[2], localOptions);
          point(ctx, pt[0], pt[1], 0, localOptions);
        }
      }
    }
    if (localOptions.drawLabels && h.annotations && (localOptions.fingerLabels?.length > 0)) {
      for (const [part, pt] of Object.entries(h.annotations)) {
        let l = localOptions.fingerLabels.slice();
        l = replace(l, '[label]', part);
        labels(ctx, l, pt[pt.length - 1][0], pt[pt.length - 1][1], localOptions);
      }
    }
    if (localOptions.drawPolygons && h.annotations) {
      const addHandLine = (part: Point[]) => {
        if (!part || part.length === 0 || !part[0]) return;
        for (let i = 0; i < part.length; i++) {
          ctx.beginPath();
          const z = part[i][2] || 0;
          ctx.strokeStyle = colorDepth(i * z, localOptions);
          ctx.moveTo(part[i > 0 ? i - 1 : 0][0], part[i > 0 ? i - 1 : 0][1]);
          ctx.lineTo(part[i][0], part[i][1]);
          ctx.stroke();
        }
      };
      ctx.lineWidth = localOptions.lineWidth;
      addHandLine(h.annotations.index);
      addHandLine(h.annotations.middle);
      addHandLine(h.annotations.ring);
      addHandLine(h.annotations.pinky);
      addHandLine(h.annotations.thumb);
      // addPart(h.annotations.palm);
    }
  }
}
