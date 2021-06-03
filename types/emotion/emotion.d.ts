/**
 * Emotion Module
 */
import { Config } from '../config';
import { Tensor, GraphModel } from '../tfjs/types';
export declare function load(config: Config): Promise<GraphModel>;
export declare function predict(image: Tensor, config: Config, idx: any, count: any): Promise<unknown>;
