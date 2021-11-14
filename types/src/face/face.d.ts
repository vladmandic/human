/**
 * Face algorithm implementation
 * Uses FaceMesh, Emotion and FaceRes models to create a unified pipeline
 */
import type { FaceResult } from '../result';
import type { Tensor } from '../tfjs/types';
import type { Human } from '../human';
export declare const detectFace: (instance: Human, input: Tensor) => Promise<FaceResult[]>;
