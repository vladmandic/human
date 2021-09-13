/**
 * FaceMesh & BlazeFace Module entry point
 */
import type { GraphModel, Tensor } from '../tfjs/types';
import type { FaceResult } from '../result';
import type { Config } from '../config';
export declare function predict(input: Tensor, config: Config): Promise<FaceResult[]>;
export declare function load(config: any): Promise<[unknown, GraphModel | null, GraphModel | null]>;
export declare const triangulation: number[];
export declare const uvmap: number[][];
//# sourceMappingURL=facemesh.d.ts.map