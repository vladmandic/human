/**
 * FaceMesh & BlazeFace Module entry point
 */
import { Tensor } from '../tfjs/types';
import { Face } from '../result';
import { Config } from '../config';
export declare function predict(input: Tensor, config: Config): Promise<Face[]>;
export declare function load(config: any): Promise<[unknown, unknown, unknown]>;
export declare const triangulation: number[];
export declare const uvmap: number[][];
