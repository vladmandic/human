import { mergeDeep } from '../util/util';
import { getCanvasContext, rect, replace, labels } from './primitives';
import { options } from './options';
import type { ObjectResult } from '../result';
import type { AnyCanvas, DrawOptions } from '../exports';

/** draw detected objects */
export function object(inCanvas: AnyCanvas, result: ObjectResult[], drawOptions?: Partial<DrawOptions>) {
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
      if (localOptions.drawLabels && (localOptions.objectLabels?.length > 0)) {
        let l = localOptions.objectLabels.slice();
        l = replace(l, '[id]', h.id.toFixed(0));
        l = replace(l, '[label]', h.label);
        l = replace(l, '[score]', 100 * h.score);
        labels(ctx, l, h.box[0], h.box[1], localOptions);
      }
      ctx.stroke();
    }
  }
}
