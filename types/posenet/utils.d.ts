export declare function eitherPointDoesntMeetConfidence(a: any, b: any, minConfidence: any): boolean;
export declare function getAdjacentKeyPoints(keypoints: any, minConfidence: any): any[];
export declare function getBoundingBox(keypoints: any): any[];
export declare function scalePoses(poses: any, [height, width]: [any, any], [inputResolutionHeight, inputResolutionWidth]: [any, any]): any;
export declare class MaxHeap {
    priorityQueue: any;
    numberOfElements: number;
    getElementValue: any;
    constructor(maxSize: any, getElementValue: any);
    enqueue(x: any): void;
    dequeue(): any;
    empty(): boolean;
    size(): number;
    all(): any;
    max(): any;
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
