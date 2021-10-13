/**
 * Anti-spoofing model implementation
 */
import type { Config } from '../config';
import type { GraphModel, Tensor } from '../tfjs/types';
export declare function load(config: Config): Promise<GraphModel>;
export declare function predict(image: Tensor, config: Config, idx: any, count: any): Promise<unknown>;
//# sourceMappingURL=antispoof.d.ts.map