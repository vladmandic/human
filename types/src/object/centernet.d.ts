/**
 * CenterNet object detection module
 */
import type { ObjectResult } from '../result';
import type { GraphModel, Tensor } from '../tfjs/types';
import type { Config } from '../config';
export declare function load(config: Config): Promise<GraphModel>;
export declare function predict(input: Tensor, config: Config): Promise<ObjectResult[]>;
//# sourceMappingURL=centernet.d.ts.map