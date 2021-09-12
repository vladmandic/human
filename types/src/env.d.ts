export interface Env {
    browser: undefined | boolean;
    node: undefined | boolean;
    worker: undefined | boolean;
    platform: undefined | string;
    agent: undefined | string;
    backends: string[];
    tfjs: {
        version: undefined | string;
        external: undefined | boolean;
    };
    wasm: {
        supported: undefined | boolean;
        simd: undefined | boolean;
        multithread: undefined | boolean;
    };
    webgl: {
        supported: undefined | boolean;
        version: undefined | string;
        renderer: undefined | string;
    };
    webgpu: {
        supported: undefined | boolean;
        adapter: undefined | string;
    };
    kernels: string[];
}
export declare const env: Env;
export declare function cpuinfo(): void;
export declare function get(): Promise<void>;
