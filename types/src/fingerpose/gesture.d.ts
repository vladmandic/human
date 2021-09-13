export default class Gesture {
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
//# sourceMappingURL=gesture.d.ts.map