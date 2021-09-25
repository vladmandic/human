/**
 * PoseNet body detection model implementation
 *
 * Based on: [**PoseNet**](https://medium.com/tensorflow/real-time-human-pose-estimation-in-the-browser-with-tensorflow-js-7dd0bc881cd5)
 */
import type { BodyResult } from '../result';
import type { Tensor, GraphModel } from '../tfjs/types';
import type { Config } from '../config';
export declare function predict(input: Tensor, config: Config): Promise<BodyResult[]>;
export declare function load(config: Config): Promise<GraphModel>;
//# sourceMappingURL=posenet.d.ts.map