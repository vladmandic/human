/**
 * HandTrack model implementation
 *
 * Based on:
 * - Hand Detection & Skeleton: [**MediaPipe HandPose**](https://drive.google.com/file/d/1sv4sSb9BSNVZhLzxXJ0jBv9DqD-4jnAz/view)
 * - Hand Tracking: [**HandTracking**](https://github.com/victordibia/handtracking)
 */
import type { HandResult } from '../result';
import type { GraphModel, Tensor } from '../tfjs/types';
import type { Config } from '../config';
export declare function loadDetect(config: Config): Promise<GraphModel>;
export declare function loadSkeleton(config: Config): Promise<GraphModel>;
export declare function load(config: Config): Promise<[GraphModel | null, GraphModel | null]>;
export declare function predict(input: Tensor, config: Config): Promise<HandResult[]>;
//# sourceMappingURL=handtrack.d.ts.map