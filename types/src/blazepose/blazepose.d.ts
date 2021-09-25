/**
 * BlazePose model implementation
 *
 * Based on : [**BlazePose**](https://drive.google.com/file/d/10IU-DRP2ioSNjKFdiGbmmQX81xAYj88s/view)
 */
import type { Tensor, GraphModel } from '../tfjs/types';
import type { BodyResult } from '../result';
import type { Config } from '../config';
export declare function load(config: Config): Promise<GraphModel>;
export declare function predict(image: Tensor, config: Config): Promise<BodyResult[]>;
//# sourceMappingURL=blazepose.d.ts.map