import * as tf from '../../dist/tfjs.esm.js';
import { Config } from '../config';
export declare class BlazeFaceModel {
    model: any;
    anchorsData: [number, number][];
    anchors: typeof tf.Tensor;
    inputSize: number;
    config: Config;
    constructor(model: any, config: any);
    getBoundingBoxes(inputImage: any): Promise<{
        boxes: {
            box: {
                startPoint: typeof tf.Tensor;
                endPoint: typeof tf.Tensor;
            };
            landmarks: any;
            anchor: number[];
            confidence: number;
        }[];
        scaleFactor: number[];
    } | null>;
}
export declare function load(config: any): Promise<BlazeFaceModel>;
