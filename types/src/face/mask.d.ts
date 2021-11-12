import type { Tensor } from '../tfjs/types';
import type { FaceResult } from '../result';
export declare function mask(face: FaceResult): Promise<Tensor | undefined>;
