/**
 * GEAR [gender/emotion/age/race] model implementation
 *
 * Based on: [**GEAR Predictor**](https://github.com/Udolf15/GEAR-Predictor)
 */
import type { Config } from '../config';
import type { GraphModel, Tensor } from '../tfjs/types';
declare type GearType = {
    age: number;
    gender: string;
    genderScore: number;
    race: Array<{
        score: number;
        race: string;
    }>;
};
export declare function load(config: Config): Promise<GraphModel>;
export declare function predict(image: Tensor, config: Config, idx: any, count: any): Promise<GearType>;
export {};
