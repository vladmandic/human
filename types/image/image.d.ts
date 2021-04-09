import * as tf from '../../dist/tfjs.esm.js';
export declare function process(input: any, config: any): {
    tensor: typeof tf.Tensor | null;
    canvas: OffscreenCanvas | HTMLCanvasElement;
};
