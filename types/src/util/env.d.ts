/** Env class that holds detected capabilities */
export declare class Env {
    /** Running in Browser */
    browser: boolean;
    /** Running in NodeJS */
    node: boolean;
    /** Running in WebWorker thread */
    worker: boolean;
    /** Detected platform */
    platform: string;
    /** Detected agent */
    agent: string;
    /** List of supported backends */
    backends: string[];
    /** Has any work been performed so far */
    initial: boolean;
    /** Are image filters supported? */
    filter: boolean | undefined;
    /** TFJS instance details */
    tfjs: {
        version: undefined | string;
    };
    /** Is offscreenCanvas supported? */
    offscreen: undefined | boolean;
    /** WASM detected capabilities */
    wasm: {
        supported: undefined | boolean;
        backend: undefined | boolean;
        simd: undefined | boolean;
        multithread: undefined | boolean;
    };
    /** WebGL detected capabilities */
    webgl: {
        supported: undefined | boolean;
        backend: undefined | boolean;
        version: undefined | string;
        renderer: undefined | string;
    };
    /** WebGPU detected capabilities */
    webgpu: {
        supported: undefined | boolean;
        backend: undefined | boolean;
        adapter: undefined | string;
    };
    /** CPU info */
    cpu: {
        model: undefined | string;
        flags: string[];
    };
    /** List of supported kernels for current backend */
    kernels: string[];
    /** MonkeyPatch for Canvas */
    Canvas: undefined;
    /** MonkeyPatch for Image */
    Image: undefined;
    /** MonkeyPatch for ImageData */
    ImageData: undefined;
    constructor();
    updateBackend(): Promise<void>;
    updateCPU(): Promise<void>;
}
export declare const env: Env;
//# sourceMappingURL=env.d.ts.map