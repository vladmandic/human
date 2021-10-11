export declare type Env = {
    /** Running in Browser */
    browser: undefined | boolean;
    /** Running in NodeJS */
    node: undefined | boolean;
    /** Running in WebWorker thread */
    worker: undefined | boolean;
    /** Detected platform */
    platform: undefined | string;
    /** Detected agent */
    agent: undefined | string;
    /** List of supported backends */
    backends: string[];
    /** Has any work been performed so far */
    initial: boolean;
    /** Are image filters supported? */
    filter: undefined | boolean;
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
    /** List of supported kernels for current backend */
    kernels: string[];
    /** MonkeyPatch for Canvas */
    Canvas: undefined;
    /** MonkeyPatch for Image */
    Image: undefined;
    /** MonkeyPatch for ImageData */
    ImageData: undefined;
};
export declare let env: Env;
export declare function cpuInfo(): Promise<void>;
export declare function backendInfo(): Promise<void>;
export declare function get(): Promise<void>;
export declare function set(obj: any): Promise<void>;
//# sourceMappingURL=env.d.ts.map