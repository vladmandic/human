/**
 * Loader and Validator for all models used by Human
 */
import type { GraphModel } from './tfjs/types';
import type { Human } from './human';
/** Instances of all possible TFJS Graph Models used by Human
 * - loaded as needed based on configuration
 * - initialized explictly with `human.load()` method
 * - initialized implicity on first call to `human.detect()`
 * - each model can be `null` if not loaded, instance of `GraphModel` if loaded or `Promise` if loading
 */
export declare class Models {
    age: null | GraphModel | Promise<GraphModel>;
    agegenderrace: null | GraphModel | Promise<GraphModel>;
    blazeposedetect: null | GraphModel | Promise<GraphModel>;
    blazepose: null | GraphModel | Promise<GraphModel>;
    centernet: null | GraphModel | Promise<GraphModel>;
    efficientpose: null | GraphModel | Promise<GraphModel>;
    embedding: null | GraphModel | Promise<GraphModel>;
    emotion: null | GraphModel | Promise<GraphModel>;
    facedetect: null | GraphModel | Promise<GraphModel>;
    faceiris: null | GraphModel | Promise<GraphModel>;
    facemesh: null | GraphModel | Promise<GraphModel>;
    faceres: null | GraphModel | Promise<GraphModel>;
    gender: null | GraphModel | Promise<GraphModel>;
    handpose: null | GraphModel | Promise<GraphModel>;
    handskeleton: null | GraphModel | Promise<GraphModel>;
    handtrack: null | GraphModel | Promise<GraphModel>;
    movenet: null | GraphModel | Promise<GraphModel>;
    nanodet: null | GraphModel | Promise<GraphModel>;
    posenet: null | GraphModel | Promise<GraphModel>;
    segmentation: null | GraphModel | Promise<GraphModel>;
    antispoof: null | GraphModel | Promise<GraphModel>;
}
export declare function reset(instance: Human): void;
/** Load method preloads all instance.configured models on-demand */
export declare function load(instance: Human): Promise<void>;
export declare function validate(instance: Human): Promise<void>;
