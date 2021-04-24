import * as utils from './utils';
export declare function buildPartWithScoreQueue(scoreThreshold: any, localMaximumRadius: any, scores: any): utils.MaxHeap;
export declare function decodeMultiplePoses(scoresBuffer: any, offsetsBuffer: any, displacementsFwdBuffer: any, displacementsBwdBuffer: any, nmsRadius: any, maxDetections: any, scoreThreshold: any): {
    keypoints: any;
    box: any;
    score: number;
}[];
