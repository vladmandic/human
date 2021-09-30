/**
 * FaceRes model implementation
 *
 * Returns Age, Gender, Descriptor
 * Implements Face simmilarity function
 *
 * Based on: [**HSE-FaceRes**](https://github.com/HSE-asavchenko/HSE_FaceRec_tf)
 */
import type { Tensor, GraphModel } from '../tfjs/types';
import type { Config } from '../config';
export declare function load(config: Config): Promise<GraphModel>;
export declare function enhance(input: any): Tensor;
export declare function predict(image: Tensor, config: Config, idx: any, count: any): Promise<unknown>;
//# sourceMappingURL=faceres.d.ts.map