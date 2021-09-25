/**
 * GEAR [gender/emotion/age/race] model implementation
 *
 * Based on: [**GEAR Predictor**](https://github.com/Udolf15/GEAR-Predictor)
 *
 * Obsolete and replaced by `faceres` that performs age/gender/descriptor analysis
 * Config placeholder: agegenderrace: { enabled: true, modelPath: 'gear.json' },
 */
import type { Config } from '../config';
import type { GraphModel, Tensor } from '../tfjs/types';
export declare function load(config: Config | any): Promise<GraphModel>;
export declare function predict(image: Tensor, config: Config): Promise<unknown>;
//# sourceMappingURL=agegenderrace.d.ts.map