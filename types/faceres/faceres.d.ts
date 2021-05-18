import * as tf from '../../dist/tfjs.esm.js';
declare type Tensor = typeof tf.Tensor;
declare type DB = Array<{
    name: string;
    source: string;
    embedding: number[];
}>;
export declare function load(config: any): Promise<any>;
export declare function similarity(embedding1: any, embedding2: any, order?: number): number;
export declare function match(embedding: Array<number>, db: DB, threshold?: number): {
    similarity: number;
    name: string;
    source: string;
    embedding: number[];
};
export declare function enhance(input: any): Tensor;
export declare function predict(image: any, config: any, idx: any, count: any): Promise<unknown>;
export {};
