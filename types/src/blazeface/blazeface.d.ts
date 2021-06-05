import { Config } from '../config';
import { Tensor, GraphModel } from '../tfjs/types';
export declare class BlazeFaceModel {
    model: GraphModel;
    anchorsData: [number, number][];
    anchors: Tensor;
    inputSize: number;
    config: Config;
    constructor(model: any, config: Config);
    getBoundingBoxes(inputImage: Tensor): Promise<{
        boxes: {
            box: {
                startPoint: Tensor;
                endPoint: Tensor;
            };
            landmarks: Tensor;
            anchor: number[];
            confidence: number;
        }[];
        scaleFactor: number[];
    } | null>;
}
export declare function load(config: Config): Promise<BlazeFaceModel>;
