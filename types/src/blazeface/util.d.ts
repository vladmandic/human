export declare const IDENTITY_MATRIX: number[][];
/**
 * Normalizes the provided angle to the range -pi to pi.
 * @param angle The angle in radians to be normalized.
 */
export declare function normalizeRadians(angle: any): number;
/**
 * Computes the angle of rotation between two anchor points.
 * @param point1 First anchor point
 * @param point2 Second anchor point
 */
export declare function computeRotation(point1: any, point2: any): number;
export declare function radToDegrees(rad: any): number;
export declare function buildTranslationMatrix(x: any, y: any): any[][];
export declare function dot(v1: any, v2: any): number;
export declare function getColumnFrom2DArr(arr: any, columnIndex: any): number[];
export declare function multiplyTransformMatrices(mat1: any, mat2: any): number[][];
export declare function buildRotationMatrix(rotation: any, center: any): number[][];
export declare function invertTransformMatrix(matrix: any): any[][];
export declare function rotatePoint(homogeneousCoordinate: any, rotationMatrix: any): number[];
export declare function xyDistanceBetweenPoints(a: any, b: any): number;
export declare function generateAnchors(inputSize: any): [number, number][];
//# sourceMappingURL=util.d.ts.map