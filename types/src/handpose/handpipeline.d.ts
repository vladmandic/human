import type * as detector from './handdetector';
import type { GraphModel } from '../tfjs/types';
export declare class HandPipeline {
    handDetector: detector.HandDetector;
    handPoseModel: GraphModel;
    inputSize: number;
    storedBoxes: Array<{
        startPoint: number[];
        endPoint: number[];
        palmLandmarks: number[];
        confidence: number;
    } | null>;
    skipped: number;
    detectedHands: number;
    constructor(handDetector: any, handPoseModel: any);
    calculateLandmarksBoundingBox(landmarks: any): {
        startPoint: number[];
        endPoint: number[];
    };
    getBoxForPalmLandmarks(palmLandmarks: any, rotationMatrix: any): {
        startPoint: number[];
        endPoint: any[];
        palmLandmarks: any;
    };
    getBoxForHandLandmarks(landmarks: any): {
        startPoint: number[];
        endPoint: any[];
        palmLandmarks: any;
    };
    transformRawCoords(rawCoords: any, box2: any, angle: any, rotationMatrix: any): any;
    estimateHands(image: any, config: any): Promise<{
        landmarks: number[];
        confidence: number;
        box: {
            topLeft: number[];
            bottomRight: number[];
        };
    }[]>;
}
//# sourceMappingURL=handpipeline.d.ts.map