import * as detector from './handdetector';
export declare class HandPipeline {
    handDetector: detector.HandDetector;
    handPoseModel: any;
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
    estimateHands(image: any, config: any): Promise<{}[]>;
}
