/**
 * Image Processing algorithm implementation
 */
import type { Input, AnyCanvas, Tensor, Config } from '../exports';
export declare function canvas(width: any, height: any): AnyCanvas;
export declare function copy(input: AnyCanvas, output?: AnyCanvas): AnyCanvas;
export declare function process(input: Input, config: Config, getTensor?: boolean): Promise<{
    tensor: Tensor | null;
    canvas: AnyCanvas | null;
}>;
export declare function skip(config: any, input: Tensor): Promise<boolean>;
export declare function compare(config: any, input1: Tensor, input2: Tensor): Promise<number>;
