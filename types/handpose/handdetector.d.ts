import * as tf from '../../dist/tfjs.esm.js';
export declare class HandDetector {
    model: any;
    anchors: number[][];
    anchorsTensor: typeof tf.Tensor;
    inputSize: number;
    inputSizeTensor: typeof tf.Tensor;
    doubleInputSizeTensor: typeof tf.Tensor;
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
