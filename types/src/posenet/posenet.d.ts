/**
 * PoseNet module entry point
 */
import { Body } from '../result';
import { Tensor, GraphModel } from '../tfjs/types';
import { Config } from '../config';
export declare function predict(input: Tensor, config: Config): Promise<Body[]>;
export declare function load(config: Config): Promise<GraphModel>;
