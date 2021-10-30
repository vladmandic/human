/**
 * PoseNet body detection model implementation
 *
 * Based on: [**PoseNet**](https://medium.com/tensorflow/real-time-human-pose-estimation-in-the-browser-with-tensorflow-js-7dd0bc881cd5)
 */
import type { BodyResult, Box } from '../result';
import type { Tensor, GraphModel } from '../tfjs/types';
import type { Config } from '../config';
import * as utils from './posenetutils';
export declare function decodePose(root: any, scores: any, offsets: any, displacementsFwd: any, displacementsBwd: any): any[];
export declare function buildPartWithScoreQueue(minConfidence: any, scores: any): utils.MaxHeap;
export declare function decode(offsets: any, scores: any, displacementsFwd: any, displacementsBwd: any, maxDetected: any, minConfidence: any): {
    keypoints: any;
    box: Box;
    score: number;
}[];
export declare function predict(input: Tensor, config: Config): Promise<BodyResult[]>;
export declare function load(config: Config): Promise<GraphModel>;
