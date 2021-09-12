/**
 * Module that analyzes person age
 * Obsolete
 */
import { FaceResult } from './result';
import { Tensor } from './tfjs/types';
export declare const detectFace: (parent: any, input: Tensor) => Promise<FaceResult[]>;
