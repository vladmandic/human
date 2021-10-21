/**
 * Image Processing algorithm implementation
 */
import type { Tensor } from '../tfjs/types';
import type { Config } from '../config';
import { env } from '../util/env';
export declare type Input = Tensor | ImageData | ImageBitmap | HTMLImageElement | HTMLMediaElement | HTMLVideoElement | HTMLCanvasElement | OffscreenCanvas | typeof Image | typeof env.Canvas;
export declare type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;
export declare function canvas(width: any, height: any): AnyCanvas;
export declare function copy(input: AnyCanvas, output?: AnyCanvas): AnyCanvas;
export declare function process(input: Input, config: Config, getTensor?: boolean): {
    tensor: Tensor | null;
    canvas: AnyCanvas | null;
};
export declare function skip(config: any, input: Tensor): Promise<boolean>;
//# sourceMappingURL=image.d.ts.map