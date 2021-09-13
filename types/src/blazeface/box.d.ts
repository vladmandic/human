export declare function scaleBoxCoordinates(box: any, factor: any): {
    startPoint: number[];
    endPoint: number[];
};
export declare function getBoxSize(box: any): [number, number];
export declare function getBoxCenter(box: any): [number, number];
export declare function cutBoxFromImageAndResize(box: any, image: any, cropSize: any): any;
export declare function enlargeBox(box: any, factor?: number): {
    startPoint: number[];
    endPoint: number[];
    landmarks: any;
};
export declare function squarifyBox(box: any): {
    startPoint: number[];
    endPoint: number[];
    landmarks: any;
};
export declare function calculateLandmarksBoundingBox(landmarks: any): {
    startPoint: number[];
    endPoint: number[];
    landmarks: any;
};
export declare const disposeBox: (t: any) => void;
export declare const createBox: (startEndTensor: any) => {
    startPoint: any;
    endPoint: any;
};
//# sourceMappingURL=box.d.ts.map