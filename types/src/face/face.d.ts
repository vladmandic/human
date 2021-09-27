/**
 * Face algorithm implementation
 * Uses FaceMesh, Emotion and FaceRes models to create a unified pipeline
 */
import type { FaceResult } from '../result';
import type { Tensor } from '../tfjs/types';
export declare const detectFace: (parent: any, input: Tensor) => Promise<FaceResult[]>;
//# sourceMappingURL=face.d.ts.map