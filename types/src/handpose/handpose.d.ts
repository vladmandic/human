/**
 * HandPose module entry point
 */
import { Hand } from '../result';
import { Tensor, GraphModel } from '../tfjs/types';
import { Config } from '../config';
export declare function predict(input: Tensor, config: Config): Promise<Hand[]>;
export declare function load(config: Config): Promise<[GraphModel | null, GraphModel | null]>;
