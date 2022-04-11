import { mergeDeep } from '../util/util';
import { getCanvasContext, rect, point, colorDepth } from './primitives';
import { options } from './options';
import type { HandResult } from '../result';
import type { AnyCanvas, DrawOptions, Point } from '../exports';

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
          ctx.fillStyle = localOptions.useDepth ? colorDepth(pt[2] || 0) : localOptions.color;
          point(ctx, pt[0], pt[1], 0, localOptions);
        }
      }
    }
    if (localOptions.drawLabels && h.annotations) {
      const addHandLabel = (part: Array<Point>, title: string) => {
        if (!part || part.length === 0 || !part[0]) return;
        const z = part[part.length - 1][2] || 0;
        ctx.fillStyle = localOptions.useDepth ? colorDepth(z) : localOptions.color;
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
          ctx.strokeStyle = localOptions.useDepth ? colorDepth(i * z) : localOptions.color;
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
