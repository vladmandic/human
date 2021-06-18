/**
 * Human main module
 */
import { Config } from './config';
import { Result } from './result';
import * as tf from '../dist/tfjs.esm.js';
import * as facemesh from './blazeface/facemesh';
import * as draw from './draw/draw';
import { Tensor, GraphModel } from './tfjs/types';
export type { Config } from './config';
export type { Result, Face, Hand, Body, Item, Gesture, Person } from './result';
export type { DrawOptions } from './draw/draw';
/** Defines all possible input types for **Human** detection
 * @typedef Input Type
 */
export declare type Input = Tensor | typeof Image | ImageData | ImageBitmap | HTMLImageElement | HTMLMediaElement | HTMLVideoElement | HTMLCanvasElement | OffscreenCanvas;
/** Error message
 * @typedef Error Type
 */
export declare type Error = {
    error: string;
};
/** Instance of TensorFlow/JS
 * @external
 */
export declare type TensorFlow = typeof tf;
/**
 * **Human** library main class
 *
 * All methods and properties are available only as members of Human class
 *
 * - Configuration object definition: {@link Config}
 * - Results object definition: {@link Result}
 * - Possible inputs: {@link Input}
 *
 * @param userConfig: {@link Config}
 */
export declare class Human {
    #private;
    /** Current version of Human library in *semver* format */
    version: string;
    /** Current configuration
     * - Details: {@link Config}
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
    /** @internal: Instance of current image being processed */
    image: {
        tensor: Tensor | null;
        canvas: OffscreenCanvas | HTMLCanvasElement | null;
    };
    /** @internal: Instance of TensorFlow/JS used by Human
     * - Can be embedded or externally provided
     */
    tf: TensorFlow;
    /** Draw helper classes that can draw detected objects on canvas using specified draw
     * - options: {@link DrawOptions} global settings for all draw operations, can be overriden for each draw method
     * - face: draw detected faces
     * - body: draw detected people and body parts
     * - hand: draw detected hands and hand parts
     * - canvas: draw processed canvas which is a processed copy of the input
     * - all: meta-function that performs: canvas, face, body, hand
     */
    draw: {
        options: draw.DrawOptions;
        gesture: typeof draw.gesture;
        face: typeof draw.face;
        body: typeof draw.body;
        hand: typeof draw.hand;
        canvas: typeof draw.canvas;
        all: typeof draw.all;
    };
    /** @internal: Currently loaded models */
    models: {
        face: [unknown, GraphModel | null, GraphModel | null] | null;
        posenet: GraphModel | null;
        blazepose: GraphModel | null;
        efficientpose: GraphModel | null;
        movenet: GraphModel | null;
        handpose: [GraphModel | null, GraphModel | null] | null;
        age: GraphModel | null;
        gender: GraphModel | null;
        emotion: GraphModel | null;
        embedding: GraphModel | null;
        nanodet: GraphModel | null;
        centernet: GraphModel | null;
        faceres: GraphModel | null;
        segmentation: GraphModel | null;
    };
    /** Reference face triangualtion array of 468 points, used for triangle references between points */
    faceTriangulation: typeof facemesh.triangulation;
    /** Refernce UV map of 468 values, used for 3D mapping of the face mesh */
    faceUVMap: typeof facemesh.uvmap;
    /** Platform and agent information detected by Human */
    sysinfo: {
        platform: string;
        agent: string;
    };
    /** Performance object that contains values for all recently performed operations */
    performance: Record<string, number>;
    /**
     * Creates instance of Human library that is futher used for all operations
     * @param userConfig: {@link Config}
     */
    constructor(userConfig?: Config | Record<string, unknown>);
    /** @hidden */
    analyze: (...msg: any[]) => void;
    /** Simmilarity method calculates simmilarity between two provided face descriptors (face embeddings)
     * - Calculation is based on normalized Minkowski distance between
     *
     * @param embedding1: face descriptor as array of numbers
     * @param embedding2: face descriptor as array of numbers
     * @returns similarity: number
    */
    similarity(embedding1: Array<number>, embedding2: Array<number>): number;
    /**
     * Segmentation method takes any input and returns processed canvas with body segmentation
     * Optional parameter background is used to fill the background with specific input
     * Segmentation is not triggered as part of detect process
     *
     * @param input: {@link Input}
     * @param background?: {@link Input}
     * @returns Canvas
     */
    segmentation(input: Input, background?: Input): Promise<OffscreenCanvas | HTMLCanvasElement | null>;
    /** Enhance method performs additional enhacements to face image previously detected for futher processing
     * @param input: Tensor as provided in human.result.face[n].tensor
     * @returns Tensor
     */
    enhance(input: Tensor): Tensor | null;
    /** Math method find best match between provided face descriptor and predefined database of known descriptors
     * @param faceEmbedding: face descriptor previsouly calculated on any face
     * @param db: array of mapping of face descriptors to known values
     * @param threshold: minimum score for matching to be considered in the result
     * @returns best match
     */
    match(faceEmbedding: Array<number>, db: Array<{
        name: string;
        source: string;
        embedding: number[];
    }>, threshold?: number): {
        name: string;
        source: string;
        similarity: number;
        embedding: number[];
    };
    /** Load method preloads all configured models on-demand
     * - Not explicitly required as any required model is load implicitly on it's first run
     * @param userConfig?: {@link Config}
    */
    load(userConfig?: Config | Record<string, unknown>): Promise<void>;
    /**
     * Runs interpolation using last known result and returns smoothened result
     * Interpolation is based on time since last known result so can be called independently
     *
     * @param result?: {@link Result} optional use specific result set to run interpolation on
     * @returns result: {@link Result}
     */
    next: (result?: Result | undefined) => Result;
    /** Main detection method
     * - Analyze configuration: {@link Config}
     * - Pre-process input: {@link Input}
     * - Run inference for all configured models
     * - Process and return result: {@link Result}
     *
     * @param input: Input
     * @param userConfig?: {@link Config}
     * @returns result: {@link Result}
    */
    detect(input: Input, userConfig?: Config | Record<string, unknown>): Promise<Result | Error>;
    /** Warmup method pre-initializes all configured models for faster inference
     * - can take significant time on startup
     * - only used for `webgl` and `humangl` backends
     * @param userConfig?: Config
    */
    warmup(userConfig?: Config | Record<string, unknown>): Promise<Result | {
        error: any;
    }>;
}
/**
 * Class Human is also available as default export
 */
export { Human as default };
