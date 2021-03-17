import * as tf from '../dist/tfjs.esm.js';
import * as facemesh from './blazeface/facemesh';
import * as age from './age/age';
import * as gender from './gender/gender';
import * as emotion from './emotion/emotion';
import * as posenet from './posenet/posenet';
import * as handpose from './handpose/handpose';
import * as blazepose from './blazepose/blazepose';
import * as nanodet from './nanodet/nanodet';
import * as config from '../config';
import * as draw from './draw';
declare type Tensor = {};
declare type Model = {};
export declare type Result = {
    face: Array<{
        confidence: Number;
        boxConfidence: Number;
        faceConfidence: Number;
        box: [Number, Number, Number, Number];
        mesh: Array<[Number, Number, Number]>;
        meshRaw: Array<[Number, Number, Number]>;
        boxRaw: [Number, Number, Number, Number];
        annotations: Array<{
            part: String;
            points: Array<[Number, Number, Number]>[];
        }>;
        age: Number;
        gender: String;
        genderConfidence: Number;
        emotion: Array<{
            score: Number;
            emotion: String;
        }>;
        embedding: Array<Number>;
        iris: Number;
        angle: {
            roll: Number;
            yaw: Number;
            pitch: Number;
        };
    }>;
    body: Array<{
        id: Number;
        part: String;
        position: {
            x: Number;
            y: Number;
            z: Number;
        };
        score: Number;
        presence: Number;
    }>;
    hand: Array<{
        confidence: Number;
        box: [Number, Number, Number, Number];
        boxRaw: [Number, Number, Number, Number];
        landmarks: Array<[Number, Number, Number]>;
        annotations: Array<{
            part: String;
            points: Array<[Number, Number, Number]>[];
        }>;
    }>;
    gesture: Array<{
        part: String;
        gesture: String;
    }>;
    object: Array<{
        score: Number;
        strideSize: Number;
        class: Number;
        label: String;
        center: Number[];
        centerRaw: Number[];
        box: Number[];
        boxRaw: Number[];
    }>;
    performance: {
        any: any;
    };
    canvas: OffscreenCanvas | HTMLCanvasElement;
};
export type { default as Config } from '../config';
export declare class Human {
    #private;
    version: String;
    config: typeof config.default;
    state: String;
    image: {
        tensor: Tensor;
        canvas: OffscreenCanvas | HTMLCanvasElement;
    };
    tf: typeof tf;
    draw: {
        drawOptions?: typeof draw.drawOptions;
        gesture: Function;
        face: Function;
        body: Function;
        hand: Function;
        canvas: Function;
        all: Function;
    };
    models: {
        face: facemesh.MediaPipeFaceMesh | null;
        posenet: posenet.PoseNet | null;
        blazepose: Model | null;
        handpose: handpose.HandPose | null;
        iris: Model | null;
        age: Model | null;
        gender: Model | null;
        emotion: Model | null;
        embedding: Model | null;
        nanodet: Model | null;
    };
    classes: {
        facemesh: typeof facemesh;
        age: typeof age;
        gender: typeof gender;
        emotion: typeof emotion;
        body: typeof posenet | typeof blazepose;
        hand: typeof handpose;
        nanodet: typeof nanodet;
    };
    sysinfo: {
        platform: String;
        agent: String;
    };
    constructor(userConfig?: {});
    profileData(): {
        newBytes: any;
        newTensors: any;
        peakBytes: any;
        numKernelOps: any;
        timeKernelOps: any;
        slowestKernelOps: any;
        largestKernelOps: any;
    } | {};
    simmilarity(embedding1: Array<Number>, embedding2: Array<Number>): Number;
    enhance(input: Tensor): Tensor | null;
    match(faceEmbedding: Array<Number>, db: Array<{
        name: String;
        source: String | undefined;
        embedding: Array<Number>;
    }>, threshold?: number): {
        name: String;
        source: String | undefined;
        simmilarity: Number;
        embedding: Array<Number>;
    };
    load(userConfig?: Object): Promise<void>;
    detect(input: Tensor | ImageData | HTMLCanvasElement | HTMLVideoElement | OffscreenCanvas, userConfig?: Object): Promise<Result | {
        error: String;
    }>;
    warmup(userConfig?: Object): Promise<Result | {
        error: any;
    }>;
}
export { Human as default };
