/**
 * HandPose module entry point
 */
import type { HandResult } from '../result';
import type { Tensor, GraphModel } from '../tfjs/types';
import type { Config } from '../config';
export declare function predict(input: Tensor, config: Config): Promise<HandResult[]>;
export declare function load(config: Config): Promise<[GraphModel | null, GraphModel | null]>;
//# sourceMappingURL=handpose.d.ts.map