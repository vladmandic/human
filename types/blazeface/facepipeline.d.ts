export declare class Pipeline {
    storedBoxes: any;
    runsWithoutFaceDetector: number;
    boundingBoxDetector: any;
    meshDetector: any;
    irisModel: any;
    meshWidth: number;
    meshHeight: number;
    irisSize: number;
    irisEnlarge: number;
    skipped: number;
    detectedFaces: number;
    constructor(boundingBoxDetector: any, meshDetector: any, irisModel: any, config: any);
    transformRawCoords(rawCoords: any, box: any, angle: any, rotationMatrix: any): any;
    getLeftToRightEyeDepthDifference(rawCoords: any): number;
    getEyeBox(rawCoords: any, face: any, eyeInnerCornerIndex: any, eyeOuterCornerIndex: any, flip?: boolean): {
        box: {
            startPoint: number[];
            endPoint: any[];
            landmarks: any;
        };
        boxSize: number[];
        crop: any;
    };
    getEyeCoords(eyeData: any, eyeBox: any, eyeBoxSize: any, flip?: boolean): {
        rawCoords: any[][];
        iris: any[][];
    };
    getAdjustedIrisCoords(rawCoords: any, irisCoords: any, direction: any): any;
    predict(input: any, config: any): Promise<any>;
    calculateLandmarksBoundingBox(landmarks: any): {
        startPoint: number[];
        endPoint: number[];
        landmarks: any;
    };
}
