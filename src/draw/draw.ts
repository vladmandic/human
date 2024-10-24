/**
 * Module that implements helper draw functions, exposed as human.draw
 */

import * as tf from 'dist/tfjs.esm.js';
import { mergeDeep, now } from '../util/util';
import { env } from '../util/env';
import { getCanvasContext, rect } from './primitives';
import { options } from './options';
import { face } from './face';
import { body } from './body';
import { hand } from './hand';
import { object } from './object';
import { gesture } from './gesture';
import { defaultLabels } from './labels';
import type { Result, PersonResult } from '../result';
import type { AnyCanvas, DrawOptions } from '../exports';
import type { Tensor2D } from '../tfjs/types';

let drawTime = 0;

export { options } from './options';
export { face } from './face';
export { body } from './body';
export { hand } from './hand';
export { object } from './object';
export { gesture } from './gesture';

/** draw combined person results instead of individual detection result objects */
export function person(inCanvas: AnyCanvas, result: PersonResult[], drawOptions?: Partial<DrawOptions>) {
  const localOptions: DrawOptions = mergeDeep(options, drawOptions);
  if (!result || !inCanvas) return;
  const ctx = getCanvasContext(inCanvas) as CanvasRenderingContext2D;
  if (!ctx) return;
  ctx.lineJoin = 'round';
  ctx.font = localOptions.font;

  for (let i = 0; i < result.length; i++) {
    if (localOptions.drawBoxes) {
      ctx.strokeStyle = localOptions.color;
      ctx.fillStyle = localOptions.color;
      rect(ctx, result[i].box[0], result[i].box[1], result[i].box[2], result[i].box[3], localOptions);
      if (localOptions.drawLabels) {
        const label = `person #${i}`;
        if (localOptions.shadowColor && localOptions.shadowColor !== '') {
          ctx.fillStyle = localOptions.shadowColor;
          ctx.fillText(label, result[i].box[0] + 3, 1 + result[i].box[1] + localOptions.lineHeight, result[i].box[2]);
        }
        ctx.fillStyle = localOptions.labelColor;
        ctx.fillText(label, result[i].box[0] + 2, 0 + result[i].box[1] + localOptions.lineHeight, result[i].box[2]);
      }
      ctx.stroke();
    }
  }
}

/** draw processed canvas */
export function canvas(input: AnyCanvas | HTMLImageElement | HTMLVideoElement, output: AnyCanvas) {
  if (!input || !output) return;
  const ctx = getCanvasContext(output) as CanvasRenderingContext2D;
  if (!ctx) return;
  ctx.drawImage(input, 0, 0);
}

/** draw processed canvas */
export async function tensor(input: Tensor2D, output: HTMLCanvasElement) {
  if (!input || !output) return;
  if (!env.browser) return;
  // const backend = tf.getBackend();
  // if (backend === 'webgpu') tf.browser.draw(input, output);
  // else await tf.browser.toPixels(input, output);
  await tf.browser.toPixels(input, output);
  // const ctx = getCanvasContext(output) as CanvasRenderingContext2D;
  // if (!ctx) return;
  // const image = await process(input);
  // result.canvas = image.canvas;
  // human.tf.dispose(image.tensor);
  // ctx.drawImage(image.canvas, 0, 0);
}

/** meta-function that performs draw for: canvas, face, body, hand */
export async function all(inCanvas: AnyCanvas, result: Result, drawOptions?: Partial<DrawOptions>) {
  if (!result?.performance || !inCanvas) return null;
  const timeStamp = now();
  const localOptions = mergeDeep(options, drawOptions);
  const promise = Promise.all([
    face(inCanvas, result.face, localOptions),
    body(inCanvas, result.body, localOptions),
    hand(inCanvas, result.hand, localOptions),
    object(inCanvas, result.object, localOptions),
    gesture(inCanvas, result.gesture, localOptions), // gestures do not have buffering
    // person(inCanvas, result.persons, localOptions); // already included above
  ]);
  drawTime = env.perfadd ? drawTime + Math.round(now() - timeStamp) : Math.round(now() - timeStamp);
  result.performance.draw = drawTime;
  return promise;
}

/** sets default label templates for face/body/hand/object/gestures */
export function init() {
  options.faceLabels = defaultLabels.face;
  options.bodyLabels = defaultLabels.body;
  options.bodyPartLabels = defaultLabels.bodyPart;
  options.handLabels = defaultLabels.hand;
  options.fingerLabels = defaultLabels.finger;
  options.objectLabels = defaultLabels.object;
  options.gestureLabels = defaultLabels.gesture;
}
