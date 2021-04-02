import * as tf from '../dist/tfjs.esm.js';
import * as facemesh from './blazeface/facemesh';
import * as age from './age/age';
import * as gender from './gender/gender';
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
/** Defines all possible input types for **Human** detection */
export declare type Input = Tensor | ImageData | ImageBitmap | HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | OffscreenCanvas;
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
    version: string;
    config: Config;
    state: string;
    image: {
        tensor: Tensor;
        canvas: OffscreenCanvas | HTMLCanvasElement;
    };
    tf: TensorFlow;
    draw: {
        drawOptions?: typeof draw.drawOptions;
        gesture: typeof draw.gesture;
        face: typeof draw.face;
        body: typeof draw.body;
        hand: typeof draw.hand;
        canvas: typeof draw.canvas;
        all: typeof draw.all;
    };
    models: {
        face: facemesh.MediaPipeFaceMesh | Model | null;
        posenet: posenet.PoseNet | null;
        blazepose: Model | null;
        efficientpose: Model | null;
        handpose: handpose.HandPose | null;
        iris: Model | null;
        age: Model | null;
        gender: Model | null;
        emotion: Model | null;
        embedding: Model | null;
        nanodet: Model | null;
        faceres: Model | null;
    };
    classes: {
        facemesh: typeof facemesh;
        age: typeof age;
        gender: typeof gender;
        emotion: typeof emotion;
        body: typeof posenet | typeof blazepose;
        hand: typeof handpose;
        nanodet: typeof nanodet;
        faceres: typeof faceres;
    };
    faceTriangulation: typeof facemesh.triangulation;
    faceUVMap: typeof facemesh.uvmap;
    sysinfo: {
        platform: string;
        agent: string;
    };
    perf: any;
    constructor(userConfig?: Config | Object);
    profileData(): {
        newBytes: any;
        newTensors: any;
        peakBytes: any;
        numKernelOps: any;
        timeKernelOps: any;
        slowestKernelOps: any;
        largestKernelOps: any;
    } | {};
    /** @hidden */
    analyze: (...msg: any[]) => void;
    similarity(embedding1: Array<number>, embedding2: Array<number>): number;
    enhance(input: Tensor): Tensor | null;
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
    load(userConfig?: Config | Object): Promise<void>;
    detect(input: Input, userConfig?: Config | Object): Promise<Result | Error>;
    warmup(userConfig?: Config | Object): Promise<Result | {
        error: any;
    }>;
}
/**
 * Class Human is also available as default export
 */
export { Human as default };
