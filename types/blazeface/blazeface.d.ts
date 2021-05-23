import { Config } from '../config';
import { Tensor, GraphModel } from '../tfjs/types';
export declare class BlazeFaceModel {
    model: GraphModel;
    anchorsData: [number, number][];
    anchors: Tensor;
    inputSize: number;
    config: Config;
    constructor(model: any, config: any);
    getBoundingBoxes(inputImage: any): Promise<{
        boxes: {
            box: {
                startPoint: Tensor;
                endPoint: Tensor;
            };
            landmarks: any;
            anchor: number[];
            confidence: number;
        }[];
        scaleFactor: number[];
    } | null>;
}
export declare function load(config: any): Promise<BlazeFaceModel>;
