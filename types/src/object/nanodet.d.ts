/**
 * NanoDet object detection model implementation
 *
 * Based on: [**MB3-CenterNet**](https://github.com/610265158/mobilenetv3_centernet)
 */
import type { ObjectResult } from '../result';
import type { GraphModel, Tensor } from '../tfjs/types';
import type { Config } from '../config';
export declare function load(config: Config): Promise<GraphModel>;
export declare function predict(image: Tensor, config: Config): Promise<ObjectResult[]>;
//# sourceMappingURL=nanodet.d.ts.map