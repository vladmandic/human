/**
 * EfficientPose model implementation
 *
 * Based on: [**EfficientPose**](https://github.com/daniegr/EfficientPose)
 */
import type { BodyResult } from '../result';
import type { GraphModel, Tensor } from '../tfjs/types';
import type { Config } from '../config';
export declare function load(config: Config): Promise<GraphModel>;
export declare function predict(image: Tensor, config: Config): Promise<BodyResult[]>;
