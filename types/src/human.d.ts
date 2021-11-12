/**
 * Human main module
 * @default Human Library
 * @summary <https://github.com/vladmandic/human>
 * @author <https://github.com/vladmandic>
 * @copyright <https://github.com/vladmandic>
 * @license MIT
 */
import { Env } from './util/env';
import * as tf from '../dist/tfjs.esm.js';
import * as draw from './util/draw';
import * as facemesh from './face/facemesh';
import * as match from './face/match';
import * as models from './models';
import type { Input, Tensor, DrawOptions, Config, Result } from './exports';
export * from './exports';
/** Instance of TensorFlow/JS used by Human
 * - Can be TFJS that is bundled with `Human` or a manually imported TFJS library
 * @external [API](https://js.tensorflow.org/api/latest/)
 */
export declare type TensorFlow = typeof tf;
/** Error message */
export declare type Error = {
    /** @property error message */
    error: string;
};
/** **Human** library main class
 *
 * All methods and properties are available only as members of Human class
 *
 * - Configuration object definition: {@link Config}
 * - Results object definition: {@link Result}
 * - Possible inputs: {@link Input}
 *
 * @param userConfig: {@link Config}
 * @returns instance of {@link Human}
 */
export declare class Human {
    #private;
    /** Current version of Human library in *semver* format */
    version: string;
    /** Current configuration
     * - Defaults: [config](https://github.com/vladmandic/human/blob/main/src/config.ts#L262)
     */
    config: Config;
    /** Last known result of detect run
     * - Can be accessed anytime after initial detection
    */
    result: Result;
    /** Current state of Human library
     * - Can be polled to determine operations that are currently executed
     * - Progresses through: 'config', 'check', 'backend', 'load', 'run:<model>', 'idle'
     */
    state: string;
    /** currenty processed image tensor and canvas */
    process: {
        tensor: Tensor | null;
        canvas: OffscreenCanvas | HTMLCanvasElement | null;
    };
    /** Instance of TensorFlow/JS used by Human
     *  - Can be embedded or externally provided
     * @internal
     *
     * [TFJS API]<https://js.tensorflow.org/api/latest/>
     */
    tf: TensorFlow;
    /** Object containing environment information used for diagnostics */
    env: Env;
    /** Draw helper classes that can draw detected objects on canvas using specified draw
     * @property options global settings for all draw operations, can be overriden for each draw method {@link DrawOptions}
     */
    draw: {
        canvas: typeof draw.canvas;
        face: typeof draw.face;
        body: typeof draw.body;
        hand: typeof draw.hand;
        gesture: typeof draw.gesture;
        object: typeof draw.object;
        person: typeof draw.person;
        all: typeof draw.all;
        options: DrawOptions;
    };
    /** Currently loaded models
     * @internal
     * {@link Models}
    */
    models: models.Models;
    /** Container for events dispatched by Human
     * {@type} EventTarget
     * Possible events:
     * - `create`: triggered when Human object is instantiated
     * - `load`: triggered when models are loaded (explicitly or on-demand)
     * - `image`: triggered when input image is processed
     * - `result`: triggered when detection is complete
     * - `warmup`: triggered when warmup is complete
     * - `error`: triggered on some errors
     */
    events: EventTarget | undefined;
    /** Reference face triangualtion array of 468 points, used for triangle references between points */
    faceTriangulation: typeof facemesh.triangulation;
    /** Refernce UV map of 468 values, used for 3D mapping of the face mesh */
    faceUVMap: typeof facemesh.uvmap;
    /** Performance object that contains values for all recently performed operations */
    performance: Record<string, number>;
    /** WebGL debug info */
    gl: Record<string, unknown>;
    /** Constructor for **Human** library that is futher used for all operations
     *
     * @param {Config} userConfig
     * @returns {Human}
     */
    constructor(userConfig?: Partial<Config>);
    /** @hidden */
    analyze: (...msg: string[]) => void;
    /** Reset configuration to default values */
    reset(): void;
    /** Validate current configuration schema */
    validate(userConfig?: Partial<Config>): {
        reason: string;
        where: string;
        expected?: string;
    }[];
    /** Exports face matching methods */
    similarity: typeof match.similarity;
    distance: typeof match.distance;
    match: typeof match.match;
    /** Utility wrapper for performance.now() */
    now(): number;
    /** Process input as return canvas and tensor
     *
     * @param input: {@link Input}
     * @param {boolean} input.getTensor should image processing also return tensor or just canvas
     * @returns { tensor, canvas }
     */
    image(input: Input, getTensor?: boolean): Promise<{
        tensor: Tensor<import("@tensorflow/tfjs-core").Rank> | null;
        canvas: import("./exports").AnyCanvas | null;
    }>;
    /** Segmentation method takes any input and returns processed canvas with body segmentation
     *  - Segmentation is not triggered as part of detect process
     *
     *  Returns:
     *
     * @param input: {@link Input}
     * @param background?: {@link Input}
     *  - Optional parameter background is used to fill the background with specific input
     * @returns {object}
     *  - `data` as raw data array with per-pixel segmentation values
     *  - `canvas` as canvas which is input image filtered with segementation data and optionally merged with background image. canvas alpha values are set to segmentation values for easy merging
     *  - `alpha` as grayscale canvas that represents segmentation alpha values
     */
    segmentation(input: Input, background?: Input): Promise<{
        data: number[] | Tensor;
        canvas: HTMLCanvasElement | OffscreenCanvas | null;
        alpha: HTMLCanvasElement | OffscreenCanvas | null;
    }>;
    /** Enhance method performs additional enhacements to face image previously detected for futher processing
     *
     * @param input: Tensor as provided in human.result.face[n].tensor
     * @returns Tensor
     */
    enhance(input: Tensor): Tensor | null;
    /** Compare two input tensors for pixel simmilarity
     * - use `human.image` to process any valid input and get a tensor that can be used for compare
     * - when passing manually generated tensors:
     *  - both input tensors must be in format [1, height, width, 3]
     *  - if resolution of tensors does not match, second tensor will be resized to match resolution of the first tensor
     * @returns {number}
     * - return value is pixel similarity score normalized by input resolution and rgb channels
    */
    compare(firstImageTensor: Tensor, secondImageTensor: Tensor): Promise<number>;
    /** Explicit backend initialization
     *  - Normally done implicitly during initial load phase
     *  - Call to explictly register and initialize TFJS backend without any other operations
     *  - Use when changing backend during runtime
     *
     * @returns {void}
     */
    init(): Promise<void>;
    /** Load method preloads all configured models on-demand
     * - Not explicitly required as any required model is load implicitly on it's first run
     *
     * @param userConfig?: {@link Config}
     * @return Promise<void>
    */
    load(userConfig?: Partial<Config>): Promise<void>;
    /** @hidden */
    emit: (event: string) => void;
    /** Runs interpolation using last known result and returns smoothened result
     * Interpolation is based on time since last known result so can be called independently
     *
     * @param result?: {@link Result} optional use specific result set to run interpolation on
     * @returns result: {@link Result}
     */
    next(result?: Result): Result;
    /** Warmup method pre-initializes all configured models for faster inference
     * - can take significant time on startup
     * - only used for `webgl` and `humangl` backends
     * @param userConfig?: {@link Config}
     * @returns result: {@link Result}
    */
    warmup(userConfig?: Partial<Config>): Promise<Result | {
        error: any;
    }>;
    /** Run detect with tensorflow profiling
     * - result object will contain total exeuction time information for top-20 kernels
     * - actual detection object can be accessed via `human.result`
    */
    profile(input: Input, userConfig?: Partial<Config>): Promise<Record<string, number>>;
    /** Main detection method
     * - Analyze configuration: {@link Config}
     * - Pre-process input: {@link Input}
     * - Run inference for all configured models
     * - Process and return result: {@link Result}
     *
     * @param input: {@link Input}
     * @param userConfig?: {@link Config}
     * @returns result: {@link Result}
    */
    detect(input: Input, userConfig?: Partial<Config>): Promise<Result | Error>;
}
/** Class Human as default export */
export { Human as default };
