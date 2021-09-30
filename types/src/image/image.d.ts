/**
 * Image Processing algorithm implementation
 */
import type { Tensor } from '../tfjs/types';
import type { Config } from '../config';
import { env } from '../util/env';
export declare type Input = Tensor | ImageData | ImageBitmap | HTMLImageElement | HTMLMediaElement | HTMLVideoElement | HTMLCanvasElement | OffscreenCanvas | typeof Image | typeof env.Canvas;
export declare function canvas(width: any, height: any): HTMLCanvasElement | OffscreenCanvas;
export declare function process(input: Input, config: Config): {
    tensor: Tensor | null;
    canvas: OffscreenCanvas | HTMLCanvasElement | null;
};
export declare function skip(config: any, input: Tensor): Promise<boolean>;
//# sourceMappingURL=image.d.ts.map