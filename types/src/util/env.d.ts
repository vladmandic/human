export declare type Env = {
    browser: undefined | boolean;
    node: undefined | boolean;
    worker: undefined | boolean;
    platform: undefined | string;
    agent: undefined | string;
    backends: string[];
    initial: boolean;
    tfjs: {
        version: undefined | string;
    };
    offscreen: undefined | boolean;
    wasm: {
        supported: undefined | boolean;
        backend: undefined | boolean;
        simd: undefined | boolean;
        multithread: undefined | boolean;
    };
    webgl: {
        supported: undefined | boolean;
        backend: undefined | boolean;
        version: undefined | string;
        renderer: undefined | string;
    };
    webgpu: {
        supported: undefined | boolean;
        backend: undefined | boolean;
        adapter: undefined | string;
    };
    kernels: string[];
    Canvas: undefined;
    Image: undefined;
    ImageData: undefined;
};
export declare let env: Env;
export declare function cpuInfo(): Promise<void>;
export declare function backendInfo(): Promise<void>;
export declare function get(): Promise<void>;
export declare function set(obj: any): Promise<void>;
//# sourceMappingURL=env.d.ts.map