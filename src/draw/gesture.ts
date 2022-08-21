import { mergeDeep } from '../util/util';
import { getCanvasContext } from './primitives';
import { options } from './options';
import type { GestureResult } from '../result';
import type { AnyCanvas, DrawOptions } from '../exports';

/** draw detected gestures */
export function gesture(inCanvas: AnyCanvas, result: GestureResult[], drawOptions?: Partial<DrawOptions>) {
  const localOptions: DrawOptions = mergeDeep(options, drawOptions);
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
