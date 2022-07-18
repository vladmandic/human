import type { env } from './util/env';
import type { Tensor } from './tfjs/types';

/* Export configuration details */
export * from './config';
/* Export results details */
export * from './result';

/* Explict reexport of main @tensorflow/tfjs types */
export type { Tensor, TensorLike, GraphModel, Rank } from './tfjs/types';

export type { DrawOptions } from './draw/options';
export type { Descriptor } from './face/match';
export type { Box, Point } from './result';
export type { Models } from './models';
export type { Env } from './util/env';
export type { FaceGesture, BodyGesture, HandGesture, IrisGesture } from './gesture/gesture';
export type { Emotion, Finger, FingerCurl, FingerDirection, HandType, Gender, Race, FaceLandmark, BodyLandmark, BodyAnnotation, ObjectType } from './result';
export { env } from './util/env';

/** Events dispatched by `human.events`
 * - `create`: triggered when Human object is instantiated
 * - `load`: triggered when models are loaded (explicitly or on-demand)
 * - `image`: triggered when input image is processed
 * - `result`: triggered when detection is complete
 * - `warmup`: triggered when warmup is complete
 */
export type Events = 'create' | 'load' | 'image' | 'result' | 'warmup' | 'error';

/** Defines all possible canvas types */
export type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;
/** Defines all possible image types */
export type AnyImage = HTMLImageElement | typeof Image
/** Defines all possible video types */
export type AnyVideo = HTMLMediaElement | HTMLVideoElement
/** Defines all possible image objects */
export type ImageObjects = ImageData | ImageBitmap
/** Defines possible externally defined canvas */
export type ExternalCanvas = typeof env.Canvas;
/** Defines all possible input types for **Human** detection */
export type Input = Tensor | AnyCanvas | AnyImage | AnyVideo | ImageObjects | ExternalCanvas;
/** Defines model stats */
export type { ModelStats } from './models';
/** Defines individual model sizes */
export type { ModelInfo } from './tfjs/load';
