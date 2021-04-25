export declare class HandDetector {
    model: any;
    anchors: any;
    anchorsTensor: any;
    inputSize: number;
    inputSizeTensor: any;
    doubleInputSizeTensor: any;
    constructor(model: any);
    normalizeBoxes(boxes: any): any;
    normalizeLandmarks(rawPalmLandmarks: any, index: any): any;
    getBoxes(input: any, config: any): Promise<{
        box: any;
        palmLandmarks: any;
        confidence: number;
    }[]>;
    estimateHandBounds(input: any, config: any): Promise<{}[]>;
}
