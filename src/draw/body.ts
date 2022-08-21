import { mergeDeep } from '../util/util';
import { getCanvasContext, rect, point, curves, colorDepth } from './primitives';
import { options } from './options';
import type { BodyResult } from '../result';
import type { AnyCanvas, DrawOptions } from '../exports';

/** draw detected bodies */
export function body(inCanvas: AnyCanvas, result: BodyResult[], drawOptions?: Partial<DrawOptions>) {
  const localOptions: DrawOptions = mergeDeep(options, drawOptions);
  if (!result || !inCanvas) return;
  const ctx = getCanvasContext(inCanvas);
  if (!ctx) return;
  ctx.lineJoin = 'round';
  for (let i = 0; i < result.length; i++) {
    ctx.strokeStyle = localOptions.color;
    ctx.fillStyle = localOptions.color;
    ctx.lineWidth = localOptions.lineWidth;
    ctx.font = localOptions.font;
    if (localOptions.drawBoxes && result[i].box && result[i].box.length === 4) {
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
        ctx.fillStyle = colorDepth(result[i].keypoints[pt].position[2], localOptions);
        point(ctx, result[i].keypoints[pt].position[0], result[i].keypoints[pt].position[1], 0, localOptions);
      }
    }
    if (localOptions.drawLabels && result[i].keypoints) {
      ctx.font = localOptions.font;
      for (const pt of result[i].keypoints) {
        if (!pt.score || (pt.score === 0)) continue;
        ctx.fillStyle = colorDepth(pt.position[2], localOptions);
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
