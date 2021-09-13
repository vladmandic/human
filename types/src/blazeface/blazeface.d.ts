import type { Config } from '../config';
import type { Tensor, GraphModel } from '../tfjs/types';
export declare class BlazeFaceModel {
    model: GraphModel;
    anchorsData: [number, number][];
    anchors: Tensor;
    inputSize: number;
    config: Config;
    constructor(model: any, config: Config);
    getBoundingBoxes(inputImage: Tensor, userConfig: Config): Promise<{
        boxes: never[];
        scaleFactor?: never;
    } | {
        boxes: {
            box: {
                startPoint: Tensor;
                endPoint: Tensor;
            };
            landmarks: Tensor;
            anchor: [number, number] | undefined;
            confidence: number;
        }[];
        scaleFactor: number[];
    }>;
}
export declare function load(config: Config): Promise<BlazeFaceModel>;
//# sourceMappingURL=blazeface.d.ts.map