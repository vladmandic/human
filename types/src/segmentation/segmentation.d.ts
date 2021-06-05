/**
 * EfficientPose Module
 */
import { GraphModel, Tensor } from '../tfjs/types';
import { Config } from '../config';
declare type Input = Tensor | typeof Image | ImageData | ImageBitmap | HTMLImageElement | HTMLMediaElement | HTMLVideoElement | HTMLCanvasElement | OffscreenCanvas;
export declare function load(config: Config): Promise<GraphModel>;
export declare function predict(input: {
    tensor: Tensor | null;
    canvas: OffscreenCanvas | HTMLCanvasElement;
}): Promise<Uint8ClampedArray | null>;
export declare function process(input: Input, background: Input | undefined, config: Config): Promise<HTMLCanvasElement | OffscreenCanvas | null>;
export {};
