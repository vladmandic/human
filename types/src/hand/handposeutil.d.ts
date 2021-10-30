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
export declare function normalizeRadians(angle: any): number;
export declare function computeRotation(point1: any, point2: any): number;
export declare const buildTranslationMatrix: (x: any, y: any) => any[][];
export declare function dot(v1: any, v2: any): number;
export declare function getColumnFrom2DArr(arr: any, columnIndex: any): number[];
export declare function multiplyTransformMatrices(mat1: any, mat2: any): number[][];
export declare function buildRotationMatrix(rotation: any, center: any): number[][];
export declare function invertTransformMatrix(matrix: any): any[][];
export declare function rotatePoint(homogeneousCoordinate: any, rotationMatrix: any): number[];
