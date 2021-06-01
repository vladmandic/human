/**
 * FaceMesh & BlazeFace Module entry point
 */
import { Face } from '../result';
export declare function predict(input: any, config: any): Promise<Face[]>;
export declare function load(config: any): Promise<[unknown, unknown, unknown]>;
export declare const triangulation: number[];
export declare const uvmap: number[][];
