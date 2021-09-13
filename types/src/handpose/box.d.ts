export declare function getBoxSize(box: any): number[];
export declare function getBoxCenter(box: any): any[];
export declare function cutBoxFromImageAndResize(box: any, image: any, cropSize: any): any;
export declare function scaleBoxCoordinates(box: any, factor: any): {
    startPoint: number[];
    endPoint: number[];
    palmLandmarks: any;
    confidence: any;
};
export declare function enlargeBox(box: any, factor?: number): {
    startPoint: number[];
    endPoint: any[];
    palmLandmarks: any;
};
export declare function squarifyBox(box: any): {
    startPoint: number[];
    endPoint: any[];
    palmLandmarks: any;
};
export declare function shiftBox(box: any, shiftFactor: any): {
    startPoint: any[];
    endPoint: any[];
    palmLandmarks: any;
};
//# sourceMappingURL=box.d.ts.map