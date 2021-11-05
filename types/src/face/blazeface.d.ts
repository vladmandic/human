/**
 * BlazeFace, FaceMesh & Iris model implementation
 * See `facemesh.ts` for entry point
 */
import type { Config } from '../config';
import type { Tensor, GraphModel } from '../tfjs/types';
import type { Point } from '../result';
export declare const size: () => number;
export declare function load(config: Config): Promise<GraphModel>;
export declare function getBoxes(inputImage: Tensor, config: Config): Promise<{
    boxes: never[];
    scaleFactor?: never;
} | {
    boxes: {
        box: {
            startPoint: Point;
            endPoint: Point;
        };
        landmarks: Point[];
        confidence: number;
    }[];
    scaleFactor: number[];
}>;
