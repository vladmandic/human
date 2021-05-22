import type { Result, Face, Body, Hand, Object, Gesture } from '../result';
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
 * -useRawBoxes: Boolean: internal: use non-normalized coordinates when performing draw methods,
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
    drawPoints: Boolean;
    drawLabels: Boolean;
    drawBoxes: Boolean;
    drawPolygons: Boolean;
    fillPolygons: Boolean;
    useDepth: Boolean;
    useCurves: Boolean;
    bufferedOutput: Boolean;
    useRawBoxes: Boolean;
    calculateHandBox: Boolean;
}
export declare const options: DrawOptions;
export declare function gesture(inCanvas: HTMLCanvasElement, result: Array<Gesture>, drawOptions?: DrawOptions): Promise<void>;
export declare function face(inCanvas: HTMLCanvasElement, result: Array<Face>, drawOptions?: DrawOptions): Promise<void>;
export declare function body(inCanvas: HTMLCanvasElement, result: Array<Body>, drawOptions?: DrawOptions): Promise<void>;
export declare function hand(inCanvas: HTMLCanvasElement, result: Array<Hand>, drawOptions?: DrawOptions): Promise<void>;
export declare function object(inCanvas: HTMLCanvasElement, result: Array<Object>, drawOptions?: DrawOptions): Promise<void>;
export declare function canvas(inCanvas: HTMLCanvasElement, outCanvas: HTMLCanvasElement): Promise<void>;
export declare function all(inCanvas: HTMLCanvasElement, result: Result, drawOptions?: DrawOptions): Promise<void>;
