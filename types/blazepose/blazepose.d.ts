/**
 * BlazePose Module
 */
import { Tensor, GraphModel } from '../tfjs/types';
import { Body } from '../result';
import { Config } from '../config';
export declare function load(config: Config): Promise<GraphModel>;
export declare function predict(image: Tensor, config: Config): Promise<Body[]>;
