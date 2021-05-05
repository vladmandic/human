export declare class HandPipeline {
    handDetector: any;
    landmarkDetector: any;
    inputSize: number;
    storedBoxes: any;
    skipped: number;
    detectedHands: number;
    constructor(handDetector: any, landmarkDetector: any);
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
