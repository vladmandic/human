import { Tensor, GraphModel } from '../tfjs/types';
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
    getBoxes(input: any, config: any): Promise<{
        box: any;
        palmLandmarks: any;
        confidence: number;
    }[]>;
    estimateHandBounds(input: any, config: any): Promise<{
        startPoint: number[];
        endPoint: number[];
        palmLandmarks: number[];
        confidence: number;
    }[]>;
}
