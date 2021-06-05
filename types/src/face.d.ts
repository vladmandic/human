/**
 * Module that analyzes person age
 * Obsolete
 */
import { Face } from './result';
import { Tensor } from './tfjs/types';
export declare const detectFace: (parent: any, input: Tensor) => Promise<Face[]>;
