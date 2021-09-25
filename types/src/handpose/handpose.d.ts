/**
 * HandPose model implementation
 *
 * Based on: [**MediaPipe HandPose**](https://drive.google.com/file/d/1sv4sSb9BSNVZhLzxXJ0jBv9DqD-4jnAz/view)
 */
import type { HandResult } from '../result';
import type { Tensor, GraphModel } from '../tfjs/types';
import type { Config } from '../config';
export declare function predict(input: Tensor, config: Config): Promise<HandResult[]>;
export declare function load(config: Config): Promise<[GraphModel | null, GraphModel | null]>;
//# sourceMappingURL=handpose.d.ts.map