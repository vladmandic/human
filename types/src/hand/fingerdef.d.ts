/**
 * FingerPose algorithm implementation
 * See `fingerpose.ts` for entry point
 */
export declare const Finger: {
    thumb: number;
    index: number;
    middle: number;
    ring: number;
    pinky: number;
    all: number[];
    nameMapping: {
        0: string;
        1: string;
        2: string;
        3: string;
        4: string;
    };
    pointsMapping: {
        0: number[][];
        1: number[][];
        2: number[][];
        3: number[][];
        4: number[][];
    };
    getName: (value: any) => any;
    getPoints: (value: any) => any;
};
export declare const FingerCurl: {
    none: number;
    half: number;
    full: number;
    nameMapping: {
        0: string;
        1: string;
        2: string;
    };
    getName: (value: any) => any;
};
export declare const FingerDirection: {
    verticalUp: number;
    verticalDown: number;
    horizontalLeft: number;
    horizontalRight: number;
    diagonalUpRight: number;
    diagonalUpLeft: number;
    diagonalDownRight: number;
    diagonalDownLeft: number;
    nameMapping: {
        0: string;
        1: string;
        2: string;
        3: string;
        4: string;
        5: string;
        6: string;
        7: string;
    };
    getName: (value: any) => any;
};
export declare class FingerGesture {
    name: any;
    curls: any;
    directions: any;
    weights: any;
    weightsRelative: any;
    constructor(name: any);
    addCurl(finger: any, curl: any, confidence: any): void;
    addDirection(finger: any, position: any, confidence: any): void;
    setWeight(finger: any, weight: any): void;
    matchAgainst(detectedCurls: any, detectedDirections: any): number;
}
//# sourceMappingURL=fingerdef.d.ts.map