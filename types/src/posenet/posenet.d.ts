/**
 * PoseNet module entry point
 */
import type { BodyResult } from '../result';
import type { Tensor, GraphModel } from '../tfjs/types';
import type { Config } from '../config';
export declare function predict(input: Tensor, config: Config): Promise<BodyResult[]>;
export declare function load(config: Config): Promise<GraphModel>;
//# sourceMappingURL=posenet.d.ts.map