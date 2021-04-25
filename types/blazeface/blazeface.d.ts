export declare class BlazeFaceModel {
    model: any;
    anchorsData: any;
    anchors: any;
    inputSize: number;
    config: any;
    constructor(model: any, config: any);
    getBoundingBoxes(inputImage: any): Promise<{
        boxes: {
            box: any;
            landmarks: any;
            anchor: any;
            confidence: number;
        }[];
        scaleFactor: number[];
    } | null>;
}
export declare function load(config: any): Promise<BlazeFaceModel>;
