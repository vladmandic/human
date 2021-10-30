import type { BodyKeypoint, BodyResult } from '../result';
import type { Tensor } from '../tfjs/types';
export declare function bodyParts(body: BodyResult): void;
export declare function jitter(keypoints: Array<BodyKeypoint>): Array<BodyKeypoint>;
export declare function padInput(input: Tensor, inputSize: number): Tensor;
export declare function rescaleBody(body: BodyResult, outputSize: [number, number]): BodyResult;
