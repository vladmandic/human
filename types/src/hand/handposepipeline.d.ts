/**
 * HandPose model implementation
 * See `handpose.ts` for entry point
 */
import type * as detector from './handposedetector';
import type { GraphModel } from '../tfjs/types';
import type { Point } from '../result';
export declare class HandPipeline {
    handDetector: detector.HandDetector;
    handPoseModel: GraphModel;
    inputSize: number;
    storedBoxes: Array<{
        startPoint: Point;
        endPoint: Point;
        palmLandmarks: Point[];
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
        startPoint: Point;
        endPoint: Point;
        palmLandmarks: any;
    };
    getBoxForHandLandmarks(landmarks: any): {
        startPoint: Point;
        endPoint: Point;
        palmLandmarks: any;
    };
    transformRawCoords(rawCoords: any, box2: any, angle: any, rotationMatrix: any): any;
    estimateHands(image: any, config: any): Promise<{
        landmarks: Point[];
        confidence: number;
        boxConfidence: number;
        fingerConfidence: number;
        box: {
            topLeft: Point;
            bottomRight: Point;
        };
    }[]>;
}
