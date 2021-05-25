/**
 * Image Processing module used by Human
 */
import { Tensor } from '../tfjs/types';
export declare function process(input: any, config: any): {
    tensor: Tensor | null;
    canvas: OffscreenCanvas | HTMLCanvasElement;
};
