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
declare type DB = Array<{
    name: string;
    source: string;
    embedding: number[];
}>;
export declare function load(config: Config): Promise<GraphModel>;
export declare function similarity(embedding1: Array<number>, embedding2: Array<number>, order?: number): number;
export declare function match(embedding: Array<number>, db: DB, threshold?: number): {
    similarity: number;
    name: string;
    source: string;
    embedding: number[];
};
export declare function enhance(input: any): Tensor;
export declare function predict(image: Tensor, config: Config, idx: any, count: any): Promise<unknown>;
export {};
//# sourceMappingURL=faceres.d.ts.map