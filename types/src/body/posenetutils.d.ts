/**
 * PoseNet body detection model implementation constants
 * See `posenet.ts` for entry point
 */
import type { BodyResult } from '../result';
export declare const partNames: string[];
export declare const count: number;
export declare const partIds: {};
export declare const connectedPartIndices: any[][];
export declare const poseChain: string[][];
export declare function eitherPointDoesntMeetConfidence(a: number, b: number, minConfidence: number): boolean;
export declare function getAdjacentKeyPoints(keypoints: any, minConfidence: number): any[];
export declare function getBoundingBox(keypoints: any): [number, number, number, number];
export declare function scalePoses(poses: any, [height, width]: [any, any], [inputResolutionHeight, inputResolutionWidth]: [any, any]): Array<BodyResult>;
export declare class MaxHeap {
    priorityQueue: Array<unknown>;
    numberOfElements: number;
    getElementValue: unknown;
    constructor(maxSize: any, getElementValue: any);
    enqueue(x: any): void;
    dequeue(): unknown;
    empty(): boolean;
    size(): number;
    all(): unknown[];
    max(): unknown;
    swim(k: any): void;
    sink(k: any): void;
    getValueAt(i: any): any;
    less(i: any, j: any): boolean;
    exchange(i: any, j: any): void;
}
export declare function getOffsetPoint(y: any, x: any, keypoint: any, offsets: any): {
    y: any;
    x: any;
};
export declare function getImageCoords(part: any, outputStride: any, offsets: any): {
    x: any;
    y: any;
};
export declare function fillArray(element: any, size: any): any[];
export declare function clamp(a: any, min: any, max: any): any;
export declare function squaredDistance(y1: any, x1: any, y2: any, x2: any): number;
export declare function addVectors(a: any, b: any): {
    x: any;
    y: any;
};
export declare function clampVector(a: any, min: any, max: any): {
    y: any;
    x: any;
};
