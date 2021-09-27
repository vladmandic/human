/**
 * BlazePose model implementation
 *
 * Based on : [**BlazePose**](https://github.com/google/mediapipe/blob/master/mediapipe/modules/pose_detection)
 */
import type { BodyResult } from '../result';
import type { GraphModel, Tensor } from '../tfjs/types';
import type { Config } from '../config';
export declare function loadDetect(config: Config): Promise<GraphModel>;
export declare function loadPose(config: Config): Promise<GraphModel>;
export declare function load(config: Config): Promise<[GraphModel | null, GraphModel | null]>;
export declare function predict(input: Tensor, config: Config): Promise<BodyResult[]>;
//# sourceMappingURL=blazepose.d.ts.map