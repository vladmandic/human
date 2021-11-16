/**
 * BlazeFace, FaceMesh & Iris model implementation
 * See `facemesh.ts` for entry point
 */
import type { Box, Point } from '../result';
export declare const createBox: (startEndTensor: any) => {
    startPoint: any;
    endPoint: any;
};
export declare const disposeBox: (t: any) => void;
export declare const getBoxSize: (box: any) => [number, number];
export declare const getBoxCenter: (box: any) => [number, number];
export declare const getClampedBox: (box: any, input: any) => Box;
export declare const getRawBox: (box: any, input: any) => Box;
export declare const scaleBoxCoordinates: (box: any, factor: any) => {
    startPoint: Point;
    endPoint: Point;
    landmarks: any;
    confidence: any;
};
export declare const cutBoxFromImageAndResize: (box: any, image: any, cropSize: any) => any;
export declare const enlargeBox: (box: any, factor: any) => {
    startPoint: Point;
    endPoint: Point;
    landmarks: any;
    confidence: any;
};
export declare const squarifyBox: (box: any) => {
    startPoint: Point;
    endPoint: Point;
    landmarks: any;
    confidence: any;
};
export declare const calculateLandmarksBoundingBox: (landmarks: any) => {
    startPoint: Point;
    endPoint: Point;
    landmarks: any;
};
export declare const fixedRotationMatrix: number[][];
export declare const normalizeRadians: (angle: any) => number;
export declare const computeRotation: (point1: any, point2: any) => number;
export declare const radToDegrees: (rad: any) => number;
export declare const buildTranslationMatrix: (x: any, y: any) => any[][];
export declare const dot: (v1: number[], v2: number[]) => number;
export declare const getColumnFrom2DArr: (arr: any, columnIndex: any) => number[];
export declare const multiplyTransformMatrices: (mat1: any, mat2: any) => number[][];
export declare const buildRotationMatrix: (rotation: any, center: any) => number[][];
export declare const invertTransformMatrix: (matrix: any) => any[][];
export declare const rotatePoint: (homogeneousCoordinate: any, rotationMatrix: any) => number[];
export declare const xyDistanceBetweenPoints: (a: any, b: any) => number;
export declare function generateAnchors(inputSize: any): [number, number][];
export declare function transformRawCoords(coordsRaw: any, box: any, angle: any, rotationMatrix: any, inputSize: any): any;
export declare function correctFaceRotation(rotate: any, box: any, input: any, inputSize: any): any[];
