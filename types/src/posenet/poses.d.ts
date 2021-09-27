/**
 * PoseNet body detection model implementation
 * See `posenet.ts` for entry point
 */
import * as utils from './utils';
import type { Box } from '../result';
export declare function decodePose(root: any, scores: any, offsets: any, displacementsFwd: any, displacementsBwd: any): any[];
export declare function buildPartWithScoreQueue(minConfidence: any, scores: any): utils.MaxHeap;
export declare function decode(offsets: any, scores: any, displacementsFwd: any, displacementsBwd: any, maxDetected: any, minConfidence: any): {
    keypoints: any;
    box: Box;
    score: number;
}[];
//# sourceMappingURL=poses.d.ts.map