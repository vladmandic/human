/**
 * Module that analyzes person age
 * Obsolete
 */
import type { Config } from '../config';
import type { GraphModel, Tensor } from '../tfjs/types';
export declare function load(config: Config | any): Promise<GraphModel>;
export declare function predict(image: Tensor, config: Config): Promise<unknown>;
//# sourceMappingURL=agegenderrace.d.ts.map