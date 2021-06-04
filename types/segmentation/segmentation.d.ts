/**
 * EfficientPose Module
 */
import { GraphModel, Tensor } from '../tfjs/types';
import { Config } from '../config';
export declare type Segmentation = boolean;
export declare function load(config: Config): Promise<GraphModel>;
export declare function predict(input: {
    tensor: Tensor | null;
    canvas: OffscreenCanvas | HTMLCanvasElement;
}, config: Config): Promise<Segmentation>;
