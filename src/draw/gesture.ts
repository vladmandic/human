import { mergeDeep } from '../util/util';
import { getCanvasContext, replace, labels } from './primitives';
import { options } from './options';
import type { GestureResult } from '../result';
import type { AnyCanvas, DrawOptions } from '../exports';

/** draw detected gestures */
export function gesture(inCanvas: AnyCanvas, result: GestureResult[], drawOptions?: Partial<DrawOptions>) {
  const localOptions: DrawOptions = mergeDeep(options, drawOptions);
  if (!result || !inCanvas) return;
  if (localOptions.drawGestures && (localOptions.gestureLabels?.length > 0)) {
    const ctx = getCanvasContext(inCanvas) as CanvasRenderingContext2D;
    if (!ctx) return;
    ctx.font = localOptions.font;
    ctx.fillStyle = localOptions.color;
    let i = 1;
    for (let j = 0; j < result.length; j++) {
      const [where, what] = Object.entries(result[j]);
      if ((what.length > 1) && ((what[1] as string).length > 0)) {
        const who = where[1] as number > 0 ? `#${where[1]}` : '';
        let l = localOptions.gestureLabels.slice();
        l = replace(l, '[where]', where[0]);
        l = replace(l, '[who]', who);
        l = replace(l, '[what]', what[1]);
        labels(ctx, l, 8, 2 + (i * localOptions.lineHeight), localOptions);
        i += 1;
      }
    }
  }
}
