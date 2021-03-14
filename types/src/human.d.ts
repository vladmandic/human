import * as tf from '../dist/tfjs.esm.js';
import * as facemesh from './blazeface/facemesh';
import * as age from './age/age';
import * as gender from './gender/gender';
import * as emotion from './emotion/emotion';
import * as posenet from './posenet/posenet';
import * as handpose from './handpose/handpose';
import * as blazepose from './blazepose/blazepose';
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
        annotations: any;
        age: Number;
        gender: String;
        genderConfidence: Number;
        emotion: String;
        embedding: any;
        iris: Number;
        angle: {
            roll: Number | null;
            yaw: Number | null;
            pitch: Number | null;
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
        box: any;
        landmarks: any;
        annotations: any;
    }>;
    gesture: Array<{
        part: String;
        gesture: String;
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
        options?: typeof draw.options;
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
    };
    classes: {
        facemesh: typeof facemesh;
        age: typeof age;
        gender: typeof gender;
        emotion: typeof emotion;
        body: typeof posenet | typeof blazepose;
        hand: typeof handpose;
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
    load(userConfig?: Object): Promise<void>;
    detect(input: Tensor | ImageData | HTMLCanvasElement | HTMLVideoElement | OffscreenCanvas, userConfig?: Object): Promise<Result | {
        error: String;
    }>;
    warmup(userConfig?: Object): Promise<Result | {
        error: any;
    }>;
}
export { Human as default };
