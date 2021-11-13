/**
 * EfficientPose model implementation
 *
 * Based on: [**BecauseofAI MobileFace**](https://github.com/becauseofAI/MobileFace)
 *
 * Obsolete and replaced by `faceres` that performs age/gender/descriptor analysis
 */
import type { Tensor, GraphModel } from '../tfjs/types';
import type { Config } from '../config';
export declare function load(config: Config): Promise<GraphModel>;
export declare function predict(input: Tensor, config: Config, idx: any, count: any): Promise<number[]>;
