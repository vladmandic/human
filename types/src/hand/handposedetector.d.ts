/**
 * HandPose model implementation
 * See `handpose.ts` for entry point
 */
import type { Tensor, GraphModel } from '../tfjs/types';
import type { Point } from '../result';
export declare class HandDetector {
    model: GraphModel;
    anchors: number[][];
    anchorsTensor: Tensor;
    inputSize: number;
    inputSizeTensor: Tensor;
    doubleInputSizeTensor: Tensor;
    constructor(model: any);
    normalizeBoxes(boxes: any): any;
    normalizeLandmarks(rawPalmLandmarks: any, index: any): any;
    predict(input: any, config: any): Promise<{
        startPoint: Point;
        endPoint: Point;
        palmLandmarks: Point[];
        confidence: number;
    }[]>;
}
