import * as utils from './utils';
export declare function decodePose(root: any, scores: any, offsets: any, outputStride: any, displacementsFwd: any, displacementsBwd: any): any[];
export declare function buildPartWithScoreQueue(minConfidence: any, scores: any): utils.MaxHeap;
export declare function decode(offsetsBuffer: any, scoresBuffer: any, displacementsFwdBuffer: any, displacementsBwdBuffer: any, maxDetected: any, minConfidence: any): {
    keypoints: any;
    box: any;
    score: number;
}[];
