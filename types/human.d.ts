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
declare class Human {
    #private;
    version: string;
    config: typeof config.default;
    state: string;
    image: {
        tensor: typeof tf.Tensor;
        canvas: OffscreenCanvas | HTMLCanvasElement;
    };
    tf: typeof tf;
    draw: typeof draw;
    models: {
        face: any;
        posenet: any;
        blazepose: any;
        handpose: any;
        iris: any;
        age: any;
        gender: any;
        emotion: any;
        embedding: any;
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
        platform: string;
        agent: string;
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
    simmilarity(embedding1: Array<number>, embedding2: Array<number>): number;
    enhance(input: typeof tf.Tensor): typeof tf.Tensor | null;
    load(userConfig?: null): Promise<void>;
    detect(input: any, userConfig?: {}): Promise<{
        face: Array<{
            confidence: number;
            boxConfidence: number;
            faceConfidence: number;
            box: [number, number, number, number];
            mesh: Array<[number, number, number]>;
            meshRaw: Array<[number, number, number]>;
            boxRaw: [number, number, number, number];
            annotations: any;
            age: number;
            gender: string;
            genderConfidence: number;
            emotion: string;
            embedding: any;
            iris: number;
            angle: {
                roll: number | null;
                yaw: number | null;
                pitch: number | null;
            };
        }>;
        body: Array<{
            id: number;
            part: string;
            position: {
                x: number;
                y: number;
                z: number;
            };
            score: number;
            presence: number;
        }>;
        hand: Array<{
            confidence: number;
            box: any;
            landmarks: any;
            annotations: any;
        }>;
        gesture: Array<{
            part: string;
            gesture: string;
        }>;
        performance: {
            any: any;
        };
        canvas: OffscreenCanvas | HTMLCanvasElement;
    } | {
        error: string;
    }>;
    warmup(userConfig: any): Promise<{
        face: any;
        body: any;
        hand: any;
        gesture: any;
        performance: any;
        canvas: any;
    } | {
        error: any;
    }>;
}
export { Human as default };
