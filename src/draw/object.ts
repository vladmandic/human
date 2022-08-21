import { mergeDeep } from '../util/util';
import { getCanvasContext, rect } from './primitives';
import { options } from './options';
import type { ObjectResult } from '../result';
import type { AnyCanvas, DrawOptions } from '../exports';

/** draw detected objects */
export function object(inCanvas: AnyCanvas, result: ObjectResult[], drawOptions?: Partial<DrawOptions>) {
  const localOptions: DrawOptions = mergeDeep(options, drawOptions);
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
