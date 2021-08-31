/**
 * Image Processing module used by Human
 */
/// <reference types="offscreencanvas" />
import { Tensor } from '../tfjs/types';
import { Config } from '../config';
declare type Input = Tensor | typeof Image | ImageData | ImageBitmap | HTMLImageElement | HTMLMediaElement | HTMLVideoElement | HTMLCanvasElement | OffscreenCanvas;
export declare function process(input: Input, config: Config): {
    tensor: Tensor | null;
    canvas: OffscreenCanvas | HTMLCanvasElement;
};
export {};
