/**
 * Custom TFJS backend for Human based on WebGL
 * Not used by default
 */
export declare const config: {
    name: string;
    priority: number;
    canvas: OffscreenCanvas | HTMLCanvasElement | null;
    gl: WebGL2RenderingContext | null;
    extensions: string[];
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
/**
 * Registers custom WebGL2 backend to be used by Human library
 *
 * @returns void
 */
export declare function register(instance: any): Promise<void>;
//# sourceMappingURL=humangl.d.ts.map