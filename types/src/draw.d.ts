/**
 * Module that implements helper draw functions, exposed as human.draw
 */
import type { Result, FaceResult, BodyResult, HandResult, ObjectResult, GestureResult, PersonResult } from './result';
/**
 * Draw Options
 * Accessed via `human.draw.options` or provided per each draw method as the drawOptions optional parameter
 * -color: draw color
 * -labelColor: color for labels
 * -shadowColor: optional shadow color for labels
 * -font: font for labels
 * -lineHeight: line height for labels, used for multi-line labels,
 * -lineWidth: width of any lines,
 * -pointSize: size of any point,
 * -roundRect: for boxes, round corners by this many pixels,
 * -drawPoints: should points be drawn,
 * -drawLabels: should labels be drawn,
 * -drawBoxes: should boxes be drawn,
 * -drawPolygons: should polygons be drawn,
 * -fillPolygons: should drawn polygons be filled,
 * -useDepth: use z-axis coordinate as color shade,
 * -useCurves: draw polygons as cures or as lines,
 * -bufferedOutput: experimental: allows to call draw methods multiple times for each detection and interpolate results between results thus achieving smoother animations
 */
export interface DrawOptions {
    color: string;
    labelColor: string;
    shadowColor: string;
    font: string;
    lineHeight: number;
    lineWidth: number;
    pointSize: number;
    roundRect: number;
    drawPoints: boolean;
    drawLabels: boolean;
    drawBoxes: boolean;
    drawPolygons: boolean;
    drawGaze: boolean;
    fillPolygons: boolean;
    useDepth: boolean;
    useCurves: boolean;
    bufferedOutput: boolean;
}
export declare const options: DrawOptions;
export declare function gesture(inCanvas: HTMLCanvasElement | OffscreenCanvas, result: Array<GestureResult>, drawOptions?: Partial<DrawOptions>): Promise<void>;
export declare function face(inCanvas: HTMLCanvasElement | OffscreenCanvas, result: Array<FaceResult>, drawOptions?: Partial<DrawOptions>): Promise<void>;
export declare function body(inCanvas: HTMLCanvasElement | OffscreenCanvas, result: Array<BodyResult>, drawOptions?: Partial<DrawOptions>): Promise<void>;
export declare function hand(inCanvas: HTMLCanvasElement | OffscreenCanvas, result: Array<HandResult>, drawOptions?: Partial<DrawOptions>): Promise<void>;
export declare function object(inCanvas: HTMLCanvasElement | OffscreenCanvas, result: Array<ObjectResult>, drawOptions?: Partial<DrawOptions>): Promise<void>;
export declare function person(inCanvas: HTMLCanvasElement | OffscreenCanvas, result: Array<PersonResult>, drawOptions?: Partial<DrawOptions>): Promise<void>;
export declare function canvas(input: HTMLCanvasElement | OffscreenCanvas | HTMLImageElement | HTMLMediaElement | HTMLVideoElement, output: HTMLCanvasElement): Promise<void>;
export declare function all(inCanvas: HTMLCanvasElement | OffscreenCanvas, result: Result, drawOptions?: Partial<DrawOptions>): Promise<[void, void, void, void, void] | null>;
//# sourceMappingURL=draw.d.ts.map