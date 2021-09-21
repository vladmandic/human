/**
 * Hand Detection and Segmentation
 */
import type { HandResult } from '../result';
import type { GraphModel, Tensor } from '../tfjs/types';
import type { Config } from '../config';
export declare function load(config: Config): Promise<[GraphModel, GraphModel]>;
export declare function predict(input: Tensor, config: Config): Promise<HandResult[]>;
//# sourceMappingURL=handtrack.d.ts.map