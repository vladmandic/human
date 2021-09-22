/**
 * EfficientPose Module
 */
import type { GraphModel, Tensor } from '../tfjs/types';
import type { Config } from '../config';
declare type Input = Tensor | typeof Image | ImageData | ImageBitmap | HTMLImageElement | HTMLMediaElement | HTMLVideoElement | HTMLCanvasElement | OffscreenCanvas;
export declare function load(config: Config): Promise<GraphModel>;
export declare function predict(input: {
    tensor: Tensor | null;
    canvas: OffscreenCanvas | HTMLCanvasElement | null;
}, config: Config): Promise<{
    data: Uint8ClampedArray | null;
    canvas: HTMLCanvasElement | OffscreenCanvas | null;
    alpha: HTMLCanvasElement | OffscreenCanvas | null;
}>;
export declare function process(input: Input, background: Input | undefined, config: Config): Promise<{
    data: Uint8ClampedArray | null;
    canvas: HTMLCanvasElement | OffscreenCanvas | null;
    alpha: HTMLCanvasElement | OffscreenCanvas | null;
}>;
export {};
//# sourceMappingURL=segmentation.d.ts.map