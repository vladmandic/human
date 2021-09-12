/**
 * PoseNet module entry point
 */
import { BodyResult } from '../result';
import { Tensor, GraphModel } from '../tfjs/types';
import { Config } from '../config';
export declare function predict(input: Tensor, config: Config): Promise<BodyResult[]>;
export declare function load(config: Config): Promise<GraphModel>;
