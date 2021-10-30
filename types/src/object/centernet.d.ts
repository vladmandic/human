/**
 * CenterNet object detection model implementation
 *
 * Based on: [**NanoDet**](https://github.com/RangiLyu/nanodet)
 */
import type { ObjectResult } from '../result';
import type { GraphModel, Tensor } from '../tfjs/types';
import type { Config } from '../config';
export declare function load(config: Config): Promise<GraphModel>;
export declare function predict(input: Tensor, config: Config): Promise<ObjectResult[]>;
