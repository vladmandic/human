/**
 * BlazeFace, FaceMesh & Iris model implementation
 *
 * Based on:
 * - [**MediaPipe BlazeFace**](https://drive.google.com/file/d/1f39lSzU5Oq-j_OXgS67KfN5wNsoeAZ4V/view)
 * - Facial Spacial Geometry: [**MediaPipe FaceMesh**](https://drive.google.com/file/d/1VFC_wIpw4O7xBOiTgUldl79d9LA-LsnA/view)
 * - Eye Iris Details: [**MediaPipe Iris**](https://drive.google.com/file/d/1bsWbokp9AklH2ANjCfmjqEzzxO1CNbMu/view)
 */
import type { GraphModel, Tensor } from '../tfjs/types';
import type { FaceResult } from '../result';
import type { Config } from '../config';
export declare function predict(input: Tensor, config: Config): Promise<FaceResult[]>;
export declare function load(config: any): Promise<[GraphModel | null, GraphModel | null, GraphModel | null]>;
export declare const triangulation: number[];
export declare const uvmap: number[][];
//# sourceMappingURL=facemesh.d.ts.map