/**
 * EfficientPose Module
 */
import { Body } from '../result';
import { GraphModel, Tensor } from '../tfjs/types';
import { Config } from '../config';
export declare function load(config: Config): Promise<GraphModel>;
export declare function predict(image: Tensor, config: Config): Promise<Body[]>;
