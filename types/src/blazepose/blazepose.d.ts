/**
 * BlazePose Module
 */
import type { Tensor, GraphModel } from '../tfjs/types';
import type { BodyResult } from '../result';
import type { Config } from '../config';
export declare function load(config: Config): Promise<GraphModel>;
export declare function predict(image: Tensor, config: Config): Promise<BodyResult[]>;
//# sourceMappingURL=blazepose.d.ts.map