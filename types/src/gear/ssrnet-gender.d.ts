/**
 * Gender model implementation
 *
 * Based on: [**SSR-Net**](https://github.com/shamangary/SSR-Net)
 */
import type { Config } from '../config';
import type { GraphModel, Tensor } from '../tfjs/types';
export declare function load(config: Config | any): Promise<GraphModel>;
export declare function predict(image: Tensor, config: Config, idx: any, count: any): Promise<{
    gender: string;
    genderScore: number;
}>;
