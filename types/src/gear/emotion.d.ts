/**
 * Emotion model implementation
 *
 * [**Oarriaga**](https://github.com/oarriaga/face_classification)
 */
import type { Config } from '../config';
import type { GraphModel, Tensor } from '../tfjs/types';
export declare function load(config: Config): Promise<GraphModel>;
export declare function predict(image: Tensor, config: Config, idx: any, count: any): Promise<Array<{
    score: number;
    emotion: string;
}>>;
