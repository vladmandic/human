/** TFJS custom backend registration */
import type { Human } from '../human';
export declare const config: {
    name: string;
    priority: number;
    canvas: HTMLCanvasElement | OffscreenCanvas | null;
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
export declare function register(instance: Human): Promise<void>;
