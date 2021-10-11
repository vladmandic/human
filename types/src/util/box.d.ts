import type { Point, Box } from '../result';
export declare function calc(keypoints: Array<Point>, outputSize?: [number, number]): {
    box: Box;
    boxRaw: Box;
};
export declare function square(keypoints: Array<Point>, outputSize?: [number, number]): {
    box: Box;
    boxRaw: Box;
};
export declare function scale(box: Box, scaleFact: number): Box;
export declare function crop(box: Box): Box;
//# sourceMappingURL=box.d.ts.map