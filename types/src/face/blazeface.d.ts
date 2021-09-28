/**
 * BlazeFace, FaceMesh & Iris model implementation
 * See `facemesh.ts` for entry point
 */
import type { Config } from '../config';
import type { Tensor, GraphModel } from '../tfjs/types';
export declare const size: () => number;
export declare function load(config: Config): Promise<GraphModel>;
export declare function getBoxes(inputImage: Tensor, config: Config): Promise<{
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
//# sourceMappingURL=blazeface.d.ts.map