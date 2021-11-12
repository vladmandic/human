/**
 * Image segmentation for body detection model
 *
 * Based on:
 * - [**MediaPipe Meet**](https://drive.google.com/file/d/1lnP1bRi9CSqQQXUHa13159vLELYDgDu0/preview)
 * - [**MediaPipe Selfie**](https://drive.google.com/file/d/1dCfozqknMa068vVsO2j_1FgZkW_e3VWv/preview)
 */
import type { GraphModel, Tensor } from '../tfjs/types';
import type { Config } from '../config';
import type { Input, AnyCanvas } from '../exports';
export declare function load(config: Config): Promise<GraphModel>;
export declare function process(input: Input, background: Input | undefined, config: Config): Promise<{
    data: Array<number> | Tensor;
    canvas: AnyCanvas | null;
    alpha: AnyCanvas | null;
}>;
