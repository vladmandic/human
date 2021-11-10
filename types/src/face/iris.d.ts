import type { GraphModel } from '../tfjs/types';
import type { Config } from '../config';
import type { Point } from '../result';
export declare function load(config: Config): Promise<GraphModel>;
export declare const getLeftToRightEyeDepthDifference: (rawCoords: any) => number;
export declare const getEyeBox: (rawCoords: any, face: any, eyeInnerCornerIndex: any, eyeOuterCornerIndex: any, meshSize: any, flip?: boolean) => {
    box: {
        startPoint: Point;
        endPoint: Point;
        landmarks: any;
        confidence: any;
    };
    boxSize: [number, number];
    crop: any;
};
export declare const getEyeCoords: (eyeData: any, eyeBox: any, eyeBoxSize: any, flip?: boolean) => {
    rawCoords: Point[];
    iris: Point[];
};
export declare const getAdjustedIrisCoords: (rawCoords: any, irisCoords: any, direction: any) => any;
export declare function augmentIris(rawCoords: any, face: any, config: any, meshSize: any): Promise<any>;
