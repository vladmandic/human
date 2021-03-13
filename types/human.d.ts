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
        tensor: any;
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
    enhance(input: any): any;
    load(userConfig?: null): Promise<void>;
    detect(input: any, userConfig?: {}): Promise<{
        face: Array<{
            any: any;
        }>;
        body: Array<{
            any: any;
        }>;
        hand: Array<{
            any: any;
        }>;
        gesture: Array<{
            any: any;
        }>;
        performance: object;
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
