export declare const config: {
    name: string;
    priority: number;
    canvas: OffscreenCanvas | HTMLCanvasElement | null;
    gl: unknown;
    width: number;
    height: number;
    webGLattr: {
        alpha: boolean;
        antialias: boolean;
        premultipliedAlpha: boolean;
        preserveDrawingBuffer: boolean;
        depth: boolean;
        stencil: boolean;
        failIfMajorPerformanceCaveat: boolean;
        desynchronized: boolean;
    };
};
export declare function register(): void;
