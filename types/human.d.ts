import * as tf from '../dist/tfjs.esm.js';
import * as facemesh from './blazeface/facemesh';
import * as faceres from './faceres/faceres';
import * as emotion from './emotion/emotion';
import * as posenet from './posenet/posenet';
import * as handpose from './handpose/handpose';
import * as blazepose from './blazepose/blazepose';
import * as nanodet from './nanodet/nanodet';
import * as draw from './draw/draw';
import { Config } from './config';
import { Result } from './result';
/** Generic Tensor object type */
export declare type Tensor = typeof tf.Tensor;
export type { Config } from './config';
export type { Result } from './result';
export type { DrawOptions } from './draw/draw';
/** Defines all possible input types for **Human** detection */
export declare type Input = Tensor | typeof Image | ImageData | ImageBitmap | HTMLImageElement | HTMLMediaElement | HTMLVideoElement | HTMLCanvasElement | OffscreenCanvas;
/** Error message */
export declare type Error = {
    error: string;
};
/** Instance of TensorFlow/JS */
export declare type TensorFlow = typeof tf;
/** Generic Model object type, holds instance of individual models */
declare type Model = Object;
/**
 * **Human** library main class
 *
 * All methods and properties are available only as members of Human class
 *
 * - Configuration object definition: {@link Config}
 * - Results object definition: {@link Result}
 * - Possible inputs: {@link Input}
 */
export declare class Human {
    #private;
    /** Current version of Human library in semver format */
    version: string;
    /** Current configuration
     * - Details: {@link Config}
     */
    config: Config;
    /** Current state of Human library
     * - Can be polled to determine operations that are currently executed
     */
    state: string;
    /** Internal: Instance of current image being processed */
    image: {
        tensor: Tensor | null;
        canvas: OffscreenCanvas | HTMLCanvasElement | null;
    };
    /** Internal: Instance of TensorFlow/JS used by Human
     * - Can be embedded or externally provided
     */
    tf: TensorFlow;
    /** Draw helper classes that can draw detected objects on canvas using specified draw styles
     * - options: global settings for all draw operations, can be overriden for each draw method, for details see {@link DrawOptions}
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
    /** Internal: Currently loaded models */
    models: {
        face: [Model, Model, Model] | null;
        posenet: Model | null;
        blazepose: Model | null;
        efficientpose: Model | null;
        handpose: [Model, Model] | null;
        iris: Model | null;
        age: Model | null;
        gender: Model | null;
        emotion: Model | null;
        embedding: Model | null;
        nanodet: Model | null;
        faceres: Model | null;
    };
    /** Internal: Currently loaded classes */
    classes: {
        facemesh: typeof facemesh;
        emotion: typeof emotion;
        body: typeof posenet | typeof blazepose;
        hand: typeof handpose;
        nanodet: typeof nanodet;
        faceres: typeof faceres;
    };
    /** Face triangualtion array of 468 points, used for triangle references between points */
    faceTriangulation: typeof facemesh.triangulation;
    /** UV map of 468 values, used for 3D mapping of the face mesh */
    faceUVMap: typeof facemesh.uvmap;
    /** Platform and agent information detected by Human */
    sysinfo: {
        platform: string;
        agent: string;
    };
    /** Performance object that contains values for all recently performed operations */
    perf: any;
    /**
     * Creates instance of Human library that is futher used for all operations
     * - @param userConfig: {@link Config}
     */
    constructor(userConfig?: Config | Object);
    /** @hidden */
    analyze: (...msg: any[]) => void;
    /** Simmilarity method calculates simmilarity between two provided face descriptors (face embeddings)
     * - Calculation is based on normalized Minkowski distance between
    */
    similarity(embedding1: Array<number>, embedding2: Array<number>): number;
    /** Enhance method performs additional enhacements to face image previously detected for futher processing
     * @param input Tensor as provided in human.result.face[n].tensor
     * @returns Tensor
     */
    enhance(input: Tensor): Tensor | null;
    /**
     * Math method find best match between provided face descriptor and predefined database of known descriptors
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
    */
    load(userConfig?: Config | Object): Promise<void>;
    /** Main detection method
     * - Analyze configuration: {@link Config}
     * - Pre-process input: {@link Input}
     * - Run inference for all configured models
     * - Process and return result: {@link Result}
    */
    detect(input: Input, userConfig?: Config | Object): Promise<Result | Error>;
    /** Warmup metho pre-initializes all models for faster inference
     * - can take significant time on startup
     * - only used for `webgl` and `humangl` backends
    */
    warmup(userConfig?: Config | Object): Promise<Result | {
        error: any;
    }>;
}
/**
 * Class Human is also available as default export
 */
export { Human as default };
