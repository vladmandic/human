export declare const disposeBox: (box: any) => void;
export declare class BlazeFaceModel {
    blazeFaceModel: any;
    width: number;
    height: number;
    anchorsData: any;
    anchors: any;
    inputSize: number;
    config: any;
    scaleFaces: number;
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
