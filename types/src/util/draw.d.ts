/**
 * Module that implements helper draw functions, exposed as human.draw
 */
import type { Result, FaceResult, BodyResult, HandResult, ObjectResult, GestureResult, PersonResult } from '../result';
import type { AnyCanvas } from '../exports';
/** Draw Options
 * - Accessed via `human.draw.options` or provided per each draw method as the drawOptions optional parameter
 */
export declare type DrawOptions = {
    /** draw line color */
    color: string;
    /** label color */
    labelColor: string;
    /** label shadow color */
    shadowColor: string;
    /** label font */
    font: string;
    /** line spacing between labels */
    lineHeight: number;
    /** line width for drawn lines */
    lineWidth: number;
    /** size of drawn points */
    pointSize: number;
    /** draw rounded boxes by n pixels */
    roundRect: number;
    /** should points be drawn? */
    drawPoints: boolean;
    /** should labels be drawn? */
    drawLabels: boolean;
    /** should detected gestures be drawn? */
    drawGestures: boolean;
    /** should draw boxes around detection results? */
    drawBoxes: boolean;
    /** should draw polygons from detection points? */
    drawPolygons: boolean;
    /** should draw gaze arrows? */
    drawGaze: boolean;
    /** should fill polygons? */
    fillPolygons: boolean;
    /** use z-coordinate when available */
    useDepth: boolean;
    /** should lines be curved? */
    useCurves: boolean;
};
export declare const options: DrawOptions;
/** draw detected gestures */
export declare function gesture(inCanvas: AnyCanvas, result: Array<GestureResult>, drawOptions?: Partial<DrawOptions>): Promise<void>;
/** draw detected faces */
export declare function face(inCanvas: AnyCanvas, result: Array<FaceResult>, drawOptions?: Partial<DrawOptions>): Promise<void>;
/** draw detected bodies */
export declare function body(inCanvas: AnyCanvas, result: Array<BodyResult>, drawOptions?: Partial<DrawOptions>): Promise<void>;
/** draw detected hands */
export declare function hand(inCanvas: AnyCanvas, result: Array<HandResult>, drawOptions?: Partial<DrawOptions>): Promise<void>;
/** draw detected objects */
export declare function object(inCanvas: AnyCanvas, result: Array<ObjectResult>, drawOptions?: Partial<DrawOptions>): Promise<void>;
/** draw combined person results instead of individual detection result objects */
export declare function person(inCanvas: AnyCanvas, result: Array<PersonResult>, drawOptions?: Partial<DrawOptions>): Promise<void>;
/** draw processed canvas */
export declare function canvas(input: AnyCanvas | HTMLImageElement | HTMLMediaElement | HTMLVideoElement, output: HTMLCanvasElement): Promise<void>;
/** meta-function that performs draw for: canvas, face, body, hand
 * @returns {Promise}
*/
export declare function all(inCanvas: AnyCanvas, result: Result, drawOptions?: Partial<DrawOptions>): Promise<[void, void, void, void, void] | null>;
