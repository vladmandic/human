import { GraphModel } from '../tfjs/types';
import { BlazeFaceModel } from './blazeface';
export declare class Pipeline {
    storedBoxes: Array<{
        startPoint: number[];
        endPoint: number[];
        landmarks: Array<number>;
        confidence: number;
        faceConfidence?: number;
    }>;
    boundingBoxDetector: BlazeFaceModel;
    meshDetector: GraphModel;
    irisModel: GraphModel;
    boxSize: number;
    meshSize: number;
    irisSize: number;
    irisEnlarge: number;
    skipped: number;
    detectedFaces: number;
    constructor(boundingBoxDetector: any, meshDetector: any, irisModel: any);
    transformRawCoords(rawCoords: any, box: any, angle: any, rotationMatrix: any): any;
    getLeftToRightEyeDepthDifference(rawCoords: any): number;
    getEyeBox(rawCoords: any, face: any, eyeInnerCornerIndex: any, eyeOuterCornerIndex: any, flip?: boolean): {
        box: {
            startPoint: number[];
            endPoint: number[];
            landmarks: any;
        };
        boxSize: number[];
        crop: any;
    };
    getEyeCoords(eyeData: any, eyeBox: any, eyeBoxSize: any, flip?: boolean): {
        rawCoords: [number, number, number][];
        iris: [number, number, number][];
    };
    getAdjustedIrisCoords(rawCoords: any, irisCoords: any, direction: any): any;
    predict(input: any, config: any): Promise<any>;
}
